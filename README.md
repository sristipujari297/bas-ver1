# Remix of Audit Navigator

Build a Professional AI-Powered Internal Bank Audit Platform

Build a polished, production-quality frontend web application for an enterprise banking internal-audit platform.

The product is called AuditAI and is designed to help bank auditors and management analyze fragmented weekly bank reports, detect anomalies and compliance risks, identify root causes, retrieve supporting evidence, and generate actionable remediation recommendations.

This is a hackathon frontend prototype, so do NOT build a real backend, database, authentication system, or real AI model yet. Instead, create a highly realistic frontend with well-structured mock data and a clean service/API abstraction so a real FastAPI/n8n/local-AI backend can be connected later without redesigning the UI.

The application should look like a serious enterprise banking product—not a generic AI chatbot or a flashy AI landing page.

1. PRODUCT CONTEXT

Banks currently depend on fragmented reports, manual audits, and disconnected systems. This makes it difficult to detect fraud, control failures, operational bottlenecks, and compliance risks early.

The proposed system transforms raw weekly bank reports into continuous audit intelligence through:

Report ingestion

Financial document/table parsing

Evidence retrieval using RAG

Specialized AI audit analysis

Anomaly detection

Root-cause analysis

Evidence-linked findings

Remediation recommendations

Human auditor review

The core conceptual workflow is:

Report Ingestion → Evidence Retrieval → Audit & Anomaly Analysis → Root-Cause Analysis → Evidence-Linked Remediation

The product should make this workflow extremely easy to understand visually.

2. MOST IMPORTANT PRODUCT PRINCIPLE

This must NOT feel like "ChatGPT for banks."

The core product is an AI audit intelligence system.

Every AI-generated finding should feel:

Evidence-backed → Explainable → Traceable → Actionable

When the AI produces an answer or finding, the interface should be able to show:

Finding

Risk level

Confidence

Reason for detection

Root cause

Supporting document

Page/section/table reference

Recommended action

Review status

The AI assistant should therefore have an Evidence panel beside the conversation.

3. TECHNOLOGY / FRONTEND

Use:

React

TypeScript

Tailwind CSS

Modern component architecture

Lucide icons or another professional icon library

Recharts or equivalent for charts

Responsive layout

Component-based reusable UI

Clean state management

Use mock data throughout the prototype.

Create a clean service/API layer such as:

/services/auditService.ts
/services/reportService.ts
/services/aiService.ts

The frontend should be structured so mock functions can later be replaced by:

Frontend
↓
FastAPI / API layer
↓
n8n orchestration
↓
RAG + PostgreSQL/pgvector
↓
Local LLM / Ollama

Do not hard-code AI responses directly inside individual UI components.

4. VISUAL DESIGN DIRECTION

The visual language should communicate:

Enterprise Banking + Security + AI + Trust

Avoid the typical generic AI aesthetic.

DO NOT use:

Purple AI gradients

Neon colours

Excessive glassmorphism

Giant glowing AI graphics

Excessive rounded cards

Cartoon illustrations

Overly playful animations

Excessive gradients

Huge empty spaces

Instead use:

Deep navy

White

Slate

Professional teal

Restrained red/amber/green risk indicators

Thin borders

Subtle shadows

Dense but readable information

Professional typography

Clean charts

Enterprise dashboard patterns

5. COLOUR SYSTEM

Use this exact visual palette:

Primary

Deep Navy:

#0B1F33

Secondary Navy:

#12304A

Accent

Professional Teal:

#0F766E

Light Teal:

#CCFBF1

Background

Main background:

#F7F9FC

Cards:

#FFFFFF

Text

Primary text:

#17202A

Secondary text:

#64748B

Borders:

#E2E8F0

Risk colours

Critical:

#DC2626

High / Warning:

#D97706

Medium:

#EAB308

Low / Healthy:

#15803D

Do not use these risk colours as decorative colours. They should have semantic meaning.

6. GLOBAL APPLICATION STRUCTURE

Create a persistent enterprise dashboard layout.

Desktop:

┌─────────────────────────────────────────────────────────────┐
│ Top Header │
├───────────────┬─────────────────────────────────────────────┤
│ │ │
│ Sidebar │ Main Content │
│ │ │
│ │ │
└───────────────┴─────────────────────────────────────────────┘

Sidebar

Use deep navy #0B1F33.

Top:

AUDITAI

Subtitle:

Internal Audit Intelligence

Navigation:

Overview

Reports

Audit Intelligence

Findings

Evidence

Remediation

AI Assistant

Divider

Audit Logs

Settings

Bottom:

System Status

User profile

The active navigation item should have a subtle teal background/highlight.

Sidebar should collapse responsively on smaller screens.

7. TOP HEADER

Create a clean top navigation bar.

Left:

Dynamic page title and optional breadcrumb.

Right:

Search icon/button

Notifications

"AI System Online" status indicator

User avatar

"Audit Analyst"

Dropdown

Show a small green status indicator:

AI System Online

This reinforces that the platform is connected to the audit intelligence engine.

8. PAGE 1 — EXECUTIVE OVERVIEW DASHBOARD

This is the main landing page after entering the system.

Header:

Good morning, Audit Team

Subtitle:

Weekly audit intelligence and risk overview

Add date range selector:

This Week

Last Week

Last 30 Days

Custom Range

Add branch/sector filters.

KPI CARDS

Create four primary cards:

Total Reports

128

Subtitle:

+12% from last week

Icon: FileText

Active Findings

12

Subtitle:

4 require immediate attention

Icon: AlertTriangle

Critical Risks

4

Subtitle:

2 newly detected

Use restrained red accent.

Audit Coverage

86%

Subtitle:

Across 24 branches

Use teal accent.

Cards should be visually clean and clickable.

9. RISK OVERVIEW

Create a large chart section titled:

Risk Overview

Use a professional line/bar/area chart showing:

Critical

High

Medium

Low

over the last 7 weeks.

Allow toggling:

Risk count

Risk score

Branches affected

Add small insight beside the chart:

AI Insight

"Overall risk increased 14% this week, primarily driven by transaction anomalies in Corporate Lending and two branch-level reporting mismatches."

This is mock AI data.

10. CRITICAL ALERTS PANEL

Right side of dashboard:

Critical Alerts

Display 3–4 realistic findings.

Example:

Unusual Loan Disbursement Pattern

Branch 042 · Corporate Lending

Risk:

Critical

Score:

92/100

Detected:

21 Aug 2026

Another:

Repeated Transaction Mismatch

Branch 017 · Retail Banking

Risk:

High

Score:

81/100

Each alert should be clickable and open the Finding Detail page.

11. AUDIT PIPELINE

Create a visual workflow component:

Current Audit Pipeline

✓ Report Ingestion
↓
✓ Evidence Retrieval
↓
✓ Audit Analysis
↓
⚠ Root Cause Identified
↓
● Remediation Pending

Use subtle animated progress/status indicators.

Each stage should be clickable and show a small popover/detail panel.

This should visually communicate the multi-agent workflow.

12. RECENT AI FINDINGS

Create a professional table:

Columns:

Finding

Branch

Sector

Risk

Score

Detected

Status

Action

Rows should include realistic banking audit findings.

Statuses:

New

Under Review

Confirmed

Remediation Pending

Resolved

Dismissed

Risk should use semantic colours.

Allow:

Search

Filter

Sort

Click row

13. PAGE 2 — REPORTS

Create a report management page.

Header:

Bank Reports

Subtitle:

Upload, monitor and analyze incoming audit reports.

Top-right:

- Upload Report

Create drag-and-drop upload area.

Supported mock file types:

PDF

XLSX

CSV

DOCX

Show:

Drag & drop reports here

and:

or Browse Files

Do not actually upload to a backend. Simulate upload progress.

14. REPORT TABLE

Columns:

Report Name

Branch

Sector

Report Type

Reporting Period

Uploaded

Processing Status

Findings

Actions

Example reports:

Branch_042_Weekly_Audit_Report.pdf

Corporate_Lending_Aug_Week_3.xlsx

Retail_Transactions_Weekly.pdf

Processing states:

Uploaded

Parsing

Processing

Indexed

Analysis Complete

Failed

Use animated progress indicators for processing.

15. REPORT DETAIL PAGE

When a report is clicked, show:

Report Information

File name

Branch

Sector

Reporting period

Uploaded by

Upload date

Processing status

Number of pages

Number of extracted records

Then show tabs:

Overview | Extracted Data | Findings | Evidence | AI Analysis

16. DOCUMENT VIEWER

Create a realistic document viewer mockup.

Left:

Document preview.

Right:

Extracted Information

Display:

KPIs

Tables

Important values

Detected anomalies

Allow highlighted evidence references.

Example:

Transaction volume increased 184% compared with the previous reporting period.

Beside it:

Source: Page 7

Clicking the source should highlight the relevant section in the mock document viewer.

This is important because the project's differentiation is evidence traceability.

17. PAGE 3 — AUDIT INTELLIGENCE

Create a dedicated audit-analysis page.

Header:

Audit Intelligence

Subtitle:

AI-generated analysis across branches, sectors and reporting periods.

Top filters:

Date

Branch

Sector

Risk Level

Finding Type

Create analysis cards:

Operational Risk

Score: 78

Trend: ↑ 12%

Compliance Risk

Score: 64

Trend: ↑ 4%

Fraud Risk

Score: 71

Trend: ↓ 3%

Reporting Risk

Score: 52

Trend: ↓ 8%

18. ROOT-CAUSE ANALYSIS SECTION

Create a visual root-cause analysis component.

Example:

Why did Branch 042's risk score increase?

Show:

Risk Score Increase
↓
Transaction volume anomaly
↓
High-value transfers increased
↓
Mismatch with reported loan activity
↓
Possible reporting/control failure

Use connected cards/nodes rather than a complicated graph.

Add:

AI Assessment

"Primary suspected cause: discrepancy between transaction activity and reported loan-disbursement KPIs."

Then:

Confidence: 91%

19. PAGE 4 — FINDINGS

Create a dedicated findings management page.

Header:

Audit Findings

Subtitle:

Review, prioritize and track AI-detected risks.

Filters:

All

Critical

High

Medium

Low

Under Review

Resolved

Create a table or card/table hybrid.

Columns:

Finding

Risk

Branch

Sector

AI Confidence

Evidence

Status

Owner

Date

20. FINDING DETAIL PAGE

This is one of the most important screens.

When a finding is opened, show:

CRITICAL FINDING #004

Unusual Loan Disbursement Pattern

Metadata:

Branch: Andheri East

Sector: Corporate Lending

Detected: 21 Aug 2026

Finding Type: Transaction Anomaly

Large risk indicator:

92 / 100

CRITICAL

WHY THIS WAS FLAGGED

Example:

"Transaction volume increased 184% while reported loan activity increased only 31%, creating a significant mismatch between observed activity and reported KPIs."

AI ROOT-CAUSE ANALYSIS

Show a structured explanation.

Sections:

Observed Pattern

Potential Cause

Affected Controls

Risk Implication

Confidence

Do NOT create fake chain-of-thought reasoning.

Only show concise, auditable explanations and evidence-supported conclusions.

21. EVIDENCE SECTION

Show:

Supporting Evidence

Document cards:

Branch_042_Weekly_Report.pdf

Loan_Disbursement_Aug.xlsx

Each card contains:

File type

Page/sheet

Relevant section

Evidence snippet

"View Source"

Clicking "View Source" opens the document viewer at the appropriate mock page/section.

22. REMEDIATION RECOMMENDATION

Show:

Recommended Actions

Example:

Review high-value transactions from the reporting period.

Verify supporting documentation for flagged loan disbursements.

Reconcile reported KPIs with transaction-level records.

Escalate unresolved discrepancies to compliance.

Add buttons:

Approve Remediation

Request Human Review

Dismiss Finding

When clicked, update the status in the frontend.

23. PAGE 5 — EVIDENCE

Create an evidence repository.

Header:

Evidence Repository

Subtitle:

Trace every AI finding back to its source.

Search:

Search documents, branches, findings...

Filters:

Date

Branch

Sector

Document Type

Finding

Create document cards/table.

Each document should show:

Name

Branch

Sector

Date

Pages

Findings linked

Indexed status

24. EVIDENCE GRAPH / LINKING

Add a visual section:

Evidence Relationships

Example:

Finding #004
│
├── Branch_042_Report.pdf
│ └── Page 7
│
├── Loan_Disbursement.xlsx
│ └── Rows 182–196
│
└── Transaction_Report.pdf
└── Page 12

This visually demonstrates the evidence-traceability concept.

25. PAGE 6 — REMEDIATION

Create a remediation management page.

Header:

Remediation Center

Subtitle:

Turn audit findings into accountable actions.

Create summary cards:

Open Actions

Overdue

In Progress

Completed

Create table:

Columns:

Action

Related Finding

Risk

Owner

Due Date

Status

Priority

Statuses:

Not Started

In Progress

Pending Verification

Completed

Overdue

Allow changing status from the UI.

26. PAGE 7 — AI ASSISTANT

This is one of the most important pages and a core requirement.

Do NOT make it look like a generic ChatGPT clone.

Title:

Audit Intelligence Assistant

Subtitle:

Ask questions across your bank's audit data and get evidence-backed answers.

Layout:

┌───────────────────────────────┬───────────────────────────┐
│ │ │
│ Conversation │ Evidence │
│ │ │
│ │ │
│ │ │
│ │ │
│ │ │
│ │ │
│ [Ask about audit data...] │ │
└───────────────────────────────┴───────────────────────────┘

27. CHAT INTERFACE

User can type questions such as:

"Why did Branch 042's risk score increase?"

"Show me all critical findings from this week."

"Which branches have unusual transaction activity?"

"What are the main compliance risks this month?"

"Compare Branch 042 and Branch 017."

"What evidence supports Finding #004?"

"Which findings require immediate remediation?"

Create realistic mock AI responses.

When the user sends a message:

Show user message.

Show a subtle "Analyzing audit evidence..." state.

Then show AI response.

Display citations/evidence cards.

Update the Evidence panel.

28. AI RESPONSE FORMAT

AI answers should NOT be giant walls of text.

Use structured responses:

Summary

Short answer.

Key Findings

Finding 1

Finding 2

Finding 3

Risk

High · 84/100

Evidence

Branch_042_Report.pdf · Page 7

Recommended Action

Short actionable recommendation.

This makes the AI feel like an enterprise audit assistant.

29. EVIDENCE PANEL IN AI ASSISTANT

The right-side Evidence panel is critical.

When an AI response references evidence, show:

Evidence

Branch_042_Weekly_Report.pdf

Page 7

"Loan disbursement volume increased..."

Button:

View Source

Then:

Loan_Disbursement_Aug.xlsx

Sheet:

Disbursement_Data

Rows:

182–196

Button:

Open Evidence

Use mock interactions.

30. AI CHAT MOCK SERVICE

Create an AI service abstraction.

For example:

interface AIResponse {
answer: string;
riskScore?: number;
confidence?: number;
findings?: Finding[];
evidence?: Evidence[];
recommendations?: string[];
}

Create a mock AI implementation.

The UI must be designed so that later this mock service can be replaced by the real team's API.

DO NOT expose API keys.

DO NOT connect to an external AI provider for this prototype.

31. PAGE 8 — AUDIT LOGS

Create a transparent system execution log.

Header:

Audit Logs

Subtitle:

Track how reports and AI agents were processed.

Table:

Timestamp

Workflow

Agent

Action

Status

Duration

Report

Details

Example:

08:42:12

Report Ingestion

Ingestion Agent

Parsed Branch_042_Report.pdf

Success

4.2s

Another:

08:43:07

Evidence Retrieval

RAG Agent

Retrieved 6 evidence chunks

Success

Another:

08:44:01

Audit Analysis

Audit Agent

Detected 3 anomalies

Success

Use this to communicate the n8n/multi-agent workflow without actually implementing n8n.

32. PAGE 9 — SETTINGS

Create a minimal enterprise settings page.

Sections:

Organization

Bank Name

Audit Department

Reporting Frequency

AI Configuration

Show read-only mock values:

Model: DeepSeek

Runtime: Ollama

Processing: On-Premise

Vector Store: PostgreSQL + pgvector

Orchestration: n8n

Security

Show:

Local Processing Enabled

External Data Sharing Disabled

Evidence Traceability Enabled

Notification Preferences

Allow toggling:

Critical Risk Alerts

New Findings

Remediation Deadlines

Processing Errors

33. ROLE / USER EXPERIENCE

For the prototype, use a single mock role:

Audit Analyst

But structure the frontend so future roles can be added:

Auditor

Audit Manager

Compliance Officer

Bank Executive

Do not create complicated authentication.

Provide a profile dropdown but keep it frontend-only.

34. SEARCH

Add a global search interface.

Search across:

Reports

Findings

Evidence

Branches

Sectors

Show categorized search results.

Example:

Search results for "Branch 042"

REPORTS
Branch_042_Weekly_Report.pdf

FINDINGS
#004 Unusual Loan Disbursement Pattern

EVIDENCE
Loan_Disbursement_Aug.xlsx

35. NOTIFICATIONS

Create a notification dropdown.

Example:

Critical finding detected

Branch 042 · 4 minutes ago

New report processed

Corporate Lending · 18 minutes ago

Remediation overdue

Finding #002 · 1 hour ago

Clicking notifications should navigate to the relevant page.

36. MOCK DATA

Use realistic banking audit data.

Create at least:

Branches

Andheri East

Bandra

Powai

Thane

Navi Mumbai

Fort

Borivali

Lower Parel

Sectors

Retail Banking

Corporate Lending

SME Banking

Treasury

Wealth Management

Digital Banking

Finding types

Transaction Anomaly

Reporting Mismatch

Compliance Risk

Access Control Failure

Loan Disbursement Anomaly

Unusual Account Activity

KPI Deviation

Use realistic numbers but clearly treat them as demo/mock data.

37. DEMO SCENARIO

Optimize the application around one compelling end-to-end demo scenario.

Use:

Branch 042 — Corporate Lending

The scenario:

A weekly report is uploaded.

System processes the report.

AI detects an unusual transaction pattern.

Risk score increases.

Finding is generated.

AI explains the likely root cause.

Evidence is displayed.

Auditor asks the AI assistant why the risk increased.

AI answers using the same evidence.

Auditor opens the finding.

Auditor reviews recommended remediation.

Auditor approves/request human review.

Remediation status changes.

Make this flow extremely polished.

This should be the primary hackathon demonstration path.

38. MICRO-INTERACTIONS

Use subtle professional animations:

Page transitions

Chart loading

Skeleton loaders

Upload progress

AI "Analyzing evidence..." state

Status changes

Notification appearance

Finding expansion

Evidence highlighting

Do NOT over-animate the interface.

Animations should communicate system activity rather than decoration.

39. RESPONSIVENESS

Desktop is the primary target because this is an enterprise banking dashboard.

Still ensure good tablet and mobile behavior.

On mobile:

Collapse sidebar

Stack dashboard cards

Stack charts

Turn tables into scrollable containers

Stack AI assistant and evidence panel vertically

40. ACCESSIBILITY

Implement:

Good colour contrast

Keyboard navigation

Clear focus states

Accessible buttons

Semantic HTML

Tooltips for unfamiliar icons

Do not rely solely on colour for risk states

41. EMPTY / LOADING / ERROR STATES

Every major section should have realistic states.

Examples:

Empty

"No findings match your filters."

Loading

"Analyzing audit evidence..."

Processing

"Parsing financial tables..."

Error

"Unable to process this report. Please retry."

No evidence

"No supporting evidence was found for this finding."

These states should look intentional and polished.

42. DATA VISUALIZATION

Use professional charts only where useful.

Recommended:

Risk trend line chart

Risk distribution donut

Branch comparison bar chart

Sector risk heatmap

Finding trend chart

Remediation status chart

Do not overload the dashboard with charts.

Every chart should communicate a clear audit insight.

43. SECTOR / BRANCH ANALYSIS

On the Audit Intelligence page, include:

Branch Risk Comparison

Horizontal bar chart.

Example:

Branch 042 ██████████████████ 92
Branch 017 ███████████████ 81
Branch 008 ███████████ 67
Branch 031 ███████ 48

Also include:

Sector Risk Heatmap

Rows:

Branches

Columns:

Fraud

Compliance

Operations

Reporting

Use restrained semantic colours.

44. AI CONFIDENCE

Every AI-generated insight should have a confidence indicator.

Examples:

Confidence 94%

Confidence 81%

Confidence 67%

Use a progress bar or badge.

Add a small tooltip explaining:

"Confidence indicates how strongly the available evidence supports this finding."

Do NOT represent confidence as mathematical certainty.

45. HUMAN-IN-THE-LOOP

Make it visually clear that AI does NOT independently make final audit decisions.

For important findings show:

AI Detection → Auditor Review → Decision → Remediation

This addresses the project's stated mitigation for LLM limitations through human review.

Include labels such as:

AI Suggested

Pending Auditor Review

Auditor Confirmed

Remediation Approved

46. PRIVACY / SECURITY UI

Because the project emphasizes local/on-premise AI and avoiding external data leakage, incorporate a subtle security indicator.

For example in the sidebar/footer:

● On-Premise AI

or:

🔒 Data Processing: Local

Clicking it opens a small information panel:

Local AI processing

No external document sharing

Evidence traceability

Controlled access

Do not make unsupported claims about actual security implementation since this is a frontend prototype.

Label this clearly as:

Prototype Configuration

47. IMPORTANT: DO NOT OVERBUILD

This is a hackathon prototype.

Do NOT implement:

Real banking integrations

Real financial transactions

Real authentication

Real payment functionality

Real cloud AI APIs

Real sensitive bank data

Complicated permission systems

Complex backend infrastructure

Everything should be represented through realistic mock data and frontend interactions.

The goal is to make the product feel real and demonstrate the workflow, while keeping the implementation maintainable.

48. COMPONENT ARCHITECTURE

Create reusable components for:

Sidebar

Header

KPI cards

Risk badge

Finding card

Finding table

Evidence card

Document viewer

AI chat message

Evidence citation

Risk score

Confidence indicator

Status badge

Audit pipeline

Chart containers

Filter controls

Data tables

Modal/dialog

Notification panel

Empty state

Loading state

Avoid duplicating UI code.

49. ROUTING

Create routes/pages for:

/
/reports
/reports/:id
/audit-intelligence
/findings
/findings/:id
/evidence
/remediation
/assistant
/logs
/settings

The Overview page should be /.

Clicking cards, findings, reports, evidence and notifications should navigate to appropriate pages.

50. UI DETAILS

Typography:

Use a professional modern sans-serif such as:

Inter

Geist

IBM Plex Sans

Use strong typography hierarchy.

Cards:

Moderate border radius

Thin borders

Very subtle shadows

White background

Buttons:

Primary:

Deep Navy / Teal

Secondary:

White with border

Danger:

Red only when destructive/critical

Do not make every component rounded like a consumer SaaS app.

51. LANDING / LOGIN SCREEN

Create a minimal professional login screen even though authentication is mock.

Left side:

AuditAI branding.

Headline:

AI-Powered Internal Audit Intelligence

Subtitle:

Turn fragmented bank reports into evidence-backed risk intelligence.

Right side:

Login card.

Fields:

Work Email

Password

Button:

Sign In

Below:

Demo Mode

Clicking Demo Mode should immediately enter the dashboard with the mock Audit Analyst account.

This is useful during the hackathon presentation.

52. DEMO MODE

Add a subtle:

Demo Mode

indicator somewhere in the UI.

Provide a small "Reset Demo" option under Settings or profile menu.

Resetting should restore:

Findings

Reports

Remediation

Chat history

Notifications

to their original mock state.

53. FINAL PRODUCT FEEL

The final application should feel similar to software used by:

Internal audit teams

Risk departments

Compliance teams

Bank management

It should feel:

Trustworthy
Professional
Secure
Analytical
Evidence-driven
Modern
AI-assisted

It should NOT feel:

Playful
Consumer-oriented
Like a generic chatbot
Like a student CRUD project

54. MOST IMPORTANT SCREEN PRIORITY

If implementation time is limited, prioritize in this order:

Priority 1

Executive Dashboard

Priority 2

AI Assistant + Evidence Panel

Priority 3

Finding Detail

Priority 4

Report Ingestion

Priority 5

Audit Intelligence / Root Cause

Priority 6

Evidence Repository

Priority 7

Remediation

Priority 8

Logs / Settings

The first five screens must be extremely polished.

55. FINAL REQUIREMENT

Before considering the frontend complete, verify this exact user journey:

Login → Dashboard → Critical Finding → Finding Detail → Evidence → AI Assistant → Ask Question → AI Response → Evidence Citation → Root Cause → Recommended Remediation → Approve / Review

Every step must work using mock data.

There should be no dead buttons for the main demo flow.

Make the entire experience feel cohesive, as if it is one real enterprise product rather than separate generated pages.

The application should be polished enough to demonstrate to hackathon judges as a working prototype of an AI System for Internal Bank Audits.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5b607787-84c3-4914-beb5-1e550c6d5899).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
