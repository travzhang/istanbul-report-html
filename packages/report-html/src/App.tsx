import { CoverageReport, type FileCoverageData } from "canyonjs-dev-report-component";

function App() {
  const reportData = window.reportData;

  if (!reportData) {
    return <p>No report data loaded.</p>;
  }

  return (
    <CoverageReport
      coverage={reportData.coverage as Record<string, FileCoverageData>}
      sources={reportData.sources}
      watermarks={reportData.istanbul.watermarks.lines}
    />
  );
}

export default App;
