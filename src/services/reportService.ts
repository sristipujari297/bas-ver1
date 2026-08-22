import { reports } from "@/data/mockData";
import type { BankReport } from "@/lib/types";

/**
 * Mock report service. Replace these functions with FastAPI calls
 * (POST /reports, GET /reports, GET /reports/:id) without touching the UI.
 */

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function listReports(): Promise<BankReport[]> {
  await delay(220);
  return reports;
}

export async function getReport(id: string): Promise<BankReport | undefined> {
  await delay(180);
  return reports.find((r) => r.id === id);
}

export interface UploadTick {
  progress: number;
  status: BankReport["status"];
  message: string;
}

/** Simulates the ingestion pipeline for a newly uploaded file. */
export async function simulateIngestion(onTick: (tick: UploadTick) => void): Promise<void> {
  const steps: UploadTick[] = [
    { progress: 18, status: "Uploaded", message: "Uploading document..." },
    { progress: 42, status: "Parsing", message: "Parsing financial tables..." },
    { progress: 68, status: "Processing", message: "Extracting KPIs and records..." },
    { progress: 86, status: "Indexed", message: "Embedding evidence chunks..." },
    { progress: 100, status: "Analysis Complete", message: "Audit analysis complete." },
  ];
  for (const step of steps) {
    await delay(750);
    onTick(step);
  }
}
