import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { branchRisk, riskDistribution, riskTrend } from "@/data/mockData";

const axis = { stroke: "var(--color-muted-foreground)", fontSize: 11 };
const tooltipStyle = {
  contentStyle: {
    borderRadius: 8,
    border: "1px solid var(--color-border)",
    fontSize: 12,
    boxShadow: "var(--shadow-raised)",
  },
};

export type RiskMetric = "count" | "score" | "branches";

export function RiskTrendChart({ metric }: { metric: RiskMetric }) {
  if (metric === "count") {
    return (
      <ResponsiveContainer width="100%" height={264}>
        <AreaChart data={riskTrend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis dataKey="week" tickLine={false} axisLine={false} {...axis} />
          <YAxis tickLine={false} axisLine={false} {...axis} />
          <Tooltip {...tooltipStyle} />
          <Legend iconType="square" wrapperStyle={{ fontSize: 11 }} />
          <Area type="monotone" dataKey="low" stackId="1" name="Low" stroke="var(--color-low)" fill="var(--color-low)" fillOpacity={0.18} />
          <Area type="monotone" dataKey="medium" stackId="1" name="Medium" stroke="var(--color-medium)" fill="var(--color-medium)" fillOpacity={0.2} />
          <Area type="monotone" dataKey="high" stackId="1" name="High" stroke="var(--color-high)" fill="var(--color-high)" fillOpacity={0.22} />
          <Area type="monotone" dataKey="critical" stackId="1" name="Critical" stroke="var(--color-critical)" fill="var(--color-critical)" fillOpacity={0.24} />
        </AreaChart>
      </ResponsiveContainer>
    );
  }
  const key = metric === "score" ? "score" : "branches";
  const label = metric === "score" ? "Aggregate risk score" : "Branches affected";
  return (
    <ResponsiveContainer width="100%" height={264}>
      <LineChart data={riskTrend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="week" tickLine={false} axisLine={false} {...axis} />
        <YAxis tickLine={false} axisLine={false} {...axis} />
        <Tooltip {...tooltipStyle} />
        <Legend iconType="square" wrapperStyle={{ fontSize: 11 }} />
        <Line type="monotone" dataKey={key} name={label} stroke="var(--color-primary)" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

const distColors = ["var(--color-critical)", "var(--color-high)", "var(--color-medium)", "var(--color-low)"];

export function RiskDistributionChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={riskDistribution} dataKey="value" nameKey="name" innerRadius={52} outerRadius={80} paddingAngle={2}>
          {riskDistribution.map((entry, i) => (
            <Cell key={entry.name} fill={distColors[i]} />
          ))}
        </Pie>
        <Tooltip {...tooltipStyle} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function BranchRiskChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={branchRisk} layout="vertical" margin={{ top: 4, right: 16, left: 24, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
        <XAxis type="number" domain={[0, 100]} tickLine={false} axisLine={false} {...axis} />
        <YAxis type="category" dataKey="branch" width={120} tickLine={false} axisLine={false} {...axis} />
        <Tooltip {...tooltipStyle} />
        <Bar dataKey="score" name="Risk score" radius={[0, 4, 4, 0]} barSize={16}>
          {branchRisk.map((b) => (
            <Cell
              key={b.branch}
              fill={
                b.score >= 85
                  ? "var(--color-critical)"
                  : b.score >= 70
                    ? "var(--color-high)"
                    : b.score >= 50
                      ? "var(--color-medium)"
                      : "var(--color-low)"
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function FindingTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={riskTrend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="week" tickLine={false} axisLine={false} {...axis} />
        <YAxis tickLine={false} axisLine={false} {...axis} />
        <Tooltip {...tooltipStyle} />
        <Bar dataKey="critical" name="Critical" stackId="a" fill="var(--color-critical)" />
        <Bar dataKey="high" name="High" stackId="a" fill="var(--color-high)" />
        <Bar dataKey="medium" name="Medium" stackId="a" fill="var(--color-medium)" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
