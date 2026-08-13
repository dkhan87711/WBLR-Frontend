import "./Citizen.css";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import leftLogo from "../../assets/department-left-logo.png";
import {
    FaMapMarkedAlt,
    FaTasks,
    FaDatabase,
    FaChartLine,
    FaUserCircle
} from "react-icons/fa";

import appConfig from "../../assets/config/url_citizen.json";

import logo1 from "../../assets/images/ulmp.png";
import logo2 from "../../assets/images/ulmp-approval.png";
import logo3 from "../../assets/images/datahub.png";
import logo4 from "../../assets/images/3d.png";
import logo5 from "../../assets/images/urban.png";
import logo6 from "../../assets/images/property.png";
import logo7 from "../../assets/images/aseet.png";
import logo8 from "../../assets/images/road.png";

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
                otp,
                "Citizen"
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

            {/* =====================================================
            HEADER
        ===================================================== */}
            <div className="header-text">
                <div
                    className="title-badge"
                    style={{ marginLeft: "10rem" }}
                >
                    GeoSpatial Intelligence Platform
                </div>

                <h2
                    className="main-title-header"
                    style={{ marginLeft: "10rem" }}
                >
                    Unified Land Management Platform
                </h2>
            </div>


            {/* =====================================================
            LEFT PANEL
        ===================================================== */}
            <div className="left-panel">
                <div className="left-text">

                    <h5 className="sub-title-header-login">
                        Unified Land Management Platform
                    </h5>

                    <div className="underline-header-login"></div>

                    <p className="description-header-login">
                        Integrated Geospatial Platform for Land Governance,
                        Monitoring, Spatial Planning and Decision Support,
                        enabling a unified view of Land Records, Cadastral
                        Mapping, ULPIN, DIGIPIN, Property Intelligence,
                        Citizen Services and Cross-Department Governance.
                    </p>

                </div>
            </div>


            {/* =====================================================
            LOGIN / APPLICATION LAUNCHER
        ===================================================== */}
            {!showApps ? (

                /* =================================================
                   LOGIN CARD
                ================================================= */
                <div className="login-card">

                    {/* HEADER */}
                    <div className="login-header">

                        <div className="login-icon-citizen">
                            <span>👤</span>
                        </div>

                        <p>
                            Welcome Citizen! Please verify your mobile
                            to continue
                        </p>

                        <div className="divider-citizen"></div>

                    </div>


                    {/* =================================================
                    LOGIN TYPE
                ================================================= */}
                    <div className="login-as">

                        <span>
                            Login as
                        </span>

                        <div className="user-type-All">

                            {/* DEPARTMENT */}
                            <div
                                className={`user-type department ${location.pathname ===
                                    "/ulmp/department"
                                    ? "active-role-department"
                                    : ""
                                    }`}
                                onClick={() =>
                                    goTo("/ulmp/department")
                                }
                            >
                                🏛 &nbsp;Department
                            </div>


                            {/* INSTITUTION */}
                            <div
                                className={`user-type institution ${location.pathname ===
                                    "/ulmp/institution"
                                    ? "active-role-institution"
                                    : ""
                                    }`}
                                onClick={() =>
                                    goTo("/ulmp/institution")
                                }
                            >
                                🏢 Institutional
                            </div>


                            {/* CITIZEN */}
                            <div
                                className={`user-type citizen ${location.pathname ===
                                    "/ulmp/citizen"
                                    ? "active-role-citizen"
                                    : ""
                                    }`}
                                onClick={() =>
                                    goTo("/ulmp/citizen")
                                }
                            >
                                👤 Citizen
                            </div>

                        </div>

                    </div>


                    {/* =================================================
                    STEP 1 - MOBILE NUMBER
                ================================================= */}
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
                                    maxLength={10}
                                />

                            </div>


                            {/* MOBILE VALIDATION */}
                            {!isValidMobile &&
                                mobile.length > 0 && (
                                    <p className="error-text">
                                        Enter valid 10-digit mobile number
                                    </p>
                                )}


                            {/* SEND OTP */}
                            <button
                                className="login-btn"
                                onClick={handleSendOtp}
                                disabled={
                                    !isValidMobile ||
                                    loading
                                }
                            >
                                {loading
                                    ? "Sending OTP..."
                                    : "Send OTP"}
                            </button>

                        </>
                    )}


                    {/* =================================================
                    STEP 2 - OTP
                ================================================= */}
                    {step === 2 && (
                        <>

                            <div className="input-group">

                                <input
                                    type="text"
                                    placeholder="Enter 6 Digit OTP"
                                    value={otp}
                                    onChange={handleOtpChange}
                                    maxLength={6}
                                />

                            </div>


                            {/* VERIFY OTP */}
                            <button
                                className="login-btn"
                                onClick={handleVerifyOtp}
                                disabled={
                                    !isValidOtp ||
                                    loading
                                }
                            >
                                {loading
                                    ? "Verifying..."
                                    : "Verify OTP"}
                            </button>


                            {/* =================================================
                            RESEND OTP
                        ================================================= */}
                            <div className="otp-resend">

                                {!canResend ? (

                                    <p>
                                        Resend OTP in{" "}
                                        {timer}s
                                    </p>

                                ) : (

                                    <button
                                        onClick={
                                            handleResendOtp
                                        }
                                        disabled={loading}
                                    >
                                        {loading
                                            ? "Sending..."
                                            : "Resend OTP"}
                                    </button>

                                )}


                                <br />


                                {/* CHANGE MOBILE */}
                                <a
                                    href="#"
                                    className="change-mobile-link"
                                    onClick={
                                        handleChangeMobile
                                    }
                                >
                                    Change Mobile Number
                                </a>

                            </div>

                        </>
                    )}


                    {/* =================================================
                    ERROR
                ================================================= */}
                    {error && (
                        <p className="error-text">
                            {error}
                        </p>
                    )}


                    {/* =================================================
                    SUPPORT
                ================================================= */}
                    <div className="footer-help">

                        Need help?{" "}

                        <a href="#">
                            &nbsp; Contact Support
                        </a>

                    </div>


                    {/* =================================================
                    BACK HOME
                ================================================= */}
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

                /* =================================================
                   APPLICATION LAUNCHER
                ================================================= */
                <div className="application-launcher-citizen">

                    <div className="app-grid">

                        {appLogos.map(
                            (app, index) => (

                                <div
                                    className="app-card-custom"
                                    key={index}
                                >

                                    {/* =================================================
                                    APP HEADER
                                ================================================= */}
                                    <div className="app-header-row">

                                        <div className="app-icon-img">

                                            <img
                                                src={app.src}
                                                alt={app.title}
                                                style={{
                                                    width: `${app.size}px`,
                                                    height: `${app.size}px`,
                                                    objectFit: "contain"
                                                }}
                                            />

                                        </div>


                                        <h3 className="app-title-inline">
                                            {app.title}
                                        </h3>

                                    </div>


                                    {/* =================================================
                                    APP DESCRIPTION
                                ================================================= */}
                                    <p className="app-desc">
                                        {app.description}
                                    </p>


                                    {/* =================================================
                                    EXPLORE
                                ================================================= */}
                                    <button
                                        className="explore-btn-custom"
                                        onClick={() =>
                                            window.open(
                                                app.url,
                                                "_blank"
                                            )
                                        }
                                    >
                                        Explore ↗
                                    </button>

                                </div>

                            )
                        )}

                    </div>

                </div>

            )}


            {/* =====================================================
            LOGGED-IN USER CARD
        ===================================================== */}
            {loggedInUser && (

                <div className="logged-user-card">

                    {/* USER AVATAR */}
                    <div className="user-avatar">
                        👤
                    </div>


                    <div>

                        {/* LABEL */}
                        <div className="logged-label">
                            Logged in as
                        </div>


                        {/* MOBILE */}
                        <div className="logged-name">
                            +91 {loggedInUser.mobileNumber}
                        </div>


                        {/* ROLE */}
                        <div className="logged-role">
                            Citizen Login
                        </div>


                        {/* LOGOUT */}
                        <button
                            className="back-home-btn"
                            onClick={() => {

                                localStorage.removeItem(
                                    "user"
                                );

                                setLoggedInUser(null);
                                setShowApps(false);
                                setStep(1);
                                setMobile("");
                                setOtp("");
                                setError("");

                            }}
                        >
                            Logout
                        </button>

                    </div>

                </div>

            )}

        </div>
    );
};