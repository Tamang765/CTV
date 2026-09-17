import {
  getCurrentFocusKey,
  setFocus,
} from "@noriginmedia/norigin-spatial-navigation";
import type { Entity } from "../types/entities";

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

export function reveal(node: HTMLElement) {
  const nodeBox = node.getBoundingClientRect();
  const strip = node.closest("[data-strip]");
  const header = strip?.parentElement?.firstElementChild as HTMLElement | null;
  const headerBox =
    header && header !== strip ? header.getBoundingClientRect() : null;
  const heroSection = node.closest("[data-hero]");
  const top = heroSection
    ? heroSection.getBoundingClientRect().top
    : headerBox && headerBox.bottom <= nodeBox.top + 4
      ? headerBox.top
      : nodeBox.top;
  let container = node.parentElement;
  while (container) {
    if (container.hasAttribute("data-scroll-region")) {
      const viewport = container.getBoundingClientRect();
      const scale = viewport.height / container.clientHeight;
      if (container.clientHeight < container.scrollHeight) {
        if (top < viewport.top + 8 * scale)
          container.scrollTop += (top - viewport.top) / scale - 8;
        else if (nodeBox.bottom > viewport.bottom - 8 * scale)
          container.scrollTop += (nodeBox.bottom - viewport.bottom) / scale + 8;
      }
      const xScale = viewport.width / container.clientWidth;
      if (nodeBox.left < viewport.left + 16 * xScale)
        container.scrollLeft += (nodeBox.left - viewport.left) / xScale - 16;
      else if (nodeBox.right > viewport.right - 16 * xScale)
        container.scrollLeft += (nodeBox.right - viewport.right) / xScale + 16;
    }
    container = container.parentElement;
  }
}
