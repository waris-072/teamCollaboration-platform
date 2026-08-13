import Project from "../models/Project.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

// =====================================================
// Admin Dashboard Service
// =====================================================

export const getAdminDashboardService = async () => {
  // User Stats
  const totalUsers = await User.countDocuments();
  const admins = await User.countDocuments({ role: "admin" });
  const managers = await User.countDocuments({ role: "manager" });
  const members = await User.countDocuments({ role: "member" });
  const activeUsers = await User.countDocuments({ isActive: true });
  const inactiveUsers = await User.countDocuments({ isActive: false });

  // Project Stats
  const totalProjects = await Project.countDocuments();
  const activeProjects = await Project.countDocuments({ status: "active" });
  const planningProjects = await Project.countDocuments({ status: "planning" });
  const completedProjects = await Project.countDocuments({ status: "completed" });
  const cancelledProjects = await Project.countDocuments({ status: "cancelled" });

  // Task Stats
  const totalTasks = await Task.countDocuments();
  const todoTasks = await Task.countDocuments({ status: "todo" });
  const inProgressTasks = await Task.countDocuments({ status: "in-progress" });
  const reviewTasks = await Task.countDocuments({ status: "review" });
  const completedTasks = await Task.countDocuments({ status: "completed" });

  // Recent Projects (last 5)
  const recentProjects = await Project.find()
    .populate("manager", "name email")
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  // Recent Users (last 5)
  const recentUsers = await User.find()
    .select("name email role isActive createdAt")
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  // Recent Notifications (last 5)
  const recentNotifications = await Notification.find()
    .populate("recipient", "name email")
    .populate("sender", "name email")
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  return {
    stats: {
      users: {
        total: totalUsers,
        admins,
        managers,
        members,
        active: activeUsers,
        inactive: inactiveUsers,
      },
      projects: {
        total: totalProjects,
        active: activeProjects,
        planning: planningProjects,
        completed: completedProjects,
        cancelled: cancelledProjects,
      },
      tasks: {
        total: totalTasks,
        todo: todoTasks,
        inProgress: inProgressTasks,
        review: reviewTasks,
        completed: completedTasks,
      },
    },
    recentProjects,
    recentUsers,
    recentNotifications,
  };
};

// =====================================================
// Manager Dashboard Service
// =====================================================

export const getManagerDashboardService = async (managerId) => {
  // Get manager's projects
  const projects = await Project.find({ manager: managerId })
    .populate("members", "name email")
    .sort({ createdAt: -1 })
    .lean();

  const projectIds = projects.map((p) => p._id);

  // Get tasks from manager's projects
  const tasks = await Task.find({
    project: { $in: projectIds },
  })
    .populate("assignedTo", "name email")
    .populate("project", "title")
    .lean();

  // Get team members (unique members from all projects)
  const memberMap = new Map();
  projects.forEach((project) => {
    (project.members || []).forEach((member) => {
      if (member._id && member._id.toString() !== managerId.toString()) {
        if (!memberMap.has(member._id.toString())) {
          memberMap.set(member._id.toString(), member);
        }
      }
    });
  });
  const teamMembers = Array.from(memberMap.values());

  // Task stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const pendingTasks = tasks.filter((t) => t.status !== "completed").length;
  const todoTasks = tasks.filter((t) => t.status === "todo").length;
  const inProgressTasks = tasks.filter((t) => t.status === "in-progress").length;
  const reviewTasks = tasks.filter((t) => t.status === "review").length;

  // Overdue tasks
  const now = new Date();
  const overdueTasks = tasks.filter((task) => {
    if (task.status === "completed") return false;
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < now;
  });

  // Upcoming deadlines (next 7 days)
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  const upcomingDeadlines = tasks
    .filter((task) => {
      if (task.status === "completed") return false;
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= now && dueDate <= sevenDaysFromNow;
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  // Project progress
  const projectProgress = projects.map((project) => {
    const projectTasks = tasks.filter(
      (t) => t.project?._id?.toString() === project._id.toString() || t.project?.toString() === project._id.toString()
    );
    const total = projectTasks.length;
    const completed = projectTasks.filter((t) => t.status === "completed").length;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
    return {
      _id: project._id,
      title: project.title,
      status: project.status,
      totalTasks: total,
      completedTasks: completed,
      progress,
    };
  });

  // Recent notifications
  const recentNotifications = await Notification.find({
    recipient: managerId,
  })
    .populate("sender", "name email")
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  return {
    stats: {
      projects: projects.length,
      members: teamMembers.length,
      totalTasks,
      completedTasks,
      pendingTasks,
      todo: todoTasks,
      inProgress: inProgressTasks,
      review: reviewTasks,
      overdue: overdueTasks.length,
    },
    projects,
    teamMembers,
    projectProgress,
    upcomingDeadlines,
    recentNotifications,
  };
};

// =====================================================
// Member Dashboard Service
// =====================================================

export const getMemberDashboardService = async (memberId) => {
  // Get tasks assigned to member
  const tasks = await Task.find({
    assignedTo: memberId,
  })
    .populate("project", "title status")
    .populate("assignedTo", "name email")
    .sort({ createdAt: -1 })
    .lean();

  // Get projects where member is part of
  const projects = await Project.find({
    members: memberId,
  })
    .populate("manager", "name email")
    .populate("members", "name email")
    .sort({ createdAt: -1 })
    .lean();

  // Task stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const pendingTasks = tasks.filter((t) => t.status !== "completed").length;
  const todoTasks = tasks.filter((t) => t.status === "todo").length;
  const inProgressTasks = tasks.filter((t) => t.status === "in-progress").length;
  const reviewTasks = tasks.filter((t) => t.status === "review").length;

  // Overdue tasks
  const now = new Date();
  const overdueTasks = tasks.filter((task) => {
    if (task.status === "completed") return false;
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < now;
  });

  // Upcoming deadlines (next 7 days)
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  const upcomingDeadlines = tasks
    .filter((task) => {
      if (task.status === "completed") return false;
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= now && dueDate <= sevenDaysFromNow;
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  // Recent notifications
  const recentNotifications = await Notification.find({
    recipient: memberId,
  })
    .populate("sender", "name email")
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  return {
    stats: {
      totalTasks,
      completedTasks,
      pendingTasks,
      todo: todoTasks,
      inProgress: inProgressTasks,
      review: reviewTasks,
      overdue: overdueTasks.length,
    },
    projects,
    tasks: tasks.slice(0, 5), // Recent tasks
    upcomingDeadlines,
    recentNotifications,
  };
};