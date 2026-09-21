import { describe, expect, it } from "vitest";
import {
  computeScrollTarget,
  type ScrollRegionMetrics,
  type ScrollTarget,
} from "./scrollGeometry";

const region: ScrollRegionMetrics = {
  left: 100,
  top: 200,
  right: 1396,
  bottom: 1280,
  clientWidth: 1296,
  clientHeight: 1080,
  scrollWidth: 1296,
  scrollHeight: 2100,
  scrollLeft: 0,
  scrollTop: 0,
};

describe("computeScrollTarget", () => {
  it("does not change the offset for a fully visible target", () => {
    expect(
      computeScrollTarget(
        region,
        { axis: "y", align: "contain", offset: 16, box: { left: 0, right: 0, top: 300, bottom: 500 } },
        1,
      ),
    ).toEqual({ left: 0, top: 0, changed: false });
  });

  it("reveals a target below the viewport with the gutter inside", () => {
    expect(
      computeScrollTarget(
        region,
        { axis: "y", align: "contain", offset: 16, box: { left: 0, right: 0, top: 1900, bottom: 1960 } },
        1,
      ),
    ).toEqual({ left: 0, top: 696, changed: true });
  });

  it("scrolls a target above the viewport back into view", () => {
    expect(
      computeScrollTarget(
        { ...region, scrollTop: 600 },
        { axis: "y", align: "contain", offset: 16, box: { left: 0, right: 0, top: 100, bottom: 260 } },
        1,
      ),
    ).toEqual({ left: 0, top: 484, changed: true });
  });

  it("aligns the start edge to the viewport start plus offset", () => {
    expect(
      computeScrollTarget(
        region,
        { axis: "y", align: "start", offset: 32, box: { left: 0, right: 0, top: 900, bottom: 1000 } },
        1,
      ),
    ).toEqual({ left: 0, top: 668, changed: true });
  });

  it("scales gutters and deltas by the stage scale", () => {
    expect(
      computeScrollTarget(
        region,
        { axis: "y", align: "contain", offset: 16, box: { left: 0, right: 0, top: 1500, bottom: 1540 } },
        0.5,
      ),
    ).toEqual({ left: 0, top: 536, changed: true });
  });

  it("scrolls horizontally for x-axis targets", () => {
    expect(
      computeScrollTarget(
        { ...region, scrollWidth: 1500 },
        { axis: "x", align: "contain", offset: 16, box: { left: 1400, right: 1490, top: 0, bottom: 0 } },
        1,
      ),
    ).toEqual({ left: 110, top: 0, changed: true });
  });

  it("clamps horizontal scroll to its maximum", () => {
    expect(
      computeScrollTarget(
        { ...region, scrollWidth: 1500 },
        { axis: "x", align: "contain", offset: 16, box: { left: 1600, right: 1700, top: 0, bottom: 0 } },
        1,
      ),
    ).toEqual({ left: 204, top: 0, changed: true });
  });

  it("returns unchanged offsets for a non-finite or zero scale", () => {
    const target: ScrollTarget = {
      axis: "y",
      align: "contain",
      offset: 16,
      box: { left: 0, right: 0, top: 1900, bottom: 1960 },
    };
    expect(computeScrollTarget(region, target, 0)).toEqual({
      left: 0,
      top: 0,
      changed: false,
    });
    expect(computeScrollTarget(region, target, Number.NaN)).toEqual({
      left: 0,
      top: 0,
      changed: false,
    });
  });
});