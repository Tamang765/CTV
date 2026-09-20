import {
  getCurrentFocusKey,
  setFocus,
} from "@noriginmedia/norigin-spatial-navigation";
import type { Entity } from "../types/entities";
import {
  computeScrollTarget,
  type ScaledBox,
  type ScrollRegionMetrics,
  type ScrollTarget,
} from "./scrollGeometry";

export const cardKey = (entity: Entity) =>
  `card-${entity.category}-${entity.id}`;
export const homeItemKey = (entity: Entity) =>
  `home-${entity.category}-${entity.id}`;

export function focus(key: string) {
  void setFocus(key);
}

export function synchronizeFocus(key: string) {
  if (getCurrentFocusKey() !== key) focus(key);
}

export function trapTab(event: KeyboardEvent, container: HTMLElement | null) {
  if (event.key !== "Tab") return false;
  event.preventDefault();
  const buttons = [
    ...(container?.querySelectorAll<HTMLButtonElement>("button") ?? []),
  ];
  if (buttons.length === 0) return true;
  const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
  const next =
    current < 0
      ? event.shiftKey
        ? buttons.length - 1
        : 0
      : (current + (event.shiftKey ? -1 : 1) + buttons.length) % buttons.length;
  const key = buttons[next]?.dataset.focusKey;
  if (key) focus(key);
  return true;
}

export function scrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";
}

const toBox = (element: Element): ScaledBox => {
  const rect = element.getBoundingClientRect();
  return {
    left: rect.left,
    right: rect.right,
    top: rect.top,
    bottom: rect.bottom,
  };
};

// Resolves how a focused node should be revealed inside one scroll region
// based on the region's declared axis/mode metadata.
function resolveTarget(
  container: HTMLElement,
  node: HTMLElement,
): ScrollTarget | null {
  const axis = container.dataset.scrollAxis === "x" ? "x" : "y";
  const mode = container.dataset.scrollMode;
  if (mode === "manual") return null;
  if (mode === "home" && axis === "y") {
    const hero = node.closest("[data-hero]");
    if (hero) return { axis, align: "start", box: toBox(hero), offset: 0 };
    const heading = node.closest("[data-strip]")?.parentElement
      ?.firstElementChild;
    if (heading instanceof HTMLElement)
      return { axis, align: "start", box: toBox(heading), offset: 16 };
    return { axis, align: "contain", box: toBox(node), offset: 16 };
  }
  const offset = mode === "rail" ? 20 : mode === "grid" ? 16 : 0;
  return { axis, align: "contain", box: toBox(node), offset };
}

function revealRegion(container: HTMLElement, node: HTMLElement) {
  const target = resolveTarget(container, node);
  if (!target) return;
  const rect = container.getBoundingClientRect();
  const scale =
    target.axis === "x"
      ? rect.width / container.clientWidth
      : rect.height / container.clientHeight;
  const metrics: ScrollRegionMetrics = {
    left: rect.left,
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
    clientWidth: container.clientWidth,
    clientHeight: container.clientHeight,
    scrollWidth: container.scrollWidth,
    scrollHeight: container.scrollHeight,
    scrollLeft: container.scrollLeft,
    scrollTop: container.scrollTop,
  };
  const { left, top, changed } = computeScrollTarget(metrics, target, scale);
  if (changed) container.scrollTo({ left, top, behavior: scrollBehavior() });
}

let pendingReveal = 0;

export function reveal(node: HTMLElement) {
  cancelAnimationFrame(pendingReveal);
  pendingReveal = requestAnimationFrame(() => {
    pendingReveal = 0;
    let container = node.parentElement;
    while (container) {
      if (container.hasAttribute("data-scroll-region"))
        revealRegion(container, node);
      container = container.parentElement;
    }
  });
}
