import {
  FaBell,
  FaClipboardList,
  FaFolder,
  FaHome,
  FaTasks,
  FaUsers,
  FaUser,
} from "react-icons/fa";

export const navigationConfig = {
  admin: [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: FaHome,
    },
    {
      label: "Users",
      path: "/admin/users",
      icon: FaUsers,
    },
    {
      label: "Projects",
      path: "/admin/projects",
      icon: FaFolder,
    },
    {
      label: "Tasks",
      path: "/admin/tasks",
      icon: FaTasks,
    },
    {
      label: "Notifications",
      path: "/admin/notifications",
      icon: FaBell,
    },
    {
      label: "Profile",
      path: "/admin/profile",
      icon: FaUser,
    },
  ],

  manager: [
    {
      label: "Dashboard",
      path: "/manager/dashboard",
      icon: FaHome,
    },
    {
      label: "Team Members",
      path: "/manager/members",
      icon: FaUsers,
    },
    {
      label: "Projects",
      path: "/manager/projects",
      icon: FaFolder,
    },
    {
      label: "Tasks",
      path: "/manager/tasks",
      icon: FaTasks,
    },
    {
      label: "Notifications",
      path: "/manager/notifications",
      icon: FaBell,
    },
    {
      label: "Profile",
      path: "/manager/profile",
      icon: FaUser,
    },
  ],

  member: [
    {
      label: "Dashboard",
      path: "/member/dashboard",
      icon: FaHome,
    },
    {
      label: "My Tasks",
      path: "/member/tasks",
      icon: FaClipboardList,
    },
    {
      label: "Notifications",
      path: "/member/notifications",
      icon: FaBell,
    },
    {
      label: "Profile",
      path: "/member/profile",
      icon: FaUser,
    },
  ],
};

