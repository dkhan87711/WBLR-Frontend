import API from "./API";
import ENDPOINTS from "./endPoints";

// ---------------------- DEPARTMENT ----------------------
export const departmentLogin = async (payload) => {
    return await API.post(
        ENDPOINTS.DEPARTMENT_LOGIN,
        payload
    );
};

export const departmentLogout = async (sessionId) => {
    return await API.post(
        ENDPOINTS.DEPARTMENT_LOGOUT,
        { sessionId }
    );
};


// ---------------------- INSTITUTION ----------------------
export const institutionLogin = async (payload) => {
    return await API.post(
        ENDPOINTS.INSTITUTION_LOGIN,
        payload
    );
};

export const institutionLogout = async (payload) => {
    return await API.post(
        ENDPOINTS.INSTITUTION_LOGOUT,
        payload
    );
};


// ---------------------- CITIZEN OTP ----------------------
export const sendOtp = async (phoneNo) => {
    return await API.post(
        ENDPOINTS.SEND_OTP,
        { phoneNo }
    );
};

export const verifyOtp = async (phoneNo, otp, user_name) => {
    return await API.post(
        ENDPOINTS.VERIFY_OTP,
        {
            phoneNo,
            otp,
            user_name
        }
    );
};

export const resendOtp = async (phoneNo) => {
    return await API.post(
        ENDPOINTS.SEND_OTP,
        { phoneNo }
    );
};


// ---------------------- APPROVAL ----------------------

// ✅ Get list (role-based)
export const getApprovalRequests = async (role) => {
    return await API.get(
        `${ENDPOINTS.APPROVAL_LIST}?role=${role}`
    );
};

// ✅ Get details
export const getApprovalDetails = async (txnId) => {
    return await API.get(
        ENDPOINTS.APPROVAL_DETAILS(txnId)
    );
};

// ✅ Approve / Reject
export const submitApproval = async (payload) => {
    return await API.post(
        ENDPOINTS.APPROVAL_ACTION,
        payload
    );
};

// ✅ Send for approval
export const submitForApproval = async (payload) => {
    return await API.post(
        ENDPOINTS.APPROVAL_SUBMIT,
        payload
    );
};
