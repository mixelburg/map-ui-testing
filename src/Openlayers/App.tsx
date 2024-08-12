import { Feature, Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import "ol/ol.css";
import { useEffect, useState } from "react";
import { Point } from "ol/geom";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { fromLonLat } from "ol/proj";
import { XYZ } from "ol/source";
import { officeCoordsLonLat } from "../util.ts";
import { useMovingOverlay } from "./useMovingOverlay.ts";
import { MovingDrone } from "./MovingDrone.tsx";
import { MovingDronePolyline } from "./MovingDronePolyline.tsx";
import modelPath from '../assets/a318.glb';


const movingDroneCoords = [
  [35.0965, 32.6567],
  [35.0975, 32.6577],
  [35.0985, 32.6567],
];

const movingDronePolylineCoords = [
  35.09670308777679, 32.65904106552489
];

const mapLayer = new TileLayer({
  source: new XYZ({
    url: "https://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}",
    crossOrigin: "anonymous",
  }),
});

type MapState = {
  map: Map;
  layer: VectorLayer;
};

export const App = () => {
  const [mapState, setMapState] = useState<MapState | null>(null);
  const [overlayAnchor, setOverlayAnchor] = useState<Feature<Point> | null>(
    null,
  );

  useEffect(() => {
    const vectorSource = new VectorSource({});

    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    const map = new Map({
      target: "map",
      layers: [mapLayer, vectorLayer],
      view: new View({
        center: fromLonLat(officeCoordsLonLat),
        zoom: 17,
      }),
    });
    setMapState({
      map,
      layer: vectorLayer,
    });

    return () => {
      map.setTarget(undefined);
      setMapState(null);
    };
  }, []);

  const overlay = useMovingOverlay(overlayAnchor);

  useEffect(() => {
    if (mapState) {
      const { map } = mapState;
      map.addOverlay(overlay);

      // listen for click events
      map.on("click", (event) => {
        const feature = map
          .getFeaturesAtPixel(event.pixel)
          .find((f) => f.getProperties().type === "drone");

        if (feature && feature.getGeometry()?.getType() === "Point") {
          setOverlayAnchor(feature as Feature<Point>);
        } else {
          setOverlayAnchor(null);
          overlay.setPosition(undefined);
        }
      });
    }
  }, [mapState, overlay]);

  return (
    <>
      <div id="map" style={{ width: "dvw", height: "100dvh" }}></div>
      <MovingDrone
        layer={mapState?.layer}
        map={mapState?.map}
        coordinates={movingDroneCoords}
      />
      <MovingDronePolyline
        layer={mapState?.layer}
        map={mapState?.map}
        start={movingDronePolylineCoords}
      />
    </>
  );
};
