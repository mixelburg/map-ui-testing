import { useEffect, useState } from "react";
import { Map } from "ol";

export const useMapZoom = (map?: Map) => {
  const [zoom, setZoom] = useState(0);

  useEffect(() => {
    if (map) {
      setZoom(map.getView().getZoom() || 0);
      map.getView().on("change:resolution", () => {
        const newZoom = map.getView().getZoom();
        if (!newZoom) return;
        setZoom(newZoom);
      });
    }
  }, [map]);

  return {
    zoom,
    setZoom,
  };
};
