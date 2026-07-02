import { useEffect, useRef, useState } from "react";

import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";

import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";

import Sketch from "@arcgis/core/widgets/Sketch";
import Search from "@arcgis/core/widgets/Search";

import BasemapGallery from "@arcgis/core/widgets/BasemapGallery";
import Expand from "@arcgis/core/widgets/Expand";
import LayerList from "@arcgis/core/widgets/LayerList";
import Legend from "@arcgis/core/widgets/Legend";
import Print from "@arcgis/core/widgets/Print";
import ScaleBar from "@arcgis/core/widgets/ScaleBar";
import Home from "@arcgis/core/widgets/Home";
import Compass from "@arcgis/core/widgets/Compass";
import Locate from "@arcgis/core/widgets/Locate";
import Fullscreen from "@arcgis/core/widgets/Fullscreen";

import {
    FaUserCircle,
    FaUserShield,
    FaSignOutAlt
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import "./MapPage.css";

/** Development */
const SERVICE_URL =
    "https://indcs0152.atrapa.deloitte.com/arcgis/rest/services/WBLR/Rajarhat_Plot";

/** Production */
// const SERVICE_URL =
//     "/arcgis/rest/services/WBLR/Rajarhat_Plot";


const FEATURE_LAYER_URL =
    `${SERVICE_URL}/FeatureServer/0`;

const MAP_SERVER_URL =
    `${SERVICE_URL}/MapServer`;

const MapPage = () => {
    const mapDiv = useRef(null);

    const [sessionExpired, setSessionExpired] =
        useState(false);

    const [redirectSeconds, setRedirectSeconds] =
        useState(10);

    const storedUser = JSON.parse(
        localStorage.getItem("user") || "null"
    );
    const user = storedUser?.user;
    // console.log("storedUser", storedUser);
    // console.log("user", user);

    const navigate = useNavigate();

    const [timeLeft, setTimeLeft] = useState(60); // 60 sec test
    const [showWarning, setShowWarning] = useState(false);
    useEffect(() => {
        let interval;

        const SESSION_TIME = 60 * 15;
        const WARNING_TIME = 30;

        setTimeLeft(SESSION_TIME);
        setShowWarning(false);

        interval = setInterval(() => {
            setTimeLeft(prev => {
                const newTime = prev - 1;

                console.log("⏱", newTime);

                if (newTime === WARNING_TIME) {
                    setShowWarning(true);
                }

                if (newTime <= 0) {
                    clearInterval(interval);
                    handleLogout();
                    return 0;
                }

                return newTime;
            });
        }, 1000);

        return () => clearInterval(interval);

    }, []);   // ✅ RUN ONCE ONLY

    // useEffect(() => {
    //     const storedUser = localStorage.getItem("user");
    //     const sessionId = localStorage.getItem("sessionId");

    //     const redirectToLogin = () => {

    //         setSessionExpired(true);

    //         let seconds = 10;

    //         const countdown =
    //             setInterval(() => {

    //                 seconds--;

    //                 setRedirectSeconds(
    //                     seconds
    //                 );

    //                 if (seconds <= 0) {

    //                     clearInterval(
    //                         countdown
    //                     );

    //                     localStorage.removeItem(
    //                         "user"
    //                     );

    //                     localStorage.removeItem(
    //                         "token"
    //                     );

    //                     localStorage.removeItem(
    //                         "sessionId"
    //                     );

    //                     navigate(
    //                         "/department",
    //                         {
    //                             replace: true
    //                         }
    //                     );
    //                 }

    //             }, 1000);
    //     };

    //     if (
    //         !storedUser ||
    //         !sessionId
    //     ) {
    //         redirectToLogin();
    //         return;
    //     }

    //     try {

    //         const parsed =
    //             JSON.parse(storedUser);

    //         if (!parsed?.user) {
    //             redirectToLogin();
    //         }

    //     } catch {

    //         redirectToLogin();

    //     }

    // }, [navigate]);

    useEffect(() => {

        if (
            sessionExpired ||
            !user
        ) {
            return;
        }

        let view;

        const initializeMap = async () => {

            // existing code

        };

        initializeMap();

        return () => {
            if (view) {
                view.destroy();
            }
        };

    }, [sessionExpired, user]);

    useEffect(() => {
        let view;

        const initializeMap = async () => {
            const graphicsLayer =
                new GraphicsLayer();

            const featureLayer =
                new FeatureLayer({
                    url: FEATURE_LAYER_URL,
                    outFields: ["*"],
                    popupEnabled: true,
                    gdbVersion: "sde.DEFAULT",

                    popupTemplate: {
                        title:
                            "Plot No: {plot_no}",

                        content: [
                            {
                                type: "fields",
                                fieldInfos: [
                                    {
                                        fieldName:
                                            "plot_no",
                                        label:
                                            "Plot Number"
                                    },
                                    {
                                        fieldName:
                                            "sheet_no",
                                        label:
                                            "Sheet Number"
                                    },
                                    {
                                        fieldName:
                                            "idn",
                                        label:
                                            "IDN"
                                    },
                                    {
                                        fieldName:
                                            "dist_name",
                                        label:
                                            "District"
                                    },
                                    {
                                        fieldName:
                                            "ps_name",
                                        label:
                                            "Police Station"
                                    },
                                    {
                                        fieldName:
                                            "block_name",
                                        label:
                                            "Block"
                                    },
                                    {
                                        fieldName:
                                            "mouza_name",
                                        label:
                                            "Mouza"
                                    },
                                    {
                                        fieldName:
                                            "jl_no",
                                        label:
                                            "JL No"
                                    }
                                ]
                            }
                        ],

                        actions: [
                            {
                                id: "zoom-to",
                                icon:
                                    "zoom-in-magnifying-glass"
                            }
                        ]
                    }
                });

            const mapImageLayer =
                new MapImageLayer({
                    url: MAP_SERVER_URL
                });

            const map = new Map({
                basemap: "hybrid",
                layers: [
                    mapImageLayer,
                    featureLayer,
                    graphicsLayer
                ]
            });

            view = new MapView({
                container:
                    mapDiv.current,
                map
            });
            view.ui.remove("zoom");
            view.ui.add("zoom", "bottom-right");
            await view.when();
            await featureLayer.load();

            // Zoom to layer extent
            try {
                const extentResponse =
                    await featureLayer.queryExtent();

                if (
                    extentResponse?.extent
                ) {
                    await view.goTo(
                        extentResponse.extent.expand(
                            1.1
                        )
                    );
                }
            } catch (error) {
                console.error(
                    "Failed to load extent:",
                    error
                );
            }

            /* -----------------------------
               Widgets
            ----------------------------- */
            const search =
                new Search({
                    view,
                    includeDefaultSources: false,
                    sources: [
                        {
                            layer:
                                featureLayer,
                            searchFields:
                                [
                                    "plot_no",
                                    "idn"
                                ],
                            displayField:
                                "plot_no",
                            exactMatch:
                                false,
                            outFields: [
                                "*"
                            ],
                            name:
                                "Plot Search",
                            placeholder:
                                "Search Plot Number"
                        }
                    ]
                });

            const home = new Home({ view });
            const compass = new Compass({ view });
            const locate = new Locate({ view });
            const fullscreen = new Fullscreen({ view });
            const scaleBar =
                new ScaleBar({
                    view,
                    unit:
                        "metric"
                });

            /* -----------------------------
               Expand Widgets
            ----------------------------- */
            const layerListExpand =
                new Expand({
                    view,
                    content:
                        new LayerList({
                            view
                        }),
                    expandTooltip:
                        "Layers"
                });

            const basemapExpand =
                new Expand({
                    view,
                    content:
                        new BasemapGallery(
                            {
                                view
                            }
                        ),
                    expandTooltip:
                        "Basemaps"
                });

            const legendExpand =
                new Expand({
                    view,
                    content:
                        new Legend({
                            view
                        }),
                    expandTooltip:
                        "Legend"
                });

            const printExpand =
                new Expand({
                    view,
                    content:
                        new Print({
                            view,
                            printServiceUrl:
                                "https://utility.arcgisonline.com/ArcGIS/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task"
                        }),
                    expandTooltip:
                        "Print"
                });

            /* -----------------------------
               UI Placement
            ----------------------------- */
            view.ui.add(search, "top-left");
            view.ui.add(
                [
                    // home,
                    // locate,
                    // compass
                ],
                "bottom-right"
            );
            view.ui.add(scaleBar, "bottom-left");
            view.ui.add(
                [
                    fullscreen,
                    layerListExpand,
                    basemapExpand,
                    legendExpand,
                    printExpand
                ],
                "top-right"
            );
        };

        initializeMap();
        return () => {
            if (view) {
                view.destroy();
            }
        };
    }, []);

    const handleLogout = async () => {
        try {
            const sessionId =
                localStorage.getItem("sessionId");

            if (sessionId) {
                await departmentLogout(sessionId);
            }
        } catch (error) {
            console.error(
                "Logout Error:",
                error
            );
        } finally {

            localStorage.removeItem(
                "user"
            );

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "sessionId"
            );

            navigate(
                "/department",
                {
                    replace: true
                }
            );
        }
    };

    // if (sessionExpired) {
    //     return (
    //         <div
    //             style={{
    //                 height: "100vh",
    //                 display: "flex",
    //                 alignItems: "center",
    //                 justifyContent: "center",
    //                 background: "#f8fafc"
    //             }}
    //         >
    //             <div
    //                 style={{
    //                     width: "460px",
    //                     background: "#ffffff",
    //                     borderRadius: "16px",
    //                     padding: "36px",
    //                     textAlign: "center",
    //                     boxShadow:
    //                         "0 12px 32px rgba(0, 0, 0, 0.08)",
    //                     border:
    //                         "1px solid #e5e7eb"
    //                 }}
    //             >
    //                 <div
    //                     style={{
    //                         fontSize: "52px",
    //                         marginBottom: "16px"
    //                     }}
    //                 >
    //                     🔒
    //                 </div>

    //                 <h2
    //                     style={{
    //                         margin: "0 0 12px",
    //                         color: "#111827",
    //                         fontWeight: "600",
    //                         fontSize: "24px"
    //                     }}
    //                 >
    //                     Session Expired
    //                 </h2>

    //                 <p
    //                     style={{
    //                         margin: 0,
    //                         color: "#6b7280",
    //                         lineHeight: "1.7",
    //                         fontSize: "15px"
    //                     }}
    //                 >
    //                     Your session is no longer valid
    //                     or has expired due to inactivity.
    //                     <br />
    //                     Please sign in again to continue
    //                     using Bhu-Manchitra.
    //                 </p>

    //                 <div
    //                     style={{
    //                         marginTop: "28px",
    //                         padding: "20px",
    //                         background: "#f8fafc",
    //                         borderRadius: "12px",
    //                         border:
    //                             "1px solid #e2e8f0"
    //                     }}
    //                 >
    //                     <div
    //                         style={{
    //                             fontSize: "42px",
    //                             fontWeight: "700",
    //                             color: "#2563eb",
    //                             lineHeight: 1
    //                         }}
    //                     >
    //                         {redirectSeconds}
    //                     </div>

    //                     <div
    //                         style={{
    //                             marginTop: "10px",
    //                             color: "#64748b",
    //                             fontSize: "14px"
    //                         }}
    //                     >
    //                         Redirecting to Sign In in{" "}
    //                         <strong>
    //                             {redirectSeconds}
    //                         </strong>{" "}
    //                         second
    //                         {redirectSeconds !== 1
    //                             ? "s"
    //                             : ""}
    //                     </div>

    //                     <div
    //                         style={{
    //                             width: "100%",
    //                             height: "6px",
    //                             background:
    //                                 "#e5e7eb",
    //                             borderRadius:
    //                                 "999px",
    //                             marginTop: "18px",
    //                             overflow:
    //                                 "hidden"
    //                         }}
    //                     >
    //                         <div
    //                             style={{
    //                                 height: "100%",
    //                                 width: `${(redirectSeconds /
    //                                     10) *
    //                                     100
    //                                     }%`,
    //                                 background:
    //                                     "#2563eb",
    //                                 transition:
    //                                     "width 1s linear"
    //                             }}
    //                         />
    //                     </div>
    //                 </div>

    //                 <div
    //                     style={{
    //                         marginTop: "18px",
    //                         color: "#94a3b8",
    //                         fontSize: "13px"
    //                     }}
    //                 >
    //                     For security reasons, inactive
    //                     sessions are automatically
    //                     terminated.
    //                 </div>
    //             </div>
    //         </div>
    //     );
    // }

    return (
        <div className="map-page">
            <div className="app-header">
                <div className="header-left">
                    <span className="menu-icon">
                        ☰
                    </span>

                    <h2 className="map-title-header">
                        Bhu-Manchitra :
                        Land Records,
                        Survey &
                        Analytics
                        Platform
                    </h2>
                </div>

                <div className="header-right">

                    {/* ✅ WARNING (ONLY AT 30s) */}
                    {showWarning && (
                        <div style={{
                            position: "fixed",
                            top: "17px",
                            right: "200px",
                            background: "yellow",
                            color: "#000",
                            padding: "5px 16px",
                            borderRadius: "6px",
                            zIndex: 9999,
                            fontSize: "12px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                        }}>
                            ⚠ Session is going to expire, save chnages
                        </div>
                    )}

                    <div className="user-profile-card">
                        <div className="user-avatar">
                            <FaUserCircle />
                        </div>

                        <div className="user-details">
                            <div className="user-display-name">
                                {user?.firstName || "Citizen"} {user?.lastName || "Login"}
                            </div>
                            <div className="user-meta">
                                <FaUserShield />
                                <span>
                                    {user?.role?.name}
                                </span>
                            </div>
                            {/* ✅ TIMER (ALWAYS VISIBLE) */}
                            <div style={{
                                marginRight: "15px",
                                marginTop: "5px",
                                background: "transparent",
                                color: "#fff",
                                padding: "0px",
                                borderRadius: "6px",
                                fontSize: "9px",
                            }}>
                                ⏱ {Math.floor(timeLeft / 60)}:
                                {(timeLeft % 60).toString().padStart(2, "0")}
                            </div>
                        </div>

                        <button
                            className="logout-icon-btn"
                            onClick={handleLogout}
                            title="Sign Out"
                        >
                            <FaSignOutAlt />
                        </button>

                    </div>
                </div>
            </div>

            <div className="map-content">
                <div
                    ref={mapDiv}
                    className="map-container"
                />
            </div>
        </div>
    );
};

export default MapPage;