import { useMemo } from "react";
import {
  ReportApp,
  cwdBaseName,
  resolveInstrumentCwd,
  resolveSource,
  toRelativePath,
  type FileCoverageData,
  type ReportAppFile,
} from "canyonjs-dev-report-component";
import "canyonjs-dev-report-component/style.css";

function App() {
  const reportData = window.reportData;

  const files = useMemo((): ReportAppFile[] => {
    const coverage = reportData?.coverage as Record<string, FileCoverageData> | undefined;
    if (reportData === undefined || coverage === undefined) {
      return [];
    }
    const instrumentCwd =
      reportData.instrumentCwd ||
      resolveInstrumentCwd(Object.entries(coverage).map(([key, data]) => data.path || key));

    return Object.entries(coverage).map(([key, data]) => {
      const absPath = data.path || key;
      return {
        ...data,
        path: absPath,
        source: resolveSource(reportData.sources, toRelativePath(absPath, instrumentCwd), instrumentCwd),
      };
    });
  }, [reportData]);

  const instrumentCwd = reportData?.instrumentCwd || resolveInstrumentCwd(files.map((file) => file.path));

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
