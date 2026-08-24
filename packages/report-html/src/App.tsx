import { useMemo, useState } from "react";
import {
  Report,
  fileCoverageToDataSource,
  type FileCoverageData,
} from "canyonjs-dev-report-component";

function App() {
  const reportData = window.reportData;
  const [value, setValue] = useState("");
  const dataSource = useMemo(
    () =>
      reportData
        ? fileCoverageToDataSource(reportData.coverage as Record<string, FileCoverageData>)
        : [],
    [reportData],
  );

  if (!reportData) {
    return <p>No report data loaded.</p>;
  }

  return (
    <Report
      name="Coverage"
      value={value}
      dataSource={dataSource}
      onSelect={async (val) => {
        setValue(val);
        return { source: reportData.sources[val] ?? "" };
      }}
    />
  );
}

export default App;
