// Pure scroll-target calculation shared by the focus-scroll controller.
// Coordinates in `ScaledBox` and the viewport edges of `ScrollRegionMetrics`
// are stage-scaled screen pixels; scroll offsets and client/scroll sizes are
// unscaled layout pixels. Dividing a screen delta by `scale` converts it.

export interface ScaledBox {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface ScrollRegionMetrics {
  left: number;
  top: number;
  right: number;
  bottom: number;
  clientWidth: number;
  clientHeight: number;
  scrollWidth: number;
  scrollHeight: number;
  scrollLeft: number;
  scrollTop: number;
}

export interface ScrollTarget {
  axis: "x" | "y";
  align: "contain" | "start";
  box: ScaledBox;
  // Layout pixels. For "contain" this is the gutter kept inside the viewport;
  // for "start" it is the offset added after the leading viewport edge.
  offset: number;
}

export interface ScrollOffset {
  left: number;
  top: number;
  changed: boolean;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

interface AxisSpan {
  start: number;
  end: number;
  viewStart: number;
  viewEnd: number;
}

// Resolves one axis. `start`/`end` are the target's scaled edges; `viewStart`/
// `viewEnd` are the region's scaled viewport edges; `gutter` is scaled too.
function axisOffset(
  span: AxisSpan,
  align: "contain" | "start",
  current: number,
  max: number,
  gutter: number,
  scale: number,
): number {
  let next = current;
  if (align === "start") {
    next = current + (span.start - (span.viewStart + gutter)) / scale;
  } else if (span.start < span.viewStart + gutter) {
    next = current + (span.start - span.viewStart - gutter) / scale;
  } else if (span.end > span.viewEnd - gutter) {
    next = current + (span.end - span.viewEnd + gutter) / scale;
  }
  return clamp(next, 0, max);
}

export function computeScrollTarget(
  region: ScrollRegionMetrics,
  target: ScrollTarget,
  scale: number,
): ScrollOffset {
  let left = region.scrollLeft;
  let top = region.scrollTop;
  if (!Number.isFinite(scale) || scale <= 0) return { left, top, changed: false };

  const gutter = target.offset * scale;

  if (target.axis === "x") {
    left = axisOffset(
      {
        start: target.box.left,
        end: target.box.right,
        viewStart: region.left,
        viewEnd: region.right,
      },
      target.align,
      region.scrollLeft,
      Math.max(0, region.scrollWidth - region.clientWidth),
      gutter,
      scale,
    );
  } else {
    top = axisOffset(
      {
        start: target.box.top,
        end: target.box.bottom,
        viewStart: region.top,
        viewEnd: region.bottom,
      },
      target.align,
      region.scrollTop,
      Math.max(0, region.scrollHeight - region.clientHeight),
      gutter,
      scale,
    );
  }

  const changed =
    Math.abs(left - region.scrollLeft) > 0.5 ||
    Math.abs(top - region.scrollTop) > 0.5;
  return { left, top, changed };
}
