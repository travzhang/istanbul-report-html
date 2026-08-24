import { useMemo } from "react";
import {
  ReportApp,
  cwdBaseName,
  resolveSource,
  toRelativePath,
  type FileCoverageData,
  type ReportAppFile,
} from "canyonjs-dev-report-component";
import "canyonjs-dev-report-component/style.css";

function App() {
  const reportData = window.reportData;
  const instrumentCwd = reportData?.instrumentCwd ?? "";

  const files = useMemo((): ReportAppFile[] => {
    const coverage = reportData?.coverage as Record<string, FileCoverageData> | undefined;
    if (reportData === undefined || coverage === undefined) {
      return [];
    }

    return Object.entries(coverage).map(([key, data]) => {
      const absPath = data.path || key;
      return {
        ...data,
        path: absPath,
        source: resolveSource(reportData.sources, toRelativePath(absPath, instrumentCwd), instrumentCwd),
      };
    });
  }, [reportData, instrumentCwd]);

  if (!reportData) {
    return <p>No report data loaded.</p>;
  }

  return (
    <ReportApp
      files={files}
      instrumentCwd={instrumentCwd}
      name={cwdBaseName(instrumentCwd)}
    />
  );
}

export default App;
