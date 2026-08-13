import { useState } from "react";

import {
    generateDigipin,
    generateUlpin
} from "../../api/apiService";

import "./GeoIdentifierTool.css";

import Point from "@arcgis/core/geometry/Point";
import Graphic from "@arcgis/core/Graphic";
import * as webMercatorUtils from "@arcgis/core/geometry/support/webMercatorUtils";
import TextSymbol from "@arcgis/core/symbols/TextSymbol";

const GeoIdentifierTool = ({
    view,
    landStackLayer,
    buildingLayer
}) => {

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

    return (

        <div className="geo-tool-container">

            <div className="geo-tool-body">

    <div className="geo-tool-tabs">

        <button
            className={
                selectionMode === "plot"
                    ? "active"
                    : ""
            }
            onClick={() =>
                setSelectionMode(
                    "plot"
                )
            }
        >
            Plot Based
        </button>

        <button
            className={
                selectionMode ===
                "property"
                    ? "active"
                    : ""
            }
            onClick={() =>
                setSelectionMode(
                    "property"
                )
            }
        >
            Property Based
        </button>

    </div>

    <p>
        {
            selectionMode ===
            "plot"
                ? "ULPIN Search"
                : "Digipin Search"
        }
    </p>

    <button
        className="geo-search-btn"
        onClick={
            enableSelection
        }
        disabled={
            loading
        }
    >
        {
            loading
                ? "Processing..."
                : selectionMode ===
                  "plot"
                ? "Select Plot"
                : "Select Property"
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