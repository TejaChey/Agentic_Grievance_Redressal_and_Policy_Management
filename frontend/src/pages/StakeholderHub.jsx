import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { findProjectByNameOrId } from "../config/projectsData";
import "./StakeholderHub.css";

// Card copy per stakeholder type. External stakeholders also get the project
// chosen on the Puravankara website.
const HUB_COPY = {
  Internal: {
    lodgeDesc: "Report a workplace, HR, POSH, or conduct concern.",
    topics: ["HR", "POSH", "Payroll", "Conduct"],
  },
  Contract: {
    lodgeDesc: "Report a wages, site safety, or working conditions concern.",
    topics: ["Wages", "Safety", "Facilities", "Conduct"],
  },
  External: {
    lodgeDesc: "Report a construction, quality, safety, or service issue at a Puravankara project.",
    topics: ["Construction", "Quality", "Safety", "Environment"],
  },
};

const DEFAULT_COPY = {
  lodgeDesc: "Report a grievance to the right Puravankara team.",
  topics: ["HR", "Safety", "Quality", "Conduct"],
};

const SAMPLE_QUESTIONS = [
  "What is the POSH policy?",
  "What is the grievance resolution timeline?",
  "Can I report anonymously?",
];

const StakeholderHub = () => {
  const { user, userDetails } = useAuth();
  const navigate = useNavigate();

  const [trackInput, setTrackInput] = useState("");
  const [chatInput, setChatInput] = useState("");

  const userType = userDetails?.user_type;
  const isExternal = userType === "External";
  const copy = HUB_COPY[userType] || DEFAULT_COPY;

  const displayName = userDetails?.name || user?.user_metadata?.name || user?.email?.split("@")[0] || "Stakeholder";

  // Project picked on the Puravankara website; only relevant to external stakeholders
  const projectParam = isExternal
    ? new URLSearchParams(window.location.search).get("project") || sessionStorage.getItem("purva_selected_project")
    : null;
  const activeProjectObj = projectParam ? findProjectByNameOrId(projectParam) : null;

  const getLodgeRoute = () => {
    const projQuery = projectParam ? `?project=${encodeURIComponent(projectParam)}` : "";
    switch (userType) {
      case "Internal": return "/lodge-internal";
      case "Contract": return "/lodge-contract";
      case "External": return `/lodge-external${projQuery}`;
      default: return "/lodge-selection";
    }
  };

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    const cleanId = trackInput.trim();
    if (!cleanId) return;
    navigate(`/track?id=${encodeURIComponent(cleanId)}`);
  };

  const handleChatTrigger = (promptText) => {
    const query = promptText || chatInput;
    if (!query.trim()) return;
    navigate("/assistant", { state: { prefill: query } });
  };

  return (
    <div className="stakeholder-hub">
      {/* ── HERO ── */}
      <section className="hub-hero py-4">
        <div className="container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <div>
              <h1 className="hub-hero-title mb-1">Welcome, {displayName}</h1>
              <p className="hub-hero-subtitle mb-0">Puravankara Grievance Redressal Portal.</p>
            </div>
            <div>
              <Link to="/dashboard" className="btn hub-btn-dashboard shadow-sm">
                <i className="bi bi-speedometer2 me-2"></i>
                Dashboard &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-4">
        <div className="row g-4 align-items-stretch">

          {/* ── LODGE A GRIEVANCE ── */}
          <div className="col-lg-6 d-flex flex-column">
            <div className="hub-action-card hub-card-lodge flex-grow-1">
              <div className="hub-card-header mb-3">
                <div className="hub-icon-wrapper hub-icon-inferno">
                  <i className="bi bi-file-earmark-plus"></i>
                </div>
                <div>
                  <h3 className="hub-card-title">Lodge a Grievance</h3>
                  <p className="hub-card-desc mb-0">{copy.lodgeDesc}</p>
                </div>
              </div>

              <div className="hub-topics-list mb-3">
                {copy.topics.map((topic) => (
                  <span key={topic} className="hub-topic-chip">{topic}</span>
                ))}
              </div>

              {activeProjectObj && (
                <div className="hub-project-card p-2 mb-3 rounded-3 bg-white border border-danger-subtle d-flex align-items-center justify-content-between gap-2">
                  <div className="d-flex align-items-center gap-2 overflow-hidden">
                    <img
                      src={activeProjectObj.image || "/purva_heritage.jpg"}
                      alt={activeProjectObj.name}
                      className="hub-project-thumb rounded-2 border flex-shrink-0"
                    />
                    <div className="text-truncate">
                      <div className="d-flex align-items-center gap-1 mb-0">
                        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 hub-project-badge">
                          <i className="bi bi-patch-check-fill me-1"></i>Verified Site
                        </span>
                        {activeProjectObj.city && (
                          <span className="text-muted hub-project-meta">• {activeProjectObj.city}</span>
                        )}
                      </div>
                      <div className="hub-project-name fw-bold text-navy text-truncate">{activeProjectObj.name}</div>
                      <div className="text-muted text-truncate hub-project-meta">
                        <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                        {activeProjectObj.location}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm px-2 py-1 text-nowrap rounded-pill hub-project-clear"
                    title="Clear selected project"
                    onClick={() => {
                      sessionStorage.removeItem("purva_selected_project");
                      navigate("/grm", { replace: true });
                    }}
                  >
                    Clear
                  </button>
                </div>
              )}

              <div className="mt-auto pt-2">
                <Link to={getLodgeRoute()} className="btn hub-btn-inferno w-100 py-2">
                  <i className="bi bi-pencil-square me-2"></i>
                  Lodge Grievance
                </Link>
              </div>
            </div>
          </div>

          {/* ── ASK PURVA (CHATBOT) ── */}
          <div className="col-lg-6">
            <div className="hub-chatbot-card h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="hub-purva-avatar">
                    <img src="/purva-logo.svg" alt="Purva AI" className="w-100 h-100 object-fit-contain" />
                    <span className="hub-live-dot"></span>
                  </div>
                  <div>
                    <h3 className="hub-card-title mb-0">Ask Purva</h3>
                    <p className="text-muted small mb-0">24/7 AI Policy Assistant</p>
                  </div>
                </div>

                <p className="hub-card-desc mb-3">
                  Instant answers on company policies, SLAs, and how to file a grievance.
                </p>

                <div className="mb-3">
                  <label className="text-muted small fw-semibold mb-2 d-block">Quick Questions:</label>
                  <div className="d-flex flex-column gap-2">
                    {SAMPLE_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        type="button"
                        className="hub-question-btn text-start py-2 px-3"
                        onClick={() => handleChatTrigger(q)}
                      >
                        <i className="bi bi-arrow-right-short text-danger me-1"></i>
                        <span>{q}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-top mt-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleChatTrigger();
                  }}
                  className="mb-2"
                >
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control hub-chat-input"
                      placeholder="Ask Purva anything..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                    />
                    <button type="submit" className="btn hub-btn-inferno px-3 fw-semibold">
                      Ask &rarr;
                    </button>
                  </div>
                </form>

                <div className="text-end">
                  <Link to="/assistant" className="hub-link-subtle small fw-semibold">
                    Open Fullscreen Assistant &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* ── TRACK A GRIEVANCE ── */}
          <div className="col-12">
            <div className="hub-action-card hub-card-track">
              <div className="hub-card-header mb-3">
                <div className="hub-icon-wrapper hub-icon-navy">
                  <i className="bi bi-search"></i>
                </div>
                <div>
                  <h3 className="hub-card-title">Track a Grievance</h3>
                  <p className="hub-card-desc mb-0">Check real-time status and resolution proof.</p>
                </div>
              </div>

              <form onSubmit={handleTrackSubmit} className="mb-3">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control hub-track-input"
                    placeholder="Enter Tracking ID..."
                    value={trackInput}
                    onChange={(e) => setTrackInput(e.target.value)}
                  />
                  <button type="submit" className="btn hub-btn-navy px-3 fw-semibold">
                    Track &rarr;
                  </button>
                </div>
              </form>

              <div className="d-flex justify-content-end align-items-center small pt-1">
                <Link to="/dashboard" className="hub-link-navy fw-semibold">
                  Dashboard History &rarr;
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StakeholderHub;
