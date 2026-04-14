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

function Badge({ priority }) {
  const colors = {
    low:    "badge-green",
    medium: "badge-amber",
    high:   "badge-red",
  };
  return (
    <span className={`badge ${colors[priority]}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">⚠ {message}</p>;
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

/* ── Address section sub-component ──────── */
function AddressSection({ title, prefix, form, setNested, errors }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-2 h-2 rounded-full ${prefix === "origin" ? "bg-slate-700" : "bg-emerald-500"}`} />
        <p className="form-label mb-0">{title}</p>
      </div>
      <div className="space-y-3">
        <div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">📍</span>
            <input
              type="text"
              placeholder="Street address"
              value={form[prefix].address}
              onChange={(e) => setNested(`${prefix}.address`, e.target.value)}
              className="form-input pl-9"
            />
          </div>
          <FieldError message={errors[`${prefix}.address`]} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🏙️</span>
              <input
                type="text"
                placeholder="City"
                value={form[prefix].city}
                onChange={(e) => setNested(`${prefix}.city`, e.target.value)}
                className="form-input pl-9"
              />
            </div>
            <FieldError message={errors[`${prefix}.city`]} />
          </div>
          <div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">#</span>
              <input
                type="text"
                placeholder="PIN code"
                maxLength={6}
                value={form[prefix].pin}
                onChange={(e) => setNested(`${prefix}.pin`, e.target.value)}
                className="form-input pl-9"
              />
            </div>
            <FieldError message={errors[`${prefix}.pin`]} />
          </div>
        </div>
      </div>
    </section>
  );
}

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

  // ── render ────────────────────────────────────────────────────
  return (
    <div className="bg-slate-50 min-h-screen">
      <Navbar />
      <Toaster position="top-right" toastOptions={{ style: { fontFamily: "Inter, sans-serif" } }} />

      <div className="max-w-2xl mx-auto px-4 py-8 page-enter">

        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">New Shipment</h1>
          <p className="text-sm text-slate-400 mt-1">Fill in route, priority, and delivery constraints</p>
        </div>

        {/* ── Stepper ─────────────────────────────── */}
        <div className="flex items-start mb-8">
          {STEPS.map((s, i) => {
            const isDone    = doneSteps.has(i);
            const isActive  = i === step;
            const isLocked  = !isDone && i > step;
            return (
              <div key={i} className="flex items-start flex-1">
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => goToStep(i)}
                    disabled={isLocked}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-200
                      ${isDone
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-200"
                        : isActive
                          ? "bg-white border-emerald-500 text-emerald-700 shadow-md"
                          : "bg-white border-slate-200 text-slate-400 cursor-default"
                      }`}
                  >
                    {isDone ? "✓" : i + 1}
                  </button>
                  <div className="text-center">
                    <p className={`text-xs font-semibold ${isActive ? "text-slate-800" : isDone ? "text-emerald-600" : "text-slate-400"}`}>
                      {s.label}
                    </p>
                    <p className="text-xs text-slate-400 hidden sm:block">{s.desc}</p>
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mt-4 mx-3 rounded-full transition-all duration-300
                    ${isDone ? "bg-emerald-400" : "bg-slate-200"}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* ══ STEP 0 — Route ══ */}
        {step === 0 && (
          <div className="card p-8 space-y-6 animate-[fadeSlideIn_0.2s_ease-out]">

            <AddressSection title="Origin" prefix="origin"      form={form} setNested={setNested} errors={errors} />
            <hr className="border-slate-100" />
            <AddressSection title="Destination" prefix="destination" form={form} setNested={setNested} errors={errors} />
            <hr className="border-slate-100" />

            {/* Cargo */}
            <section>
              <p className="form-label">Cargo Details</p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">⚖️</span>
                  <input
                    type="number"
                    placeholder="Weight (kg)"
                    min="0.1"
                    step="0.1"
                    value={form.weight}
                    onChange={(e) => setNested("weight", e.target.value)}
                    className="form-input pl-9"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">📦</span>
                  <select
                    value={form.packageType}
                    onChange={(e) => setNested("packageType", e.target.value)}
                    className="form-input pl-9 appearance-none"
                  >
                    <option value="">Package type</option>
                    {PACKAGE_TYPES.map((t) => (
                      <option key={t} value={t.toLowerCase()}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <textarea
                placeholder="Special instructions (optional)"
                maxLength={200}
                rows={3}
                value={form.instructions}
                onChange={(e) => setNested("instructions", e.target.value)}
                className="form-input resize-none"
              />
              <p className="text-xs text-slate-400 text-right mt-1">{form.instructions.length}/200</p>
            </section>

            <div className="flex justify-end pt-2">
              <button onClick={handleNext} className="btn-primary px-7 gap-2 flex items-center">
                Continue
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
              </button>
            </div>
          </div>
        )}

        {/* ══ STEP 1 — Priority & Constraints ══ */}
        {step === 1 && (
          <div className="card p-8 space-y-6 animate-[fadeSlideIn_0.2s_ease-out]">

            {/* Priority cards */}
            <section>
              <p className="form-label">Delivery Priority</p>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {PRIORITY_OPTIONS.map((opt) => {
                  const isSelected = form.priority === opt.value;
                  const accent = {
                    low:    isSelected ? "border-emerald-400 bg-emerald-50 shadow-emerald-100" : "border-slate-200 hover:border-emerald-300",
                    medium: isSelected ? "border-amber-400   bg-amber-50   shadow-amber-100"   : "border-slate-200 hover:border-amber-300",
                    high:   isSelected ? "border-red-400     bg-red-50     shadow-red-100"     : "border-slate-200 hover:border-red-300",
                  }[opt.value];
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setNested("priority", opt.value)}
                      className={`border-2 rounded-xl p-4 text-center transition-all duration-150 shadow-sm ${accent}`}
                    >
                      <div className="text-2xl mb-1.5">{opt.icon}</div>
                      <div className="text-sm font-semibold text-slate-800">{opt.label}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{opt.desc}</div>
                    </button>
                  );
                })}
              </div>

              {/* Estimates */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Est. delivery", value: selectedPriority.desc                                          },
                  { label: "Est. cost",     value: `₹ ${selectedPriority.cost.toLocaleString("en-IN")}`           },
                  { label: "Distance",      value: "1,388 km"                                                     },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-xs text-slate-400 mb-1">{label}</p>
                    <p className="text-sm font-bold text-slate-800">{value}</p>
                  </div>
                ))}
              </div>
            </section>

            <hr className="border-slate-100" />

            {/* Constraints */}
            <section>
              <p className="form-label">Route Constraints</p>
              <div className="grid grid-cols-2 gap-3">
                {CONSTRAINT_OPTIONS.map((opt) => {
                  const checked = form.constraints.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      onClick={() => toggleConstraint(opt.value)}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all duration-150
                        ${checked ? "border-emerald-300 bg-emerald-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}
                    >
                      <span className={`w-4 h-4 rounded-md flex items-center justify-center border flex-shrink-0 text-xs mt-0.5 transition-all
                        ${checked ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300"}`}>
                        {checked && "✓"}
                      </span>
                      <span>
                        <span className="block text-sm font-medium text-slate-800">{opt.label}</span>
                        <span className="block text-xs text-slate-500 mt-0.5">{opt.sub}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <hr className="border-slate-100" />

            {/* Pickup schedule */}
            <section>
              <p className="form-label">Pickup Schedule</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">📅</span>
                  <input
                    type="date"
                    min={tomorrowISO()}
                    value={form.pickupDate}
                    onChange={(e) => setNested("pickupDate", e.target.value)}
                    className="form-input pl-9"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🕐</span>
                  <select
                    value={form.timeWindow}
                    onChange={(e) => setNested("timeWindow", e.target.value)}
                    className="form-input pl-9 appearance-none"
                  >
                    {TIME_WINDOWS.map((w) => (
                      <option key={w.value} value={w.value}>{w.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <div className="flex justify-between pt-2">
              <button onClick={handleBack} className="btn-secondary">← Back</button>
              <button onClick={handleNext} className="btn-primary flex items-center gap-2">
                Review
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
              </button>
            </div>
          </div>
        )}

        {/* ══ STEP 2 — Review & Confirm ══ */}
        {step === 2 && (
          <div className="card p-8 space-y-6 animate-[fadeSlideIn_0.2s_ease-out]">

            {/* Route preview */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Route Preview</p>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex flex-col gap-1 items-center">
                  <span className="w-3 h-3 rounded-full bg-slate-700 border-2 border-white shadow" />
                  <span className="w-0.5 h-6 bg-dashed-slate-300 border-l-2 border-dashed border-slate-200" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow" />
                </div>
                <div className="flex flex-col gap-4 flex-1">
                  <span className="font-medium text-slate-700">{form.origin.address || "—"}, {form.origin.city}</span>
                  <span className="font-medium text-slate-700">{form.destination.address || "—"}, {form.destination.city}</span>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="divide-y divide-slate-50">
              {[
                { label: "Priority",     value: <Badge priority={form.priority} />                                    },
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
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-3">
                  <span className="text-sm text-slate-500">{label}</span>
                  <span className="text-sm font-semibold text-slate-800 text-right">{value}</span>
                </div>
              ))}
            </div>

            {form.instructions && (
              <div className="bg-slate-50 rounded-xl p-4 text-sm border border-slate-100">
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Instructions</span>
                <span className="text-slate-600">{form.instructions}</span>
              </div>
            )}

            <div className="flex justify-between pt-2">
              <button onClick={handleBack} className="btn-secondary">← Edit</button>
              <button
                onClick={onSubmit}
                disabled={submitting}
                className="btn-primary flex items-center gap-2 px-7"
              >
                {submitting ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating…</>
                ) : (
                  <><span>✓</span> Confirm Shipment</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
