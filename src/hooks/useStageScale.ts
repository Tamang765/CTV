import { useEffect, useLayoutEffect, useState } from "preact/hooks";
import { updateAllLayouts } from "@noriginmedia/norigin-spatial-navigation";

const getScale = () =>
  Math.min(window.innerWidth / 1920, window.innerHeight / 1080, 1);

export function useStageScale() {
  const [scale, setScale] = useState(getScale);
  useEffect(() => {
    let frame = 0;
    const resize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setScale(getScale()));
    };
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);
  // Measure focus targets after Preact commits the new stage transform.
  useLayoutEffect(() => {
    void updateAllLayouts();
  }, [scale]);
  return scale;
}