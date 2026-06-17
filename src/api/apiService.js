import API from "./API";
import ENDPOINTS from "./endPoints";

// ---------------------- DEPARTMENT ----------------------
export const departmentLogin = async (payload) => {
    return await API.post(
        ENDPOINTS.DEPARTMENT_LOGIN,
        payload
    );
};

export const departmentLogout = async (
    sessionId
) => {
    return await API.post(
        ENDPOINTS.DEPARTMENT_LOGOUT,
        {
            sessionId
        }
    );
};


// ---------------------- INSTITUTION ----------------------
export const institutionLogin = async (payload) => {
    return await API.post(
        ENDPOINTS.INSTITUTION_LOGIN,
        payload
    );
};

export const institutionLogout =
    async (payload) => {

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

export const verifyOtp = async (
    phoneNo,
    otp
) => {
    return await API.post(
        ENDPOINTS.VERIFY_OTP,
        {
            phoneNo,
            otp
        }
    );
};

export const resendOtp = async (
    phoneNo
) => {
    return await API.post(
        ENDPOINTS.SEND_OTP,
        { phoneNo }
    );
};