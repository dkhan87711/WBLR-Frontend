import "./Institution.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import leftLogo from "../../assets/department-left-logo.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import {
    institutionLogin,
    institutionLogout
} from "../../api/apiService";

import {
    FaMapMarkedAlt,
    FaTasks,
    FaDatabase,
    FaChartLine,
    FaUserCircle
} from "react-icons/fa";

export const Institution = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);

    const [showApps, setShowApps] = useState(false);
    const [loggedInUser, setLoggedInUser] = useState(null);

    const [loginId, setLoginId] = useState("");
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
                await institutionLogin({
                    userName: loginId,
                    email: loginId,
                    password,
                    loginType: "WEB"
                });

            console.log(
                "Institution Login Success",
                response.data
            );

            const userData =
                response.data.data;

            setLoggedInUser(userData);

            localStorage.setItem(
                "user",
                JSON.stringify(userData)
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
                await institutionLogout({
                    sessionId
                });
            }
        } catch (error) {
            console.error(
                "Logout Error",
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
            <div className="header-text">
                <div className="title-badge" style={{ marginLeft: "10rem" }}>
                    GeoSpatial Intelligence Platform</div>
                <h2 className="main-title-header" style={{ marginLeft: "10rem" }}>
                    Unified Land Management Platform
                </h2>
            </div>

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

            {!showApps ? (

                <div className="login-card">

                    <div className="login-header">
                        <div className="login-icon-institution">
                            <span>🏢</span>
                        </div>

                        <p>Institutional Login</p>
                        <div className="divider-institution"></div>
                    </div>

                    <div className="login-as">
                        <span>Login as</span>

                        <div className="user-type-All">
                            <div
                                className={`user-type department ${location.pathname === "/department"
                                    ? "active-role-department"
                                    : ""
                                    }`}
                                onClick={() =>
                                    goTo("/department")
                                }
                            >
                                🏛 &nbsp;Department
                            </div>

                            <div
                                className={`user-type institution ${location.pathname === "/institution"
                                    ? "active-role-institution"
                                    : ""
                                    }`}
                                onClick={() =>
                                    goTo("/institution")
                                }
                            >
                                🏢 Institutional
                            </div>

                            <div
                                className={`user-type citizen ${location.pathname === "/citizen"
                                    ? "active-role-citizen"
                                    : ""
                                    }`}
                                onClick={() =>
                                    goTo("/citizen")
                                }
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
                                setLoginId(
                                    e.target.value
                                )
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
                            <input
                                type="checkbox"
                            />
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

                    <div className="launcher-header">
                        <h2>Welcome To Bhu-Manchitra</h2>
                        <p>
                            Select an application to continue
                        </p>
                    </div>

                    <div className="app-grid">
                        <div className="app-card geospatial">
                            <div className="app-icon geospatial-icon">
                                <FaMapMarkedAlt />
                            </div>
                            <h3>Bhu-Manchitra Web Portal</h3>
                            <p>
                                Unified GIS platform for map visualization, spatial layers, and land information services.
                            </p>

                            <button
                                className="explore-btn geospatial-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate("/map");
                                }}
                            >
                                Explore ↗
                            </button>
                        </div>

                        <div className="app-card acquisition">
                            <div className="app-icon acquisition-icon">
                                <FaTasks />
                            </div>
                            <h3>Bhu-Manchitra Data Hub</h3>
                            <p>
                                Centralized repository for managing, integrating, and sharing geospatial datasets.
                            </p>

                            <button
                                className="explore-btn compliance-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(
                                        "https://indcs0152.atrapa.deloitte.com/gisportal/apps/sites/#/unified-land-management-system",
                                        "_blank"
                                    );
                                }}
                            >
                                Explore ↗
                            </button>
                        </div>

                    </div>

                </div>

            )}

            {loggedInUser && (
                <div className="logged-user-card">
                    <div className="user-avatar">
                        <FaUserCircle size={48} />
                    </div>

                    <div>
                        <div className="logged-label">
                            Logged in as
                        </div>

                        <div className="logged-name">
                            {loggedInUser.user.firstName}{" "}
                            {loggedInUser.user.lastName}
                        </div>

                        <div className="logged-role">
                            {loggedInUser.user.userType?.name} User
                        </div>

                        <button
                            className="logout-btn"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};