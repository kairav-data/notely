import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "40px 20px", fontFamily: "system-ui, sans-serif", textAlign: "center", maxWidth: "600px", margin: "40px auto" }}>
          <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>Something went wrong</h2>
          <p style={{ color: "#78716c", marginBottom: "16px" }}>An unexpected error occurred while rendering the application.</p>
          <pre style={{ background: "#f5f5f4", padding: "14px", borderRadius: "8px", overflowX: "auto", textAlign: "left", fontSize: "13px", color: "#dc2626" }}>
            {this.state.error?.stack || this.state.error?.message || String(this.state.error)}
          </pre>
          <div style={{ marginTop: "24px" }}>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: "8px 18px", borderRadius: "8px", background: "#d97706", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600 }}
            >
              Reload application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
