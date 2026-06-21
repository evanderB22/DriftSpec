import { useState } from "react";

const MAKES = ["BMW", "Toyota", "Honda", "Ford", "Subaru", "Nissan", "Audi", "Volkswagen", "Chevrolet", "Mitsubishi", "Mazda", "Mercedes-Benz", "Hyundai", "Dodge", "Lexus"];
const GOALS = [
  { id: "performance", label: "Performance", icon: "⚡", desc: "More power & speed" },
  { id: "stance", label: "Stance / Look", icon: "🎨", desc: "Aesthetics & fitment" },
  { id: "track", label: "Track / Handling", icon: "🏁", desc: "Cornering & braking" },
  { id: "daily", label: "Daily Driver", icon: "🛣️", desc: "Comfort + light mods" },
  { id: "audio", label: "Audio / Interior", icon: "🔊", desc: "Sound & cabin upgrades" },
  { id: "offroad", label: "Off-Road", icon: "🏔️", desc: "Lift, tires & skids" },
];
const BUDGETS = ["Under $500", "$500–$2,000", "$2,000–$5,000", "$5,000–$15,000", "$15,000+"];
const EXPERIENCES = ["Complete beginner", "Some DIY experience", "Intermediate — done basic mods", "Advanced — built cars before"];

const FREE_LIMIT = 1;

export default function App() {
  const [screen, setScreen] = useState("home");
  const [form, setForm] = useState({ make: "", model: "", year: "", goals: [], budget: "", experience: "", notes: "" });
  const [result, setResult] = useState(null);
  const [usageCount, setUsageCount] = useState(0);
  const [error, setError] = useState(null);

  const toggleGoal = (id) => {
    setForm(f => ({
      ...f,
      goals: f.goals.includes(id) ? f.goals.filter(g => g !== id) : [...f.goals, id]
    }));
  };

  const isFormValid = form.make && form.model && form.year && form.goals.length > 0 && form.budget && form.experience;

  const generatePlan = async () => {
    if (usageCount >= FREE_LIMIT) { setScreen("paywall"); return; }
    setScreen("loading");
    setError(null);

    try {
      // Calls OUR OWN serverless function — never the Anthropic API directly.
      // The real API key lives only on the server, never in browser code.
      const response = await fetch("/.netlify/functions/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form, goalLabels: form.goals.map(g => GOALS.find(x => x.id === g)?.label) })
      });

      if (!response.ok) throw new Error("Request failed");

      const parsed = await response.json();
      setResult(parsed);
      setUsageCount(c => c + 1);
      setScreen("result");
    } catch (e) {
      setError("Something went wrong generating your plan. Please try again.");
      setScreen("form");
    }
  };

  const diffColor = (d) => d === "Easy" ? "#43C6AC" : d === "Medium" ? "#F7971E" : "#FF6584";

  if (screen === "home") return (
    <div style={styles.page}>
      <div style={styles.homeWrap}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🔧</div>
        <div style={styles.badge}>AI-Powered • Beta</div>
        <h1 style={styles.heroTitle}>Drift<span style={{ color: "#2D7FF9" }}>Spec</span></h1>
        <p style={styles.heroSub}>Tell us your car and your goals. Get a step-by-step modification plan built around your budget — in seconds.</p>

        <div style={styles.featureGrid}>
          {[
            ["⚡", "Instant plans", "Tailored to your exact car & budget"],
            ["🔩", "Real parts", "Specific mod names, not generic advice"],
            ["📋", "Staged roadmap", "Know what to do first, second, third"],
            ["💰", "Cost estimates", "No nasty surprises"],
          ].map(([icon, title, desc]) => (
            <div key={title} style={styles.featureCard}>
              <span style={{ fontSize: 22 }}>{icon}</span>
              <div style={{ fontWeight: 700, fontSize: 13, marginTop: 6 }}>{title}</div>
              <div style={{ fontSize: 12, color: "#7070A0", marginTop: 2 }}>{desc}</div>
            </div>
          ))}
        </div>

        <button style={styles.ctaBtn} onClick={() => setScreen("form")}>
          Build My Mod Plan →
        </button>
        <p style={{ fontSize: 12, color: "#5050A0", marginTop: 12 }}>Free plan includes 1 build plan • No account needed</p>
      </div>
    </div>
  );

  if (screen === "form") return (
    <div style={styles.page}>
      <div style={styles.formWrap}>
        <button style={styles.backBtn} onClick={() => setScreen("home")}>← Back</button>
        <h2 style={styles.formTitle}>Your Car</h2>

        <div style={styles.row3}>
          <div style={styles.field}>
            <label style={styles.label}>Year</label>
            <input style={styles.input} type="number" placeholder="e.g. 2018" min="1980" max="2025"
              value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Make</label>
            <select style={styles.input} value={form.make} onChange={e => setForm(f => ({ ...f, make: e.target.value }))}>
              <option value="">Select…</option>
              {MAKES.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Model</label>
            <input style={styles.input} placeholder="e.g. WRX STI" value={form.model}
              onChange={e => setForm(f => ({ ...f, model: e.target.value }))} />
          </div>
        </div>

        <h2 style={{ ...styles.formTitle, marginTop: 24 }}>Build Goals <span style={{ color: "#5050A0", fontSize: 13, fontWeight: 400 }}>(pick all that apply)</span></h2>
        <div style={styles.goalGrid}>
          {GOALS.map(g => {
            const sel = form.goals.includes(g.id);
            return (
              <button key={g.id} style={{ ...styles.goalCard, ...(sel ? styles.goalCardSel : {}) }}
                onClick={() => toggleGoal(g.id)}>
                <span style={{ fontSize: 24 }}>{g.icon}</span>
                <div style={{ fontWeight: 700, fontSize: 13, marginTop: 4 }}>{g.label}</div>
                <div style={{ fontSize: 11, color: sel ? "#aaa" : "#5050A0" }}>{g.desc}</div>
              </button>
            );
          })}
        </div>

        <h2 style={{ ...styles.formTitle, marginTop: 24 }}>Total Budget</h2>
        <div style={styles.chipRow}>
          {BUDGETS.map(b => (
            <button key={b} style={{ ...styles.chip, ...(form.budget === b ? styles.chipSel : {}) }}
              onClick={() => setForm(f => ({ ...f, budget: b }))}>{b}</button>
          ))}
        </div>

        <h2 style={{ ...styles.formTitle, marginTop: 24 }}>Your Experience</h2>
        <div style={styles.chipRow}>
          {EXPERIENCES.map(e => (
            <button key={e} style={{ ...styles.chip, ...(form.experience === e ? styles.chipSel : {}) }}
              onClick={() => setForm(f => ({ ...f, experience: e }))}>{e}</button>
          ))}
        </div>

        <h2 style={{ ...styles.formTitle, marginTop: 24 }}>Anything else? <span style={{ color: "#5050A0", fontSize: 13, fontWeight: 400 }}>(optional)</span></h2>
        <textarea style={{ ...styles.input, height: 72, resize: "none", fontFamily: "inherit" }}
          placeholder="e.g. I want to keep it street legal, already have coilovers, targeting 400whp…"
          value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />

        {error && <div style={{ background: "#FF638420", border: "1px solid #FF638460", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#FF9090", marginTop: 12 }}>{error}</div>}

        <button style={{ ...styles.ctaBtn, marginTop: 24, opacity: isFormValid ? 1 : 0.4, cursor: isFormValid ? "pointer" : "default" }}
          onClick={isFormValid ? generatePlan : undefined}>
          Generate My Plan ⚡
        </button>
      </div>
    </div>
  );

  if (screen === "loading") return (
    <div style={{ ...styles.page, justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16, animation: "spin 1.5s linear infinite" }}>⚙️</div>
        <style>{`@keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }`}</style>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Building your plan…</div>
        <div style={{ color: "#7070A0", fontSize: 14, marginTop: 6 }}>Analyzing your {form.year} {form.make} {form.model}</div>
      </div>
    </div>
  );

  if (screen === "paywall") return (
    <div style={styles.page}>
      <div style={styles.homeWrap}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px" }}>You've used your free plan</h2>
        <p style={{ color: "#7070A0", fontSize: 15, marginBottom: 28 }}>Upgrade to Pro for unlimited build plans, part links, and a compatibility checker.</p>

        <div style={{ background: "#16161E", border: "1px solid #2D7FF940", borderRadius: 16, padding: "24px 20px", marginBottom: 20, maxWidth: 360, width: "100%" }}>
          <div style={{ fontSize: 13, color: "#2D7FF9", fontWeight: 700, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>Pro Plan</div>
          <div style={{ fontSize: 32, fontWeight: 900, marginBottom: 4 }}>$9<span style={{ fontSize: 16, fontWeight: 400, color: "#7070A0" }}>/month</span></div>
          {["Unlimited mod plans", "Clickable part links", "Compatibility warnings", "Save & compare builds", "Priority support"].map(f => (
            <div key={f} style={{ fontSize: 14, color: "#C0C0D8", padding: "6px 0", borderBottom: "1px solid #ffffff08", display: "flex", gap: 8 }}>
              <span style={{ color: "#43C6AC" }}>✓</span> {f}
            </div>
          ))}
        </div>

        <button style={styles.ctaBtn}>Upgrade to Pro →</button>
        <button style={{ ...styles.backBtn, display: "block", margin: "16px auto 0", cursor: "pointer" }} onClick={() => setScreen("home")}>← Back to home</button>
      </div>
    </div>
  );

  if (screen === "result" && result) return (
    <div style={styles.page}>
      <div style={styles.formWrap}>
        <div style={{ background: "linear-gradient(135deg, #2D7FF918, #2D7FF908)", border: "1px solid #2D7FF930", borderRadius: 14, padding: "18px 20px", marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "#2D7FF9", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Your Build Plan</div>
          <div style={{ fontWeight: 800, fontSize: 19 }}>{form.year} {form.make} {form.model}</div>
          <div style={{ color: "#9090B0", fontSize: 13, marginTop: 4 }}>{result.summary}</div>
          <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={styles.tag}>💰 {result.totalEstimate}</span>
            {form.goals.map(g => <span key={g} style={styles.tag}>{GOALS.find(x => x.id === g)?.icon} {GOALS.find(x => x.id === g)?.label}</span>)}
          </div>
        </div>

        {result.stages?.map((stage, si) => (
          <div key={si} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#2D7FF9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{si + 1}</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{stage.stage}</div>
                <div style={{ fontSize: 12, color: "#7070A0" }}>{stage.priority}</div>
              </div>
            </div>

            {stage.mods?.map((mod, mi) => (
              <div key={mi} style={{ background: "#16161E", border: "1px solid #ffffff10", borderRadius: 12, padding: "14px 16px", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{mod.name}</div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: diffColor(mod.difficulty), background: diffColor(mod.difficulty) + "18", padding: "2px 8px", borderRadius: 20 }}>{mod.difficulty}</span>
                    {mod.diy && <span style={{ fontSize: 11, fontWeight: 700, color: "#43C6AC", background: "#43C6AC18", padding: "2px 8px", borderRadius: 20 }}>DIY ✓</span>}
                  </div>
                </div>
                <div style={{ fontSize: 13, color: "#9090B0", margin: "5px 0 8px" }}>{mod.why}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#E8E8F0" }}>{mod.cost}</div>
              </div>
            ))}
          </div>
        ))}

        {result.warnings?.length > 0 && (
          <div style={{ background: "#F7971E12", border: "1px solid #F7971E30", borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#F7971E", marginBottom: 8 }}>⚠️ Watch out</div>
            {result.warnings.map((w, i) => <div key={i} style={{ fontSize: 13, color: "#C0A060", marginBottom: 4 }}>• {w}</div>)}
          </div>
        )}

        {result.proTip && (
          <div style={{ background: "#6C63FF12", border: "1px solid #6C63FF30", borderRadius: 12, padding: "14px 16px", marginBottom: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#6C63FF", marginBottom: 6 }}>💡 Expert tip</div>
            <div style={{ fontSize: 13, color: "#B0B0D0" }}>{result.proTip}</div>
          </div>
        )}

        <div style={{ background: "linear-gradient(135deg, #2D7FF918, #6C63FF12)", border: "1px solid #2D7FF930", borderRadius: 14, padding: "20px", marginBottom: 16, textAlign: "center" }}>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>Want part links & compatibility check?</div>
          <div style={{ fontSize: 13, color: "#9090B0", marginBottom: 14 }}>Upgrade to Pro to get clickable parts, save this build, and run unlimited plans.</div>
          <button style={{ ...styles.ctaBtn, padding: "11px 28px", fontSize: 14, width: "auto" }} onClick={() => setScreen("paywall")}>Upgrade to Pro — $9/mo</button>
        </div>

        <button style={{ ...styles.chip, width: "100%", textAlign: "center", padding: "13px" }} onClick={() => { setResult(null); setScreen("form"); }}>
          ← Plan a different build
        </button>
      </div>
    </div>
  );

  return null;
}

const styles = {
  page: { background: "#0A0E16", minHeight: "100vh", color: "#E8E8F0", fontFamily: "'Inter', system-ui, sans-serif", display: "flex", flexDirection: "column", alignItems: "center" },
  homeWrap: { maxWidth: 480, width: "100%", padding: "48px 20px 60px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" },
  formWrap: { maxWidth: 600, width: "100%", padding: "24px 16px 60px" },
  badge: { fontSize: 11, fontWeight: 700, color: "#2D7FF9", background: "#2D7FF918", border: "1px solid #2D7FF930", borderRadius: 20, padding: "4px 12px", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 },
  heroTitle: { fontSize: "clamp(36px, 8vw, 52px)", fontWeight: 900, margin: "0 0 12px", letterSpacing: "-0.03em" },
  heroSub: { fontSize: 16, color: "#8080A8", lineHeight: 1.6, marginBottom: 28, maxWidth: 380 },
  featureGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%", marginBottom: 28 },
  featureCard: { background: "#16161E", border: "1px solid #ffffff10", borderRadius: 12, padding: "14px 12px", textAlign: "left" },
  ctaBtn: { background: "#2D7FF9", color: "#fff", border: "none", borderRadius: 12, padding: "14px 32px", fontSize: 15, fontWeight: 800, cursor: "pointer", width: "100%", letterSpacing: "-0.01em" },
  backBtn: { background: "none", border: "none", color: "#7070A0", fontSize: 14, cursor: "pointer", padding: "0 0 16px" },
  formTitle: { fontSize: 16, fontWeight: 800, margin: "0 0 12px", letterSpacing: "-0.01em" },
  row3: { display: "grid", gridTemplateColumns: "1fr 1.4fr 1.4fr", gap: 10 },
  field: { display: "flex", flexDirection: "column" },
  label: { fontSize: 11, fontWeight: 700, color: "#6060A0", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 },
  input: { background: "#16161E", border: "1px solid #ffffff15", borderRadius: 10, padding: "10px 12px", color: "#E8E8F0", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" },
  goalGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 },
  goalCard: { background: "#16161E", border: "1.5px solid #ffffff10", borderRadius: 12, padding: "12px 8px", cursor: "pointer", color: "#E8E8F0", textAlign: "center" },
  goalCardSel: { background: "#2D7FF918", borderColor: "#2D7FF9" },
  chipRow: { display: "flex", flexWrap: "wrap", gap: 8 },
  chip: { background: "#16161E", border: "1.5px solid #ffffff10", borderRadius: 20, padding: "8px 14px", fontSize: 13, color: "#C0C0D8", cursor: "pointer" },
  chipSel: { background: "#2D7FF918", borderColor: "#2D7FF9", color: "#fff" },
  tag: { fontSize: 12, fontWeight: 600, background: "#ffffff10", borderRadius: 20, padding: "3px 10px", color: "#C0C0D8" },
  };
