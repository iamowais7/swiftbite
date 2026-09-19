import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}
interface State {
  hasError: boolean;
  message: string;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error("ErrorBoundary caught:", error, info);
  }

  reset = () => this.setState({ hasError: false, message: "" });

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 p-6 text-center">
          <span className="text-4xl">⚠️</span>
          <p className="font-semibold text-gray-800">Something went wrong here.</p>
          <p className="text-sm text-gray-500 max-w-md break-words">{this.state.message}</p>
          <button
            onClick={this.reset}
            className="rounded-lg bg-[#E23744] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d32f3a]"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
