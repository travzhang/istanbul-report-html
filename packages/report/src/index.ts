import type { FileCoverageData } from "istanbul-lib-coverage";
import type { Context, ReportNode } from "istanbul-lib-report";
import { ReportBase } from "istanbul-lib-report";
import { CoverageReport } from "./coverage-report";

/** maps report nodes to output paths, see the html report's `linkMapper` option */
export interface LinkMapper {
  getPath(node: ReportNode | string): string;
  relativePath(source: ReportNode | string, target: ReportNode | string): string;
  assetPath(node: ReportNode, name: string): string;
}

/** options accepted by {@link HtmlReport} */
export interface HtmlOptions {
  /** show extra logging while the report is generated */
  verbose?: boolean;
  /** maps report nodes to output paths */
  linkMapper?: LinkMapper;
  /** subdirectory (under the report dir) to write the report to */
  subdir?: string;
  /** skip nodes with no coverage */
  skipEmpty?: boolean;
  /** the metrics to show in the report UI, defaults to lines, branches and functions */
  metricsToShow?: ("lines" | "branches" | "functions" | "statements")[];
}

class HtmlReport extends ReportBase {
  private options: HtmlOptions;
  private coverage: Record<string, FileCoverageData> = {};

  constructor(opts?: HtmlOptions) {
    super();
    this.options = opts ?? {};
    this.coverage = {};
  }

  onDetail(node: ReportNode): void {
    const fileCoverage = node.getFileCoverage()
    this.coverage[fileCoverage.path] = fileCoverage;
  }

  async onEnd(_rootNode: ReportNode, context: Context): Promise<void> {
    const cr = new CoverageReport(this.options);
    await cr.generate({
      coverage: this.coverage,
      targetDir: context.dir,
      sourceFinder: context.sourceFinder,
      istanbul: {
        watermarks: context.watermarks,
      },
    });
  }
}

export default HtmlReport;
