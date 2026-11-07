import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import preflight from './preflight.css?inline'
import styles from './index.css?inline'

const root = document.createElement('div')
root.id = 'crx-root'
document.body.append(root)

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <style type="text/css">{preflight + styles}</style>
    <App/>
  </React.StrictMode>,
)
