"use client";

import { useState, useRef, useEffect } from "react";
import { sections } from "@/lib/se-trainer/sections";
import { mcqQuestions } from "@/lib/se-trainer/mcq-questions";
import { practiceQuestions } from "@/lib/se-trainer/practice-questions";
import type { FeedbackResponse } from "@/lib/se-trainer/types";

// Alias for backward compatibility within this file
const questions = mcqQuestions;

// === Styles ===
const colors = {
  bg: "#0D0F14",
  surface: "#151820",
  surfaceHover: "#1C2030",
  card: "#181C28",
  border: "#252A3A",
  borderHover: "#3A4060",
  accent: "#6C63FF",
  accentGlow: "rgba(108,99,255,0.15)",
  accentDim: "#4A44B0",
  green: "#2ECB71",
  greenGlow: "rgba(46,203,113,0.15)",
  red: "#E74C5A",
  redGlow: "rgba(231,76,90,0.15)",
  orange: "#F2994A",
  orangeGlow: "rgba(242,153,74,0.12)",
  text: "#E8E6F0",
  textDim: "#8A8AA0",
  textMuted: "#5A5A72",
};

// === Components ===
const Badge = ({ children, color = colors.accent, bg = colors.accentGlow }: { children: React.ReactNode; color?: string; bg?: string }) => (
  <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, color, background: bg, letterSpacing: 0.5 }}>{children}</span>
);

const ProgressRing = ({ progress, size = 48, stroke = 4 }: { progress: number; size?: number; stroke?: number }) => {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (progress / 100) * circ;
  const col = progress >= 80 ? colors.green : progress >= 50 ? colors.orange : colors.red;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={colors.border} strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={col} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central" fill={col}
        fontSize={12} fontWeight={700} style={{ transform: "rotate(90deg)", transformOrigin: "center" }}>
        {Math.round(progress)}%
      </text>
    </svg>
  );
};

const categoryLabels: Record<string, string> = {
  "discovery": "Discovery",
  "objection-handling": "Objection Handling",
  "technical-depth": "Technical Depth",
  "demo-design": "Demo Design",
  "customer-success": "Customer Success",
};

// === Main Page ===
export default function SETrainerPage() {
  const [tab, setTab] = useState("docs");
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [quizState, setQuizState] = useState("menu");
  const [quizSection, setQuizSection] = useState<number | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [communityQs, setCommunityQs] = useState<Array<{ id: string; text: string; author: string; ai_answer: string | null; created_at: string }>>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [expandingId, setExpandingId] = useState<string | null>(null);
  // Practice tab state
  const [practiceFilter, setPracticeFilter] = useState<string>("all");
  const [activePracticeQ, setActivePracticeQ] = useState<number | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<Record<number, FeedbackResponse>>({});
  const [loadingFeedback, setLoadingFeedback] = useState<number | null>(null);
  const [showModelAnswer, setShowModelAnswer] = useState<Record<number, boolean>>({});
  const quizRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/community")
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setCommunityQs(data); })
      .catch(() => {});
  }, []);

  const filteredQuestions = quizSection ? questions.filter((q) => q.section === quizSection) : questions;

  const startQuiz = (section: number | null) => {
    setQuizSection(section);
    setCurrentQ(0);
    setAnswers({});
    setShowExplanation(false);
    setQuizState("active");
  };

  const selectAnswer = (qId: number, optionIdx: number) => {
    if (answers[qId] !== undefined) return;
    setAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentQ < filteredQuestions.length - 1) {
      setCurrentQ((prev) => prev + 1);
      setShowExplanation(false);
    } else {
      setQuizState("review");
    }
  };

  const score = Object.entries(answers).filter(([qId]) => {
    const q = questions.find((q) => q.id === parseInt(qId));
    return q && answers[q.id] === q.correct;
  }).length;

  const totalAnswered = Object.keys(answers).length;

  const expandQuestion = async (id: string) => {
    const cq = communityQs.find((q) => q.id === id);
    if (!cq) return;
    setExpandingId(id);
    try {
      const resp = await fetch("/api/community/expand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cq.id, text: cq.text }),
      });
      const data = await resp.json();
      if (data.answer) {
        setCommunityQs((prev) => prev.map((q) => (q.id === id ? { ...q, ai_answer: data.answer } : q)));
      }
    } catch {
      setCommunityQs((prev) => prev.map((q) => (q.id === id ? { ...q, ai_answer: "Error connecting to API. Please try again." } : q)));
    }
    setExpandingId(null);
  };

  const addCommunityQuestion = async () => {
    if (!newQuestion.trim()) return;
    try {
      const resp = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newQuestion.trim(), author: authorName.trim() || undefined }),
      });
      const data = await resp.json();
      if (data.id) {
        setCommunityQs((prev) => [data, ...prev]);
        setNewQuestion("");
      }
    } catch {}
  };

  const submitFeedback = async (questionId: number) => {
    const pq = practiceQuestions.find((q) => q.id === questionId);
    if (!pq || !userAnswer.trim()) return;
    setLoadingFeedback(questionId);
    try {
      const resp = await fetch("/api/se-trainer/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText: pq.prompt,
          userAnswer: userAnswer.trim(),
          guidancePoints: pq.guidancePoints,
          category: pq.category,
          difficulty: pq.difficulty,
        }),
      });
      const data = await resp.json();
      if (data.score) {
        setFeedback((prev) => ({ ...prev, [questionId]: data }));
      }
    } catch {}
    setLoadingFeedback(null);
  };

  const renderContent = (text: string) => {
    return text.split("\n").map((line, i) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={i} style={{ margin: line === "" ? "8px 0" : "4px 0", lineHeight: 1.7 }}>
          {parts.map((part, j) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <strong key={j} style={{ color: colors.accent, fontWeight: 600 }}>
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return <span key={j}>{part}</span>;
          })}
        </p>
      );
    });
  };

  const filteredPractice = practiceFilter === "all" ? practiceQuestions : practiceQuestions.filter((q) => q.category === practiceFilter);
  const activePQ = practiceQuestions.find((q) => q.id === activePracticeQ);

  return (
    <div style={{ minHeight: "100vh", background: colors.bg, color: colors.text, fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif" }}>
      {/* Internal Tabs */}
      <div style={{ borderBottom: `1px solid ${colors.border}`, background: colors.surface }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 0, overflowX: "auto" }}>
          {[
            { key: "docs", label: "\uD83D\uDCC4 Documentation", desc: "10 Technical Areas" },
            { key: "quiz", label: "\uD83E\uDDEA Quiz", desc: `${questions.length} Questions` },
            { key: "practice", label: "\uD83C\uDFAF Practice", desc: `${practiceQuestions.length} Scenarios` },
            { key: "community", label: "\uD83D\uDC65 Community", desc: "Submit Questions" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key);
                if (t.key !== "docs") setSelectedSection(null);
              }}
              style={{
                padding: "14px 24px",
                background: tab === t.key ? colors.accentGlow : "transparent",
                border: "none",
                borderBottom: tab === t.key ? `2px solid ${colors.accent}` : "2px solid transparent",
                color: tab === t.key ? colors.accent : colors.textDim,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "inherit",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              {t.label} <span style={{ fontSize: 11, opacity: 0.7, marginLeft: 4 }}>{t.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 32px" }}>
        {/* DOCUMENTATION TAB */}
        {tab === "docs" && !selectedSection && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: colors.textDim }}>Core Technical Knowledge Areas</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSection(s.id)}
                  style={{
                    background: colors.card,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 12,
                    padding: "20px 22px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s",
                    fontFamily: "inherit",
                    color: colors.text,
                    position: "relative",
                    overflow: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.accentDim;
                    e.currentTarget.style.background = colors.surfaceHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.background = colors.card;
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                    <span style={{ fontSize: 28 }}>{s.icon}</span>
                    <Badge>Section {s.id}</Badge>
                  </div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{s.title}</h3>
                  <p style={{ margin: "8px 0 0", fontSize: 13, color: colors.textDim, lineHeight: 1.5 }}>{s.content.substring(0, 120)}...</p>
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: 80,
                      height: 80,
                      background: `radial-gradient(circle at top right, ${colors.accentGlow}, transparent)`,
                      pointerEvents: "none",
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === "docs" && selectedSection && (
          <div>
            <button
              onClick={() => setSelectedSection(null)}
              style={{ background: "none", border: "none", color: colors.accent, cursor: "pointer", fontSize: 14, fontFamily: "inherit", fontWeight: 600, marginBottom: 20, padding: 0 }}
            >
              {"\u2190"} Back to all sections
            </button>
            <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 16, padding: "32px 36px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                <span style={{ fontSize: 36 }}>{sections[selectedSection - 1].icon}</span>
                <div>
                  <Badge>Section {selectedSection}</Badge>
                  <h2 style={{ margin: "6px 0 0", fontSize: 22, fontWeight: 700 }}>{sections[selectedSection - 1].title}</h2>
                </div>
              </div>
              <div style={{ fontSize: 15, color: colors.text, lineHeight: 1.8 }}>{renderContent(sections[selectedSection - 1].content)}</div>
              <div style={{ marginTop: 28, paddingTop: 20, borderTop: `1px solid ${colors.border}`, display: "flex", gap: 10 }}>
                <button
                  onClick={() => {
                    setTab("quiz");
                    startQuiz(selectedSection);
                  }}
                  style={{ padding: "10px 20px", background: colors.accent, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontFamily: "inherit", fontSize: 14 }}
                >
                  {"\uD83E\uDDEA"} Quiz this section ({questions.filter((q) => q.section === selectedSection).length} questions)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* QUIZ TAB */}
        {tab === "quiz" && quizState === "menu" && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: colors.textDim }}>Choose Your Quiz</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
              <button
                onClick={() => startQuiz(null)}
                style={{
                  background: `linear-gradient(135deg, ${colors.accent}22, ${colors.card})`,
                  border: `1px solid ${colors.accent}55`,
                  borderRadius: 14,
                  padding: "24px",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                  color: colors.text,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = colors.accent)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = `${colors.accent}55`)}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>{"\uD83C\uDFC6"}</div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: colors.accent }}>Full Assessment</h3>
                <p style={{ margin: "6px 0 0", fontSize: 13, color: colors.textDim }}>All {questions.length} questions across all 10 sections</p>
              </button>
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => startQuiz(s.id)}
                  style={{
                    background: colors.card,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 14,
                    padding: "24px",
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "inherit",
                    color: colors.text,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.borderHover;
                    e.currentTarget.style.background = colors.surfaceHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.background = colors.card;
                  }}
                >
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{s.title}</h3>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: colors.textDim }}>
                    {questions.filter((q) => q.section === s.id).length} questions
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === "quiz" && quizState === "active" && filteredQuestions[currentQ] && (
          <div ref={quizRef}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <button
                onClick={() => {
                  setQuizState("menu");
                  setQuizSection(null);
                }}
                style={{ background: "none", border: "none", color: colors.accent, cursor: "pointer", fontSize: 14, fontFamily: "inherit", fontWeight: 600, padding: 0 }}
              >
                {"\u2190"} Exit quiz
              </button>
              <span style={{ fontSize: 13, color: colors.textDim }}>
                Question {currentQ + 1} of {filteredQuestions.length}
                {totalAnswered > 0 && ` \u00B7 Score: ${score}/${totalAnswered}`}
              </span>
            </div>
            <div style={{ height: 4, background: colors.border, borderRadius: 2, marginBottom: 28 }}>
              <div
                style={{
                  height: "100%",
                  width: `${((currentQ + 1) / filteredQuestions.length) * 100}%`,
                  background: colors.accent,
                  borderRadius: 2,
                  transition: "width 0.4s ease",
                }}
              />
            </div>

            <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 16, padding: "32px" }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <Badge>{sections[filteredQuestions[currentQ].section - 1]?.title}</Badge>
                <Badge color={colors.textDim} bg={colors.surface}>
                  Q{filteredQuestions[currentQ].id}
                </Badge>
              </div>
              <h3 style={{ margin: "0 0 24px", fontSize: 18, fontWeight: 600, lineHeight: 1.5 }}>{filteredQuestions[currentQ].q}</h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filteredQuestions[currentQ].options.map((opt, i) => {
                  const answered = answers[filteredQuestions[currentQ].id] !== undefined;
                  const selected = answers[filteredQuestions[currentQ].id] === i;
                  const isCorrect = i === filteredQuestions[currentQ].correct;
                  let borderCol = colors.border;
                  let bgCol = colors.surface;
                  let icon = String.fromCharCode(65 + i);
                  if (answered) {
                    if (isCorrect) {
                      borderCol = colors.green;
                      bgCol = colors.greenGlow;
                      icon = "\u2713";
                    } else if (selected) {
                      borderCol = colors.red;
                      bgCol = colors.redGlow;
                      icon = "\u2717";
                    }
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => selectAnswer(filteredQuestions[currentQ].id, i)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "14px 18px",
                        background: bgCol,
                        border: `1px solid ${borderCol}`,
                        borderRadius: 10,
                        cursor: answered ? "default" : "pointer",
                        textAlign: "left",
                        fontFamily: "inherit",
                        color: colors.text,
                        fontSize: 14,
                        lineHeight: 1.5,
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        if (!answered) {
                          e.currentTarget.style.borderColor = colors.accentDim;
                          e.currentTarget.style.background = colors.surfaceHover;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!answered) {
                          e.currentTarget.style.borderColor = colors.border;
                          e.currentTarget.style.background = colors.surface;
                        }
                      }}
                    >
                      <span
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 13,
                          fontWeight: 700,
                          flexShrink: 0,
                          background: answered && isCorrect ? colors.green : answered && selected ? colors.red : colors.border,
                          color: answered && (isCorrect || selected) ? "#fff" : colors.textDim,
                        }}
                      >
                        {icon}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              {showExplanation && (
                <div style={{ marginTop: 20, padding: "16px 20px", background: colors.accentGlow, border: `1px solid ${colors.accent}44`, borderRadius: 10 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: colors.accent, marginBottom: 6 }}>
                    {answers[filteredQuestions[currentQ].id] === filteredQuestions[currentQ].correct ? "\u2713 Correct!" : "\u2717 Incorrect"}
                  </p>
                  <p style={{ margin: 0, fontSize: 14, color: colors.text, lineHeight: 1.6 }}>{filteredQuestions[currentQ].explanation}</p>
                </div>
              )}

              {showExplanation && (
                <button
                  onClick={nextQuestion}
                  style={{
                    marginTop: 20,
                    padding: "12px 28px",
                    background: colors.accent,
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 600,
                    fontFamily: "inherit",
                    fontSize: 14,
                  }}
                >
                  {currentQ < filteredQuestions.length - 1 ? "Next Question \u2192" : "View Results \u2192"}
                </button>
              )}
            </div>
          </div>
        )}

        {tab === "quiz" && quizState === "review" && (
          <div>
            <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 16, padding: "32px", textAlign: "center", marginBottom: 24 }}>
              <ProgressRing progress={(score / totalAnswered) * 100} size={80} stroke={6} />
              <h2 style={{ margin: "16px 0 6px", fontSize: 22, fontWeight: 700 }}>
                {score >= totalAnswered * 0.8 ? "Excellent!" : score >= totalAnswered * 0.5 ? "Good Progress" : "Keep Studying"}
              </h2>
              <p style={{ margin: 0, fontSize: 15, color: colors.textDim }}>
                You scored <strong style={{ color: colors.accent }}>{score}</strong> out of <strong>{totalAnswered}</strong>
              </p>
              <button
                onClick={() => {
                  setQuizState("menu");
                  setQuizSection(null);
                }}
                style={{ marginTop: 20, padding: "10px 24px", background: colors.accent, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontFamily: "inherit", fontSize: 14 }}
              >
                Back to Quiz Menu
              </button>
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 600, color: colors.textDim, marginBottom: 14 }}>Review Answers</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filteredQuestions.map((q) => {
                const userAns = answers[q.id];
                const correct = userAns === q.correct;
                return (
                  <div key={q.id} style={{ background: colors.card, border: `1px solid ${correct ? colors.green + "44" : colors.red + "44"}`, borderRadius: 10, padding: "16px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <span
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 6,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          fontWeight: 700,
                          background: correct ? colors.green : colors.red,
                          color: "#fff",
                        }}
                      >
                        {correct ? "\u2713" : "\u2717"}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>
                        Q{q.id}: {q.q.substring(0, 80)}...
                      </span>
                    </div>
                    {!correct && (
                      <p style={{ margin: "6px 0 0 32px", fontSize: 13, color: colors.textDim }}>
                        Your answer: {q.options[userAns]} {"\u2014"} Correct: <span style={{ color: colors.green }}>{q.options[q.correct]}</span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PRACTICE TAB */}
        {tab === "practice" && !activePQ && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: colors.textDim }}>Interview Practice Scenarios</h2>
            <p style={{ fontSize: 14, color: colors.textMuted, marginBottom: 20 }}>Write your answer, then get AI feedback scored against a hidden rubric.</p>

            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              {["all", "discovery", "objection-handling", "technical-depth", "demo-design", "customer-success"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setPracticeFilter(cat)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 20,
                    border: `1px solid ${practiceFilter === cat ? colors.accent : colors.border}`,
                    background: practiceFilter === cat ? colors.accentGlow : "transparent",
                    color: practiceFilter === cat ? colors.accent : colors.textDim,
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: "inherit",
                  }}
                >
                  {cat === "all" ? "All" : categoryLabels[cat]}
                </button>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }}>
              {filteredPractice.map((pq) => (
                <button
                  key={pq.id}
                  onClick={() => { setActivePracticeQ(pq.id); setUserAnswer(""); }}
                  style={{
                    background: colors.card,
                    border: `1px solid ${feedback[pq.id] ? colors.green + "44" : colors.border}`,
                    borderRadius: 12,
                    padding: "20px 22px",
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "inherit",
                    color: colors.text,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.accentDim; e.currentTarget.style.background = colors.surfaceHover; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = feedback[pq.id] ? colors.green + "44" : colors.border; e.currentTarget.style.background = colors.card; }}
                >
                  <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                    <Badge>{categoryLabels[pq.category]}</Badge>
                    <Badge color={pq.difficulty === "senior" ? colors.orange : pq.difficulty === "mid" ? colors.accent : colors.green}
                      bg={pq.difficulty === "senior" ? colors.orangeGlow : pq.difficulty === "mid" ? colors.accentGlow : colors.greenGlow}>
                      {pq.difficulty}
                    </Badge>
                    {feedback[pq.id] && (
                      <Badge color={colors.green} bg={colors.greenGlow}>{"\u2713"} {feedback[pq.id].score}/5</Badge>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>{pq.prompt.substring(0, 120)}...</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === "practice" && activePQ && (
          <div>
            <button
              onClick={() => setActivePracticeQ(null)}
              style={{ background: "none", border: "none", color: colors.accent, cursor: "pointer", fontSize: 14, fontFamily: "inherit", fontWeight: 600, marginBottom: 20, padding: 0 }}
            >
              {"\u2190"} Back to all scenarios
            </button>

            <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 16, padding: "32px" }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                <Badge>{categoryLabels[activePQ.category]}</Badge>
                <Badge color={activePQ.difficulty === "senior" ? colors.orange : activePQ.difficulty === "mid" ? colors.accent : colors.green}
                  bg={activePQ.difficulty === "senior" ? colors.orangeGlow : activePQ.difficulty === "mid" ? colors.accentGlow : colors.greenGlow}>
                  {activePQ.difficulty}
                </Badge>
              </div>
              <h3 style={{ margin: "0 0 24px", fontSize: 18, fontWeight: 600, lineHeight: 1.5 }}>{activePQ.prompt}</h3>

              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Write your answer here..."
                style={{
                  width: "100%",
                  minHeight: 180,
                  padding: "16px",
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 10,
                  color: colors.text,
                  fontSize: 14,
                  fontFamily: "inherit",
                  lineHeight: 1.7,
                  outline: "none",
                  resize: "vertical",
                }}
                onFocus={(e) => (e.target.style.borderColor = colors.accent)}
                onBlur={(e) => (e.target.style.borderColor = colors.border)}
              />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                <span style={{ fontSize: 12, color: colors.textMuted }}>{userAnswer.length} characters</span>
                <button
                  onClick={() => submitFeedback(activePQ.id)}
                  disabled={!userAnswer.trim() || loadingFeedback === activePQ.id}
                  style={{
                    padding: "12px 28px",
                    background: !userAnswer.trim() ? colors.surface : loadingFeedback === activePQ.id ? colors.surface : colors.accent,
                    color: !userAnswer.trim() ? colors.textMuted : "#fff",
                    border: "none",
                    borderRadius: 8,
                    cursor: !userAnswer.trim() || loadingFeedback === activePQ.id ? "not-allowed" : "pointer",
                    fontWeight: 600,
                    fontFamily: "inherit",
                    fontSize: 14,
                  }}
                >
                  {loadingFeedback === activePQ.id ? "\u23F3 Evaluating..." : "\uD83E\uDD16 Get AI Feedback"}
                </button>
              </div>
            </div>

            {/* Feedback Display */}
            {feedback[activePQ.id] && (
              <div style={{ marginTop: 20 }}>
                {/* Score */}
                <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 16, padding: "24px 32px", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 24, fontWeight: 700,
                      background: feedback[activePQ.id].score >= 4 ? colors.greenGlow : feedback[activePQ.id].score >= 3 ? colors.orangeGlow : colors.redGlow,
                      color: feedback[activePQ.id].score >= 4 ? colors.green : feedback[activePQ.id].score >= 3 ? colors.orange : colors.red,
                    }}>
                      {feedback[activePQ.id].score}/5
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                        {feedback[activePQ.id].score >= 4 ? "Strong Answer" : feedback[activePQ.id].score >= 3 ? "Solid Foundation" : "Needs Work"}
                      </h3>
                      <p style={{ margin: "4px 0 0", fontSize: 13, color: colors.textDim, lineHeight: 1.5 }}>{feedback[activePQ.id].interviewerPerspective}</p>
                    </div>
                  </div>

                  {/* Strengths */}
                  <div style={{ marginBottom: 16 }}>
                    <h4 style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: colors.green }}>{"\u2713"} Strengths</h4>
                    {feedback[activePQ.id].strengths.map((s, i) => (
                      <p key={i} style={{ margin: "4px 0 4px 16px", fontSize: 14, color: colors.text, lineHeight: 1.6 }}>{"\u2022"} {s}</p>
                    ))}
                  </div>

                  {/* Improvements */}
                  <div style={{ marginBottom: 16 }}>
                    <h4 style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: colors.orange }}>{"\u25B2"} Areas to Improve</h4>
                    {feedback[activePQ.id].improvements.map((s, i) => (
                      <p key={i} style={{ margin: "4px 0 4px 16px", fontSize: 14, color: colors.text, lineHeight: 1.6 }}>{"\u2022"} {s}</p>
                    ))}
                  </div>

                  {/* Model Answer (collapsible) */}
                  <div>
                    <button
                      onClick={() => setShowModelAnswer((prev) => ({ ...prev, [activePQ.id]: !prev[activePQ.id] }))}
                      style={{ background: "none", border: "none", color: colors.accent, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit", padding: 0 }}
                    >
                      {showModelAnswer[activePQ.id] ? "\u25BC Hide Model Answer" : "\u25B6 Show Model Answer"}
                    </button>
                    {showModelAnswer[activePQ.id] && (
                      <div style={{ marginTop: 10, padding: "16px", background: colors.accentGlow, border: `1px solid ${colors.accent}33`, borderRadius: 10 }}>
                        <p style={{ margin: 0, fontSize: 14, color: colors.text, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{feedback[activePQ.id].modelAnswer}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rubric Reveal */}
                <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, padding: "16px 20px" }}>
                  <h4 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: colors.textDim }}>Evaluation Rubric (what the AI scored against)</h4>
                  {activePQ.guidancePoints.map((gp, i) => (
                    <p key={i} style={{ margin: "4px 0 4px 8px", fontSize: 13, color: colors.textDim, lineHeight: 1.5 }}>{i + 1}. {gp}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* COMMUNITY TAB */}
        {tab === "community" && (
          <div>
            <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 16, padding: "28px 32px", marginBottom: 24 }}>
              <h2 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 700 }}>{"\uD83D\uDC65"} Community Question Bank</h2>
              <p style={{ margin: "0 0 20px", fontSize: 14, color: colors.textDim }}>
                Submit interview questions. Click &quot;Expand&quot; to generate a detailed AI-powered answer.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 8 }}>
                <input
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCommunityQuestion()}
                  placeholder="Type an interview question..."
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: colors.surface,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 10,
                    color: colors.text,
                    fontSize: 14,
                    fontFamily: "inherit",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = colors.accent)}
                  onBlur={(e) => (e.target.style.borderColor = colors.border)}
                />
                <input
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Your name (optional)"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: colors.surface,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 10,
                    color: colors.text,
                    fontSize: 14,
                    fontFamily: "inherit",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = colors.accent)}
                  onBlur={(e) => (e.target.style.borderColor = colors.border)}
                />
                <button
                  onClick={addCommunityQuestion}
                  style={{
                    width: "100%",
                    padding: "12px 22px",
                    background: colors.accent,
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    cursor: "pointer",
                    fontWeight: 600,
                    fontFamily: "inherit",
                    fontSize: 14,
                  }}
                >
                  + Add Question
                </button>
              </div>
            </div>

            {communityQs.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 20px", color: colors.textMuted }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>{"\uD83D\uDCA1"}</div>
                <p style={{ fontSize: 15 }}>No community questions yet. Be the first to contribute!</p>
                <p style={{ fontSize: 13 }}>Submit a question above and click &quot;Expand&quot; to get an AI-generated detailed answer.</p>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {communityQs.map((cq) => (
                <div key={cq.id} style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, padding: "20px 24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 600, lineHeight: 1.5 }}>{cq.text}</p>
                      <p style={{ margin: 0, fontSize: 12, color: colors.textMuted }}>
                        Added by {cq.author} {"\u00B7"} {new Date(cq.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!cq.ai_answer && (
                      <button
                        onClick={() => expandQuestion(cq.id)}
                        disabled={expandingId === cq.id}
                        style={{
                          padding: "8px 16px",
                          background: expandingId === cq.id ? colors.surface : colors.accentGlow,
                          border: `1px solid ${colors.accent}44`,
                          borderRadius: 8,
                          color: colors.accent,
                          cursor: expandingId === cq.id ? "wait" : "pointer",
                          fontWeight: 600,
                          fontFamily: "inherit",
                          fontSize: 13,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {expandingId === cq.id ? "\u23F3 Generating..." : "\uD83E\uDD16 Expand with AI"}
                      </button>
                    )}
                  </div>
                  {cq.ai_answer && (
                    <div style={{ marginTop: 16, padding: "16px 20px", background: colors.accentGlow, border: `1px solid ${colors.accent}33`, borderRadius: 10 }}>
                      <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 600, color: colors.accent }}>{"\uD83E\uDD16"} AI-Generated Answer</p>
                      <div style={{ fontSize: 14, color: colors.text, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{cq.ai_answer}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
