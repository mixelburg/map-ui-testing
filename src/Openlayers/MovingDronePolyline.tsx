import { Feature, Map, Overlay } from "ol";
import { useEffect, useMemo, useRef, useState } from "react";
import { Coordinate } from "ol/coordinate";
import { LineString, Point } from "ol/geom";
import { fromLonLat } from "ol/proj";
import { Stroke, Style } from "ol/style";
import VectorLayer from "ol/layer/Vector";
import { getVectorContext } from "ol/render";
import RenderEvent from "ol/render/Event";

type MovingDroneProps = {
  map?: Map;
  layer?: VectorLayer;
  start: Coordinate;
};

const getRandomNumberBetween = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

export const MovingDronePolyline = (props: MovingDroneProps) => {
  const { map, layer } = props;
  const [coordinates, setCoordinates] = useState<Coordinate[]>([props.start]);
  const distanceRef = useRef(0); // Store distance across renders
  const lastTimeRef = useRef<number | null>(null); // Store last time across renders
  const speed = 15_000;
  const previousRouteLengthRef = useRef(0); // Store the previous route length
  const totalTimeRef = useRef(0);

  const overlay = useMemo(() => {
    // create a circle overlay
    const div = document.createElement("div");
    div.style.width = "10px";
    div.style.height = "10px";
    div.style.background = "rgba(0, 0, 255, 1)";
    div.style.borderRadius = "50%";
    return new Overlay({
      element: div,
      positioning: "center-center",
    });
  }, []);

  useEffect(() => {
    // every second add a new coordinate with higher longitude and latitude use random number
    const interval = setInterval(() => {
      setCoordinates((ps) => {
        const last = ps[ps.length - 1];
        const newCoordinate = [
          last[0] + getRandomNumberBetween(-0.0001, 0.0005),
          last[1] + getRandomNumberBetween(-0.0001, 0.0005),
        ];
        return [...ps, newCoordinate];
      });
    }, 2000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const transformedCoordinates = coordinates.map((coord) =>
      fromLonLat(coord),
    );
    const route = new LineString(transformedCoordinates);

    const newRouteLength = route.getLength();
    const routeLengthRatio = previousRouteLengthRef.current / newRouteLength;

    // // Adjust distance based on the change in route length
    if (routeLengthRatio) {
      distanceRef.current *= routeLengthRatio;
    }

    previousRouteLengthRef.current = newRouteLength;
  }, [coordinates]);

  useEffect(() => {
    if (map && layer) {
      const transformedCoordinates = coordinates.map((coord) =>
        fromLonLat(coord),
      );
      const route = new LineString(transformedCoordinates);
      const routeLength = route.getLength();
      if (!routeLength) {
        return;
      }

      // add overlay to the map
      map.addOverlay(overlay);

      const lineFeature = new Feature({ geometry: route });
      layer.getSource()?.addFeature(lineFeature);

      // Define the style for the polyline
      const polylineStyle = new Style({
        stroke: new Stroke({
          color: "rgba(0, 0, 255, 0.8)", // Blue line
          width: 2,
        }),
      });
      lineFeature.setStyle(polylineStyle);

      const position = new Point(route.getCoordinateAt(distanceRef.current));

      const moveFeature = (event: RenderEvent) => {
        const time = event.frameState?.time || 0;
        const elapsedTime = time - (lastTimeRef.current || time);
        lastTimeRef.current = time;
        totalTimeRef.current += elapsedTime;

        if (routeLength) {
          distanceRef.current =
            (speed * totalTimeRef.current) / 1e6 / routeLength;
          console.log("d", {
            distance: distanceRef.current,
          });
        }

        const currentCoordinate = route.getCoordinateAt(distanceRef.current);
        position.setCoordinates(currentCoordinate);
        const vectorContext = getVectorContext(event);
        vectorContext.drawGeometry(position);
        // set overlay position
        overlay.setPosition(currentCoordinate);

        map?.render();
      };

      lastTimeRef.current = Date.now();
      layer.on("postrender", moveFeature);

      return () => {
        const source = layer.getSource();
        source?.removeFeatures([lineFeature]);
      };
    }
  }, [map, layer, coordinates]);

  return <></>;
};
