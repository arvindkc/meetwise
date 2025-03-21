/**
 * Utility functions to handle CORS and port-related errors
 */

/**
 * Adds global error handler for port disconnection errors
 * to prevent uncaught exceptions in the console
 */
export function setupGlobalErrorHandlers(): void {
  // Original window.onerror handler
  const originalOnError = window.onerror;

  // Custom error handler
  window.onerror = (message, source, lineno, colno, error) => {
    // Check if it's a port disconnection error
    if (
      message &&
      typeof message === "string" &&
      (message.includes("disconnected port") ||
        message.includes("Cross-Origin-Opener-Policy"))
    ) {
      console.warn("Caught and handled:", message);

      // Return true to indicate the error was handled
      return true;
    }

    // For other errors, use the original handler if available
    if (originalOnError) {
      return originalOnError(message, source, lineno, colno, error);
    }

    // Default behavior: let the error propagate
    return false;
  };
}

/**
 * Wrapper for fetch that handles CORS errors gracefully
 */
export async function corsHandledFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  try {
    const response = await fetch(input, {
      ...init,
      // Add CORS mode
      mode: "cors",
      // Add credentials if needed
      credentials: "same-origin",
    });
    return response;
  } catch (error) {
    if (error instanceof Error) {
      // Check if it's a CORS error
      if (
        error.message.includes("NetworkError") ||
        error.message.includes("Failed to fetch") ||
        error.message.includes("Cross-Origin")
      ) {
        console.warn("CORS error handled:", error.message);
        throw new Error(
          "Network request failed. This might be due to CORS restrictions."
        );
      }
    }
    throw error;
  }
}
