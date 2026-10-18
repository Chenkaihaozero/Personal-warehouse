import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 用 HashRouter，保证静态部署 / 直接双击 index.html 也能正常路由 */}
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
)
