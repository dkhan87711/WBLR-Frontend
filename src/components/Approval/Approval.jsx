import { useState } from "react";
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


const requests = [
    {
        requestId: "MOD-2026-0001",
        plotNo: "235",
        mouza: "Rajarhat",
        jlNo: "12",
        requestedBy: "Danish Khan",
        requestedDate: "28-Jun-2026",
        status: "Pending",
        areaChange: "+22.71 sqm"
    },
    {
        requestId: "MOD-2026-0002",
        plotNo: "671",
        mouza: "Rajarhat",
        jlNo: "08",
        requestedBy: "Ashish",
        requestedDate: "27-Jun-2026",
        status: "Pending",
        areaChange: "-14.22 sqm"
    },
    {
        requestId: "MOD-2026-0003",
        plotNo: "902",
        mouza: "New Town",
        jlNo: "44",
        requestedBy: "Kishan",
        requestedDate: "26-Jun-2026",
        status: "Pending",
        areaChange: "+8.15 sqm"
    }
];

const Approval = () => {

    const navigate = useNavigate();
    const storedUser = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    const user = storedUser?.user;

    const [selectedRequest, setSelectedRequest] =
        useState(null);
    const [reviewComment, setReviewComment] =
        useState("");

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("sessionId");
        navigate("/department", {
            replace: true
        });
    };

    return (
        <div className="approval-page">

            {/* HEADER */}
            <div className="app-header">
                <div className="header-left">
                    <span className="menu-icon">
                        ☰
                    </span>

                    <h2 className="map-title-header">
                        Bhu-Manchitra :
                        Approval Flow Management
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

            {/* REVIEW SCREEN */}
            {selectedRequest ? (
                <div className="review-page">
                    <div className="review-header">
                        <button
                            className="back-btn"
                            onClick={() =>
                                setSelectedRequest(null)
                            }
                        >
                            <FaArrowLeft />
                            Back to Queue
                        </button>

                        <div>
                            <h2>
                                Plot #{selectedRequest.plotNo}
                            </h2>
                            <p>
                                Requested By :
                                {" "}
                                {selectedRequest.requestedBy}
                                {" "}
                                | Date :
                                {" "}
                                {selectedRequest.requestedDate}
                            </p>
                        </div>
                    </div>

                    <div className="review-top-grid">
                        <div className="summary-card">
                            <h3>
                                Change Summary
                            </h3>
                            <div className="summary-row">
                                <span>Request ID</span>
                                <strong>
                                    {selectedRequest.requestId}
                                </strong>
                            </div>
                            <div className="summary-row">
                                <span>Submitted By</span>
                                <strong>
                                    {selectedRequest.requestedBy}
                                </strong>
                            </div>
                            <div className="summary-row">
                                <span>Submitted On</span>
                                <strong>
                                    {selectedRequest.requestedDate}
                                </strong>
                            </div>
                            <div className="summary-row">
                                <span>Area Difference</span>
                                <strong>
                                    {selectedRequest.areaChange}
                                </strong>
                            </div>
                            <div className="summary-row">
                                <span>Status</span>
                                <strong className="status-pending">
                                    Pending Approval
                                </strong>
                            </div>
                            <div className="summary-reason">
                                Boundary correction
                                based on DGPS survey
                                and field verification.
                            </div>
                        </div>

                        <div className="timeline-card">
                            <h3>
                                Approval Workflow
                            </h3>
                            <ul className="timeline">
                                <li className="completed">
                                    ✓ Submitted
                                </li>
                                <li className="completed">
                                    ✓ Survey Verification
                                </li>
                                <li className="active">
                                    ● Pending at Section Officer
                                </li>
                                <li>
                                    ○ District Officer
                                </li>
                                <li>
                                    ○ Final Approval
                                </li>
                            </ul>
                        </div>

                    </div>

                    <div className="comparison-section">
                        <div className="map-panel">
                            <div className="map-panel-header">
                                BEFORE EDIT
                            </div>
                            <div className="approval-map">
                                <div className="map-placeholder">
                                    Existing Plot Boundary
                                    <div className="legend">
                                        Blue Polygon
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="map-panel">
                            <div className="map-panel-header">
                                AFTER EDIT
                            </div>

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

                    <div className="attribute-card">
                        <h3>
                            Attribute Changes
                        </h3>

                        <table className="attribute-table">
                            <thead>
                                <tr>
                                    <th>Field</th>
                                    <th>Old Value</th>
                                    <th>New Value</th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr>
                                    <td>Plot Area</td>
                                    <td>512.12 sq.m</td>
                                    <td>534.83 sq.m</td>
                                </tr>
                                <tr>
                                    <td>Plot Number</td>
                                    <td>235</td>
                                    <td>235</td>
                                </tr>
                                <tr>
                                    <td>Owner Name</td>
                                    <td>XYZ</td>
                                    <td>XYZ</td>
                                </tr>
                                <tr>
                                    <td>Boundary Vertices</td>
                                    <td>18</td>
                                    <td>22</td>
                                </tr>
                            </tbody>
                        </table>

                    </div>

                    <div className="comment-card">
                        <h3>
                            Reviewer Comments
                        </h3>
                        <textarea
                            value={reviewComment}
                            onChange={(e) =>
                                setReviewComment(
                                    e.target.value
                                )
                            }
                            placeholder="Enter approval/rejection remarks..."
                        />
                    </div>

                    <div className="action-panel">
                        <button className="reject-btn">
                            <FaTimesCircle />
                            Reject Request
                        </button>

                        <button className="approve-btn">
                            <FaCheckCircle />
                            Approve Request
                        </button>
                    </div>

                </div>

            ) : (

                <div className="approval-content">
                    <div className="page-title-card">
                        <div>
                            <h2>
                                Approval Flow Management
                            </h2>
                            <p>
                                Review and approve cadastral plot modifications
                            </p>
                        </div>
                    </div>

                    <div className="kpi-grid">
                        <div className="kpi-card pending">
                            <FaClock />
                            <span>Pending</span>
                            <h2>24</h2>
                        </div>
                        <div className="kpi-card approved">
                            <FaCheckCircle />
                            <span>Approved Today</span>
                            <h2>12</h2>
                        </div>
                        <div className="kpi-card rejected">
                            <FaTimesCircle />
                            <span>Rejected</span>
                            <h2>3</h2>
                        </div>
                        <div className="kpi-card total">
                            <FaSearch />
                            <span>Total Changes</span>
                            <h2>89</h2>
                        </div>
                    </div>

                    <div className="filter-panel">
                        <input
                            placeholder="Search Plot Number"
                        />

                        <select>
                            <option>Mouza</option>
                        </select>
                        <select>
                            <option>Status</option>
                        </select>
                        <input type="date" />
                        <input
                            placeholder="Requested By"
                        />
                    </div>

                    <div className="request-grid-card">
                        <div className="section-title">
                            Plot Modification Requests
                        </div>

                        <table className="approval-table">
                            <thead>
                                <tr>
                                    <th>Plot No</th>
                                    <th>Mouza</th>
                                    <th>JL</th>
                                    <th>Requested By</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {requests.map((row) => (

                                    <tr key={row.requestId}>
                                        <td>
                                            {row.plotNo}
                                        </td>
                                        <td>
                                            {row.mouza}
                                        </td>
                                        <td>
                                            {row.jlNo}
                                        </td>
                                        <td>
                                            {row.requestedBy}
                                        </td>
                                        <td>
                                            {row.requestedDate}
                                        </td>
                                        <td>
                                            <span className="pending-badge">
                                                {row.status}
                                            </span>
                                        </td>

                                        <td>
                                            <button
                                                className="review-btn"
                                                onClick={() =>
                                                    setSelectedRequest(row)
                                                }
                                            >
                                                Review
                                            </button>
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
