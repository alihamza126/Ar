export const ROLES = {
  ADMIN: 'admin',
  STUDENT: 'student',
  TEACHER: 'teacher',
  // Add more roles as needed
};
export const ROLE_PATHS = {
  [ROLES.STUDENT]: ['/student'],
  [ROLES.TEACHER]: ['/teacher'],
  // Admin has access to all paths, so we don't need to define them here
};
// Map roles to their corresponding profile models and selection fields
export const ROLE_PROFILE_MAPPING = {
};
