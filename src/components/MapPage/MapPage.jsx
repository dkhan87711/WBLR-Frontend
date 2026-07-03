import { useEffect, useRef, useState } from "react";

import '@arcgis/core/assets/esri/themes/light/main.css';
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";

import WebMap from "@arcgis/core/WebMap";
import Editor from "@arcgis/core/widgets/Editor";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
import esriConfig from "@arcgis/core/config.js";

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


esriConfig.portalUrl =
  "https://indcs0152.atrapa.deloitte.com/gisportal";



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
    console.log("MapPage Render");
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

            console.log("Map Initialized");

            const webmap = new WebMap({
                portalItem: {
                    id: "82368e996eab4c7e86b6cc5fef8bd07f"
                }
            });

            view = new MapView({
                container: mapDiv.current,
                map: webmap
            });

            
            const editLayerObj = new FeatureLayer({
                url: "https://indcs0152.atrapa.deloitte.com/arcgis/rest/services/Hosted/land_txn_request_WBLR/FeatureServer/0",
                title: "Plot Edit Layer",
                outFields: ["*"]
            });

            await webmap.load();

            // Add editable layer to webmap


            view.ui.remove("zoom");
            view.ui.add("zoom", "bottom-right");

            await view.when();
            await webmap.load();

            console.log(
                "WebMap Layers",
                webmap.layers.map(layer => ({
                    title: layer.title,
                    id: layer.id
                }))
            );

            webmap.add(editLayerObj);

            const parcelLayer = webmap.layers.find(
                layer =>
                    layer.title ===
                    "Rajarhat Plot Layer"
            );

            if (!parcelLayer) {
                console.error(
                    "Rajarhat Plot Layer not found"
                );
                return;
            }

            // CHANGE THIS TO YOUR TARGET EDIT LAYER NAME
            const editLayer = webmap.layers.find(
                layer =>
                    layer.title ===
                    "Plot Edit Layer"
            );

            if (!editLayer) {
                console.error(
                    "Edit Layer not found"
                );
                return;
            }

            try {

                const extentResponse =
                    await parcelLayer.queryExtent();

                if (extentResponse?.extent) {
                    await view.goTo(
                        extentResponse.extent.expand(
                            1.1
                        )
                    );
                }

            } catch (err) {
                console.error(err);
            }

            const search =
                new Search({
                    view,
                    includeDefaultSources:
                        false,
                    sources: [
                        {
                            layer:
                                parcelLayer,
                            searchFields: [
                                "plot_no",
                                "idn"
                            ],
                            displayField:
                                "plot_no",
                            exactMatch:
                                false,
                            outFields: ["*"],
                            name:
                                "Plot Search",
                            placeholder:
                                "Search Plot Number"
                        }
                    ]
                });

            const fullscreen =
                new Fullscreen({ view });

            const scaleBar =
                new ScaleBar({
                    view,
                    unit: "metric"
                });

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
                        new BasemapGallery({
                            view
                        }),
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

            const editor = new Editor({
                view,
                layerInfos: [
                    {
                        layer: parcelLayer,
                        enabled: true
                    }
                ]
            });

            const editorExpand = new Expand({
                view,
                content: editor,
                expandIconClass: "esri-icon-edit",
                expandTooltip: "Editor",
                expanded: false
            });

            let switchingWorkflow = false;
            let openingEditLayerFeature = false;

            reactiveUtils.watch(
                () => editor.activeWorkflow,
                async (workflow) => {

                    if (
                        !workflow ||
                        workflow.type !== "update"
                    ) {
                        return;
                    }

                    if (
                        switchingWorkflow ||
                        openingEditLayerFeature
                    ) {
                        return;
                    }

                    const rootFeatures =
                        workflow?.data?.rootFeatures;

                        
                console.log("====== WATCHER FIRED ======");
                console.log("Workflow:", workflow);


                    if (
                        !rootFeatures ||
                        rootFeatures.length === 0
                    ) {
                        return;
                    }

                    try {

                        switchingWorkflow = true;

                        const selectedFeatures =
                            rootFeatures.toArray();

                        const rajarhatFeatures =
                            selectedFeatures.filter(
                                feature =>
                                    feature.layer.id ===
                                    parcelLayer.id
                            );

                        // Ignore if workflow already belongs to Plot Edit Layer
                        if (
                            rajarhatFeatures.length === 0
                        ) {
                            switchingWorkflow = false;
                            return;
                        }

                        const addFeatures = [];
                        const createdFeatureIds = [];

                        for (const sourceFeature of rajarhatFeatures) {

                            const plotNo =
                                sourceFeature.attributes.plot_no;

                            // Prevent duplicate creation
                            const checkQuery =
                                editLayer.createQuery();

                            checkQuery.where =
                                `old_plot_n='${plotNo}'`;

                            const existing =
                                await editLayer.queryFeatures(
                                    checkQuery
                                );

                            if (
                                existing.features.length > 0
                            ) {

                                createdFeatureIds.push(
                                    existing.features[0]
                                        .attributes.OBJECTID
                                );

                                continue;
                            }

                            addFeatures.push({

                                geometry:
                                    sourceFeature.geometry,

                                attributes: {

                                    old_plot_n:
                                        plotNo,

                                    txn_type:
                                        "EDIT",

                                    status:
                                        "DRAFT",

                                    created_by:
                                        user?.firstName ||
                                        user?.username ||
                                        "SYSTEM",

                                    created_da:
                                        new Date()
                                            .toISOString()
                                }
                            });
                        }

                        // Create features
                        if (
                            addFeatures.length > 0
                        ) {

                            const result =
                                await editLayer.applyEdits({
                                    addFeatures
                                });

                            console.log(
                                "Add Result",
                                result
                            );

                           
                    
                            result.addFeatureResults.forEach(r => {

                                if (r.objectId) {

                                    createdFeatureIds.push(
                                        r.objectId
                                    );
                                }

                            });


                        }

                        await editLayer.refresh();

                        // Open first Plot Edit Layer feature
                        if (
                            createdFeatureIds.length > 0
                        ) {

                            const query =
                                editLayer.createQuery();

                            query.objectIds = [
                                createdFeatureIds[0]
                            ];

                            query.returnGeometry = true;

                            const featureResult =
                                await editLayer.queryFeatures(
                                    query
                                );

                            const editableFeature =
                                featureResult.features[0];

                                                            console.log(
                                "Retrieved Edit Feature:",
                                editableFeature
                            );

                            console.log(
                                "Retrieved Layer:",
                                editableFeature.layer?.title
                            );

                            console.log(
                                "Edit Layer Title:",
                                editLayer.title
                            );

                            console.log(
                                "Edit Layer Id:",
                                editLayer.id
                            );

                            if (
                                editableFeature
                            ) {

                                openingEditLayerFeature = true;

                                // Critical
                                editableFeature.layer =
                                    editLayer;

                                    

                                console.log(
                                    "Opening Plot Edit Layer Feature",
                                    editableFeature
                                );

                                editor.cancelWorkflow();

                                setTimeout(
                                    async () => {

                                        try {

                                            
                                            console.log(
                                                "STARTING UPDATE WORKFLOW"
                                            );

                                            console.log(
                                                "Feature Layer:",
                                                editableFeature.layer?.title
                                            );

                                            console.log(
                                                "Feature OID:",
                                                editableFeature.attributes?.OBJECTID
                                            );

                                            await editor.startUpdateWorkflowAtFeatureEdit(
                                                editableFeature
                                            );

                                        } catch (
                                            err
                                        ) {

                                            console.error(
                                                "Failed to switch to Plot Edit Layer",
                                                err
                                            );
                                        }

                                        setTimeout(() => {

                                            openingEditLayerFeature =
                                                false;

                                            switchingWorkflow =
                                                false;

                                        }, 1000);

                                    },
                                    500
                                );

                                return;
                            }
                        }

                        switchingWorkflow = false;

                    } catch (error) {

                        console.error(
                            "Workflow Error",
                            error
                        );

                        switchingWorkflow = false;
                        openingEditLayerFeature = false;
                    }
                }
            );

            view.ui.add(
                search,
                "top-left"
            );

            view.ui.add(
                scaleBar,
                "bottom-left"
            );

            view.ui.add(
                [
                    fullscreen,
                    layerListExpand,
                    basemapExpand,
                    legendExpand,
                    printExpand,
                    editorExpand
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