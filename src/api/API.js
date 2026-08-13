import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api",
    // baseURL: "http://indcs0152:7000/api/bhuManchitra/",
    headers: {
        "Content-Type": "application/json",
    },
});

API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization =
                `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default API;