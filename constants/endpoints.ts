export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    VERIFY_EMAIL: "/api/auth/verify-email",
    LOGOUT: "/api/auth/logout",

    // reset password
    resetPasswordVerify: "/api/auth/rest-password/verify",
    resetPasswordSend: "/api/auth/rest-password/send",
    resetPassword: "/api/auth/rest-password",

    // google
    GOOGLE: "/api/auth/google",
  },

  USER: {
    PROFILE: "/api/auth/current-user",
    UPDATE: (id: string) => `/user/update/${id}`,
  },
};
