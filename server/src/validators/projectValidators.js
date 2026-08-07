import mongoose from "mongoose";

export function validateCreateProject(data) {
  const errors = {};

  if (!data.title?.trim()) {
    errors.title = "Project title is required.";
  }

  if (!data.description?.trim()) {
    errors.description = "Project description is required.";
  }

  if (!data.startDate) {
    errors.startDate = "Start date is required.";
  }

  if (!data.endDate) {
    errors.endDate = "End date is required.";
  }

  if (!data.manager) {
    errors.manager = "Project manager is required.";
  }

  if (
    data.manager &&
    !mongoose.Types.ObjectId.isValid(data.manager)
  ) {
    errors.manager = "Invalid manager ID.";
  }

  if (
    data.members &&
    Array.isArray(data.members)
  ) {
    const invalidMember = data.members.find(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );

    if (invalidMember) {
      errors.members = "One or more member IDs are invalid.";
    }
  }

  if (
    data.startDate &&
    data.endDate &&
    new Date(data.endDate) < new Date(data.startDate)
  ) {
    errors.endDate = "End date cannot be before the start date.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}