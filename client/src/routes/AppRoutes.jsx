import { Navigate, Route, Routes } from "react-router-dom";

import Login from "../pages/auth/Login";
import Unauthorized from "../pages/auth/Unauthorized";

import DashboardLayout from "../components/dashboard/DashboardLayout";

import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

import ProjectDetails from "../components/project/ProjectDetails";
import TaskDetails from "../components/task/TaskDetails";

import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminProjects from "../pages/admin/AdminProjects";
import AdminTasks from "../pages/admin/AdminTasks";
import AdminUsers from "../pages/admin/AdminUsers";
import UserDetails from "../pages/admin/UserDetails";

import ManagerDashboard from "../pages/manager/ManagerDashboard";
import ManagerProjects from "../pages/manager/ManagerProjects";
import ManagerTasks from "../pages/manager/ManagerTasks";
import ManagerMembers from "../pages/manager/ManagerMembers";

import MemberDashboard from "../pages/member/MemberDashboard";
import MemberTasks from "../pages/member/MemberTasks";

import Notifications from "../pages/notifications/Notifications";
import Profile from "../pages/profile/Profile";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}

      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Routes */}

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>

          {/* Admin */}

          <Route element={<RoleRoute allowedRoles={["admin"]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/projects" element={<AdminProjects />} />
            <Route 
              path="/admin/projects/:projectId" 
              element={<ProjectDetails />} 
            />
            <Route path="/admin/tasks" element={<AdminTasks />} />
            <Route path="/admin/tasks/:taskId" element={<TaskDetails />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/users/:userId" element={<UserDetails />}/>
            <Route path="/admin/notifications" element={<Notifications />} />
            <Route path="/admin/profile" element={<Profile />} />
          </Route>

          {/* Manager */}

          <Route element={<RoleRoute allowedRoles={["manager"]} />}>
            <Route path="/manager/dashboard" element={<ManagerDashboard />} />
            <Route path="/manager/projects" element={<ManagerProjects />} />
             <Route 
              path="/manager/projects/:projectId" 
              element={<ProjectDetails />} 
            />
            <Route path="/manager/tasks" element={<ManagerTasks />} />
            <Route path="/manager/tasks/:taskId" element={<TaskDetails />} />
            <Route path="/manager/members" element={<ManagerMembers />} />
            <Route path="/manager/notifications" element={<Notifications />} />
            <Route path="/manager/profile" element={<Profile />} />
          </Route>

          {/* Member */}

          <Route element={<RoleRoute allowedRoles={["member"]} />}>
            <Route path="/member/dashboard" element={<MemberDashboard />} />
            <Route path="/member/tasks" element={<MemberTasks />} />
            <Route path="/member/tasks/:taskId" element={<TaskDetails />} />
            <Route path="/member/notifications" element={<Notifications />} />
            <Route path="/member/profile" element={<Profile />} />
          </Route>

        </Route>
      </Route>

      {/* Role Base Paths */}

      <Route path="/admin" element={
        <Navigate to="/admin/dashboard" replace />
      }/>

      <Route path="/manager" element={
        <Navigate to="/manager/dashboard" replace />
      }/>

      <Route path="/member" element={
        <Navigate to="/member/dashboard" replace />
      }/>

      {/* Unknown Routes */}

      <Route path="*" element={
        <Navigate to="/login" replace />
      }/>
    </Routes>
  );
};

export default AppRoutes;