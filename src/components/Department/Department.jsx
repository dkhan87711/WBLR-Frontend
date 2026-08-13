import "./Department.css";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { departmentLogin, departmentLogout } from "../../api/apiService";
import leftLogo from "../../assets/department-left-logo.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import appConfig from "../../assets/config/url.json";

import logo1 from "../../assets/images/property.png";
import logo2 from "../../assets/images/weather.png";
import logo3 from "../../assets/images/flood.png";
import logo4 from "../../assets/images/lake.png";
import logo5 from "../../assets/images/urban.png";
import logo6 from "../../assets/images/3d.png";
import logo7 from "../../assets/images/aseet.png";
import logo8 from "../../assets/images/road.png";

import {
    FaMapMarkedAlt,
    FaTasks,
    FaDatabase,
    FaChartLine,
    FaUserCircle
} from "react-icons/fa";

export const Department = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);

    const [showApps, setShowApps] = useState(false);
    const [loggedInUser, setLoggedInUser] = useState(null);

    const [loginId, setLoginId] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [timeLeft, setTimeLeft] = useState(60); // 60 sec for testing

    const goTo = (path) => {
        navigate(path);
    };

    const logoMap = [
        logo1,
        logo2,
        logo3,
        logo4,
        logo5,
        logo6,
        logo7,
        logo8
    ];

    const sizeMap = [
        45, 45, 45, 45,
        45, 45, 40, 45
    ];

    const appLogos = appConfig.map((app, index) => ({
        src: logoMap[index],
        size: sizeMap[index],
        title: app.title,
        description: app.description,
        url: app.url,
    }));

    const handleLogin = async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await departmentLogin({
                    userName: loginId,
                    email: loginId,
                    password,
                    loginType: "WEB"
                });

            console.log(
                "Department Login Success",
                response.data
            );

            const userData = response.data.data;

            setLoggedInUser(userData);

            localStorage.setItem(
                "user",
                JSON.stringify(userData)
            );

            localStorage.setItem(
                "token",
                response.data.token || ""
            );

            localStorage.setItem(
                "sessionId",
                userData.sessionId
            );

            setShowApps(true);

        } catch (err) {

            console.error(err);

            setError(
                err?.response?.data?.message ||
                "Login failed"
            );

        } finally {

            setLoading(false);

        }
    };

    const handleLogout = async () => {
        try {
            const sessionId =
                localStorage.getItem(
                    "sessionId"
                );
            if (sessionId) {
                await departmentLogout(
                    sessionId
                );

            }
        } catch (error) {
            console.error(
                "Logout Error:",
                error
            );
        } finally {
            localStorage.clear();
            setLoggedInUser(null);
            setShowApps(false);
            navigate("/");
        }
    };

    useEffect(() => {
        let countdownInterval;
        let logoutTimer;

        const SESSION_TIME = 60 * 15; // seconds
        const WARNING_TIME = 30;

        if (loggedInUser) {
            setTimeLeft(SESSION_TIME);

            countdownInterval = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) return 0;
                    return prev - 1;
                });
            }, 1000);

            logoutTimer = setTimeout(() => {
                alert("Session expired. Logging out...");
                handleLogout();
            }, SESSION_TIME * 1000);
        }

        return () => {
            clearInterval(countdownInterval);
            clearTimeout(logoutTimer);
        };
    }, [loggedInUser]);

    useEffect(() => {
        if (timeLeft === 30) {
            alert("⚠ Session will expire in 30 seconds. Please save your work.");
        }
    }, [timeLeft]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const formattedTime = `${minutes}:${seconds
        .toString()
        .padStart(2, "0")}`;

    return (
        <div className="login-page">

            <div className="header-text">
                <div className="title-badge">GeoSpatial Intelligence Platform</div>
                <h2 className="main-title-header">
                    ULMP : Unified Land Management Platform<span></span>
                </h2>
            </div>

            {/* ===== LEFT VISUAL PANEL ===== */}
            {!showApps && (
                <div className="left-panel">
                    <div className="left-text">
                        <h5 className="sub-title-header-login">
                            Unified Land Management Platform
                        </h5>
                        <div className="underline-header-login"></div>
                        <p className="description-header-login">
                            Integrated Geospatial Platform for Land Governance, Monitoring,
                            Spatial Planning and Decision Support, enabling a unified view of
                            Land Records, Cadastral Mapping, ULPIN, DIGIPIN, Property
                            Intelligence, Citizen Services and Cross-Department Governance.
                        </p>
                    </div>
                </div>
            )}

            {
                !showApps ? (
                    <div className="login-card">
                        <div className="login-icon-department">
                            <span>🏛</span>
                        </div>
                        <div className="login-header">
                            <p>Department Login</p>
                            <div className="divider"></div>
                        </div>

                        <div className="login-as">
                            <span>Login as</span>
                            <div className="user-type-All">
                                <div
                                    className={`user-type department ${location.pathname === "/department"
                                        ? "active-role-department"
                                        : ""
                                        }`}
                                    onClick={() => goTo("/department")}
                                >
                                    🏛 Department
                                </div>

                                <div
                                    className={`user-type institution ${location.pathname === "/institution"
                                        ? "active-role-institution"
                                        : ""
                                        }`}
                                    onClick={() => goTo("/institution")}
                                >
                                    🏢 Institutional
                                </div>

                                <div
                                    className={`user-type citizen ${location.pathname === "/citizen"
                                        ? "active-role-citizen"
                                        : ""
                                        }`}
                                    onClick={() => goTo("/citizen")}
                                >
                                    👤 Citizen
                                </div>
                            </div>
                        </div>

                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Username or Email"
                                value={loginId}
                                onChange={(e) =>
                                    setLoginId(e.target.value)
                                }
                            />
                        </div>

                        <div className="input-group password-group">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                            >
                                {showPassword ? (
                                    <FaEyeSlash />
                                ) : (
                                    <FaEye />
                                )}
                            </button>
                        </div>

                        <div className="login-options">
                            <label className="remember-me">
                                <input type="checkbox" />
                                Remember me
                            </label>
                            <a href="#">
                                Forgot Password?
                            </a>
                        </div>

                        {error && (
                            <div className="login-error">
                                {error}
                            </div>
                        )}

                        <button
                            className="login-btn"
                            onClick={handleLogin}
                            disabled={
                                !loginId ||
                                !password ||
                                loading
                            }
                        >
                            {loading
                                ? "Logging In..."
                                : "Login"}
                        </button>
                        <button
                            className="back-home-btn"
                            onClick={handleLogout}
                        >
                            ⬅ Back to Home
                        </button>
                    </div>
                ) : (
                    <div className="application-launcher">
                        <div className="app-grid">
                            {appLogos.map((app, index) => (
                                <div className="app-card-custom" key={index}>
                                    <div className="app-header-row">
                                        <div className="app-icon-img">
                                            <img
                                                src={app.src}
                                                alt={app.title}
                                                style={{
                                                    width: `${app.size}px`,
                                                    objectFit: "contain"
                                                }}
                                            />
                                        </div>
                                        <h3 className="app-title-inline">
                                            {app.title}
                                        </h3>
                                    </div>

                                    <p className="app-desc">
                                        {app.description}
                                    </p>

                                    <button
                                        className="explore-btn-custom"
                                        onClick={() => window.open(app.url, "_blank")}
                                    >
                                        Explore ↗
                                    </button>

                                </div>
                            ))}
                        </div>
                    </div>
                )
            }

            <div className="session-timer">
                ⏱ Session expires in: {formattedTime}
            </div>

            {
                loggedInUser && (
                    <div className="logged-user-card">
                        <div className="user-avatar-login">
                            <FaUserCircle size={48} />
                        </div>
                        <div>
                            <div className="logged-name">
                                {loggedInUser?.user?.firstName}{" "}
                                {loggedInUser?.user?.lastName}
                            </div>

                            <button
                                className="logout-btn"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                )
            }
        </div>
    );
};