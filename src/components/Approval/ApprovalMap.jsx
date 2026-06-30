import { useEffect, useRef } from "react";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";
import TextSymbol from "@arcgis/core/symbols/TextSymbol";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";
import Point from "@arcgis/core/geometry/Point";
import Polygon from "@arcgis/core/geometry/Polygon";

const SERVICE_URL =
    "https://indcs0152.atrapa.deloitte.com/arcgis/rest/services/WBLR/Rajarhat_Plot";

const FEATURE_LAYER_URL = `${SERVICE_URL}/FeatureServer/0`;
const MAP_SERVER_URL = `${SERVICE_URL}/MapServer`;

const ApprovalMap = ({ mode, geoData }) => {
    const mapRef = useRef(null);

    useEffect(() => {
        let view;

        const initMap = async () => {
            const graphicsLayer = new GraphicsLayer();

            const featureLayer = new FeatureLayer({
                url: FEATURE_LAYER_URL,
                outFields: ["*"]
            });

            const mapImageLayer = new MapImageLayer({
                url: MAP_SERVER_URL
            });

            const map = new Map({
                basemap: "hybrid",
                layers: [mapImageLayer, featureLayer, graphicsLayer]
            });

            view = new MapView({
                container: mapRef.current,
                map
            });

            await view.when();

            const polygons = [];

            // ✅ BEFORE EDIT
            if (mode === "before" && geoData?.length) {
                geoData.forEach(item => {
                    if (!item.geometry) return;

                    const geometry = JSON.parse(item.geometry);

                    const poly = addPolygonWithLabels(
                        geometry.coordinates[0],
                        item.plot_no,
                        [0, 0, 255],
                        graphicsLayer
                    );

                    polygons.push(poly);
                });
            }

            // ✅ AFTER EDIT
            if (mode === "after" && geoData?.length) {
                geoData.forEach(item => {
                    if (!item?.shape?.coordinates) return;

                    const poly = addPolygonWithLabels(
                        item.shape.coordinates[0],
                        item.new_plot_no,
                        [0, 150, 0],
                        graphicsLayer
                    );

                    polygons.push(poly);
                });
            }

            // ✅ FIXED ZOOM
            if (polygons.length) {
                view.goTo(polygons);
            }
        };

        initMap();

        return () => {
            if (view) view.destroy();
        };
    }, [mode, geoData]);

    return <div style={{ height: "300px", width: "100%" }} ref={mapRef} />;
};

const addPolygonWithLabels = (ringsArray, plotLabel, color, graphicsLayer) => {

    if (!ringsArray) return;

    // ✅ PROPER POLYGON OBJECT
    const polygon = new Polygon({
        rings: ringsArray,
        spatialReference: { wkid: 4326 }
    });

    // ✅ DRAW POLYGON
    graphicsLayer.add(new Graphic({
        geometry: polygon,
        symbol: {
            type: "simple-fill",
            color: [...color, 0.1],
            outline: {
                color,
                width: 1
            }
        }
    }));

    // ✅ SAFE CENTROID
    const centroid = polygon.extent?.center;
    if (!centroid) return polygon;

    // ✅ AREA
    const area = geometryEngine.geodesicArea(polygon, "hectares");

    // ✅ AREA LABEL
    graphicsLayer.add(new Graphic({
        geometry: centroid,
        symbol: new TextSymbol({
            text: `${area ? area.toFixed(4) : 0} ha`,
            color: "black",
            // haloColor: "white",
            // haloSize: "1px",
            font: { size: 8 },
            yoffset: -12
        })
    }));

    // ✅ PLOT LABEL
    graphicsLayer.add(new Graphic({
        geometry: centroid,
        symbol: new TextSymbol({
            text: plotLabel || "",
            color: color,
            // haloColor: "white",
            // haloSize: "1px",
            font: { size: 11, weight: "bold" },
            yoffset: 8
        })
    }));

    // ✅ EDGE LENGTHS
    polygon.rings.forEach(ring => {

        for (let i = 0; i < ring.length - 1; i++) {

            const p1 = ring[i];
            const p2 = ring[i + 1];

            if (!p1 || !p2) continue;

            const line = {
                type: "polyline",
                paths: [[p1, p2]],
                spatialReference: { wkid: 4326 }
            };

            const length = geometryEngine.geodesicLength(line, "meters");

            if (!length || isNaN(length)) continue;

            const mid = new Point({
                longitude: (p1[0] + p2[0]) / 2,
                latitude: (p1[1] + p2[1]) / 2
            });

            graphicsLayer.add(new Graphic({
                geometry: mid,
                symbol: new TextSymbol({
                    text: `${length.toFixed(2)} m`,
                    color: "black",
                    // haloColor: "white",
                    // haloSize: "1px",
                    font: { size: 8 }
                })
            }));
        }
    });

    return polygon;
};

export default ApprovalMap;