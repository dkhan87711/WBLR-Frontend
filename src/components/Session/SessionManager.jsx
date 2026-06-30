import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { departmentLogout } from "../../api/apiService";

const SessionManager = ({ children }) => {
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        let interval;
        let logoutTimer;
        let warningTimer;

        const SESSION_TIME = 60; // seconds (testing)
        const WARNING_TIME = 30; // seconds

        const token = localStorage.getItem("token");

        const handleLogout = async () => {
            try {
                const sessionId = localStorage.getItem("sessionId");
                if (sessionId) {
                    await departmentLogout(sessionId);
                }
            } catch (err) {
                console.error(err);
            } finally {
                localStorage.clear();
                navigate("/");
            }
        };

        if (token) {
            setTimeLeft(SESSION_TIME);

            // ✅ countdown (correct)
            interval = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            // ✅ correct milliseconds
            warningTimer = setTimeout(() => {
                alert("⚠ Session will expire in 30 seconds");
            }, (SESSION_TIME - WARNING_TIME) * 1000);

            // ✅ correct milliseconds
            logoutTimer = setTimeout(() => {
                alert("Session expired. Logging out...");
                handleLogout();
            }, SESSION_TIME * 1000);
        }

        return () => {
            clearInterval(interval);
            clearTimeout(logoutTimer);
            clearTimeout(warningTimer);
        };

    }, [navigate]);

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    return (
        <>
            {localStorage.getItem("token") && (
                <div
                    style={{
                        position: "fixed",
                        top: "10px",
                        right: "20px",
                        background: "rgba(0,0,0,0.75)",
                        color: "#fff",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        zIndex: 9999,
                        border: "1px solid #ff4d4f"
                    }}
                >
                    ⏱ Session expires in: {formatTime(timeLeft)}
                </div>
            )}

            {children}
        </>
    );
};

export default SessionManager;