import { createRoot } from "react-dom/client";
import ErrorBoundary from "./ErrorBoundary";
import App from "./App";
import "./index.css";
import { setupGlobalErrorHandlers } from "./utils/corsHandler";

// Set up global error handlers
setupGlobalErrorHandlers();

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

const root = createRoot(rootElement);

root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
