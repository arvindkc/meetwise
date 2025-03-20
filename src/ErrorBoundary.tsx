import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
  isNetworkError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: "",
    isNetworkError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Check if it's a port disconnection or CORS-related error
    const isNetworkError =
      error.message.includes("disconnected port") ||
      error.message.includes("Cross-Origin") ||
      error.message.includes("NetworkError");

    return {
      hasError: true,
      errorMessage: error.message,
      isNetworkError,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.state.isNetworkError) {
        return (
          <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-xl font-semibold mb-4">
              Network Issue Detected
            </h1>
            <p className="mb-4">
              We're having trouble connecting to some services. This might be
              due to:
            </p>
            <ul className="list-disc text-left mb-6">
              <li className="ml-6">Network connection problems</li>
              <li className="ml-6">Browser security settings</li>
              <li className="ml-6">
                Cross-origin resource sharing (CORS) restrictions
              </li>
            </ul>
            <p>Try refreshing the page or check your internet connection.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Refresh Page
            </button>
          </div>
        );
      }

      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-xl font-semibold mb-4">Something went wrong</h1>
          <p className="mb-6">We're sorry, but an error has occurred.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
