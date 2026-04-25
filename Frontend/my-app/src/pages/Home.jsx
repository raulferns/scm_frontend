import { useNavigate } from "react-router-dom";

/* ─── Inline SVG icons ─────────────────────────────── */
const TruckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="1" />
    <path d="M16 8h4l3 3v5h-7V8z" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const RouteIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="19" r="2" />
    <circle cx="18" cy="5" r="2" />
    <path d="M6 17V7a2 2 0 0 1 2-2h4" />
    <path d="M18 7v10a2 2 0 0 1-2 2H8" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const BoltIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

/* ─── Styles object (all inline — no Tailwind classes used for layout/color) ── */
const S = {
  root: {
    minHeight: "100vh",
    background: "#030712",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    color: "#f9fafb",
    WebkitFontSmoothing: "antialiased",
  },

  /* Navbar */
  navbar: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "60px",
    background: "rgba(3,7,18,0.8)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 32px",
    zIndex: 50,
    boxSizing: "border-box",
  },
  navLogo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    textDecoration: "none",
  },
  logoIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    background: "linear-gradient(135deg, #10b981, #059669)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  logoText: {
    fontSize: "18px",
    fontWeight: 700,
    lineHeight: 1,
    letterSpacing: "-0.01em",
  },
  navBtn: {
    border: "1px solid rgba(16,185,129,0.4)",
    color: "#34d399",
    background: "transparent",
    borderRadius: "8px",
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.2s ease",
  },

  /* Hero */
  hero: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: "60px",
    position: "relative",
    overflow: "hidden",
  },
  heroBg: {
    position: "absolute",
    inset: 0,
    background: `
      radial-gradient(ellipse 80% 50% at 50% -10%, rgba(16,185,129,0.15), transparent),
      repeating-linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
      repeating-linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
    `,
    backgroundSize: "auto, 40px 40px, 40px 40px",
    pointerEvents: "none",
  },
  heroContent: {
    position: "relative",
    maxWidth: "800px",
    width: "100%",
    textAlign: "center",
    padding: "0 24px",
  },

  /* Eyebrow pill */
  pill: {
    display: "inline-block",
    border: "1px solid rgba(16,185,129,0.3)",
    background: "rgba(16,185,129,0.1)",
    color: "#34d399",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    padding: "6px 16px",
    borderRadius: "9999px",
    marginBottom: "32px",
  },

  /* Headline */
  headlineWrap: {
    fontSize: "clamp(48px, 6vw, 80px)",
    fontWeight: 800,
    lineHeight: 1.05,
    letterSpacing: "-0.03em",
    marginBottom: "24px",
  },
  headlineLine1: {
    color: "#f9fafb",
    display: "block",
  },
  headlineLine2: {
    display: "block",
    background: "linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },

  /* Subheadline */
  sub: {
    maxWidth: "560px",
    margin: "0 auto 40px",
    fontSize: "18px",
    color: "#6b7280",
    lineHeight: 1.7,
  },

  /* CTA Button */
  ctaBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "12px",
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "white",
    fontWeight: 600,
    fontSize: "16px",
    padding: "16px 36px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    fontFamily: "inherit",
    boxShadow: "0 0 40px rgba(16,185,129,0.35), 0 4px 24px rgba(16,185,129,0.2)",
    transition: "all 0.2s ease",
  },

  /* Trust row */
  trustRow: {
    display: "flex",
    gap: "24px",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: "24px",
  },
  trustItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#6b7280",
    fontSize: "13px",
  },

  /* Stats row */
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
    maxWidth: "600px",
    margin: "64px auto 0",
  },
  statCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "20px 24px",
    textAlign: "center",
  },
  statNum: {
    fontSize: "28px",
    fontWeight: 700,
    lineHeight: 1,
  },
  statLabel: {
    fontSize: "12px",
    color: "#6b7280",
    marginTop: "4px",
  },

  /* Feature section */
  featureSection: {
    padding: "120px 24px",
    background: "#030712",
  },
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1px",
    background: "rgba(255,255,255,0.05)",
    maxWidth: "1100px",
    margin: "0 auto",
    borderRadius: "16px",
    overflow: "hidden",
  },
  featureCard: {
    background: "#0a0f1a",
    padding: "40px 32px",
  },
  featureIconWrap: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "24px",
  },
  featureTitle: {
    fontSize: "18px",
    fontWeight: 600,
    color: "#f9fafb",
    marginBottom: "12px",
    marginTop: 0,
  },
  featureText: {
    fontSize: "14px",
    color: "#6b7280",
    lineHeight: 1.7,
    margin: 0,
  },

  /* Bottom CTA */
  bottomCta: {
    padding: "120px 24px",
    textAlign: "center",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    background: "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(16,185,129,0.08), transparent)",
  },
  bottomHeadline: {
    fontSize: "clamp(36px, 5vw, 48px)",
    fontWeight: 800,
    color: "#f9fafb",
    margin: "0 0 16px",
    letterSpacing: "-0.02em",
  },
  bottomSub: {
    fontSize: "18px",
    color: "#6b7280",
    margin: "0 0 40px",
  },

  /* Section header shared */
  sectionHead: {
    textAlign: "center",
    marginBottom: "64px",
  },
  sectionTitle: {
    fontSize: "40px",
    fontWeight: 700,
    color: "#f9fafb",
    margin: "16px 0 16px",
    letterSpacing: "-0.02em",
  },
  sectionSub: {
    fontSize: "16px",
    color: "#6b7280",
    maxWidth: "480px",
    margin: "0 auto",
    lineHeight: 1.6,
  },
};

/* ─── Component ────────────────────────────────────── */
export default function Home() {
  const navigate = useNavigate();

  const handleOpenDashboard = () => navigate("/dashboard");

  const handleNavBtnHover = (e, enter) => {
    e.currentTarget.style.background = enter
      ? "rgba(16,185,129,0.1)"
      : "transparent";
  };

  const handleCtaBtnHover = (e, enter) => {
    e.currentTarget.style.transform = enter ? "translateY(-2px)" : "translateY(0)";
    e.currentTarget.style.boxShadow = enter
      ? "0 0 60px rgba(16,185,129,0.5), 0 8px 32px rgba(16,185,129,0.3)"
      : "0 0 40px rgba(16,185,129,0.35), 0 4px 24px rgba(16,185,129,0.2)";
  };

  return (
    <div style={S.root}>
      {/* ── Navbar ── */}
      <nav style={S.navbar}>
        <div style={S.navLogo}>
          <div style={S.logoIcon}>
            <TruckIcon />
          </div>
          <span style={S.logoText}>
            <span style={{ color: "#f9fafb" }}>Smart</span>
            <span style={{ color: "#10b981" }}>Supply</span>
          </span>
        </div>

        <button
          id="nav-open-dashboard"
          style={S.navBtn}
          onClick={handleOpenDashboard}
          onMouseEnter={(e) => handleNavBtnHover(e, true)}
          onMouseLeave={(e) => handleNavBtnHover(e, false)}
        >
          Open Dashboard
        </button>
      </nav>

      {/* ── Hero ── */}
      <section style={S.hero}>
        <div style={S.heroBg} aria-hidden="true" />

        <div style={S.heroContent}>
          {/* Eyebrow */}
          <div style={S.pill}>AI-Powered · Real-Time · Proactive</div>

          {/* Headline */}
          <h1 style={S.headlineWrap}>
            <span style={S.headlineLine1}>Your supply chain,</span>
            <span style={S.headlineLine2}>predicted.</span>
          </h1>

          {/* Sub */}
          <p style={S.sub}>
            SmartSupply detects disruptions before they occur — using live ML
            prediction, weather intelligence, and India-specific event signals
            to reroute your fleet automatically.
          </p>

          {/* CTA */}
          <button
            id="hero-open-dashboard"
            style={S.ctaBtn}
            onClick={handleOpenDashboard}
            onMouseEnter={(e) => handleCtaBtnHover(e, true)}
            onMouseLeave={(e) => handleCtaBtnHover(e, false)}
          >
            Open Dashboard
            <ArrowRightIcon />
          </button>

          {/* Trust row */}
          <div style={S.trustRow}>
            {["Live Firestore sync", "ML risk prediction", "External signal intelligence"].map((t) => (
              <div key={t} style={S.trustItem}>
                <CheckIcon />
                <span>{t}</span>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div style={S.statsRow}>
            <div style={S.statCard}>
              <div style={{ ...S.statNum, color: "#f9fafb" }}>18</div>
              <div style={S.statLabel}>Active shipments</div>
            </div>
            <div style={S.statCard}>
              <div style={{ ...S.statNum, color: "#ef4444" }}>3</div>
              <div style={S.statLabel}>High risk today</div>
            </div>
            <div style={S.statCard}>
              <div style={{ ...S.statNum, color: "#10b981" }}>67%</div>
              <div style={S.statLabel}>Network health</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Section ── */}
      <section style={S.featureSection}>
        <div style={S.sectionHead}>
          <div style={S.pill}>What makes us different</div>
          <h2 style={S.sectionTitle}>Not a tracker. An intelligence layer.</h2>
          <p style={S.sectionSub}>
            Real-time signals, live ML models, and automatic rerouting — so you
            react before anything breaks.
          </p>
        </div>

        <div style={S.featureGrid}>
          {/* Card 1 */}
          <div style={S.featureCard}>
            <div style={{ ...S.featureIconWrap, background: "rgba(16,185,129,0.15)" }}>
              <RouteIcon />
            </div>
            <h3 style={S.featureTitle}>Predict before impact</h3>
            <p style={S.featureText}>
              Live ML models score every active shipment for risk every few
              minutes — combining traffic, weather, festival calendars, and
              driver behaviour to surface issues 24 hours before they become
              delays.
            </p>
          </div>

          {/* Card 2 */}
          <div style={S.featureCard}>
            <div style={{ ...S.featureIconWrap, background: "rgba(239,68,68,0.15)" }}>
              <ShieldIcon />
            </div>
            <h3 style={S.featureTitle}>Reroute automatically</h3>
            <p style={S.featureText}>
              When a high-risk signal is detected, the system computes
              alternative routes and flags them in the dashboard — letting
              dispatchers approve a safer path in one click without leaving
              the interface.
            </p>
          </div>

          {/* Card 3 */}
          <div style={S.featureCard}>
            <div style={{ ...S.featureIconWrap, background: "rgba(139,92,246,0.15)" }}>
              <BoltIcon />
            </div>
            <h3 style={S.featureTitle}>Simulate any future</h3>
            <p style={S.featureText}>
              The Simulation engine lets you replay disruption scenarios —
              flood zones, highway blockages, strike days — against your live
              fleet to validate contingency plans before you need them.
            </p>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section style={S.bottomCta}>
        <h2 style={S.bottomHeadline}>See your fleet in real time.</h2>
        <p style={S.bottomSub}>No setup. No login. Just intelligence.</p>

        <button
          id="bottom-open-dashboard"
          style={S.ctaBtn}
          onClick={handleOpenDashboard}
          onMouseEnter={(e) => handleCtaBtnHover(e, true)}
          onMouseLeave={(e) => handleCtaBtnHover(e, false)}
        >
          Open Dashboard
          <ArrowRightIcon />
        </button>
      </section>
    </div>
  );
}
