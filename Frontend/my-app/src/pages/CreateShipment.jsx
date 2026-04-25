import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "../components/Navbar";
import { createShipment } from "../api/shipments";
import { geocodeAddress } from "../api/geocode";

const PRIORITY_OPTIONS = [
  { value: "low",    label: "Low",    icon: "🌿", desc: "3–5 days",  cost: 480  },
  { value: "medium", label: "Medium", icon: "⚡", desc: "1–2 days",  cost: 920  },
  { value: "high",   label: "High",   icon: "🚀", desc: "Same day",  cost: 1650 },
];

const CONSTRAINT_OPTIONS = [
  { value: "avoid_tolls",        label: "Avoid tolls",        sub: "Takes longer routes"   },
  { value: "avoid_highways",     label: "Avoid highways",     sub: "Uses state roads"      },
  { value: "no_night_delivery",  label: "No night delivery",  sub: "6 AM – 9 PM only"     },
  { value: "signature_required", label: "Signature required", sub: "Recipient must sign"   },
];

const PACKAGE_TYPES = ["Box", "Pallet", "Envelope", "Fragile", "Hazardous"];
const TIME_WINDOWS  = [
  { value: "morning",   label: "Morning (8 AM – 12 PM)"   },
  { value: "afternoon", label: "Afternoon (12 PM – 5 PM)"  },
  { value: "evening",   label: "Evening (5 PM – 9 PM)"    },
  { value: "flexible",  label: "Flexible"                  },
];

const STEPS = [
  { label: "Route",    icon: "🗺️",  desc: "Origin & Destination" },
  { label: "Priority", icon: "⚡",   desc: "Speed & Constraints"  },
  { label: "Review",   icon: "✅",   desc: "Confirm & Submit"     },
];

const initialForm = {
  origin:       { address: "", city: "", pin: "" },
  destination:  { address: "", city: "", pin: "" },
  weight:       "",
  packageType:  "",
  instructions: "",
  priority:     "low",
  constraints:  [],
  pickupDate:   "",
  timeWindow:   "morning",
};

/* ── Shared inline styles ─────────────────────────── */
const inputBase = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "12px",
  padding: "14px 16px 14px 44px",
  fontSize: "14px",
  color: "#f9fafb",
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s, box-shadow 0.15s, background 0.15s",
  appearance: "none",
  WebkitAppearance: "none",
};
const inputNoIcon = { ...inputBase, padding: "14px 16px" };

function DarkInput(props) {
  return (
    <input
      {...props}
      style={{ ...inputBase, ...(props.noIcon ? { padding: "14px 16px" } : {}), ...props.style }}
      onFocus={e => {
        e.target.style.borderColor = "rgba(16,185,129,0.6)";
        e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.1)";
        e.target.style.background = "rgba(255,255,255,0.06)";
      }}
      onBlur={e => {
        e.target.style.borderColor = "rgba(255,255,255,0.1)";
        e.target.style.boxShadow = "none";
        e.target.style.background = "rgba(255,255,255,0.04)";
      }}
      onMouseEnter={e => { if (document.activeElement !== e.target) e.target.style.borderColor = "rgba(255,255,255,0.2)"; }}
      onMouseLeave={e => { if (document.activeElement !== e.target) e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
    />
  );
}

function DarkSelect({ children, ...props }) {
  return (
    <select
      {...props}
      style={{ ...inputBase, cursor: "pointer" }}
      onFocus={e => {
        e.target.style.borderColor = "rgba(16,185,129,0.6)";
        e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.1)";
        e.target.style.background = "rgba(255,255,255,0.06)";
      }}
      onBlur={e => {
        e.target.style.borderColor = "rgba(255,255,255,0.1)";
        e.target.style.boxShadow = "none";
        e.target.style.background = "rgba(255,255,255,0.04)";
      }}
    >
      {children}
    </select>
  );
}

function InputIcon({ children }) {
  return (
    <span style={{
      position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
      width: "18px", height: "18px", color: "#4b5563", display: "flex",
      alignItems: "center", justifyContent: "center", fontSize: "16px", pointerEvents: "none",
    }}>
      {children}
    </span>
  );
}

function SectionLabel({ children, dot }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
      {dot && (
        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: dot, flexShrink: 0 }} />
      )}
      <p style={{
        fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em",
        textTransform: "uppercase", color: "#4b5563", margin: 0,
      }}>
        {children}
      </p>
    </div>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return (
    <p style={{ marginTop: "6px", fontSize: "12px", color: "#ef4444", display: "flex", alignItems: "center", gap: "4px" }}>
      ⚠ {message}
    </p>
  );
}

function useFormValidation() {
  const [errors, setErrors] = useState({});

  const setError   = (key, msg) => setErrors((prev) => ({ ...prev, [key]: msg }));
  const clearError = (key)      => setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });

  const validateStep1 = (form) => {
    const newErrors = {};
    if (!form.origin.address.trim())            newErrors["origin.address"]      = "Required";
    if (!form.origin.city.trim())               newErrors["origin.city"]         = "Required";
    if (!/^\d{6}$/.test(form.origin.pin))       newErrors["origin.pin"]          = "Enter a valid 6-digit PIN";
    if (!form.destination.address.trim())        newErrors["destination.address"] = "Required";
    if (!form.destination.city.trim())           newErrors["destination.city"]    = "Required";
    if (!/^\d{6}$/.test(form.destination.pin))  newErrors["destination.pin"]     = "Enter a valid 6-digit PIN";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return { errors, setError, clearError, validateStep1 };
}

/* ── Review badge ─────────────────────────────────── */
function PriorityReviewBadge({ priority }) {
  const map = {
    low:    { bg: "rgba(16,185,129,0.15)",  color: "#34d399", border: "rgba(16,185,129,0.3)"  },
    medium: { bg: "rgba(245,158,11,0.15)",  color: "#fbbf24", border: "rgba(245,158,11,0.3)"  },
    high:   { bg: "rgba(239,68,68,0.15)",   color: "#f87171", border: "rgba(239,68,68,0.3)"   },
  };
  const c = map[priority] ?? map.low;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "2px 12px",
      borderRadius: "9999px", fontSize: "12px", fontWeight: 600,
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
    }}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
}

/* ── Address section sub-component ──────────────────── */
function AddressSection({ title, prefix, form, setNested, errors }) {
  const isOrigin = prefix === "origin";
  return (
    <section>
      <SectionLabel dot={isOrigin ? "#10b981" : "#ef4444"}>{title}</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div>
          <div style={{ position: "relative" }}>
            <InputIcon>📍</InputIcon>
            <DarkInput
              type="text"
              placeholder="Street address"
              value={form[prefix].address}
              onChange={(e) => setNested(`${prefix}.address`, e.target.value)}
            />
          </div>
          <FieldError message={errors[`${prefix}.address`]} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <div style={{ position: "relative" }}>
              <InputIcon>🏙️</InputIcon>
              <DarkInput
                type="text"
                placeholder="City"
                value={form[prefix].city}
                onChange={(e) => setNested(`${prefix}.city`, e.target.value)}
              />
            </div>
            <FieldError message={errors[`${prefix}.city`]} />
          </div>
          <div>
            <div style={{ position: "relative" }}>
              <InputIcon>#</InputIcon>
              <DarkInput
                type="text"
                placeholder="PIN code"
                maxLength={6}
                value={form[prefix].pin}
                onChange={(e) => setNested(`${prefix}.pin`, e.target.value)}
              />
            </div>
            <FieldError message={errors[`${prefix}.pin`]} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Route separator ornament ─────────────────────── */
function RouteSeparator() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      height: "40px", position: "relative", margin: "4px 0",
    }}>
      <div style={{ flex: 1, width: "2px", borderLeft: "2px dashed rgba(255,255,255,0.08)" }} />
      <div style={{
        width: "14px", height: "14px", transform: "rotate(45deg)",
        background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
        flexShrink: 0,
      }} />
      <div style={{ flex: 1, width: "2px", borderLeft: "2px dashed rgba(255,255,255,0.08)" }} />
    </div>
  );
}

/* ── Primary action button ─────────────────────────── */
function PrimaryBtn({ onClick, disabled, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%", background: "linear-gradient(135deg, #10b981, #059669)",
        color: "white", fontSize: "15px", fontWeight: 600,
        padding: "16px", borderRadius: "12px", border: "none",
        cursor: disabled ? "not-allowed" : "pointer", fontFamily: "inherit",
        boxShadow: "0 0 30px rgba(16,185,129,0.3)",
        transition: "all 0.2s ease",
        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
        opacity: disabled ? 0.7 : 1,
      }}
      onMouseEnter={e => {
        if (!disabled) {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "0 0 40px rgba(16,185,129,0.5)";
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 0 30px rgba(16,185,129,0.3)";
      }}
    >
      {children}
      <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
      </svg>
    </button>
  );
}

function SecondaryBtn({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "12px", padding: "12px 24px", color: "#9ca3af",
        fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
        transition: "all 0.15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "#f9fafb"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#9ca3af"; }}
    >
      {children}
    </button>
  );
}

/* ── Main component ────────────────────────────────── */
export default function CreateShipment() {
  const navigate = useNavigate();
  const [step,       setStep]       = useState(0);
  const [doneSteps,  setDoneSteps]  = useState(new Set());
  const [form,       setForm]       = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const { errors, validateStep1 }   = useFormValidation();

  // ── field helpers ─────────────────────────────────────────────
  const setNested = (path, value) =>
    setForm((prev) => {
      const [a, b] = path.split(".");
      return b
        ? { ...prev, [a]: { ...prev[a], [b]: value } }
        : { ...prev, [a]: value };
    });

  const toggleConstraint = useCallback((value) => {
    setForm((prev) => ({
      ...prev,
      constraints: prev.constraints.includes(value)
        ? prev.constraints.filter((c) => c !== value)
        : [...prev.constraints, value],
    }));
  }, []);

  // ── navigation ────────────────────────────────────────────────
  const goToStep = (n) => { if (n < step || doneSteps.has(n)) setStep(n); };
  const markDone = (n) => setDoneSteps((prev) => new Set([...prev, n]));

  const handleNext = () => {
    if (step === 0 && !validateStep1(form)) return;
    markDone(step);
    setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => s - 1);

  // ── submit ────────────────────────────────────────────────────
  const onSubmit = async () => {
    setSubmitting(true);
    try {
      const originAddress = `${form.origin.city}, ${form.origin.pin}, India`;
      const destinationAddress = `${form.destination.city}, ${form.destination.pin}, India`;

      const originCoords = await geocodeAddress(originAddress);
      const destinationCoords = await geocodeAddress(destinationAddress);
      if (!originCoords || !destinationCoords) {
        throw new Error("Invalid address. Could not fetch coordinates.");
      }

      const payload = {
        origin: {
          address: originAddress,
          lat: originCoords.lat,
          lng: originCoords.lng,
        },
        destination: {
          address: destinationAddress,
          lat: destinationCoords.lat,
          lng: destinationCoords.lng,
        },

        weight: form.weight ? parseFloat(form.weight) : null,
        packageType: form.packageType,
        instructions: form.instructions,
        priority: form.priority,
        constraints: form.constraints,
        pickupDate: form.pickupDate,
        timeWindow: form.timeWindow,
      };
      await createShipment(payload);
      toast.success("Shipment created!");
      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      toast.error(error.message || "Could not create shipment");
    } finally {
      setSubmitting(false);
    }
  };

  // ── derived ───────────────────────────────────────────────────
  const selectedPriority = PRIORITY_OPTIONS.find((p) => p.value === form.priority);

  const tomorrowISO = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  /* ── Card shell ─────────────────────────────────── */
  const cardStyle = {
    background: "#0d1117",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    padding: "40px",
    boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
  };

  const dividerStyle = {
    border: "none",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    margin: "24px 0",
  };

  /* ── Priority card styles ─────────────────────────── */
  const priorityAccent = {
    low:    { sel: { borderColor: "rgba(16,185,129,0.5)",  background: "rgba(16,185,129,0.08)",  boxShadow: "0 0 20px rgba(16,185,129,0.1)"   } },
    medium: { sel: { borderColor: "rgba(245,158,11,0.5)",  background: "rgba(245,158,11,0.08)",  boxShadow: "0 0 20px rgba(245,158,11,0.1)"   } },
    high:   { sel: { borderColor: "rgba(239,68,68,0.5)",   background: "rgba(239,68,68,0.08)",   boxShadow: "0 0 20px rgba(239,68,68,0.1)"    } },
  };

  // ── render ────────────────────────────────────────────────────
  return (
    <div style={{ background: "#030712", minHeight: "100vh", fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <Navbar />
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontFamily: "Inter, sans-serif", background: "#0d1117", color: "#f9fafb", border: "1px solid rgba(255,255,255,0.08)" },
        }}
      />

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Page header */}
        <div style={{ marginBottom: "40px" }}>
          <h1 style={{ fontSize: "36px", fontWeight: 800, color: "#f9fafb", letterSpacing: "-0.02em", margin: "0 0 8px" }}>
            New Shipment
          </h1>
          <p style={{ fontSize: "15px", color: "#4b5563", margin: 0 }}>
            Fill in route, priority, and delivery constraints
          </p>
        </div>

        {/* ── Stepper ─────────────────────────────── */}
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px" }}>
          {/* Background connector */}
          <div style={{
            position: "absolute", top: "16px", left: "10%", right: "10%",
            height: "1px", background: "rgba(255,255,255,0.08)", zIndex: 0,
          }} />

          {STEPS.map((s, i) => {
            const isDone   = doneSteps.has(i);
            const isActive = i === step;
            const isLocked = !isDone && i > step;
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", zIndex: 1, position: "relative" }}>
                <button
                  onClick={() => goToStep(i)}
                  disabled={isLocked}
                  style={{
                    width: "32px", height: "32px", borderRadius: "50%", border: "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: "14px", cursor: isLocked ? "default" : "pointer",
                    transition: "all 0.2s",
                    ...(isDone
                      ? { background: "#10b981", color: "white" }
                      : isActive
                        ? { background: "linear-gradient(135deg, #10b981, #059669)", color: "white", boxShadow: "0 0 20px rgba(16,185,129,0.5)" }
                        : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#4b5563" }
                    ),
                  }}
                >
                  {isDone ? (
                    <svg viewBox="0 0 14 14" fill="none" width="14" height="14">
                      <path d="M2.5 7l3.5 3.5 5.5-7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    i + 1
                  )}
                </button>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "12px", fontWeight: isActive ? 600 : 400, color: isActive ? "#10b981" : "#4b5563", margin: "0 0 2px" }}>
                    {s.label}
                  </p>
                  <p style={{ fontSize: "10px", color: "#374151", margin: 0 }}>{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ══ STEP 0 — Route ══ */}
        {step === 0 && (
          <div style={cardStyle}>
            <AddressSection title="Origin" prefix="origin" form={form} setNested={setNested} errors={errors} />
            <RouteSeparator />
            <AddressSection title="Destination" prefix="destination" form={form} setNested={setNested} errors={errors} />

            <hr style={dividerStyle} />

            {/* Cargo */}
            <section>
              <SectionLabel>Cargo Details</SectionLabel>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div style={{ position: "relative" }}>
                  <InputIcon>⚖️</InputIcon>
                  <DarkInput
                    type="number"
                    placeholder="Weight (kg)"
                    min="0.1"
                    step="0.1"
                    value={form.weight}
                    onChange={(e) => setNested("weight", e.target.value)}
                  />
                </div>
                <div style={{ position: "relative" }}>
                  <InputIcon>📦</InputIcon>
                  <DarkSelect
                    value={form.packageType}
                    onChange={(e) => setNested("packageType", e.target.value)}
                  >
                    <option value="">Package type</option>
                    {PACKAGE_TYPES.map((t) => (
                      <option key={t} value={t.toLowerCase()}>{t}</option>
                    ))}
                  </DarkSelect>
                </div>
              </div>
              <textarea
                placeholder="Special instructions (optional)"
                maxLength={200}
                rows={3}
                value={form.instructions}
                onChange={(e) => setNested("instructions", e.target.value)}
                style={{
                  ...inputNoIcon,
                  resize: "none",
                  minHeight: "100px",
                  paddingTop: "14px",
                }}
                onFocus={e => {
                  e.target.style.borderColor = "rgba(16,185,129,0.6)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.1)";
                  e.target.style.background = "rgba(255,255,255,0.06)";
                }}
                onBlur={e => {
                  e.target.style.borderColor = "rgba(255,255,255,0.1)";
                  e.target.style.boxShadow = "none";
                  e.target.style.background = "rgba(255,255,255,0.04)";
                }}
              />
              <p style={{ fontSize: "12px", color: "#374151", textAlign: "right", marginTop: "8px" }}>
                {form.instructions.length}/200
              </p>
            </section>

            <div style={{ marginTop: "24px" }}>
              <PrimaryBtn onClick={handleNext}>Continue</PrimaryBtn>
            </div>
          </div>
        )}

        {/* ══ STEP 1 — Priority & Constraints ══ */}
        {step === 1 && (
          <div style={cardStyle}>

            {/* Priority cards */}
            <section>
              <SectionLabel>Delivery Priority</SectionLabel>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "16px" }}>
                {PRIORITY_OPTIONS.map((opt) => {
                  const isSelected = form.priority === opt.value;
                  const selStyle = isSelected ? priorityAccent[opt.value].sel : {};
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setNested("priority", opt.value)}
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "12px", padding: "16px 20px",
                        cursor: "pointer", transition: "all 0.15s",
                        textAlign: "center", fontFamily: "inherit",
                        ...selStyle,
                      }}
                    >
                      <div style={{ fontSize: "24px", marginBottom: "8px" }}>{opt.icon}</div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "#f9fafb", marginBottom: "4px" }}>{opt.label}</div>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>{opt.desc}</div>
                    </button>
                  );
                })}
              </div>

              {/* Estimates */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                {[
                  { label: "Est. delivery", value: selectedPriority.desc                                          },
                  { label: "Est. cost",     value: `₹ ${selectedPriority.cost.toLocaleString("en-IN")}`           },
                  { label: "Distance",      value: "1,388 km"                                                     },
                ].map(({ label, value }) => (
                  <div key={label} style={{
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "12px", padding: "14px 16px",
                  }}>
                    <p style={{ fontSize: "11px", color: "#4b5563", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{label}</p>
                    <p style={{ fontSize: "15px", fontWeight: 700, color: "#f9fafb", margin: 0 }}>{value}</p>
                  </div>
                ))}
              </div>
            </section>

            <hr style={dividerStyle} />

            {/* Constraints */}
            <section>
              <SectionLabel>Route Constraints</SectionLabel>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {CONSTRAINT_OPTIONS.map((opt) => {
                  const checked = form.constraints.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      onClick={() => toggleConstraint(opt.value)}
                      style={{
                        display: "flex", alignItems: "flex-start", gap: "12px",
                        padding: "14px 16px", borderRadius: "12px", textAlign: "left",
                        cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                        background: checked ? "rgba(16,185,129,0.06)" : "rgba(255,255,255,0.03)",
                        border: checked ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <span style={{
                        width: "18px", height: "18px", borderRadius: "5px", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        marginTop: "1px", transition: "all 0.15s",
                        background: checked ? "#10b981" : "rgba(255,255,255,0.04)",
                        border: checked ? "1px solid #10b981" : "1px solid rgba(255,255,255,0.1)",
                      }}>
                        {checked && (
                          <svg viewBox="0 0 14 14" fill="none" width="12" height="12">
                            <path d="M2.5 7l3.5 3.5 5.5-7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </span>
                      <span>
                        <span style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#d1d5db", marginBottom: "2px" }}>{opt.label}</span>
                        <span style={{ display: "block", fontSize: "12px", color: "#4b5563" }}>{opt.sub}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <hr style={dividerStyle} />

            {/* Pickup schedule */}
            <section>
              <SectionLabel>Pickup Schedule</SectionLabel>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ position: "relative" }}>
                  <InputIcon>📅</InputIcon>
                  <DarkInput
                    type="date"
                    min={tomorrowISO()}
                    value={form.pickupDate}
                    onChange={(e) => setNested("pickupDate", e.target.value)}
                  />
                </div>
                <div style={{ position: "relative" }}>
                  <InputIcon>🕐</InputIcon>
                  <DarkSelect
                    value={form.timeWindow}
                    onChange={(e) => setNested("timeWindow", e.target.value)}
                  >
                    {TIME_WINDOWS.map((w) => (
                      <option key={w.value} value={w.value}>{w.label}</option>
                    ))}
                  </DarkSelect>
                </div>
              </div>
            </section>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "32px", gap: "12px" }}>
              <SecondaryBtn onClick={handleBack}>← Back</SecondaryBtn>
              <div style={{ flex: 1 }}>
                <PrimaryBtn onClick={handleNext}>Review</PrimaryBtn>
              </div>
            </div>
          </div>
        )}

        {/* ══ STEP 2 — Review & Confirm ══ */}
        {step === 2 && (
          <div style={cardStyle}>

            {/* Route preview */}
            <div style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "14px", padding: "20px", marginBottom: "24px",
            }}>
              <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#4b5563", margin: "0 0 16px" }}>
                Route Preview
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10b981", border: "2px solid rgba(255,255,255,0.15)", display: "block" }} />
                  <span style={{ width: "2px", height: "24px", borderLeft: "2px dashed rgba(255,255,255,0.1)", display: "block" }} />
                  <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444", border: "2px solid rgba(255,255,255,0.15)", display: "block" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
                  <span style={{ fontSize: "14px", fontWeight: 500, color: "#f9fafb" }}>{form.origin.address || "—"}, {form.origin.city}</span>
                  <span style={{ fontSize: "14px", fontWeight: 500, color: "#f9fafb" }}>{form.destination.address || "—"}, {form.destination.city}</span>
                </div>
              </div>
            </div>

            {/* Summary rows */}
            <div>
              {[
                { label: "Priority",     value: <PriorityReviewBadge priority={form.priority} />                      },
                { label: "Delivery",     value: selectedPriority.desc                                                  },
                { label: "Est. cost",    value: `₹ ${selectedPriority.cost.toLocaleString("en-IN")}`                  },
                { label: "Package",      value: form.packageType || "—"                                               },
                { label: "Weight",       value: form.weight ? `${form.weight} kg` : "—"                               },
                { label: "Pickup",       value: `${form.pickupDate || "—"} · ${form.timeWindow}`                      },
                {
                  label: "Constraints",
                  value: form.constraints.length
                    ? form.constraints.map((c) => c.replace(/_/g, " ")).join(", ")
                    : "None",
                },
              ].map(({ label, value }, idx, arr) => (
                <div key={label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "16px 0",
                  borderBottom: idx < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}>
                  <span style={{ fontSize: "14px", color: "#4b5563" }}>{label}</span>
                  <span style={{ fontSize: "14px", fontWeight: 500, color: "#f9fafb", textAlign: "right" }}>{value}</span>
                </div>
              ))}
            </div>

            {form.instructions && (
              <div style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "12px", padding: "16px", marginTop: "16px",
              }}>
                <span style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#4b5563", marginBottom: "6px" }}>
                  Instructions
                </span>
                <span style={{ fontSize: "14px", color: "#9ca3af" }}>{form.instructions}</span>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "32px", gap: "12px" }}>
              <SecondaryBtn onClick={handleBack}>← Edit</SecondaryBtn>
              <div style={{ flex: 1 }}>
                <button
                  onClick={onSubmit}
                  disabled={submitting}
                  style={{
                    width: "100%", background: "linear-gradient(135deg, #10b981, #059669)",
                    color: "white", fontSize: "15px", fontWeight: 600,
                    padding: "16px", borderRadius: "12px", border: "none",
                    cursor: submitting ? "not-allowed" : "pointer", fontFamily: "inherit",
                    boxShadow: "0 0 30px rgba(16,185,129,0.3)",
                    transition: "all 0.2s ease", opacity: submitting ? 0.8 : 1,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  }}
                  onMouseEnter={e => { if (!submitting) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 0 40px rgba(16,185,129,0.5)"; } }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 30px rgba(16,185,129,0.3)"; }}
                >
                  {submitting ? (
                    <>
                      <span style={{
                        width: "16px", height: "16px",
                        border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white",
                        borderRadius: "50%", display: "inline-block",
                        animation: "cspin 0.7s linear infinite",
                      }} />
                      Creating…
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 14 14" fill="none" width="16" height="16">
                        <path d="M2.5 7l3.5 3.5 5.5-7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Confirm Shipment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Spinner keyframe */}
      <style>{`
        @keyframes cspin { to { transform: rotate(360deg); } }
        select option { background: #0d1117; color: #f9fafb; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.6); cursor: pointer; }
      `}</style>
    </div>
  );
}
