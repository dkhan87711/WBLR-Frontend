import { useState } from "react";

import {
    decodeUlpin,
    generateDigipin
} from "../../api/apiService";

import "./GeoIdentifierTool.css";

import Point from "@arcgis/core/geometry/Point";
import Graphic from "@arcgis/core/Graphic";

const GeoIdentifierTool = ({
    view,
    landStackLayer,
    buildingLayer
}) => {

    const [activeTab, setActiveTab] =
        useState("ulpin");

    const [searchValue, setSearchValue] =
        useState("");

    const [loading, setLoading] =
        useState(false);

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

    const getParcel =
        async (point) => {

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

            return response.features?.[0];
        };

    const getBuildings =
        async (geometry) => {

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

    const processUlpin =
    async () => {

        if (
            !landStackLayer ||
            !buildingLayer
        ) {

            throw new Error(
                "LandStack / Building layers not loaded."
            );
        }

        clearHighlights();

        const ulpin =
            searchValue.trim();

        // STEP 1
        // Decode ULPIN

        const decodeResponse =
            await decodeUlpin(
                ulpin
            );

        const decoded =
            decodeResponse?.data?.data;

        if (!decoded) {

            throw new Error(
                "Unable to decode ULPIN"
            );
        }

        const latitude =
            Number(
                decoded.latitude
            );

        const longitude =
            Number(
                decoded.longitude
            );

        // STEP 2
        // Create Point

        const point =
            new Point({

                latitude,

                longitude

            });

        // STEP 3
        // Query LandStack Layer

        const parcel =
            await getParcel(
                point
            );

        if (!parcel) {

            throw new Error(
                "No parcel found in LandStack layer."
            );
        }

        // STEP 4
        // Highlight Parcel

        highlightParcel(
            parcel.geometry
        );

        // STEP 5
        // Query Building Layer

        const buildings =
            await getBuildings(
                parcel.geometry
            );

        buildings.forEach(
            building => {

                highlightBuilding(
                    building.geometry
                );

            }
        );

                // STEP 6
            // Parcel centroid => Primary DIGIPIN

            const parcelCentroid =
                parcel.geometry.centroid;

            let parcelDigipin =
                "Not Available";

            try {

                const response =
                    await generateDigipin(
                        parcelCentroid.y,
                        parcelCentroid.x
                    );

                parcelDigipin =
                    response?.data?.digipin ||
                    response?.data?.data?.digipin ||
                    response?.data?.data ||
                    "Not Available";

            } catch (error) {

                console.error(
                    "Parcel DIGIPIN Error",
                    error
                );
            }

    const digipinSet = new Set();

    for (const building of buildings) {
        try {
            const centroid =
                building.geometry.centroid;

            const response =
                await generateDigipin(
                    centroid.y,
                    centroid.x
                );

            const digipin =
                response?.data?.digipin ||
                response?.data?.data?.digipin ||
                response?.data?.data;

            if (digipin) {
                digipinSet.add(digipin);
            }
        } catch (error) {
            console.error(
                "Building DIGIPIN Error",
                error
            );
        }
    }      

        // STEP 8
        // Zoom

        const zoomTargets = [
            parcel.geometry
        ];

        buildings.forEach(
            building => {

                zoomTargets.push(
                    building.geometry
                );

            }
        );

        if (
            zoomTargets.length > 0
        ) {

            await view.goTo(
                zoomTargets,
                {
                    duration: 1500
                }
            );
        }

        // STEP 9
        // Result

            setResult({
            ulpin,
            latitude,
            longitude,
            floor: decoded.floor,

            digipins: [...digipinSet],
            digipinCount: digipinSet.size,

            buildingCount: buildings.length,

            plotNo:
                parcel.attributes?.plot_no ||
                parcel.attributes?.plot_number ||
                parcel.attributes?.plot_no_ ||
                "N/A",

            mouza:
                parcel.attributes?.mouza_name ||
                parcel.attributes?.mouza ||
                "N/A",

            khatian:
                parcel.attributes?.khatian_no ||
                parcel.attributes?.khatian ||
                "N/A"
        });
    };

    const handleSearch =
        async () => {

            try {

                setLoading(true);

                setError("");

                setResult(null);

                if (
                    !searchValue.trim()
                ) {

                    throw new Error(
                        activeTab ===
                            "ulpin"
                            ? "Please enter ULPIN"
                            : "Please enter DIGIPIN"
                    );
                }

                if (
                    activeTab ===
                    "ulpin"
                ) {

                    await processUlpin();

                } else {

                    setError(
                        "DIGIPIN workflow not implemented yet."
                    );
                }

            } catch (err) {

                console.error(err);

                setError(

                    err?.message ||

                    err?.response?.data?.message ||

                    "Something went wrong."
                );

            } finally {

                setLoading(false);
            }
        };

    return (

    <div className="geo-tool-container">

        <div className="geo-tool-tabs">

            <button
                className={
                    activeTab === "ulpin"
                        ? "active"
                        : ""
                }
                onClick={() =>
                    setActiveTab("ulpin")
                }
            >
                ULPIN Search
            </button>

            <button
                className={
                    activeTab === "digipin"
                        ? "active"
                        : ""
                }
                onClick={() =>
                    setActiveTab("digipin")
                }
            >
                DIGIPIN Search
            </button>

        </div>

        <div className="geo-tool-body">

            <label>
                Enter {
                    activeTab === "ulpin"
                        ? "ULPIN"
                        : "DIGIPIN"
                }
            </label>

            <input
                type="text"
                placeholder={
                    activeTab === "ulpin"
                        ? "80HV8J-E2E4CZ-H0"
                        : "Enter DIGIPIN"
                }
                value={searchValue}
                onChange={(e) =>
                    setSearchValue(
                        e.target.value
                    )
                }
            />

            <button
                className="geo-search-btn"
                onClick={handleSearch}
                disabled={loading}
            >
                {
                    loading
                        ? "Searching..."
                        : "Search"
                }
            </button>

        </div>

        <div className="geo-tool-results">

            <h4>Results</h4>

            {error && (

                <div className="geo-error">
                    {error}
                </div>

            )}

            {result && (

                <>

                    <div className="result-row">
                        <strong>ULPIN</strong>
                        <span>{result.ulpin}</span>
                    </div>

                    <div className="result-row">
                        <strong>Latitude</strong>
                        <span>{result.latitude}</span>
                    </div>

                    <div className="result-row">
                        <strong>Longitude</strong>
                        <span>{result.longitude}</span>
                    </div>

                    <div className="result-row">
                        <strong>Floor</strong>
                        <span>{result.floor}</span>
                    </div>

                   <div className="result-row">
                        <strong>Parcel DIGIPIN</strong>
                        <span>
                            {result.parcelDigipin}
                        </span>
                    </div>

                    <div className="result-row">
                        <strong>Unique DIGIPIN Count</strong>
                        <span>{result.digipinCount}</span>
                    </div>

                    {result.digipins?.map(
                        (digipin, index) => (
                            <div
                                key={digipin}
                                className="result-row"
                            >
                                <strong>
                                    DIGIPIN {index + 1}
                                </strong>

                                <span>{digipin}</span>
                            </div>
                        )
                    )}

                    <div className="result-row">
                        <strong>Plot No</strong>
                        <span>{result.plotNo}</span>
                    </div>

                    <div className="result-row">
                        <strong>Mouza</strong>
                        <span>{result.mouza}</span>
                    </div>

                    <div className="result-row">
                        <strong>Khatian</strong>
                        <span>{result.khatian}</span>
                    </div>

                    <div className="result-row">
                        <strong>Buildings</strong>
                        <span>{result.buildingCount}</span>
                    </div>

                    {
                        result.buildingLatitude && (

                            <div className="result-row">
                                <strong>
                                    Building Lat
                                </strong>

                                <span>
                                    {
                                        result.buildingLatitude
                                    }
                                </span>
                            </div>

                        )
                    }

                    {
                        result.buildingLongitude && (

                            <div className="result-row">
                                <strong>
                                    Building Lon
                                </strong>

                                <span>
                                    {
                                        result.buildingLongitude
                                    }
                                </span>
                            </div>

                        )
                    }

                </>

            )}

            {
                !loading &&
                !error &&
                !result && (

                    <div className="no-results">
                        No data available
                    </div>

                )
            }

        </div>

    </div>

);
}

export default GeoIdentifierTool;