import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Approval.css";

import {
    FaUserCircle,
    FaUserShield,
    FaSignOutAlt,
    FaSearch,
    FaCheckCircle,
    FaTimesCircle,
    FaClock,
    FaArrowLeft
} from "react-icons/fa";

import {
    getApprovalRequests,
    getApprovalDetails,
    submitApproval
} from "../../api/apiService";

const Approval = () => {

    const navigate = useNavigate();
    const storedUser = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    const user = storedUser?.user;
    const isEditor =
        ["FIELD_USER", "BLRO"].includes(
            user?.userSubType?.code
        );

    const [requests, setRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [reviewData, setReviewData] = useState(null);
    const [reviewComment, setReviewComment] = useState("");
    const [loading, setLoading] = useState(false);

    const [plotFilter, setPlotFilter] = useState("");
    const [mouzaFilter, setMouzaFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [requestedByFilter, setRequestedByFilter] = useState("");


    // ✅ FETCH LIST
    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);

            const res = await getApprovalRequests();

            console.log("API RESPONSE:", res); // 👈 DEBUG

            // ✅ handle multiple possible formats
            const list =
                res.data?.data ||
                res.data ||
                res.data?.result ||
                [];

            const formatted = list.map((row) => ({
                requestId: row.txn_id,
                txn_type: row.txn_type,
                plotNo: row.plot_no,
                mouza: row.mouza,
                jlNo: "-",
                requestedBy: row.requested_by,
                requestedDate: row.requested_date
                    ? new Date(row.requested_date).toLocaleDateString()
                    : "-",
                status: row.status || "Pending",
                areaChange: "-"
            }));

            setRequests(formatted);

        } catch (err) {
            console.error("FETCH ERROR:", err);
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    // ✅ REVIEW CLICK
    const handleReview = async (row) => {
        try {
            const res = await getApprovalDetails(row.requestId);

            setSelectedRequest(row);
            setReviewData(res.data.data);

        } catch (err) {
            console.error(err);
        }
    };

    // ✅ APPROVE / REJECT
    const handleAction = async (status) => {
        try {
            await submitApproval({
                txnId: selectedRequest.requestId,
                role: user.role.name,
                status,
                remarks: reviewComment,
                userId: user.userId
            });

            alert(`Request ${status} ✅`);

            setSelectedRequest(null);
            setReviewData(null);
            setReviewComment("");

            fetchRequests();

        } catch (err) {
            alert("Error while processing!");
        }
    };

    const handleDelete = (txnId) => {
        if (!window.confirm("Are you sure to delete?")) return;

        // temporary UI remove (backend later)
        setRequests(prev =>
            prev.filter(r => r.requestId !== txnId)
        );
    };

    const handleSendForApproval = (txnId) => {
        alert("Sent for approval ✅");

        // temporary status update
        setRequests(prev =>
            prev.map(r =>
                r.requestId === txnId
                    ? { ...r, status: "SUBMITTED" }
                    : r
            )
        );
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("sessionId");

        navigate("/department", { replace: true });
    };

    const totalCount = requests?.length || 0;
    const pendingCount =
        requests?.filter(r => r.status === "Pending")?.length || 0;
    const approvedCount =
        requests?.filter(r => r.status === "APPROVED")?.length || 0;
    const rejectedCount =
        requests?.filter(r => r.status === "REJECTED")?.length || 0;

    /** Filters */
    const mouzaOptions = [
        ...new Set(
            requests
                .map(r => r.mouza)
                .filter(Boolean)
        )
    ];
    const statusOptions = [
        ...new Set(
            requests
                .map(r => r.status)
                .filter(Boolean)
        )
    ];
    const filteredRequests = requests.filter(row => {

        const matchesPlot =
            !plotFilter ||
            row.plotNo
                ?.toString()
                .toLowerCase()
                .includes(plotFilter.toLowerCase());

        const matchesMouza =
            !mouzaFilter ||
            row.mouza === mouzaFilter;

        const matchesStatus =
            !statusFilter ||
            row.status === statusFilter;

        const matchesRequestedBy =
            !requestedByFilter ||
            row.requestedBy
                ?.toLowerCase()
                .includes(
                    requestedByFilter.toLowerCase()
                );

        const matchesDate =
            !dateFilter ||
            new Date(row.requestedDate)
                .toISOString()
                .split("T")[0] === dateFilter;

        return (
            matchesPlot &&
            matchesMouza &&
            matchesStatus &&
            matchesRequestedBy &&
            matchesDate
        );
    });


    return (
        <div className="approval-page">

            {/* HEADER */}
            <div className="app-header">
                <div className="header-left">
                    <span className="menu-icon">☰</span>

                    <h2 className="map-title-header">
                        Bhu-Manchitra : Approval Flow Management
                    </h2>
                </div>

                <div className="header-right">
                    <div className="user-profile-card">
                        <div className="user-avatar">
                            <FaUserCircle />
                        </div>

                        <div className="user-details">
                            <div className="user-display-name">
                                {user?.firstName} {user?.lastName}
                            </div>
                            <div className="user-meta">
                                <FaUserShield />
                                <span>
                                    {user?.role?.name}
                                </span>
                            </div>
                        </div>

                        <button
                            className="logout-icon-btn"
                            onClick={handleLogout}
                        >
                            <FaSignOutAlt />
                        </button>
                    </div>
                </div>
            </div>

            {/* ================= REVIEW SCREEN ================= */}
            {selectedRequest ? (
                <div className="review-page">

                    <div className="review-header">
                        <button
                            className="back-btn"
                            onClick={() => {
                                setSelectedRequest(null);
                                setReviewData(null);
                            }}
                        >
                            <FaArrowLeft /> Back to Queue
                        </button>

                        <div>
                            <h2>Plot #{selectedRequest.plotNo}</h2>
                            <p>
                                Requested By: {selectedRequest.requestedBy} |
                                Date: {selectedRequest.requestedDate}
                            </p>
                        </div>
                    </div>

                    {/* SUMMARY */}
                    <div className="review-top-grid">

                        <div className="summary-card">
                            <h3>Change Summary</h3>

                            <div className="summary-row">
                                <span>Request ID</span>
                                <strong>{selectedRequest.requestId}</strong>
                            </div>

                            <div className="summary-row">
                                <span>Submitted By</span>
                                <strong>{selectedRequest.requestedBy}</strong>
                            </div>

                            <div className="summary-row">
                                <span>Submitted On</span>
                                <strong>{selectedRequest.requestedDate}</strong>
                            </div>

                            <div className="summary-row">
                                <span>Status</span>
                                <strong className="status-pending">
                                    Pending Approval
                                </strong>
                            </div>
                        </div>

                        {/* Workflow static (can sync later) */}
                        <div className="timeline-card">
                            <h3>Approval Workflow</h3>

                            <ul className="timeline">
                                <li className="completed">✓ Submitted</li>
                                <li className="completed">✓ Survey</li>
                                <li className="active">● Review</li>
                                <li>○ DLRO</li>
                                <li>○ Final</li>
                            </ul>
                        </div>

                    </div>

                    {/* MAP (UNCHANGED ✅) */}
                    <div className="comparison-section">

                        <div className="map-panel">
                            <div className="map-panel-header">BEFORE EDIT</div>
                            <div className="approval-map">
                                <div className="map-placeholder">
                                    Existing Plot Boundary
                                    <div className="legend">Blue Polygon</div>
                                </div>
                            </div>
                        </div>

                        <div className="map-panel">
                            <div className="map-panel-header">AFTER EDIT</div>
                            <div className="approval-map">
                                <div className="map-placeholder">
                                    Proposed Plot Boundary
                                    <div className="legend green">
                                        Green Polygon
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* 🔥 DYNAMIC TABLE FROM DB */}
                    <div className="attribute-card">
                        <h3>Transaction Details</h3>

                        <table className="attribute-table">
                            <thead>
                                <tr>
                                    <th>Old Plot No</th>
                                    <th>New Plot No</th>
                                    <th>Mouza</th>
                                    <th>Khatihan No</th>
                                    <th>Owner Name</th>
                                    <th>ROR Area  (hec)</th>
                                    <th>GIS Area  (hec)</th>
                                    <th>Area Diff (hec)</th>
                                </tr>
                            </thead>

                            <tbody>
                                {reviewData?.transaction?.map((row, i) => (
                                    <tr key={i}>
                                        <td>{row?.old_plot_no}</td>
                                        <td>{row?.new_plot_no}</td>
                                        <td>{row?.mouza}</td>
                                        <td>{row?.khatian_no}</td>
                                        <td>{row?.owner_name}</td>
                                        <td>{row?.ror_area}</td>
                                        <td>{row?.gis_area}</td>
                                        <td>
                                            {(
                                                (parseFloat(row?.gis_area || 0) -
                                                    parseFloat(row?.ror_area || 0)
                                                ).toFixed(4)
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                    </div>

                    {/* COMMENTS */}
                    <div className="comment-card">
                        <h3>Reviewer Comments</h3>
                        <textarea
                            value={reviewComment}
                            onChange={(e) =>
                                setReviewComment(e.target.value)
                            }
                            placeholder="Enter approval/rejection remarks..."
                        />
                    </div>

                    {/* ACTION */}
                    <div className="action-panel">

                        <button
                            className="reject-btn"
                            onClick={() => handleAction("REJECTED")}
                        >
                            <FaTimesCircle /> Reject Request
                        </button>

                        <button
                            className="approve-btn"
                            onClick={() => handleAction("APPROVED")}
                        >
                            <FaCheckCircle /> Approve Request
                        </button>

                    </div>

                </div>

            ) : (

                /* ================= LIST SCREEN ================= */
                <div className="approval-content">

                    <div className="page-title-card">
                        <h2>Approval Flow Management</h2>
                        <p>Review and approve cadastral plot modifications</p>
                    </div>

                    <div className="kpi-grid">
                        <div className="kpi-card pending">
                            <FaClock />
                            <span>Pending</span>
                            <h2>{pendingCount}</h2>
                        </div>

                        <div className="kpi-card approved">
                            <FaCheckCircle />
                            <span>Approved Today</span>
                            <h2>{approvedCount}</h2>
                        </div>

                        <div className="kpi-card rejected">
                            <FaTimesCircle />
                            <span>Rejected</span>
                            <h2>{rejectedCount}</h2>
                        </div>

                        <div className="kpi-card total">
                            <FaSearch />
                            <span>Total Changes</span>
                            <h2>{totalCount}</h2>
                        </div>
                    </div>

                    {/* ================= FILTERS ================= */}
                    <div className="filter-panel">
                        <input
                            type="text"
                            placeholder="Search Plot Number"
                            value={plotFilter}
                            onChange={(e) =>
                                setPlotFilter(e.target.value)
                            }
                        />

                        <select
                            value={mouzaFilter}
                            onChange={(e) =>
                                setMouzaFilter(e.target.value)
                            }
                        >
                            <option value="">
                                All Mouza
                            </option>

                            {mouzaOptions.map((mouza) => (
                                <option
                                    key={mouza}
                                    value={mouza}
                                >
                                    {mouza}
                                </option>
                            ))}
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(e.target.value)
                            }
                        >
                            <option value="">
                                All Status
                            </option>

                            {statusOptions.map((status) => (
                                <option
                                    key={status}
                                    value={status}
                                >
                                    {status}
                                </option>
                            ))}
                        </select>

                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) =>
                                setDateFilter(e.target.value)
                            }
                        />

                        <button
                            className="review-btn"
                            onClick={() => {
                                setPlotFilter("");
                                setMouzaFilter("");
                                setStatusFilter("");
                                setDateFilter("");
                                setRequestedByFilter("");
                            }}
                        >
                            Reset
                        </button>

                    </div>


                    <div className="request-grid-card">

                        <div className="section-title">
                            Plot Modification Requests
                        </div>

                        <table className="approval-table">

                            <thead>
                                <tr>
                                    <th>Edit Type</th>
                                    <th>Plot No</th>
                                    <th>Mouza</th>
                                    <th>Requested By</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredRequests.map((row) => (

                                    <tr key={row.requestId}>
                                        <td>{row.txn_type}</td>
                                        <td>{row.plotNo}</td>
                                        <td>{row.mouza}</td>
                                        <td>{row.requestedBy}</td>
                                        <td>{row.requestedDate}</td>

                                        <td>
                                            <span className="pending-badge">
                                                {row.status}
                                            </span>
                                        </td>

                                        <td style={{ display: "flex", height: '55px' }}>
                                            {isEditor ? (
                                                <>
                                                    <button
                                                        className="reject-btn"
                                                        onClick={() => handleDelete(row.requestId)}
                                                    >
                                                        Delete
                                                    </button>

                                                    <button
                                                        className="approve-btn"
                                                        onClick={() => handleSendForApproval(row.requestId)}
                                                        style={{ marginLeft: "6px" }}
                                                    >
                                                        Send for Approval
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    className="review-btn"
                                                    onClick={() => handleReview(row)}
                                                >
                                                    Review
                                                </button>
                                            )}
                                        </td>

                                    </tr>
                                ))}
                            </tbody>

                        </table>

                    </div>

                </div>
            )}

        </div>
    );
};

export default Approval;