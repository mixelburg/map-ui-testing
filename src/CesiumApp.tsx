import * as Cesium from "cesium";
import { Cartesian3, createWorldTerrainAsync, Viewer as CesiumViewer } from "cesium";
import { CesiumComponentRef, Entity, Viewer } from "resium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { useEffect, useRef } from "react";
import { officeCoords } from "./util.ts";
import airplaneModel from './assets/a318.glb';

// Set your Cesium Ion access token here
Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzZjdkMTFkMS02ODU0LTQ4Y2YtYTc2MC1iODQzODVkYTY5OTQiLCJpZCI6MjM0MDQwLCJpYXQiOjE3MjMzNjk3NTh9.8KqhIeVHRxWQiJ4kJzic7ZTZxAINVXESS3OqCyd8el0";



export const CesiumApp = () => {
  const viewerRef = useRef<CesiumComponentRef<CesiumViewer>>(null);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (viewerRef.current?.cesiumElement) {
      const viewer = viewerRef.current.cesiumElement;
      const camera = viewer.camera;
      const moveAmount = 100.0;
      const moveRate = camera.positionCartographic.height / moveAmount;

      switch (event.key) {
        case "ArrowUp":
          camera.moveForward(moveRate);
          break;
        case "ArrowDown":
          camera.moveBackward(moveRate);
          break;
        case "ArrowLeft":
          camera.moveLeft(moveRate);
          break;
        case "ArrowRight":
          camera.moveRight(moveRate);
          break;
        case "w":
          camera.moveUp(moveRate);
          break;
        case "s":
          camera.moveDown(moveRate);
          break;
        case "a":
          camera.twistLeft(0.05);
          break;
        case "d":
          camera.twistRight(0.05);
          break;
        default:
          break;
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    setTimeout(async () => {
      if (viewerRef.current?.cesiumElement) {
        console.log('flyTo');

        const viewer = viewerRef.current.cesiumElement;

        const tileset = await Cesium.createGooglePhotorealistic3DTileset();
        viewer.scene.primitives.add(tileset);

        viewer.camera.flyTo({
          destination: Cartesian3.fromDegrees(
            officeCoords.lon,
            officeCoords.lat,
            1000
          ),
          // orientation: {
          //   heading: Cesium.Math.toRadians(0),
          //   pitch: Cesium.Math.toRadians(-40),
          //   roll: 0.0,
          // },
          duration: 0
        });

        viewer.entities.add({
          rectangle: {
            // make it around the officeCoords
            coordinates: Cesium.Rectangle.fromDegrees(
              officeCoords.lon - 0.0002,
              officeCoords.lat - 0.0002,
              officeCoords.lon + 0.0002,
              officeCoords.lat + 0.0002
            ),
            material: Cesium.Color.BLUE.withAlpha(0.5),
          },
        });


      }
    }, 1000)
  }, []);

  return (
    <Viewer
      full
      ref={viewerRef}
      terrainProvider={createWorldTerrainAsync()}
    >
      <Entity
        name="CodeValue Office"
        position={Cartesian3.fromDegrees(
          officeCoords.lon,
          officeCoords.lat,
          0
        )}
        point={{ pixelSize: 10 }}
      >
      </Entity>
    </Viewer>
  );
};
