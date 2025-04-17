import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
// 导入i18n配置
import "./lib/i18n"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
