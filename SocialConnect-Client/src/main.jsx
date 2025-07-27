import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { AuthProvider } from "./contexts/AuthContext"
import { ThemeProviderWrapper } from "./contexts/ThemeContext"
import "./index.css"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProviderWrapper>
        <App />
      </ThemeProviderWrapper>
    </AuthProvider>
  </React.StrictMode>,
)
