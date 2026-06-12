import "./Citizen.css";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import leftLogo from "../../assets/department-left-logo.png";

import {
    sendOtp as sendOtpApi,
    verifyOtp as verifyOtpApi,
    resendOtp as resendOtpApi
} from "../../api/apiService";

export const Citizen = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [step, setStep] = useState(1);
    const [showApps, setShowApps] = useState(false);
    const [loggedInUser, setLoggedInUser] = useState(null);

    const [mobile, setMobile] = useState("");
    const [otp, setOtp] = useState("");

    const [timer, setTimer] = useState(15);
    const [canResend, setCanResend] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const goTo = (path) => {
        navigate(path);
    };

    const handleMobileChange = (e) => {
        let value = e.target.value.replace(/\D/g, "");

        if (value.length <= 10) {
            setMobile(value);
        }

        setError("");
    };

    const handleOtpChange = (e) => {
        let value = e.target.value.replace(/\D/g, "");

        if (value.length <= 6) {
            setOtp(value);
        }

        setError("");
    };

    const isValidMobile = mobile.length === 10;
    const isValidOtp = otp.length === 6;

    useEffect(() => {
        let interval;

        if (step === 2 && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }

        if (timer === 0) {
            setCanResend(true);
        }

        return () => clearInterval(interval);
    }, [step, timer]);

    const handleSendOtp = async () => {
        if (!isValidMobile) return;

        try {
            setLoading(true);
            setError("");

            await sendOtpApi(`${mobile}`);

            setStep(2);
            setTimer(15);
            setCanResend(false);

        } catch (err) {
            console.error(err);

            setError(
                err?.response?.data?.message ||
                "Failed to send OTP"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!isValidOtp) {
            setError("Please enter a valid 6-digit OTP");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await verifyOtpApi(
                `${mobile}`,
                otp
            );

            console.log(
                "Citizen Login Success",
                response.data
            );

            const userData = {
                mobileNumber: mobile,
                userTypeName: "Citizen"
            };

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
                "OTP verification failed"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        try {
            setLoading(true);
            setError("");

            await resendOtpApi(`${mobile}`);

            setTimer(15);
            setCanResend(false);

        } catch (err) {
            console.error(err);

            setError(
                err?.response?.data?.message ||
                "Failed to resend OTP"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleChangeMobile = (e) => {
        e.preventDefault();

        setStep(1);
        setOtp("");
        setError("");
        setTimer(15);
        setCanResend(false);
    };

    return (
        <div className="login-page">

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
                        multiple departments.
                    </p>

                </div>

            </div>

            {!showApps ? (
                <div className="login-card">

                    {/* HEADER */}
                    <div className="login-header">
                        <div className="login-icon-citizen">
                            <span>👤</span>
                        </div>

                        <p>
                            Welcome Citizen! Please verify your mobile
                            <br />
                            to continue
                        </p>

                        <div className="divider-citizen"></div>
                    </div>

                    {/* LOGIN TYPE */}
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

                    {/* STEP 1 */}
                    {step === 1 && (
                        <>
                            <div
                                className="input-group mobile-input"
                                style={{
                                    display: "flex",
                                    gap: "10px"
                                }}
                            >
                                <span className="country-code">
                                    +91
                                </span>

                                <input
                                    type="text"
                                    placeholder="Enter mobile number"
                                    value={mobile}
                                    onChange={handleMobileChange}
                                />
                            </div>

                            {!isValidMobile &&
                                mobile.length > 0 && (
                                    <p className="error-text">
                                        Enter valid 10-digit mobile number
                                    </p>
                                )}

                            <button
                                className="login-btn"
                                onClick={handleSendOtp}
                                disabled={
                                    !isValidMobile || loading
                                }
                            >
                                {loading
                                    ? "Sending OTP..."
                                    : "Send OTP"}
                            </button>
                        </>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                        <>
                            <div className="input-group">
                                <input
                                    type="text"
                                    placeholder="Enter 6 Digit OTP"
                                    value={otp}
                                    onChange={handleOtpChange}
                                />
                            </div>

                            <button
                                className="login-btn"
                                onClick={handleVerifyOtp}
                                disabled={loading}
                            >
                                {loading
                                    ? "Verifying..."
                                    : "Verify OTP"}
                            </button>

                            <div className="otp-resend">

                                {!canResend ? (
                                    <p>
                                        Resend OTP in {timer}s
                                    </p>
                                ) : (
                                    <button
                                        onClick={handleResendOtp}
                                    >
                                        Resend OTP
                                    </button>
                                )}

                                <br />

                                <a
                                    href="#"
                                    className="change-mobile-link"
                                    onClick={handleChangeMobile}
                                >
                                    Change Mobile Number
                                </a>

                            </div>
                        </>
                    )}

                    {error && (
                        <p className="error-text">
                            {error}
                        </p>
                    )}

                    <div className="footer-help">
                        Need help?{" "}
                        <a href="#">
                            Contact Support
                        </a>
                    </div>

                    <button
                        className="back-home-btn"
                        onClick={() => navigate("/")}
                    >
                        ⬅ Back to Home
                    </button>

                </div>

            ) : (

                <div className="application-launcher citizen-launcher">

                    {/* <div className="launcher-header">
                        <p>
                            Select an application to continue
                        </p>
                    </div> */}

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center"
                        }}
                    >
                        <div className="app-card citizen-app">

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
                            +91 {loggedInUser.mobileNumber}
                        </div>

                        <div className="logged-role">
                            Citizen Login
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