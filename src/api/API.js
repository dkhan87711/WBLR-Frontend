import axios from "axios";

const API = axios.create({
    // baseURL: "http://localhost:5000/api",
    baseURL: "http://indcs0152:7000/api/landstack/",
    headers: {
        "Content-Type": "application/json",
    },
});

// Optional: request interceptor
API.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => Promise.reject(error)
);

export default API;