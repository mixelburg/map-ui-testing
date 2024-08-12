import * as Cesium from "cesium";
import { Cartesian3, Viewer as CesiumViewer } from "cesium";
import { CesiumComponentRef, Entity, Viewer } from "resium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { useEffect, useRef } from "react";
import { officeCoords } from "./util.ts";

// Set your Cesium Ion access token here
Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzZjdkMTFkMS02ODU0LTQ4Y2YtYTc2MC1iODQzODVkYTY5OTQiLCJpZCI6MjM0MDQwLCJpYXQiOjE3MjMzNjk3NTh9.8KqhIeVHRxWQiJ4kJzic7ZTZxAINVXESS3OqCyd8el0";



export const CesiumApp = () => {
  const viewerRef = useRef<CesiumComponentRef<CesiumViewer>>(null);

  useEffect(() => {
    setTimeout(() => {
      if (viewerRef.current?.cesiumElement) {
        console.log('flyTo');

        viewerRef.current.cesiumElement.camera.flyTo({
          destination: Cartesian3.fromDegrees(officeCoords.lon, officeCoords.lat, 400),
        });
      }
    }, 50)
  }, []);

  return (
    <Viewer full ref={viewerRef}>
      <Entity
        name="CodeValue Office"
        position={Cartesian3.fromDegrees(
          officeCoords.lon,
          officeCoords.lat,
          0
        )}
        point={{ pixelSize: 10 }}
      >
        test
      </Entity>
    </Viewer>
  );
};
