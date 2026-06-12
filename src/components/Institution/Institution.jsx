import "./Institution.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { institutionLogin } from "../../api/apiService";
import leftLogo from "../../assets/department-left-logo.png";

export const Institution = () => {
    const navigate = useNavigate();
    const location = useLocation();

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

            const response = await institutionLogin({
                userName,
                password,
            });

            console.log(
                "Institution Login Success",
                response.data
            );

            const userData = response.data.data;

            localStorage.setItem(
                "user",
                JSON.stringify(userData)
            );

            setLoggedInUser(userData);
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

    return (
        <div className="login-page">

            {/* ===== LEFT VISUAL PANEL ===== */}
            <div className="left-panel">

                <div className="left-icon">
                    <img
                        src={leftLogo}
                        alt="landstack-icon"
                    />
                </div>

                <div className="left-text">
                    <p className="welcome-text">
                        Welcome to
                    </p>

                    <h2 className="main-title">
                        Landstack
                    </h2>

                    <h5 className="sub-title">
                        Unified Digital Land Information System
                    </h5>

                    <div className="underline"></div>

                    <p className="description">
                        Landstack is an integrated GIS-based
                        Digital Land Information System that
                        unifies land records, geospatial data,
                        and administrative processes across
                        multiple departments. It enables
                        seamless data exchange, enhances
                        transparency, and drives efficient
                        land governance through a single,
                        connected digital ecosystem.
                    </p>
                </div>

            </div>

            {!showApps ? (

                <div className="login-card">

                    <div className="login-header">
                        <div className="login-icon-institution">
                            <span>🏢</span>
                        </div>

                        <p>
                            Welcome! Please sign in to your
                            account
                            <br />
                            to continue
                        </p>

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
                                🏛 Department
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
                            placeholder="Username"
                            value={userName}
                            onChange={(e) =>
                                setUserName(
                                    e.target.value
                                )
                            }
                        />
                    </div>

                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) =>
                                setPassword(
                                    e.target.value
                                )
                            }
                        />
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
                            Contact Support
                        </a>
                    </div>

                    <button
                        className="back-home-btn"
                        onClick={() =>
                            navigate("/")
                        }
                    >
                        ⬅ Back to Home
                    </button>

                </div>

            ) : (

                <div className="application-launcher">

                    <div className="launcher-header">
                        <p>
                            Select an application to continue
                        </p>
                    </div>

                    <div className="app-grid">

                        {/* Geospatial */}
                        <div className="app-card geospatial">

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

                        {/* Acquisition */}
                        <div className="app-card acquisition">

                            <div className="app-icon acquisition-icon">
                                🔍
                            </div>

                            <h3>
                                Land Acquisition Impact
                                Assessment
                            </h3>

                            <p>
                                Assess and analyse the
                                impact of land acquisition
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

                        {/* Compliance */}
                        <div className="app-card compliance compliance-center">

                            <div className="app-icon compliance-icon">
                                🛡️
                            </div>

                            <h3>
                                Compliance Monitoring &
                                Restriction Flagging
                            </h3>

                            <p>
                                Monitor compliance and
                                land-use restrictions
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

            )}

            {loggedInUser && (
                <div className="logged-user-card">

                    <div className="user-avatar">
                        👤
                    </div>

                    <div>

                        <div className="logged-label">
                            Logged in as
                        </div>

                        <div className="logged-name">
                            {loggedInUser.firstName}{" "}
                            {loggedInUser.lastName}
                        </div>

                        <div className="logged-role">
                            {loggedInUser.userTypeName} Login
                        </div>

                        <button
                            className="back-home-btn"
                            onClick={() =>
                                navigate("/")
                            }
                        >
                            Logout
                        </button>

                    </div>

                </div>
            )}

        </div>
    );
};