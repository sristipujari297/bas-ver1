import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  auditLogs as seedLogs,
  evidenceDocuments as seedDocs,
  evidenceRefs as seedEvidence,
  findings as seedFindings,
  notifications as seedNotifications,
  remediationActions as seedRemediation,
  reports as seedReports,
} from "@/data/mockData";
import type {
  AppNotification,
  BankReport,
  ChatMessage,
  Finding,
  FindingStatus,
  RemediationAction,
  RemediationStatus,
  ReviewStage,
} from "@/lib/types";

interface AppState {
  findings: Finding[];
  reports: BankReport[];
  remediation: RemediationAction[];
  notifications: AppNotification[];
  chat: ChatMessage[];
  logs: typeof seedLogs;
  evidence: typeof seedEvidence;
  documents: typeof seedDocs;
  updateFindingStatus: (id: string, status: FindingStatus, stage?: ReviewStage) => void;
  assignFindingOwner: (id: string, owner: string) => void;
  updateRemediationStatus: (id: string, status: RemediationStatus) => void;
  addReport: (report: BankReport) => void;
  updateReport: (id: string, patch: Partial<BankReport>) => void;
  setChat: (messages: ChatMessage[]) => void;
  appendChat: (message: ChatMessage) => void;
  markNotificationsRead: () => void;
  resetDemo: () => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [findings, setFindings] = useState<Finding[]>(seedFindings);
  const [reports, setReports] = useState<BankReport[]>(seedReports);
  const [remediation, setRemediation] = useState<RemediationAction[]>(seedRemediation);
  const [notifications, setNotifications] = useState<AppNotification[]>(seedNotifications);
  const [chat, setChatState] = useState<ChatMessage[]>([]);

  const updateFindingStatus = useCallback(
    (id: string, status: FindingStatus, stage?: ReviewStage) => {
      setFindings((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status, reviewStage: stage ?? f.reviewStage } : f)),
      );
    },
    [],
  );

  const assignFindingOwner = useCallback((id: string, owner: string) => {
    setFindings((prev) => prev.map((f) => (f.id === id ? { ...f, owner } : f)));
  }, []);

  const updateRemediationStatus = useCallback((id: string, status: RemediationStatus) => {
    setRemediation((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }, []);

  const addReport = useCallback((report: BankReport) => {
    setReports((prev) => [report, ...prev]);
  }, []);

  const updateReport = useCallback((id: string, patch: Partial<BankReport>) => {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const markNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const resetDemo = useCallback(() => {
    setFindings(seedFindings);
    setReports(seedReports);
    setRemediation(seedRemediation);
    setNotifications(seedNotifications);
    setChatState([]);
  }, []);

  const value = useMemo<AppState>(
    () => ({
      findings,
      reports,
      remediation,
      notifications,
      chat,
      logs: seedLogs,
      evidence: seedEvidence,
      documents: seedDocs,
      updateFindingStatus,
      assignFindingOwner,
      updateRemediationStatus,
      addReport,
      updateReport,
      setChat: setChatState,
      appendChat: (message: ChatMessage) => setChatState((prev) => [...prev, message]),
      markNotificationsRead,
      resetDemo,
    }),
    [
      findings,
      reports,
      remediation,
      notifications,
      chat,
      updateFindingStatus,
      assignFindingOwner,
      updateRemediationStatus,
      addReport,
      updateReport,
      markNotificationsRead,
      resetDemo,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppStore must be used within AppStoreProvider");
  return ctx;
}
