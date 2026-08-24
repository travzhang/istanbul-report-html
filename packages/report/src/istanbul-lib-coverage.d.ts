import type { FileCoverageData } from "istanbul-lib-coverage";

declare module "istanbul-lib-coverage" {
  interface FileCoverage {
    /** POJO used by JSON.stringify; types upstream declare this as `object`. */
    toJSON(): FileCoverageData;
  }
}
