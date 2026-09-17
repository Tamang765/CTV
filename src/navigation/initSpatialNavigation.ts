import {
  destroy,
  GetBoundingClientRectAdapter,
  init,
} from "@noriginmedia/norigin-spatial-navigation";

// Norigin initialises at module load so every focusable registers against a
// live engine that already accounts for the fixed 1080p stage's preview scale.
init({
  layoutAdapter: GetBoundingClientRectAdapter,
  shouldFocusDOMNode: true,
  domNodeFocusOptions: { preventScroll: true },
  throttle: 100,
  throttleKeypresses: true,
});

if (import.meta.hot) import.meta.hot.dispose(() => destroy());
