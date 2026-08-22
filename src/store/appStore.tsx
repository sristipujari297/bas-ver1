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
import type { ReportAnalysisResult } from "@/services/reportService";
import type {
  AppNotification,
  AuditLogEntry,
  BankReport,
  ChatMessage,
  EvidenceDocument,
  EvidenceRef,
  Finding,
  FindingStatus,
  RemediationAction,
  RemediationStatus,
  ReviewStage,
} from "@/lib/types";

export interface AppState {
  findings: Finding[];
  reports: BankReport[];
  remediation: RemediationAction[];
  notifications: AppNotification[];
  chat: ChatMessage[];
  logs: AuditLogEntry[];
  evidence: EvidenceRef[];
  documents: EvidenceDocument[];

  // Finding operations
  addFinding: (finding: Finding | Finding[]) => void;
  updateFinding: (id: string, patch: Partial<Finding>) => void;
  updateFindingStatus: (id: string, status: FindingStatus, stage?: ReviewStage) => void;
  assignFindingOwner: (id: string, owner: string) => void;
  confirmFinding: (id: string) => void;
  deleteFinding: (id: string) => void;

  // Report operations
  addReport: (report: BankReport | BankReport[]) => void;
  updateReport: (id: string, patch: Partial<BankReport>) => void;
  deleteReport: (id: string) => void;
  applyReportAnalysis: (reportId: string, result: ReportAnalysisResult) => void;

  // Evidence Reference operations
  addEvidence: (evidence: EvidenceRef | EvidenceRef[]) => void;
  updateEvidence: (id: string, patch: Partial<EvidenceRef>) => void;
  deleteEvidence: (id: string) => void;

  // Evidence Document operations
  addDocument: (document: EvidenceDocument | EvidenceDocument[]) => void;
  updateDocument: (id: string, patch: Partial<EvidenceDocument>) => void;
  deleteDocument: (id: string) => void;

  // Remediation Action operations
  addRemediation: (action: RemediationAction | RemediationAction[]) => void;
  updateRemediation: (id: string, patch: Partial<RemediationAction>) => void;
  updateRemediationStatus: (id: string, status: RemediationStatus) => void;
  deleteRemediation: (id: string) => void;

  // Notification operations
  addNotification: (notification: AppNotification | AppNotification[]) => void;
  markNotificationRead: (id: string) => void;
  markNotificationsRead: () => void;
  deleteNotification: (id: string) => void;

  // Audit Log operations
  addAuditLog: (log: AuditLogEntry | AuditLogEntry[]) => void;
  clearAuditLogs: () => void;

  // Chat operations
  setChat: (messages: ChatMessage[]) => void;
  appendChat: (message: ChatMessage) => void;
  clearChat: () => void;

  // Demo lifecycle
  resetDemo: () => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [findings, setFindings] = useState<Finding[]>(() => structuredClone(seedFindings));
  const [reports, setReports] = useState<BankReport[]>(() => structuredClone(seedReports));
  const [remediation, setRemediation] = useState<RemediationAction[]>(() =>
    structuredClone(seedRemediation),
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    structuredClone(seedNotifications),
  );
  const [logs, setLogs] = useState<AuditLogEntry[]>(() => structuredClone(seedLogs));
  const [evidence, setEvidence] = useState<EvidenceRef[]>(() => structuredClone(seedEvidence));
  const [documents, setDocuments] = useState<EvidenceDocument[]>(() => structuredClone(seedDocs));
  const [chat, setChatState] = useState<ChatMessage[]>([]);

  // Finding actions
  const addFinding = useCallback((finding: Finding | Finding[]) => {
    setFindings((prev) => (Array.isArray(finding) ? [...finding, ...prev] : [finding, ...prev]));
  }, []);

  const updateFinding = useCallback((id: string, patch: Partial<Finding>) => {
    setFindings((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }, []);

  const updateFindingStatus = useCallback(
    (id: string, status: FindingStatus, stage?: ReviewStage) => {
      setFindings((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status, reviewStage: stage ?? f.reviewStage } : f)),
      );

      setRemediation((prev) =>
        prev.map((a) => {
          if (a.findingId !== id) return a;

          // 1. If finding is dismissed/false positive, associated remediation must not remain active
          if (status === "Dismissed") {
            return { ...a, status: "Dismissed" as RemediationStatus };
          }

          // 2. If remediation is approved, update associated remediation to In Progress
          if (status === "Remediation Pending" || stage === "Remediation Approved") {
            if (a.status === "Not Started" || a.status === "Dismissed") {
              return { ...a, status: "In Progress" as RemediationStatus };
            }
          }

          // 3. If finding is confirmed, associated remediation remains active/available
          if (status === "Confirmed" || status === "Under Review" || status === "New") {
            if (a.status === "Dismissed") {
              return { ...a, status: "Not Started" as RemediationStatus };
            }
          }

          // 4. If finding is resolved, mark non-dismissed remediation as completed
          if (status === "Resolved") {
            if (a.status !== "Dismissed") {
              return { ...a, status: "Completed" as RemediationStatus };
            }
          }

          return a;
        }),
      );
    },
    [],
  );

  const assignFindingOwner = useCallback((id: string, owner: string) => {
    setFindings((prev) => prev.map((f) => (f.id === id ? { ...f, owner } : f)));
  }, []);

  const confirmFinding = useCallback(
    (id: string) => {
      updateFindingStatus(id, "Confirmed", "Auditor Confirmed");
    },
    [updateFindingStatus],
  );

  const deleteFinding = useCallback((id: string) => {
    setFindings((prev) => prev.filter((f) => f.id !== id));
  }, []);

  // Report actions
  const addReport = useCallback((report: BankReport | BankReport[]) => {
    setReports((prev) => (Array.isArray(report) ? [...report, ...prev] : [report, ...prev]));
  }, []);

  const updateReport = useCallback((id: string, patch: Partial<BankReport>) => {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const deleteReport = useCallback((id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const applyReportAnalysis = useCallback((reportId: string, result: ReportAnalysisResult) => {
    const { finding, evidenceRefs, document, remediation: rm, notification, auditLogs } = result;
    setFindings((prev) => [finding, ...prev]);
    setEvidence((prev) => [...evidenceRefs, ...prev]);
    setDocuments((prev) => [document, ...prev]);
    setRemediation((prev) => [rm, ...prev]);
    setNotifications((prev) => [notification, ...prev]);
    setLogs((prev) => [...auditLogs, ...prev]);
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              findingIds: [...r.findingIds, finding.id],
              aiSummary:
                "Transaction activity materially outpaced reported loan KPIs. A critical finding was generated pending auditor review.",
              aiConfidence: finding.confidence,
            }
          : r,
      ),
    );
  }, []);

  // Evidence actions
  const addEvidence = useCallback((item: EvidenceRef | EvidenceRef[]) => {
    setEvidence((prev) => (Array.isArray(item) ? [...item, ...prev] : [item, ...prev]));
  }, []);

  const updateEvidence = useCallback((id: string, patch: Partial<EvidenceRef>) => {
    setEvidence((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }, []);

  const deleteEvidence = useCallback((id: string) => {
    setEvidence((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // Evidence Document actions
  const addDocument = useCallback((doc: EvidenceDocument | EvidenceDocument[]) => {
    setDocuments((prev) => (Array.isArray(doc) ? [...doc, ...prev] : [doc, ...prev]));
  }, []);

  const updateDocument = useCallback((id: string, patch: Partial<EvidenceDocument>) => {
    setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }, []);

  const deleteDocument = useCallback((id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  // Remediation actions
  const addRemediation = useCallback((action: RemediationAction | RemediationAction[]) => {
    setRemediation((prev) => (Array.isArray(action) ? [...action, ...prev] : [action, ...prev]));
  }, []);

  const updateRemediation = useCallback((id: string, patch: Partial<RemediationAction>) => {
    setRemediation((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }, []);

  const updateRemediationStatus = useCallback((id: string, status: RemediationStatus) => {
    setRemediation((prev) => {
      const action = prev.find((a) => a.id === id);
      if (status === "Completed" && action) {
        setFindings((findings) =>
          findings.map((f) =>
            f.id === action.findingId && f.status === "Remediation Pending"
              ? { ...f, status: "Resolved" as FindingStatus }
              : f,
          ),
        );
      }
      return prev.map((a) => (a.id === id ? { ...a, status } : a));
    });
  }, []);

  const deleteRemediation = useCallback((id: string) => {
    setRemediation((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // Notification actions
  const addNotification = useCallback((notification: AppNotification | AppNotification[]) => {
    setNotifications((prev) =>
      Array.isArray(notification) ? [...notification, ...prev] : [notification, ...prev],
    );
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Audit Log actions
  const addAuditLog = useCallback((log: AuditLogEntry | AuditLogEntry[]) => {
    setLogs((prev) => (Array.isArray(log) ? [...log, ...prev] : [log, ...prev]));
  }, []);

  const clearAuditLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // Chat actions
  const appendChat = useCallback((message: ChatMessage) => {
    setChatState((prev) => [...prev, message]);
  }, []);

  const clearChat = useCallback(() => {
    setChatState([]);
  }, []);

  // Demo Reset
  const resetDemo = useCallback(() => {
    setFindings(structuredClone(seedFindings));
    setReports(structuredClone(seedReports));
    setRemediation(structuredClone(seedRemediation));
    setNotifications(structuredClone(seedNotifications));
    setLogs(structuredClone(seedLogs));
    setEvidence(structuredClone(seedEvidence));
    setDocuments(structuredClone(seedDocs));
    setChatState([]);
  }, []);

  const value = useMemo<AppState>(
    () => ({
      findings,
      reports,
      remediation,
      notifications,
      chat,
      logs,
      evidence,
      documents,
      addFinding,
      updateFinding,
      updateFindingStatus,
      assignFindingOwner,
      confirmFinding,
      deleteFinding,
      addReport,
      updateReport,
      deleteReport,
      applyReportAnalysis,
      addEvidence,
      updateEvidence,
      deleteEvidence,
      addDocument,
      updateDocument,
      deleteDocument,
      addRemediation,
      updateRemediation,
      updateRemediationStatus,
      deleteRemediation,
      addNotification,
      markNotificationRead,
      markNotificationsRead,
      deleteNotification,
      addAuditLog,
      clearAuditLogs,
      setChat: setChatState,
      appendChat,
      clearChat,
      resetDemo,
    }),
    [
      findings,
      reports,
      remediation,
      notifications,
      chat,
      logs,
      evidence,
      documents,
      addFinding,
      updateFinding,
      updateFindingStatus,
      assignFindingOwner,
      confirmFinding,
      deleteFinding,
      addReport,
      updateReport,
      deleteReport,
      applyReportAnalysis,
      addEvidence,
      updateEvidence,
      deleteEvidence,
      addDocument,
      updateDocument,
      deleteDocument,
      addRemediation,
      updateRemediation,
      updateRemediationStatus,
      deleteRemediation,
      addNotification,
      markNotificationRead,
      markNotificationsRead,
      deleteNotification,
      addAuditLog,
      clearAuditLogs,
      appendChat,
      clearChat,
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
