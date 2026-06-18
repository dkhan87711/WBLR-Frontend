import "./Department.css";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { departmentLogin, departmentLogout } from "../../api/apiService";
import leftLogo from "../../assets/department-left-logo.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export const Department = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);

    const [showApps, setShowApps] = useState(false);
    const [loggedInUser, setLoggedInUser] = useState(null);

    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const goTo = (path) => {
        navigate(path);
    };

    const handleLogin = async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await departmentLogin({
                    userName,
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
            // For future authenticated APIs
            localStorage.setItem(
                "token",
                response.data.token || ""
            );
            // Session tracking
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

    return (
        <div className="login-page">

            {/* ===== TOP HEADER ===== */}
            {/* <div className="top-header">
                <h1>Landstack: Unified Digital Land Information System</h1>
                <p>
                    Integrated GIS Platform for Transparent, Efficient & Intelligent Land Management
                    Covering Masterplan, Permissions, Registration, Record of Rights & Cadastral Mapping
                </p>
            </div> */}

            {/* ===== LEFT VISUAL PANEL ===== */}
            <div className="left-panel">

                {/* ICON */}
                <div className="left-icon">
                    <img src={leftLogo} alt="landstack-icon" />
                </div>

                {/* TEXT */}
                <div className="left-text">
                    <p className="welcome-text">Welcome to</p>
                    <h2 className="main-title-header-login">
                        Bhu-<span>Manchitra</span>
                    </h2>

                    <h5 className="sub-title-header-login">
                        Land Records, Survey & Analytics Platform
                    </h5>
                    <div className="underline-header-login"></div>
                    <p className="description-header-login">
                        Integrated Geospatial Platform for Land Governance,
                        Monitoring and Decision Support System.
                        It enables seamless integration of land records,
                        cadastral maps, survey data, and spatial analytics
                        to support transparent administration, evidence-based
                        planning, and efficient land management across departments.
                    </p>
                </div>

            </div>

            {
                !showApps ? (

                    <div className="login-card">

                        <div className="login-header">
                            <div className="login-icon-department">
                                <span>🏛</span>
                            </div>

                            <p>
                                Welcome! Please sign in to your account
                                <br />
                                to continue
                            </p>

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
                                    🏛 &nbsp;Department
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
                                placeholder="Username"
                                value={userName}
                                onChange={(e) =>
                                    setUserName(e.target.value)
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
                                !userName ||
                                !password ||
                                loading
                            }
                        >
                            {loading
                                ? "Logging In..."
                                : "Login"}
                        </button>

                        <div className="or-divider">
                            <span></span>
                            <p>or</p>
                            <span></span>
                        </div>

                        <div className="footer-help">
                            Need help?
                            <a href="#">
                                &nbsp; Contact Support
                            </a>
                        </div>

                        <button
                            className="back-home-btn"
                            onClick={handleLogout}
                        >
                            ⬅ Back to Home
                        </button>

                    </div>

                ) : (

                    <div className="application-launcher">

                        <div className="launcher-header">
                            {/* <h2>Welcome To Landstack</h2> */}
                            <p>
                                Select an application to continue
                            </p>
                        </div>

                        <div className="app-grid">
                            <div
                                className="app-card geospatial"
                            >
                                <div className="app-icon geospatial-icon">
                                    🗺️
                                </div>
                                <h3>
                                    Unified Geospatial System
                                </h3>
                                <p>
                                    Integrated platform for all
                                    geospatial data and services
                                </p>

                                <button
                                    className="explore-btn geospatial-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(
                                            "https://indcs0152.atrapa.deloitte.com/gisportal/apps/experiencebuilder/experience/?id=4377d53312084943907c9b0d36a9dbc5&draft=true",
                                            "_blank"
                                        );
                                    }}
                                >
                                    Explore ↗
                                </button>
                            </div>

                            <div
                                className="app-card acquisition"
                            >
                                <div className="app-icon acquisition-icon">
                                    🔍
                                </div>
                                <h3>
                                    Land Acquisition Impact Assessment
                                </h3>
                                <p>
                                    Assess and analyse the impact
                                    of land acquisition
                                </p>

                                <button
                                    className="explore-btn acquisition-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(
                                            "https://indcs0152.atrapa.deloitte.com/gisportal/apps/experiencebuilder/experience/?id=20a34cdc7ebd457283f7159a1f5507ad",
                                            "_blank"
                                        );
                                    }}
                                >
                                    Explore ↗
                                </button>
                            </div>

                            <div
                                className="app-card citizen-app"
                            >
                                <div className="app-icon citizen-icon">
                                    👥
                                </div>
                                <h3>
                                    Landstack Web Application
                                    for Citizen
                                </h3>
                                <p>
                                    Citizen-centric land
                                    information and services
                                </p>

                                <button
                                    className="explore-btn citizen-btn-new"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(
                                            "https://indcs0152.atrapa.deloitte.com/gisportal/apps/experiencebuilder/experience/?id=dd63f5172f4342799a8204ccc02b8d3e",
                                            "_blank"
                                        );
                                    }}
                                >
                                    Explore ↗
                                </button>
                            </div>

                            <div
                                className="app-card compliance"
                            >
                                <div className="app-icon compliance-icon">
                                    🛡️
                                </div>
                                {/* <h3>
                                    Compliance Monitoring &
                                    Restriction Flagging
                                </h3>
                                <p>
                                    Monitor compliance and
                                    land-use restrictions
                                </p> */}
                                <h3>
                                    Property Tax Analytics Platform
                                </h3>
                                <p>
                                    AI + ML Based Property Tax Recovery and Analytics Platform
                                </p>

                                <button
                                    className="explore-btn compliance-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(
                                            "https://indcs0152.atrapa.deloitte.com/gisportal/apps/dashboards/4ca187c5ed5f40fe9788d14824cbff9c",
                                            "_blank"
                                        );
                                    }}
                                >
                                    Explore ↗
                                </button>
                            </div>

                        </div>
                    </div>

                )
            }

            {
                loggedInUser && (
                    <div className="logged-user-card">
                        <div className="user-avatar">
                            👤
                        </div>
                        <div>
                            <div className="logged-label">
                                Logged in as
                            </div>
                            <div className="logged-name">
                                {loggedInUser.firstName} {loggedInUser.lastName}
                            </div>
                            <div className="logged-role">
                                {loggedInUser.userTypeName} Login
                            </div>
                            <button
                                className="back-home-btn"
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