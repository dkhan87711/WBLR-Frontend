const ENDPOINTS = {
    DEPARTMENT_LOGIN: "/department/login",
    DEPARTMENT_LOGOUT: "/department/logout",

    INSTITUTION_LOGIN: "/institutional/login",
    INSTITUTION_LOGOUT: "/institutional/logout",

    SEND_OTP: "/citizen/send-otp",
    VERIFY_OTP: "/citizen/otp-login",
    RESEND_OTP: "/citizen/resend-otp",

    // ✅ Approval APIs
    APPROVAL_LIST: "/approval/requests",
    APPROVAL_DETAILS: (txnId) => `/approval/requests/${txnId}`,
    APPROVAL_ACTION: "/approval/action",

    APPROVAL_SUBMIT: "/approval/submit",
    // NEW
    APPROVAL_IMPORT_GEOJSON: "/approval/import-geojson"

};

export default ENDPOINTS;