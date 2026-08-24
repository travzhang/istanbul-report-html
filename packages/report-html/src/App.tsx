import { MyButton } from 'canyonjs-dev-report-component'
import './App.css'

declare global {
  interface Window {
    reportData?: unknown
  }
}

function App() {
  return (
    <main>
      <h1>Coverage Report</h1>
      <MyButton type="primary" />
      <pre>{JSON.stringify(window.reportData, null, 2)}</pre>
    </main>
  )
}

export default App
