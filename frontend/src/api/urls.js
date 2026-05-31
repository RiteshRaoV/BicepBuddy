export const API_URLS = {
  LOGIN: '/api/login',
  REGISTER: '/api/register',
  ME: '/api/me',
  ONBOARDING: '/api/onboarding',
  USER_PLANS: (userId) => `/api/users/${userId}/plans`,
  BULK_PLANS: '/api/plans/bulk',
  USER_JOURNALS: (userId) => `/api/users/${userId}/journals`,
  SAVE_JOURNAL: '/api/journal',
};
