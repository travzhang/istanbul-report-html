import { useMemo, useState } from "react";
import {
  Report,
  cwdBaseName,
  fileCoverageToDataSource,
  resolveInstrumentCwd,
  resolveSource,
  type FileCoverageData,
} from "canyonjs-dev-report-component";

function App() {
  const reportData = window.reportData;
  const [value, setValue] = useState("");

  const coverage = reportData?.coverage as Record<string, FileCoverageData> | undefined;
  const instrumentCwd = useMemo(() => {
    if (!reportData || coverage === undefined) {
      return "";
    }
    return reportData.instrumentCwd || resolveInstrumentCwd(
      Object.entries(coverage).map(([key, data]) => data.path || key),
    );
  }, [coverage, reportData]);

  const dataSource = useMemo(
    () => (coverage ? fileCoverageToDataSource(coverage, instrumentCwd) : []),
    [coverage, instrumentCwd],
  );

  if (!reportData) {
    return <p>No report data loaded.</p>;
  }

  return (
    <Report
      name={cwdBaseName(instrumentCwd)}
      value={value}
      dataSource={dataSource}
      onSelect={async (val) => {
        setValue(val);
        return { source: resolveSource(reportData.sources, val, instrumentCwd) };
      }}
    />
  );
}

export default App;
