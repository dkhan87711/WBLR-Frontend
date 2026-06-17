export const setAuthData = (
    data
) => {

    localStorage.setItem(
        "token",
        data.token
    );

    localStorage.setItem(
        "userId",
        data.userId
    );

    localStorage.setItem(
        "userName",
        data.userName
    );

    localStorage.setItem(
        "userType",
        data.userType
    );

    localStorage.setItem(
        "role",
        data.role || ""
    );

    localStorage.setItem(
        "sessionId",
        data.sessionId
    );
};

export const clearAuthData =
    () => {

        localStorage.clear();
    };

export const getToken = () =>
    localStorage.getItem("token");

export const isLoggedIn = () =>
    !!localStorage.getItem("token");