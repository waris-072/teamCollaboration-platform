import { validateCreateProject } from "../validators/projectValidators.js";
import { createProjectService, getProjectsService, getProjectByIdService, updateProjectService, updateProjectStatusService, deleteProjectService, updateProjectMembersService, getAvailableMembersService } from "../services/projectService.js";

export async function createProjectController(req, res) {
  try {
    const { isValid, errors } = validateCreateProject(req.body);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    const project = await createProjectService(req.body, req.user._id);

    return res.status(201).json({
      success: true,
      message: "Project created successfully.",
      project,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getProjectsController(req, res) {
  try {
    const projects = await getProjectsService(req.user);

    return res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
}

export async function getProjectByIdController(req, res) {
  try {
    const project = await getProjectByIdService(req.params.projectId, req.user);

    return res.status(200).json({
      success: true,
      project,
    });

  } catch (error) {

    return res.status(404).json({
      success: false,
      message: error.message,
    });

  }
}

export async function updateProjectController(req, res) {
  try {
    const project = await updateProjectService(
      req.params.projectId,
      req.body,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "Project updated successfully.",
      project,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function updateProjectStatusController(req, res) {
  try {
    const project = await updateProjectStatusService(
      req.params.projectId,
      req.body.status,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "Project status updated successfully.",
      project,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function deleteProjectController(req, res) {
  try {
    const { projectId } = req.params;
    await deleteProjectService(projectId, req.user);

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function updateProjectMembersController(req, res) {
  try {
    const project = await updateProjectMembersService(
      req.params.projectId,
      req.body.members,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "Project members updated successfully.",
      project,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getAvailableMembersController(req, res) {
  try {
    const members = await getAvailableMembersService(
        req.params.projectId,
        req.user
      );

    return res.status(200).json({
      success: true,
      members,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

