import { Feature, Map, Overlay } from "ol";
import { useEffect, useMemo, useState } from "react";
import { Coordinate } from "ol/coordinate";
import { Point, Polygon } from "ol/geom";
import { fromLonLat } from "ol/proj";
import ReactDOM from "react-dom/client";
import { PolygonLabel } from "./PolygonLabel.tsx";
import { Fill, Icon, Stroke, Style } from "ol/style";
import { fpsToMs } from "../util.ts";
import VectorLayer from "ol/layer/Vector";
import { useMapZoom } from "./useMapZoom.ts";
import VectorSource from "ol/source/Vector";

const drawPolygonWithMovingDrone = (
  map: Map,
  layer: VectorLayer,
  coordinates: Coordinate[],
  overlay: Overlay,
) => {
  // Transform the coordinates from [lon, lat] to [x, y]
  const transformedCoordinates = coordinates.map((coord) => fromLonLat(coord));

  // Ensure the first and last coordinates are the same to close the polygon
  if (
    transformedCoordinates.length > 0 &&
    transformedCoordinates[0] !==
      transformedCoordinates[transformedCoordinates.length - 1]
  ) {
    transformedCoordinates.push(transformedCoordinates[0]);
  }

  const polygon = new Polygon([transformedCoordinates]);

  // set fixed size for the overlay
  const centeroid = polygon.getInteriorPoint().getCoordinates();
  overlay.setPosition(centeroid);
  map.addOverlay(overlay);

  // Create a new polygon feature
  const polygonFeature = new Feature({
    geometry: polygon,
  });

  // Define the style for the polygon
  const polygonStyle = new Style({
    stroke: new Stroke({
      color: "rgba(0, 0, 255, 0.8)", // Blue border
      width: 2,
    }),
    fill: new Fill({
      color: "rgba(0, 0, 255, 0.2)", // Light blue fill
    }),
  });
  polygonFeature.setStyle(polygonStyle);

  // Create a point feature for the icon
  const iconFeature = new Feature({
    geometry: new Point(transformedCoordinates[0]), // Start at the first coordinate
  });

  const movingFeatureStyle = new Style({
    image: new Icon({
      anchor: [0.5, 0.5],
      src: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn3.iconfinder.com%2Fdata%2Ficons%2Fdevices-fill%2F100%2FDJI-Mavic-f-512.png&f=1&nofb=1&ipt=03e7ce0efdb0b01ba3114c956c28f1399a21232715e08941ab3bcb6dbcc6c347&ipo=images",
      scale: 0.1,
    }),
  });

  // Define the style for the icon
  iconFeature.setStyle(movingFeatureStyle);
  iconFeature.setProperties({
    type: "drone",
    name: "DJI Mavic 3",
  });

  const speed = 0.001;
  let currentIndex = 0;
  let fraction = 0;

  // Function to update the icon position along the path
  const updateIconPosition = () => {
    if (fraction >= 1) {
      fraction = 0;
      currentIndex = (currentIndex + 1) % (transformedCoordinates.length - 1);
    }

    // Calculate the next position along the path
    const start = transformedCoordinates[currentIndex];
    const end = transformedCoordinates[currentIndex + 1];
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];

    fraction += speed;

    const newPos = [start[0] + fraction * dx, start[1] + fraction * dy];
    iconFeature.setGeometry(new Point(newPos));

    (iconFeature.getStyle() as Style)
      ?.getImage()
      ?.setRotation(Math.atan2(dy, dx));
  };

  const interval = setInterval(updateIconPosition, fpsToMs(60));

  layer.getSource()?.addFeature(polygonFeature);
  layer.getSource()?.addFeature(iconFeature);

  return {
    interval,
    polygon,
  };
};

type MovingDroneProps = {
  map?: Map;
  coordinates: Coordinate[];
  hidden?: boolean;
};

export const MovingDrone = (props: MovingDroneProps) => {
  const { map, hidden: forceHidden, coordinates } = props;
  const { zoom } = useMapZoom(props.map);
  const [polygon, setPolygon] = useState<Polygon | null>(null);

  const [_hidden, setHidden] = useState<boolean>(false);
  const [layer, setLayer] = useState<VectorLayer | null>(null);

  const hidden = forceHidden || _hidden;

  const overlay = useMemo(() => {
    const labelElement = document.createElement("div");
    labelElement.className = "polygon-label";

    // Render the React component into the overlay element
    ReactDOM.createRoot(labelElement).render(<PolygonLabel />);
    return new Overlay({
      element: labelElement,
      positioning: "center-center",
      stopEvent: false,
      autoPan: false,
    });
  }, []);

  useEffect(() => {
    if (polygon) {
      if (zoom < 16) {
        overlay.setPosition(undefined);
      } else {
        overlay.setPosition(polygon.getInteriorPoint().getCoordinates());
      }
    }
  }, [zoom, overlay, polygon]);

  useEffect(() => {
    if (map && !hidden) {
      const vectorSource = new VectorSource({});

      const vectorLayer = new VectorLayer({
        source: vectorSource,
      });
      map.addLayer(vectorLayer);
      setLayer(vectorLayer);

      const { interval, polygon } = drawPolygonWithMovingDrone(
        map,
        vectorLayer,
        coordinates,
        overlay,
      );
      setPolygon(polygon);

      return () => {
        clearInterval(interval);
        map.removeLayer(vectorLayer);
        setLayer(null);
        // hide overlay
        overlay.setPosition(undefined);
      };
    }
  }, [map, coordinates, hidden, overlay]);

  return <>
    <button
      style={{
        position: "absolute",
        top: 10,
        left: 40,
        zIndex: 1000,
      }}
      onClick={() => setHidden(ps => !ps)}
    >
     toggle drone
    </button>
  </>;
};
