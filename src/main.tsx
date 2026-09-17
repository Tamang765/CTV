import { render } from "preact";
import { App } from "./app/App";
import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary";
import "./navigation/initSpatialNavigation";
import "./styles/globals.css";

render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
  document.getElementById("app")!,
);
