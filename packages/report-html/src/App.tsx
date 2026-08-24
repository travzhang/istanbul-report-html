import { MyButton } from "canyonjs-dev-report-component";
import "./App.css";
import type { ReportData } from "./report-data";

function formatValue(value: unknown): string {
  if (value === undefined) {
    return "—";
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  return String(value);
}

function OptionsTable({ title, rows }: { title: string; rows: [string, unknown][] }) {
  return (
    <section className="report-section">
      <h2>{title}</h2>
      <table className="report-table">
        <thead>
          <tr>
            <th>Option</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([key, value]) => (
            <tr key={key}>
              <td>{key}</td>
              <td>{formatValue(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function WatermarksTable({ watermarks }: { watermarks: ReportData["istanbul"]["watermarks"] }) {
  const metrics = ["statements", "lines", "branches", "functions"] as const;

  return (
    <section className="report-section">
      <h2>Istanbul Context</h2>
      <table className="report-table">
        <thead>
          <tr>
            <th>Metric</th>
            <th>Low &lt;</th>
            <th>High ≥</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((metric) => (
            <tr key={metric}>
              <td>{metric}</td>
              <td>{watermarks[metric][0]}%</td>
              <td>{watermarks[metric][1]}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function App() {
  const reportData = window.reportData;

  if (!reportData) {
    return (
      <main className="report">
        <h1>Coverage Report</h1>
        <p className="report-empty">No report data loaded.</p>
      </main>
    );
  }

  const htmlRows: [string, unknown][] = [
    ["verbose", reportData.html.verbose],
    ["subdir", reportData.html.subdir],
    ["skipEmpty", reportData.html.skipEmpty],
    ["metricsToShow", reportData.html.metricsToShow],
  ];

  return (
    <main className="report">
      <header className="report-header">
        <h1>Coverage Report</h1>
        <MyButton type="primary" />
      </header>

      <section className="report-section">
        <h2>Data Summary</h2>
        <dl className="report-stats">
          <div>
            <dt>Coverage files</dt>
            <dd>{reportData.stats.coverageFileCount}</dd>
          </div>
          <div>
            <dt>Source files</dt>
            <dd>{reportData.stats.sourceFileCount}</dd>
          </div>
        </dl>
      </section>

      <OptionsTable title="HTML Report Options" rows={htmlRows} />
      <WatermarksTable watermarks={reportData.istanbul.watermarks} />
    </main>
  );
}

export default App;
