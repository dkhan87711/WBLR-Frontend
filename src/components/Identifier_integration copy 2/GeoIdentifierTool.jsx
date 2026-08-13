import { useState } from "react";

import {
    generateDigipin,
    generateUlpin
} from "../../api/apiService";

import "./GeoIdentifierTool.css";

import Point from "@arcgis/core/geometry/Point";
import Graphic from "@arcgis/core/Graphic";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";
import * as webMercatorUtils from "@arcgis/core/geometry/support/webMercatorUtils";

const GeoIdentifierTool = ({
    view,
    landStackLayer
}) => {

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


const processPlot = async (point) => {

    clearHighlights();

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

    // ---------------------------------
    // Convert parcel geometry to WGS84
    // ---------------------------------


    let geometry4326 =
    parcel.geometry;

    const wkid =
        parcel.geometry
            ?.spatialReference?.wkid ||
        parcel.geometry
            ?.spatialReference?.latestWkid;

    if (wkid !== 4326) {

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

    console.log(
        "GeoJSON for ULPIN",
        geoJsonGeometry
    );

    // ---------------------------------
    // Generate ULPIN
    // ---------------------------------

    const ulpinResponse =
        await generateUlpin(
            geoJsonGeometry
        );

    const ulpin =
        ulpinResponse?.data?.ulpin ||
        ulpinResponse?.data?.data?.ulpin ||
        ulpinResponse?.data?.data ||
        "Not Available";

    // ---------------------------------
    // Generate Plot Coverage DIGIPINs
    // ---------------------------------

    const digipinSet =
        new Set();

    const extent =
        geometry4326.extent;

    const step =
        0.00004;

    for (
        let lon = extent.xmin;
        lon <= extent.xmax;
        lon += step
    ) {

        for (
            let lat = extent.ymin;
            lat <= extent.ymax;
            lat += step
        ) {

            const samplePoint =
                new Point({
                    longitude: lon,
                    latitude: lat,
                    spatialReference: {
                        wkid: 4326
                    }
                });

            const isInside =
                geometryEngine.contains(
                    geometry4326,
                    samplePoint
                );

            if (!isInside) {
                continue;
            }

            try {

                const response =
                    await generateDigipin(
                        lat,
                        lon
                    );

                const digipin =
                    response?.data?.digipin ||
                    response?.data?.data?.digipin ||
                    response?.data?.data;

                if (digipin) {
                    digipinSet.add(
                        digipin
                    );
                }

            } catch (error) {

                console.error(
                    "DIGIPIN Error",
                    error
                );
            }
        }
    }

    await view.goTo(
        parcel.geometry,
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

    const enablePlotSelection =
        () => {

            setError("");
            setResult(
                null
            );

            const clickHandler =
                view.on(
                    "click",
                    async (
                        event
                    ) => {

                        clickHandler.remove();

                        try {

                            setLoading(
                                true
                            );

                            await processPlot(
                                event.mapPoint
                            );

                        } catch (
                            error
                        ) {

                            console.error(
                                error
                            );

                            setError(
                                error.message ||
                                    "Failed to process plot."
                            );

                        } finally {

                            setLoading(
                                false
                            );
                        }
                    }
                );
        };

    return (

        <div className="geo-tool-container">

            <div className="geo-tool-body">

                <p>
                    Click
                    "Select Plot"
                    and then
                    click a
                    parcel on
                    the map.
                </p>

                <button
                    className="geo-search-btn"
                    onClick={
                        enablePlotSelection
                    }
                    disabled={
                        loading
                    }
                >
                    {
                        loading
                            ? "Processing..."
                            : "Select Plot"
                    }
                </button>

            </div>

            <div className="geo-tool-results">

                <h4>
                    Results
                </h4>

                {error && (

                    <div className="geo-error">
                        {error}
                    </div>

                )}

                {result && (

                    <>

                        <div className="result-row">
                            <strong>
                                ULPIN
                            </strong>

                            <span>
                                {
                                    result.ulpin
                                }
                            </span>
                        </div>

                        <div className="result-row">
                            <strong>
                                Plot No
                            </strong>

                            <span>
                                {
                                    result.plotNo
                                }
                            </span>
                        </div>

                        <div className="result-row">
                            <strong>
                                Mouza
                            </strong>

                            <span>
                                {
                                    result.mouza
                                }
                            </span>
                        </div>

                        <div className="result-row">
                            <strong>
                                Khatian
                            </strong>

                            <span>
                                {
                                    result.khatian
                                }
                            </span>
                        </div>

                        <div className="result-row">
                            <strong>
                                DIGIPIN Count
                            </strong>

                            <span>
                                {
                                    result.digipinCount
                                }
                            </span>
                        </div>

                        {result.digipins?.map(
                            (
                                digipin,
                                index
                            ) => (
                                <div
                                    key={
                                        digipin
                                    }
                                    className="result-row"
                                >
                                    <strong>
                                        DIGIPIN{" "}
                                        {index +
                                            1}
                                    </strong>

                                    <span>
                                        {
                                            digipin
                                        }
                                    </span>
                                </div>
                            )
                        )}

                    </>

                )}

                {!loading &&
                    !error &&
                    !result && (

                        <div className="no-results">
                            No data available
                        </div>

                    )}

            </div>

        </div>
    );
};

export default GeoIdentifierTool;