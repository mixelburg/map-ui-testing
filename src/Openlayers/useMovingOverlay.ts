import { useEffect } from "react";
import { toLonLat } from "ol/proj";
import { Feature, Overlay } from "ol";
import { Point } from "ol/geom";
import { fpsToMs } from "../util.ts";


const overlayElement = document.createElement("div");
overlayElement.style.backgroundColor = "white";
overlayElement.style.border = "1px solid black";
overlayElement.style.padding = "10px";
overlayElement.style.borderRadius = "5px";
overlayElement.style.position = "absolute";
overlayElement.style.transform = "translate(-50%, -100%)";
overlayElement.style.whiteSpace = "nowrap";

const overlay = new Overlay({
  element: overlayElement,
  autoPan: false,
});

export const useMovingOverlay = (overlayAnchor: Feature<Point> | null) => {
  useEffect(() => {
    if (overlayAnchor) {
      const interval = setInterval(() => {
        const coordinates = overlayAnchor.getGeometry()?.getCoordinates();
        if (!coordinates) {
          return;
        }
        const lonLat = toLonLat(coordinates);
        const properties = overlayAnchor.getProperties();
        overlayElement.innerHTML = `<strong>${properties['name'] || 'drone name'}</strong><br>Lon: ${lonLat[0].toFixed(4)}, Lat: ${lonLat[1].toFixed(4)}`;
        overlay.setPosition([coordinates[0], coordinates[1] + 10]);
      }, fpsToMs(60));

      return () => {
        clearInterval(interval);
      };
    }
  }, [overlayAnchor]);

  return overlay
}