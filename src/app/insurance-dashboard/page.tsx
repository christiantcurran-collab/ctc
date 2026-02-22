"use client";

import { useState, useMemo, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ScatterChart, Scatter, Legend, ReferenceLine,
} from "recharts";
import {
  generateBonds, calculatePortfolioSummary, runMonteCarloSimulation,
  getDurationDistribution, getYieldCurveData, getPV01BySector,
  formatUSD, formatNumber,
  type Bond, type MonteCarloResult,
} from "@/lib/insurance-dashboard-data";
import "./insurance-dashboard.css";

// ============================================================
// Color palette
// ============================================================
const COLORS = {
  blue: "#58a6ff",
  green: "#3fb950",
  red: "#f85149",
  orange: "#f0883e",
  yellow: "#d29922",
  purple: "#bc8cff",
  teal: "#39d2c0",
  pink: "#f778ba",
  gray: "#8b949e",
};

const SECTOR_COLORS: Record<string, string> = {
  Government: COLORS.blue,
  Banking: COLORS.orange,
  Technology: COLORS.purple,
  Healthcare: COLORS.green,
  Energy: COLORS.yellow,
  Utilities: COLORS.teal,
  Telecom: COLORS.pink,
  Industrials: COLORS.gray,
  Consumer: "#da7756",
  "Financial Services": "#79c0ff",
};

function ratingClass(rating: string): string {
  if (rating.startsWith("AAA")) return "rating-aaa";
  if (rating.startsWith("AA")) return "rating-aa";
  if (rating.startsWith("A")) return "rating-a";
  if (rating.startsWith("BBB")) return "rating-bbb";
  return "rating-bb";
}

// ============================================================
// Main Page
// ============================================================
export default function InsuranceDashboardPage() {
  const [activeTab, setActiveTab] = useState<"holdings" | "analytics" | "montecarlo">("holdings");
  const [sortField, setSortField] = useState<keyof Bond>("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedBond, setSelectedBond] = useState<Bond | null>(null);
  const [mcResult, setMcResult] = useState<MonteCarloResult | null>(null);
  const [mcRunning, setMcRunning] = useState(false);

  const bonds = useMemo(() => generateBonds(42), []);
  const summary = useMemo(() => calculatePortfolioSummary(bonds), [bonds]);

  const sortedBonds = useMemo(() => {
    return [...bonds].sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      const as = String(av);
      const bs = String(bv);
      return sortDir === "asc" ? as.localeCompare(bs) : bs.localeCompare(as);
    });
  }, [bonds, sortField, sortDir]);

  const handleSort = useCallback((field: keyof Bond) => {
    if (field === sortField) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }, [sortField]);

  const handleRunMC = useCallback(() => {
    setMcRunning(true);
    setTimeout(() => {
      const result = runMonteCarloSimulation(bonds, 2000, 123);
      setMcResult(result);
      setMcRunning(false);
    }, 50);
  }, [bonds]);

  // Chart data
  const durationDist = useMemo(() => getDurationDistribution(bonds), [bonds]);
  const yieldData = useMemo(() => getYieldCurveData(bonds), [bonds]);
  const pv01BySector = useMemo(() => getPV01BySector(bonds), [bonds]);
  const yieldGovt = useMemo(() => yieldData.filter(d => d.type === "Government"), [yieldData]);
  const yieldCorp = useMemo(() => yieldData.filter(d => d.type === "Corporate"), [yieldData]);

  return (
    <div className="ins-page">
      {/* Metrics Bar */}
      <div className="ins-metrics">
        <div className="ins-metric-card">
          <span className="ins-metric-label">Market Value</span>
          <span className="ins-metric-value">{formatUSD(summary.totalMarketValue)}</span>
          <span className="ins-metric-sub">{summary.governmentCount + summary.corporateCount} bonds &middot; USD</span>
        </div>
        <div className="ins-metric-card">
          <span className="ins-metric-label">Mod. Duration</span>
          <span className="ins-metric-value accent">{formatNumber(summary.weightedDuration)}</span>
          <span className="ins-metric-sub">Portfolio weighted</span>
        </div>
        <div className="ins-metric-card">
          <span className="ins-metric-label">Total PV01</span>
          <span className="ins-metric-value">{formatUSD(summary.totalPV01)}</span>
          <span className="ins-metric-sub">Per 1bp shift</span>
        </div>
        <div className="ins-metric-card">
          <span className="ins-metric-label">Total DV01</span>
          <span className="ins-metric-value">{formatUSD(summary.totalDV01)}</span>
          <span className="ins-metric-sub">Dollar value 1bp</span>
        </div>
        <div className="ins-metric-card">
          <span className="ins-metric-label">Avg Yield</span>
          <span className="ins-metric-value positive">{formatNumber(summary.averageYield)}%</span>
          <span className="ins-metric-sub">Market-value weighted</span>
        </div>
        <div className="ins-metric-card">
          <span className="ins-metric-label">Expected Loss</span>
          <span className="ins-metric-value negative">{formatUSD(summary.totalExpectedLoss)}</span>
          <span className="ins-metric-sub">Annual &middot; PD &times; LGD</span>
        </div>
        <div className="ins-metric-card">
          <span className="ins-metric-label">Govt / Corp</span>
          <span className="ins-metric-value">{summary.governmentCount} / {summary.corporateCount}</span>
          <span className="ins-metric-sub">Bond count split</span>
        </div>
        <div className="ins-metric-card">
          <span className="ins-metric-label">Convexity</span>
          <span className="ins-metric-value">{formatNumber(summary.weightedConvexity)}</span>
          <span className="ins-metric-sub">Portfolio weighted</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="ins-tabs">
        <button className={`ins-tab ${activeTab === "holdings" ? "active" : ""}`}
          onClick={() => setActiveTab("holdings")}>Holdings</button>
        <button className={`ins-tab ${activeTab === "analytics" ? "active" : ""}`}
          onClick={() => setActiveTab("analytics")}>Risk Analytics</button>
        <button className={`ins-tab ${activeTab === "montecarlo" ? "active" : ""}`}
          onClick={() => setActiveTab("montecarlo")}>Monte Carlo</button>
      </div>

      {/* Content */}
      <div className="ins-content">
        {activeTab === "holdings" && (
          <HoldingsTable
            bonds={sortedBonds}
            sortField={sortField}
            sortDir={sortDir}
            onSort={handleSort}
            onSelectBond={setSelectedBond}
          />
        )}
        {activeTab === "analytics" && (
          <RiskAnalytics
            summary={summary}
            durationDist={durationDist}
            yieldGovt={yieldGovt}
            yieldCorp={yieldCorp}
            pv01BySector={pv01BySector}
          />
        )}
        {activeTab === "montecarlo" && (
          <MonteCarloPanel
            result={mcResult}
            running={mcRunning}
            onRun={handleRunMC}
            portfolioValue={summary.totalMarketValue}
          />
        )}
      </div>

      {/* Cashflow Modal */}
      {selectedBond && (
        <CashflowModal bond={selectedBond} onClose={() => setSelectedBond(null)} />
      )}
    </div>
  );
}

// ============================================================
// Holdings Table
// ============================================================
function HoldingsTable({ bonds, sortField, sortDir, onSort, onSelectBond }: {
  bonds: Bond[];
  sortField: keyof Bond;
  sortDir: "asc" | "desc";
  onSort: (field: keyof Bond) => void;
  onSelectBond: (bond: Bond) => void;
}) {
  const arrow = (field: keyof Bond) =>
    sortField === field ? (sortDir === "asc" ? " ▲" : " ▼") : "";

  return (
    <div className="ins-card">
      <div className="ins-card-header">
        <span className="ins-card-title">Portfolio Holdings — 100 USD Bonds</span>
      </div>
      <div className="ins-table-wrap">
        <table className="ins-table">
          <thead>
            <tr>
              <th onClick={() => onSort("id")}>#<span className="sort-arrow">{arrow("id")}</span></th>
              <th onClick={() => onSort("issuer")}>Issuer<span className="sort-arrow">{arrow("issuer")}</span></th>
              <th onClick={() => onSort("type")}>Type<span className="sort-arrow">{arrow("type")}</span></th>
              <th onClick={() => onSort("sector")}>Sector<span className="sort-arrow">{arrow("sector")}</span></th>
              <th onClick={() => onSort("rating")}>Rating<span className="sort-arrow">{arrow("rating")}</span></th>
              <th onClick={() => onSort("couponRate")} className="text-right">Coupon<span className="sort-arrow">{arrow("couponRate")}</span></th>
              <th onClick={() => onSort("maturityYears")} className="text-right">Mat (Y)<span className="sort-arrow">{arrow("maturityYears")}</span></th>
              <th onClick={() => onSort("yieldToMaturity")} className="text-right">YTM<span className="sort-arrow">{arrow("yieldToMaturity")}</span></th>
              <th onClick={() => onSort("marketPrice")} className="text-right">Mkt Value<span className="sort-arrow">{arrow("marketPrice")}</span></th>
              <th onClick={() => onSort("duration")} className="text-right">Dur<span className="sort-arrow">{arrow("duration")}</span></th>
              <th onClick={() => onSort("convexity")} className="text-right">Cvx<span className="sort-arrow">{arrow("convexity")}</span></th>
              <th onClick={() => onSort("pv01")} className="text-right">PV01<span className="sort-arrow">{arrow("pv01")}</span></th>
              <th onClick={() => onSort("pd")} className="text-right">PD<span className="sort-arrow">{arrow("pd")}</span></th>
              <th onClick={() => onSort("expectedLoss")} className="text-right">EL<span className="sort-arrow">{arrow("expectedLoss")}</span></th>
              <th>CF</th>
            </tr>
          </thead>
          <tbody>
            {bonds.map(b => (
              <tr key={b.id}>
                <td style={{ color: COLORS.gray }}>{b.id}</td>
                <td>{b.issuer}</td>
                <td><span className={b.type === "Government" ? "type-govt" : "type-corp"}>{b.type === "Government" ? "Govt" : "Corp"}</span></td>
                <td style={{ color: SECTOR_COLORS[b.sector] ?? COLORS.gray }}>{b.sector}</td>
                <td><span className={`rating-badge ${ratingClass(b.rating)}`}>{b.rating}</span></td>
                <td className="text-right">{b.couponRate.toFixed(3)}%</td>
                <td className="text-right">{b.maturityYears}Y</td>
                <td className="text-right" style={{ color: COLORS.green }}>{b.yieldToMaturity.toFixed(2)}%</td>
                <td className="text-right">{formatUSD(b.marketPrice)}</td>
                <td className="text-right" style={{ color: COLORS.orange }}>{b.duration.toFixed(2)}</td>
                <td className="text-right">{b.convexity.toFixed(1)}</td>
                <td className="text-right">{formatUSD(b.pv01)}</td>
                <td className="text-right">{b.pd.toFixed(3)}%</td>
                <td className="text-right" style={{ color: COLORS.red }}>{formatUSD(b.expectedLoss)}</td>
                <td>
                  <button className="view-btn" onClick={() => onSelectBond(b)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================
// Risk Analytics
// ============================================================
function RiskAnalytics({ summary, durationDist, yieldGovt, yieldCorp, pv01BySector }: {
  summary: ReturnType<typeof calculatePortfolioSummary>;
  durationDist: ReturnType<typeof getDurationDistribution>;
  yieldGovt: { maturity: number; yield: number }[];
  yieldCorp: { maturity: number; yield: number }[];
  pv01BySector: { sector: string; pv01: number }[];
}) {
  return (
    <div className="ins-charts-grid">
      {/* Duration Distribution */}
      <div className="ins-card">
        <div className="ins-card-header">
          <span className="ins-card-title">Duration Distribution</span>
        </div>
        <div className="ins-card-body">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={durationDist}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis dataKey="bucket" tick={{ fill: "#8b949e", fontSize: 10 }} />
              <YAxis tick={{ fill: "#8b949e", fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: "#1c2128", border: "1px solid #30363d", borderRadius: 4, fontSize: 11 }}
                labelStyle={{ color: "#8b949e" }}
              />
              <Bar dataKey="count" fill={COLORS.blue} radius={[3, 3, 0, 0]} name="# Bonds" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sector Allocation */}
      <div className="ins-card">
        <div className="ins-card-header">
          <span className="ins-card-title">Sector Allocation (Market Value)</span>
        </div>
        <div className="ins-card-body">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={summary.sectorBreakdown}
                cx="50%" cy="50%"
                innerRadius={55} outerRadius={95}
                dataKey="value" nameKey="name"
                paddingAngle={2}
                label={(props) => `${props.name ?? ""} ${((props.percent ?? 0) * 100).toFixed(0)}%`}
              >
                {summary.sectorBreakdown.map((entry) => (
                  <Cell key={entry.name} fill={SECTOR_COLORS[entry.name] ?? COLORS.gray} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#1c2128", border: "1px solid #30363d", borderRadius: 4, fontSize: 11 }}
                formatter={(value) => formatUSD(Number(value ?? 0))}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Yield Curve */}
      <div className="ins-card">
        <div className="ins-card-header">
          <span className="ins-card-title">Yield vs Maturity</span>
        </div>
        <div className="ins-card-body">
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis
                dataKey="maturity" name="Maturity"
                tick={{ fill: "#8b949e", fontSize: 10 }}
                label={{ value: "Years", position: "insideBottom", offset: -5, fill: "#8b949e", fontSize: 10 }}
              />
              <YAxis
                dataKey="yield" name="Yield"
                tick={{ fill: "#8b949e", fontSize: 10 }}
                label={{ value: "YTM %", angle: -90, position: "insideLeft", fill: "#8b949e", fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{ background: "#1c2128", border: "1px solid #30363d", borderRadius: 4, fontSize: 11 }}
                formatter={(value) => `${Number(value ?? 0).toFixed(2)}%`}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: "#8b949e" }} />
              <Scatter name="Government" data={yieldGovt} fill={COLORS.blue} />
              <Scatter name="Corporate" data={yieldCorp} fill={COLORS.orange} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PV01 by Sector */}
      <div className="ins-card">
        <div className="ins-card-header">
          <span className="ins-card-title">PV01 Contribution by Sector</span>
        </div>
        <div className="ins-card-body">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={pv01BySector} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis type="number" tick={{ fill: "#8b949e", fontSize: 10 }} tickFormatter={(v) => formatUSD(v)} />
              <YAxis dataKey="sector" type="category" tick={{ fill: "#8b949e", fontSize: 10 }} width={100} />
              <Tooltip
                contentStyle={{ background: "#1c2128", border: "1px solid #30363d", borderRadius: 4, fontSize: 11 }}
                formatter={(value) => formatUSD(Number(value ?? 0))}
              />
              <Bar dataKey="pv01" name="PV01" radius={[0, 3, 3, 0]}>
                {pv01BySector.map((entry) => (
                  <Cell key={entry.sector} fill={SECTOR_COLORS[entry.sector] ?? COLORS.gray} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="ins-card">
        <div className="ins-card-header">
          <span className="ins-card-title">Rating Distribution</span>
        </div>
        <div className="ins-card-body">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={summary.ratingBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis dataKey="name" tick={{ fill: "#8b949e", fontSize: 10 }} />
              <YAxis tick={{ fill: "#8b949e", fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: "#1c2128", border: "1px solid #30363d", borderRadius: 4, fontSize: 11 }}
              />
              <Bar dataKey="count" name="# Bonds" fill={COLORS.teal} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CR01 vs Duration Scatter */}
      <div className="ins-card">
        <div className="ins-card-header">
          <span className="ins-card-title">Expected Loss by Rating</span>
        </div>
        <div className="ins-card-body">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={summary.ratingBreakdown.map(r => {
              const ratingBonds = generateBonds(42).filter(b => b.rating === r.name);
              const totalEL = ratingBonds.reduce((s, b) => s + b.expectedLoss, 0);
              return { name: r.name, el: totalEL };
            })}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis dataKey="name" tick={{ fill: "#8b949e", fontSize: 10 }} />
              <YAxis tick={{ fill: "#8b949e", fontSize: 10 }} tickFormatter={(v) => formatUSD(v)} />
              <Tooltip
                contentStyle={{ background: "#1c2128", border: "1px solid #30363d", borderRadius: 4, fontSize: 11 }}
                formatter={(value) => formatUSD(Number(value ?? 0))}
              />
              <Bar dataKey="el" name="Expected Loss" fill={COLORS.red} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Monte Carlo Panel
// ============================================================
function MonteCarloPanel({ result, running, onRun, portfolioValue }: {
  result: MonteCarloResult | null;
  running: boolean;
  onRun: () => void;
  portfolioValue: number;
}) {
  return (
    <div className="ins-mc-grid">
      {/* Left: Controls & Metrics */}
      <div>
        <div className="ins-card" style={{ marginBottom: 16 }}>
          <div className="ins-card-header">
            <span className="ins-card-title">Simulation</span>
          </div>
          <div className="ins-card-body">
            <div className="ins-mc-params">
              <div>Scenarios: <span>2,000</span></div>
              <div>Horizon: <span>1 Year</span></div>
              <div>IR Model: <span>Vasicek</span></div>
              <div>Credit: <span>Gaussian Copula</span></div>
              <div>&kappa;: <span>0.50</span> &theta;: <span>3.0%</span> &sigma;: <span>1.0%</span></div>
              <div>Correlation &rho;: <span>0.30</span></div>
            </div>
            <button className="ins-mc-btn" onClick={onRun} disabled={running}>
              {running ? "Running..." : "Run Simulation"}
            </button>
          </div>
        </div>

        {result && (
          <div className="ins-mc-metrics">
            <div className="ins-mc-metric">
              <div className="ins-mc-metric-label">VaR 95%</div>
              <div className="ins-mc-metric-value loss">{formatUSD(result.var95)}</div>
            </div>
            <div className="ins-mc-metric">
              <div className="ins-mc-metric-label">VaR 99%</div>
              <div className="ins-mc-metric-value loss">{formatUSD(result.var99)}</div>
            </div>
            <div className="ins-mc-metric">
              <div className="ins-mc-metric-label">CVaR 95%</div>
              <div className="ins-mc-metric-value loss">{formatUSD(result.cvar95)}</div>
            </div>
            <div className="ins-mc-metric">
              <div className="ins-mc-metric-label">CVaR 99%</div>
              <div className="ins-mc-metric-value loss">{formatUSD(result.cvar99)}</div>
            </div>
            <div className="ins-mc-metric">
              <div className="ins-mc-metric-label">Mean P&L</div>
              <div className={`ins-mc-metric-value ${result.mean >= 0 ? "gain" : "loss"}`}>
                {result.mean >= 0 ? "+" : ""}{formatUSD(result.mean)}
              </div>
            </div>
            <div className="ins-mc-metric">
              <div className="ins-mc-metric-label">Std Dev</div>
              <div className="ins-mc-metric-value neutral">{formatUSD(result.stdDev)}</div>
            </div>
          </div>
        )}
      </div>

      {/* Right: Histogram */}
      <div className="ins-card">
        <div className="ins-card-header">
          <span className="ins-card-title">P&L Distribution — 1Y Horizon</span>
        </div>
        <div className="ins-card-body">
          {!result && !running && (
            <div className="ins-loading">
              <p style={{ color: "#8b949e" }}>Click &quot;Run Simulation&quot; to generate Monte Carlo scenarios</p>
            </div>
          )}
          {running && (
            <div className="ins-loading">
              <div className="ins-spinner" />
              <p>Running 2,000 scenarios...</p>
            </div>
          )}
          {result && (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={result.histogram}>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                <XAxis
                  dataKey="bucket"
                  tick={{ fill: "#8b949e", fontSize: 9 }}
                  interval={3}
                  label={{ value: "P&L ($)", position: "insideBottom", offset: -5, fill: "#8b949e", fontSize: 10 }}
                />
                <YAxis
                  tick={{ fill: "#8b949e", fontSize: 10 }}
                  label={{ value: "Frequency", angle: -90, position: "insideLeft", fill: "#8b949e", fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{ background: "#1c2128", border: "1px solid #30363d", borderRadius: 4, fontSize: 11 }}
                  labelFormatter={(label) => `P&L: ${label}`}
                />
                <ReferenceLine y={0} stroke="#30363d" />
                <Bar dataKey="count" name="Scenarios">
                  {result.histogram.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={entry.value < 0 ? "rgba(248, 81, 73, 0.7)" : "rgba(63, 185, 80, 0.7)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Cashflow Modal
// ============================================================
function CashflowModal({ bond, onClose }: { bond: Bond; onClose: () => void }) {
  const totalCoupon = bond.cashflows.reduce((s, cf) => s + cf.coupon, 0);
  const totalPrincipal = bond.cashflows.reduce((s, cf) => s + cf.principal, 0);
  const totalCash = bond.cashflows.reduce((s, cf) => s + cf.total, 0);
  const totalDiscounted = bond.cashflows.reduce((s, cf) => s + cf.discounted, 0);

  return (
    <div className="ins-modal-overlay" onClick={onClose}>
      <div className="ins-modal" onClick={e => e.stopPropagation()}>
        <div className="ins-modal-header">
          <span className="ins-modal-title">Cashflow Schedule — {bond.issuer}</span>
          <button className="ins-modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="ins-modal-body">
          <div className="ins-modal-meta">
            <div className="ins-modal-meta-item">
              <div className="ins-modal-meta-label">ISIN</div>
              <div className="ins-modal-meta-value">{bond.isin}</div>
            </div>
            <div className="ins-modal-meta-item">
              <div className="ins-modal-meta-label">Rating</div>
              <div className="ins-modal-meta-value">{bond.rating}</div>
            </div>
            <div className="ins-modal-meta-item">
              <div className="ins-modal-meta-label">Coupon</div>
              <div className="ins-modal-meta-value">{bond.couponRate.toFixed(3)}%</div>
            </div>
            <div className="ins-modal-meta-item">
              <div className="ins-modal-meta-label">YTM</div>
              <div className="ins-modal-meta-value">{bond.yieldToMaturity.toFixed(2)}%</div>
            </div>
            <div className="ins-modal-meta-item">
              <div className="ins-modal-meta-label">Face Value</div>
              <div className="ins-modal-meta-value">{formatUSD(bond.faceValue)}</div>
            </div>
            <div className="ins-modal-meta-item">
              <div className="ins-modal-meta-label">Market Price</div>
              <div className="ins-modal-meta-value">{formatUSD(bond.marketPrice)}</div>
            </div>
            <div className="ins-modal-meta-item">
              <div className="ins-modal-meta-label">Duration</div>
              <div className="ins-modal-meta-value">{bond.duration.toFixed(2)}</div>
            </div>
            <div className="ins-modal-meta-item">
              <div className="ins-modal-meta-label">PD</div>
              <div className="ins-modal-meta-value">{bond.pd.toFixed(3)}%</div>
            </div>
          </div>

          <table className="ins-cf-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Coupon ($)</th>
                <th>Principal ($)</th>
                <th>Total ($)</th>
                <th>PV ($)</th>
              </tr>
            </thead>
            <tbody>
              {bond.cashflows.map(cf => (
                <tr key={cf.year}>
                  <td>{cf.year}</td>
                  <td>{formatUSD(cf.coupon)}</td>
                  <td>{cf.principal > 0 ? formatUSD(cf.principal) : "—"}</td>
                  <td>{formatUSD(cf.total)}</td>
                  <td>{formatUSD(cf.discounted)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>Total</td>
                <td>{formatUSD(totalCoupon)}</td>
                <td>{formatUSD(totalPrincipal)}</td>
                <td>{formatUSD(totalCash)}</td>
                <td>{formatUSD(totalDiscounted)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
