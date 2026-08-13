import {
  getAdminDashboardService,
  getManagerDashboardService,
  getMemberDashboardService,
} from "../services/dashboardService.js";

// =====================================================
// Admin Dashboard Controller
// =====================================================

export const getAdminDashboard = async (req, res) => {
  try {
    const dashboardData = await getAdminDashboardService();
    res.status(200).json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("❌ Admin Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to load admin dashboard.",
    });
  }
};

// =====================================================
// Manager Dashboard Controller
// =====================================================

export const getManagerDashboard = async (req, res) => {
  try {
    const managerId = req.user._id;
    const dashboardData = await getManagerDashboardService(managerId);
    res.status(200).json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("❌ Manager Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to load manager dashboard.",
    });
  }
};

// =====================================================
// Member Dashboard Controller
// =====================================================

export const getMemberDashboard = async (req, res) => {
  try {
    const memberId = req.user._id;
    const dashboardData = await getMemberDashboardService(memberId);
    res.status(200).json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("❌ Member Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to load member dashboard.",
    });
  }
};