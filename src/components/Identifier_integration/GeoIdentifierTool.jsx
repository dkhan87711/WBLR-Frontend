import { useState, useMemo } from "react";

import {
    generateDigipin,
    generateUlpin
} from "../../api/apiService";

import "./GeoIdentifierTool.css";

import Point from "@arcgis/core/geometry/Point";
import Graphic from "@arcgis/core/Graphic";
import * as webMercatorUtils from "@arcgis/core/geometry/support/webMercatorUtils";
import TextSymbol from "@arcgis/core/symbols/TextSymbol";
import data from "../../config/pmayData";

const GeoIdentifierTool = ({
    view,
    landStackLayer,
    buildingLayer,
}) => {

        const [applications, setApplications] =
        useState(data || []);


        const [expandedSection, setExpandedSection] =

        useState("application");

        const toggleSection = section => {

        setExpandedSection(

        expandedSection === section

        ? null
        : section
        );
    };

    const [expandedApplication, setExpandedApplication] =
    useState(null);

const [selectedImage, setSelectedImage] =
    useState(null);

const toggleApplication = (
    applicationId
) => {

    setExpandedApplication(prev =>
        prev === applicationId
            ? null
            : applicationId
    );
};


    const [loading, setLoading] =
        useState(false);

    const [selectionMode, setSelectionMode] =
    useState("plot");

    const [result, setResult] =
        useState(null);

    const [error, setError] =
        useState("");

    const clearHighlights = () => {

        if (view) {
            view.graphics.removeAll();
        }
    };

    const highlightParcel = (
        geometry
    ) => {

        const graphic =
            new Graphic({
                geometry,

                symbol: {
                    type: "simple-fill",

                    color: [
                        0,
                        255,
                        255,
                        0.15
                    ],

                    outline: {
                        color: [
                            0,
                            255,
                            255
                        ],
                        width: 3
                    }
                }
            });

        view.graphics.add(
            graphic
        );
    };

    const getParcel = async (
        point
    ) => {

        const query =
            landStackLayer.createQuery();

        query.geometry =
            point;

        query.spatialRelationship =
            "intersects";

        query.returnGeometry =
            true;

        query.outFields =
            ["*"];

        const response =
            await landStackLayer.queryFeatures(
                query
            );

        return (
            response.features?.[0]
        );
    };

const getBuildings = async (
    geometry
) => {

    const query =
        buildingLayer.createQuery();

    query.geometry =
        geometry;

    query.spatialRelationship =
        "intersects";

    query.returnGeometry =
        true;

    query.outFields =
        ["*"];

    const response =
      await buildingLayer.queryFeatures(
            query
        );

   return response.features || [];
};

const getBuildingFromPoint =
    async point => {

        const query =
            buildingLayer.createQuery();

        query.geometry = point;

        query.spatialRelationship =
            "intersects";

        query.returnGeometry = true;

        query.outFields = ["*"];

        const response =
            await buildingLayer.queryFeatures(
                query
            );

        return response.features?.[0];
    };


const processPlot = async (
    point
) => {

    clearHighlights();

    showPin(
        point,
        [0, 0, 255]
    );

    const parcel =
        await getParcel(point);

    if (!parcel) {
        throw new Error(
            "Parcel not found."
        );
    }

    highlightParcel(
        parcel.geometry
    );

    let geometry4326 =
        parcel.geometry;

    const wkid =
        parcel.geometry
            ?.spatialReference?.wkid ||
        parcel.geometry
            ?.spatialReference?.latestWkid;

    if (
        wkid === 3857 ||
        wkid === 102100
    ) {
        geometry4326 =
            webMercatorUtils.webMercatorToGeographic(
                parcel.geometry
            );
    }

    const geoJsonGeometry = {
        type: "Polygon",
        coordinates:
            geometry4326.rings
    };

    const ulpinResponse =
        await generateUlpin(
            geoJsonGeometry
        );

    const ulpin =
        ulpinResponse?.data?.ulpin ||
        ulpinResponse?.data?.data?.ulpin ||
        ulpinResponse?.data?.data ||
        "Not Available";

    const buildings =
        await getBuildings(
            parcel.geometry
        );

    const digipinSet =
        new Set();

    if (
        buildings.length > 0
    ) {

        for (const building of buildings) {

            highlightBuilding(
                building.geometry
            );

            try {

                let centroid =
                    building.geometry
                        .centroid;

                const centroidWkid =
                    centroid
                        ?.spatialReference
                        ?.wkid ||
                    centroid
                        ?.spatialReference
                        ?.latestWkid;

                if (
                    centroidWkid ===
                        3857 ||
                    centroidWkid ===
                        102100
                ) {

                    centroid =
                        webMercatorUtils.webMercatorToGeographic(
                            centroid
                        );
                }

                const response =
                    await generateDigipin(
                        centroid.y,
                        centroid.x
                    );

                const digipin =
                    response?.data
                        ?.digipin ||
                    response?.data
                        ?.data
                        ?.digipin ||
                    response?.data
                        ?.data;

               if (
                digipin &&
                !digipinSet.has(
                    digipin
                )
            ) {

                digipinSet.add(
                    digipin
                );

                addDigipinLabel(
                    centroid,
                    digipin
                );
            }

            } catch (error) {

                console.error(
                    error
                );
            }
        }

    } else {

        try {

            let centroid =
                geometry4326
                    .centroid;

            const response =
                await generateDigipin(
                    centroid.y,
                    centroid.x
                );

            const digipin =
                response?.data
                    ?.digipin ||
                response?.data
                    ?.data
                    ?.digipin ||
                response?.data
                    ?.data;

          if (
            digipin &&
            !digipinSet.has(
                digipin
            )
        ) {

            digipinSet.add(
                digipin
            );

            addDigipinLabel(
                centroid,
                digipin
            );
        }

        } catch (error) {

            console.error(
                error
            );
        }
    }

    await view.goTo(
        [
            parcel.geometry,
            ...buildings.map(
                (
                    building
                ) =>
                    building.geometry
            )
        ],
        {
            duration: 1500
        }
    );

    setResult({
        ulpin,

        digipins:
            [...digipinSet],

        digipinCount:
            digipinSet.size,

        buildingCount:
            buildings.length,

        plotNo:
            parcel.attributes
                ?.plot_no ||
            parcel.attributes
                ?.plot_number ||
            parcel.attributes
                ?.plot_no_ ||
            "N/A",

        mouza:
            parcel.attributes
                ?.mouza_name ||
            parcel.attributes
                ?.mouza ||
            "N/A",

        khatian:
            parcel.attributes
                ?.khatian_no ||
            parcel.attributes
                ?.khatian ||
            "N/A"
    });
};

const processProperty = async (
    point
) => {

    clearHighlights();

    showPin(
        point,
        [255, 0, 0]
    );

    const building =
        await getBuilding(
            point
        );

    if (!building) {

        throw new Error(
            "No building found."
        );
    }

    highlightBuilding(
        building.geometry
    );

    let centroid =
        building.geometry
            .centroid;

    const centroidWkid =
        centroid
            ?.spatialReference
            ?.wkid ||
        centroid
            ?.spatialReference
            ?.latestWkid;

    if (
        centroidWkid === 3857 ||
        centroidWkid === 102100
    ) {

        centroid =
            webMercatorUtils.webMercatorToGeographic(
                centroid
            );
    }

    const digipinResponse =
        await generateDigipin(
            centroid.y,
            centroid.x
        );

    const digipin =
        digipinResponse?.data
            ?.digipin ||
        digipinResponse?.data
            ?.data
            ?.digipin ||
        digipinResponse?.data
            ?.data ||
        "Not Available";

    addDigipinLabel(
        centroid,
        digipin
    );

    const parcel =
        await getParcel(
            centroid
        );

    if (!parcel) {

        throw new Error(
            "Parcel not found."
        );
    }

    highlightParcel(
        parcel.geometry
    );

    let geometry4326 =
        parcel.geometry;

    const parcelWkid =
        parcel.geometry
            ?.spatialReference
            ?.wkid ||
        parcel.geometry
            ?.spatialReference
            ?.latestWkid;

    if (
        parcelWkid === 3857 ||
        parcelWkid === 102100
    ) {

        geometry4326 =
            webMercatorUtils.webMercatorToGeographic(
                parcel.geometry
            );
    }

    const geoJsonGeometry = {
        type: "Polygon",
        coordinates:
            geometry4326.rings
    };

    const ulpinResponse =
        await generateUlpin(
            geoJsonGeometry
        );

    const ulpin =
        ulpinResponse?.data
            ?.ulpin ||
        ulpinResponse?.data
            ?.data
            ?.ulpin ||
        ulpinResponse?.data
            ?.data ||
        "Not Available";

    await view.goTo(
        [
            parcel.geometry,
            building.geometry
        ],
        {
            duration: 1500
        }
    );

    setResult({
        ulpin,

        digipins: [
            digipin
        ],

        digipinCount: 1,

        buildingCount: 1,

        plotNo:
            parcel.attributes
                ?.plot_no ||
            parcel.attributes
                ?.plot_number ||
            parcel.attributes
                ?.plot_no_ ||
            "N/A",

        mouza:
            parcel.attributes
                ?.mouza_name ||
            parcel.attributes
                ?.mouza ||
            "N/A",

        khatian:
            parcel.attributes
                ?.khatian_no ||
            parcel.attributes
                ?.khatian ||
            "N/A"
    });
};

const showPin = (
    point,
    color = [0, 0, 255]
) => {

    const graphic =
        new Graphic({
            geometry: point,

            symbol: {
                type: "simple-marker",

                style: "circle",

                size: 12,

                color,

                outline: {
                    color: [255, 255, 255],
                    width: 2
                }
            }
        });

    view.graphics.add(
        graphic
    );
};

const addDigipinLabel = (
    point,
    digipin
) => {

    const labelGraphic =
        new Graphic({
            geometry: point,

            symbol: new TextSymbol({
                text: digipin,

                color: "#000000",

                haloColor: "#FFFFFF",

                haloSize: 3,

                yoffset: -20,

                font: {
                    size: 11,
                    weight: "bold"
                }
            })
        });

    view.graphics.add(
        labelGraphic
    );
};

const getBuilding = async (
    point
) => {

    const query =
        buildingLayer.createQuery();

    query.geometry = point;

    query.spatialRelationship =
        "intersects";

    query.returnGeometry =
        true;

    query.outFields =
        ["*"];

    const response =
      await buildingLayer.queryFeatures(
            query
        );

   return response.features?.[0];
};


const highlightBuilding = (
    geometry
) => {

    const graphic =
        new Graphic({
            geometry,

            symbol: {
                type: "simple-fill",

                color: [
                    255,
                    0,
                    0,
                    0.15
                ],

                outline: {
                    color: [
                        255,
                        0,
                        0
                    ],

                    width: 2
                }
            }
        });

    view.graphics.add(
        graphic
    );
};

const verifyConstructionImage =
    async application => {

        try {

            const point4326 =
                new Point({
                    latitude:
                        application.extractedImageLat,

                    longitude:
                        application.extractedImageLong,

                    spatialReference: {
                        wkid: 4326
                    }
                });

            const point =
                webMercatorUtils.geographicToWebMercator(
                    point4326
                );

            clearHighlights();

            showPin(
                point,
                [255, 0, 0]
            );

            const parcel =
                await getParcel(point);

            if (!parcel) {

                alert(
                    "Parcel not found."
                );

                return;
            }

            highlightParcel(
                parcel.geometry
            );

            const building =
                await getBuildingFromPoint(
                    point
                );

            if (!building) {

                alert(
                    "Building not found."
                );

                return;
            }

            highlightBuilding(
                building.geometry
            );

            let geometry4326 =
                parcel.geometry;

            const wkid =
                parcel.geometry
                    ?.spatialReference
                    ?.wkid ||
                parcel.geometry
                    ?.spatialReference
                    ?.latestWkid;

            if (
                wkid === 3857 ||
                wkid === 102100
            ) {

                geometry4326 =
                    webMercatorUtils.webMercatorToGeographic(
                        parcel.geometry
                    );
            }

            const ulpinResponse =
                await generateUlpin({
                    type: "Polygon",
                    coordinates:
                        geometry4326.rings
                });

            const imageUlpin =
                ulpinResponse?.data
                    ?.ulpin ||
                ulpinResponse?.data
                    ?.data?.ulpin ||
                ulpinResponse?.data
                    ?.data ||
                "";

            let centroid =
                building.geometry
                    .centroid;

            const centroidWkid =
                centroid
                    ?.spatialReference
                    ?.wkid ||
                centroid
                    ?.spatialReference
                    ?.latestWkid;

            if (
                centroidWkid ===
                    3857 ||
                centroidWkid ===
                    102100
            ) {

                centroid =
                    webMercatorUtils.webMercatorToGeographic(
                        centroid
                    );
            }

            const digipinResponse =
                await generateDigipin(
                    centroid.y,
                    centroid.x
                );

            const imageDigipin =
                digipinResponse?.data
                    ?.digipin ||
                digipinResponse?.data
                    ?.data?.digipin ||
                digipinResponse?.data
                    ?.data ||
                "";

            const matched =
                imageUlpin?.trim() ===
                    application.ulpin?.trim() &&
                imageDigipin?.trim() ===
                    application.digipin?.trim();

            updateApplication(
                application.applicationId,
                {
                    imageUlpin,
                    imageDigipin,

                    constructionVerified:
                        matched,

                    constructionRemarks:
                        matched
                            ? "Geotag Verified"
                            : "Photo Location Mismatch"
                }
            );

            if (matched) {

                alert(
                    "Application successfully verified."
                );

            } else {

                alert(
                    "Geotagged photo does not match DIGIPIN."
                );
            }

        } catch (error) {

            console.error(error);

            alert(
                "Verification failed."
            );
        }
    };

    const verifyCompletionCertificate =
    application => {

        const aadhaarAddress =
            application.addressAsPerAadhaar
                ?.trim()
                ?.toLowerCase();

        const certificateAddress =
            application.certificateAddress
                ?.trim()
                ?.toLowerCase();

        const matched =
            aadhaarAddress ===
            certificateAddress;

        updateApplication(
            application.applicationId,
            {
                completionVerified:
                    matched,

                completionRemarks:
                    matched
                        ? "Certificate Address Matched"
                        : "Certificate Address Mismatch"
            }
        );

        if (matched) {

            alert(
                "Certificate address matches Aadhaar address."
            );

        } else {

            alert(
                "Certificate address does not match Aadhaar address."
            );
        }
    };

    const enableSelection = () => {

    setError("");
    setResult(null);

    const clickHandler =
        view.on(
            "click",
            async (event) => {

                clickHandler.remove();

                try {

                    setLoading(true);

                    if (
                        selectionMode === "plot"
                    ) {

                        await processPlot(
                            event.mapPoint
                        );

                    } else {

                        await processProperty(
                            event.mapPoint
                        );
                    }

                } catch (error) {

                    console.error(
                        "Selection Error",
                        error
                    );

                    setError(
                        error?.message ||
                        "Failed to process selection."
                    );

                } finally {

                    setLoading(false);
                }
            }
        );
};


    const applicationRecords =
        useMemo(() => {
            return applications.filter(
                app =>
                    !app.disbursementStatus &&
                    app.verifiedStatus !==
                        "Rejected"
            );
        }, [applications]);

    const constructionRecords =
        useMemo(() => {
            return applications.filter(
                app =>
                    app.disbursementStatus ===
                        "Initial" &&
                    app.verifiedStatus ===
                        "Approved"
            );
        }, [applications]);

    const completionRecords =
        useMemo(() => {
            return applications.filter(
                app =>
                    app.disbursementStatus ===
                        "Intermediate" &&
                    app.constructionStatus ===
                        "Approved"
            );
        }, [applications]);

    const updateApplication =
        (applicationId, updates) => {
            setApplications(prev =>
                prev.map(app =>
                    app.applicationId ===
                    applicationId
                        ? {
                              ...app,
                              ...updates
                          }
                        : app
                )
            );
        };

    const approveApplication =
        applicationId => {
            updateApplication(
                applicationId,
                {
                    verifiedStatus:
                        "Approved",
                    disbursementStatus:
                        "Initial",
                    verificationDate:
                        new Date()
                            .toISOString()
                            .split(
                                "T"
                            )[0]
                }
            );
        };

    const rejectApplication =
        applicationId => {
            updateApplication(
                applicationId,
                {
                    verifiedStatus:
                        "Rejected"
                }
            );
        };

   const approveConstruction =
    applicationId => {

        const app =
            applications.find(
                a =>
                    a.applicationId ===
                    applicationId
            );

        if (
            !app?.constructionVerified
        ) {

            alert(
                "Please verify construction image first."
            );

            return;
        }

        updateApplication(
            applicationId,
            {
                constructionStatus:
                    "Approved",

                disbursementStatus:
                    "Intermediate"
            }
        );
    };

    const rejectConstruction =
        applicationId => {
            updateApplication(
                applicationId,
                {
                    constructionStatus:
                        "Rejected"
                }
            );
        };

    const approveCompletion =
    applicationId => {

        const app =
            applications.find(
                a =>
                    a.applicationId ===
                    applicationId
            );

        if (
            !app?.completionVerified
        ) {

            alert(
                "Please verify completion certificate first."
            );

            return;
        }

        updateApplication(
            applicationId,
            {
                completionStatus:
                    "Approved",

                completionCertificateGenerated:
                    true,

                disbursementStatus:
                    "Final"
            }
        );
    };

    const rejectCompletion =
        applicationId => {
            updateApplication(
                applicationId,
                {
                    completionStatus:
                        "Rejected",
                    completionCertificateGenerated: false
                }
            );
        };

        const verifyApplication = async application => {

    try {

        const point4326 =
        new Point({
            longitude: application.long,
            latitude: application.lat,
            spatialReference: {
                wkid: 4326
            }
        });

        const point =
        webMercatorUtils
            .geographicToWebMercator(
                point4326
            );

        clearHighlights();

        showPin(
            point,
            [0, 0, 255]
        );

        // Get parcel from point
        const parcel =
            await getParcel(point);

        if (!parcel) {

            alert("Parcel not found.");

            return;
        }

        highlightParcel(
            parcel.geometry
        );

        // Get building from SAME point
        const building =
            await getBuildingFromPoint(
                point
            );

        if (!building) {

            alert("Building not found.");

            return;
        }

        highlightBuilding(
            building.geometry
        );

        // Convert parcel geometry if needed
        let geometry4326 =
            parcel.geometry;

        const parcelWkid =
            parcel.geometry
                ?.spatialReference?.wkid ||
            parcel.geometry
                ?.spatialReference
                ?.latestWkid;

        if (
            parcelWkid === 3857 ||
            parcelWkid === 102100
        ) {

            geometry4326 =
                webMercatorUtils.webMercatorToGeographic(
                    parcel.geometry
                );
        }

        // Generate ULPIN
        const ulpinResponse =
            await generateUlpin({
                type: "Polygon",
                coordinates:
                    geometry4326.rings
            });

        const ulpin =
            ulpinResponse?.data?.ulpin ||
            ulpinResponse?.data?.data?.ulpin ||
            ulpinResponse?.data?.data ||
            "";

        // Generate DIGIPIN
        let centroid =
            building.geometry.centroid;

        const centroidWkid =
            centroid
                ?.spatialReference?.wkid ||
            centroid
                ?.spatialReference
                ?.latestWkid;

        if (
            centroidWkid === 3857 ||
            centroidWkid === 102100
        ) {

            centroid =
                webMercatorUtils.webMercatorToGeographic(
                    centroid
                );
        }

        const digipinResponse =
            await generateDigipin(
                centroid.y,
                centroid.x
            );

        const digipin =
            digipinResponse?.data
                ?.digipin ||
            digipinResponse?.data
                ?.data?.digipin ||
            digipinResponse?.data
                ?.data ||
            "";

        // Duplicate check
        const duplicate =
            applications.find(
                app =>
                    app.applicationId !==
                        application.applicationId &&
                    app.ulpin === ulpin &&
                    app.digipin ===
                        digipin
            );

        // Update current record
        updateApplication(
            application.applicationId,
            {
                ulpin,
                digipin,

                verificationCompleted:
                    !duplicate,

                verificationRemarks:
                    duplicate
                        ? "Duplicate Plot"
                        : "Verified Successfully",

                verificationDate:
                    new Date()
                        .toISOString()
                        .split("T")[0]
            }
        );

        if (duplicate) {

            alert(
                "Application already exists for the plot."
            );

        } else {

            alert(
                "Application successfully verified."
            );
        }

    } catch (error) {

        console.error(
            "Verification Error",
            error
        );

        alert(
            "Verification failed."
        );
    }
};

    const renderCard = (
    application,
    verifyBtnText,
    approveHandler,
    rejectHandler,
    showGeoFields = false
) => {

    const isExpanded =
        expandedApplication ===
        application.applicationId;

    return (
        <div
            key={application.applicationId}
            className="application-item"
        >

            <div
                className="application-item-header"
                onClick={() =>
                    toggleApplication(
                        application.applicationId
                    )
                }
            >

                <span>
                    {
                        application.applicationId
                    }
                </span>

                <span>
                    {isExpanded
                        ? "▼"
                        : "▶"}
                </span>

            </div>

            {isExpanded && (
                <div className="application-item-body">

                    <p>
                        <strong>
                            Applicant Name:
                        </strong>{" "}
                        {
                            application.applicantName
                        }
                    </p>

                    <p>
                        <strong>
                            Aadhaar:
                        </strong>{" "}
                        {
                            application.aadhaar
                        }
                    </p>

                    <p>
                        <strong>
                            Plot Number:
                        </strong>{" "}
                        {
                            application.plotNumber
                        }
                    </p>

                    <p>
                        <strong>
                            Address:
                        </strong>{" "}
                        {
                            application.addressAsPerAadhaar
                        }
                    </p>

                   {application.ulpin && (
                        <p>
                            <strong>ULPIN:</strong>
                            {application.ulpin}
                        </p>
                    )}

                    {application.digipin && (
                        <p>
                            <strong>DIGIPIN:</strong>
                            {application.digipin}
                        </p>
                    )}

                    {showGeoFields && (
                        <>
                           <p>
                            <strong>
                                Image Lat:
                            </strong>{" "}
                            {application.extractedImageLat}
                        </p>

                        <p>
                            <strong>
                                Image Long:
                            </strong>{" "}
                            {application.extractedImageLong}
                        </p>

                        {application.imageUlpin && (
                            <p>
                                <strong>
                                    Image ULPIN:
                                </strong>{" "}
                                {application.imageUlpin}
                            </p>
                        )}

                        {application.imageDigipin && (
                            <p>
                                <strong>
                                    Image DIGIPIN:
                                </strong>{" "}
                                {application.imageDigipin}
                            </p>
                        )}
                        </>
                    )}

                    <div className="action-panel">

                        <button
                            className="verify-btn"
                           onClick={() => {

                                if (
                                    verifyBtnText ===
                                    "Verify Construction Area"
                                ) {

                                    verifyConstructionImage(
                                        application
                                    );

                                } else if (
                                    verifyBtnText ===
                                    "Verify Completion Certificate"
                                ) {

                                    verifyCompletionCertificate(
                                        application
                                    );

                                } else {

                                    verifyApplication(
                                        application
                                    );
                                }
                            }}
                        
                        >
                            {verifyBtnText}
                        </button>

                        <div className="decision-buttons">

                            <button
                                className="approve-btn"
                                disabled={
                                verifyBtnText ===
                                "Verify Completion Certificate"
                                    ? !application.completionVerified
                                    : showGeoFields
                                    ? !application.constructionVerified
                                    : !application.verificationCompleted
                            }
                                onClick={() =>
                                    approveHandler(
                                        application.applicationId
                                    )
                                }
                            >
                                Approve
                            </button>

                            <button
                                className="reject-btn"
                                onClick={() =>
                                    rejectHandler(
                                        application.applicationId
                                    )
                                }
                            >
                                Reject
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
};

    return (
        <div className="housing-verification-container">

            <h2>
                Urban Housing Scheme
            </h2>

            <div className="sub-title">
                View Application
            </div>

            {/* Section 1 */}

            <div className="verification-section">
                <div
                    className="section-header"
                    onClick={() =>
                        toggleSection(
                            "application"
                        )
                    }
                >
                    <span>
                        Verify
                        Application -
                        1st
                        Installment
                    </span>

                    <span>
                        {expandedSection ===
                        "application"
                            ? "▼"
                            : "▶"}
                    </span>
                </div>

                {expandedSection ===
                    "application" && (
                    <div className="section-content">
                        {applicationRecords.map(
                            app =>
                                renderCard(
                                    app,
                                    "Verify Application",
                                    approveApplication,
                                    rejectApplication
                                )
                        )}
                    </div>
                )}
            </div>

            {/* Section 2 */}

            <div className="verification-section">
                <div
                    className="section-header"
                    onClick={() =>
                        toggleSection(
                            "construction"
                        )
                    }
                >
                    <span>
                        Verify
                        Construction
                        Area - 2nd
                        Installment
                    </span>

                    <span>
                        {expandedSection ===
                        "construction"
                            ? "▼"
                            : "▶"}
                    </span>
                </div>

                {expandedSection ===
                    "construction" && (
                    <div className="section-content">
                        {constructionRecords.map(
                            app =>
                                renderCard(
                                    app,
                                    "Verify Construction Area",
                                    approveConstruction,
                                    rejectConstruction,
                                    true
                                )
                        )}
                    </div>
                )}
            </div>

            {/* Section 3 */}

            <div className="verification-section">
                <div
                    className="section-header"
                    onClick={() =>
                        toggleSection(
                            "completion"
                        )
                    }
                >
                    <span>
                        Verify
                        Completion
                        Certificate -
                        3rd
                        Installment
                    </span>

                    <span>
                        {expandedSection ===
                        "completion"
                            ? "▼"
                            : "▶"}
                    </span>
                </div>

                {expandedSection ===
                    "completion" && (
                    <div className="section-content">
                        {completionRecords.map(
                            app =>
                                renderCard(
                                    app,
                                    "Verify Completion Certificate",
                                    approveCompletion,
                                    rejectCompletion,
                                    true
                                )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};




export default GeoIdentifierTool;