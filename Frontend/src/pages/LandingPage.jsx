import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Check,
  ChevronRight,
  Clock3,
  FileText,
  HeartHandshake,
  LockKeyhole,
  LogIn,
  Mic,
  Radar,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserCheck,
  Users,
  Volume2,
} from "lucide-react";

const signalSources = [
  {
    icon: BarChart3,
    title: "Authorized operational data",
    copy: "Duty hours, leave use, deployment duration, transfers and training load.",
    tone: "blue",
  },
  {
    icon: Smartphone,
    title: "Voluntary wellness check-ins",
    copy: "Private mood, sleep and fatigue check-ins from mobile app.",
    tone: "yellow",
  },
  {
    icon: Mic,
    title: "Voice-enabled access",
    copy: "Push-to-talk ESP32 check-ins for moments when typing is not practical.",
    tone: "green",
  },
  {
    icon: FileText,
    title: "Approved assessments",
    copy: "Fixed, auditable fatigue and occupational-stress questionnaires.",
    tone: "coral",
  },
];

const loopSteps = [
  {
    icon: Radar,
    title: "Predict",
    copy: "Detect longitudinal signals of occupational stress and fatigue.",
    tone: "blue",
  },
  {
    icon: BrainCircuit,
    title: "Explain",
    copy: "Show trend, confidence and contributing factors — never black-box score.",
    tone: "yellow",
  },
  {
    icon: HeartHandshake,
    title: "Intervene",
    copy: "Recommend human-led welfare actions, from rest review to confidential support.",
    tone: "green",
  },
  {
    icon: Activity,
    title: "Measure",
    copy: "Track outcomes to learn whether support improves welfare over time.",
    tone: "coral",
  },
];

const roles = [
  {
    icon: UserCheck,
    role: "Personnel",
    access: "Own trends, check-ins and recommendations",
    tone: "yellow",
  },
  {
    icon: HeartHandshake,
    role: "Welfare Officer",
    access: "Authorized individual indicators and intervention history",
    tone: "green",
  },
  {
    icon: Users,
    role: "Commander",
    access: "Aggregate unit trends and workload hotspots",
    tone: "blue",
  },
  {
    icon: LockKeyhole,
    role: "System Admin",
    access: "Security metadata — no routine wellness-content access",
    tone: "coral",
  },
];

const safeguards = [
  "Welfare support, never automatic discipline",
  "Raw journals and voice recordings stay commander-hidden",
  "Encrypted in transit and at rest",
  "Pseudonymous IDs, consent controls and audit trails",
  "Human review before every meaningful action",
  "Self-hosted AI processing, not third-party cloud API",
];

const interventions = [
  {
    signal: "Sustained duty-hour increase",
    action: "Workload and schedule review",
  },
  {
    signal: "Low leave use over time",
    action: "Rest and leave recommendation",
  },
  { signal: "Declining sleep trend", action: "Fatigue and recovery support" },
  {
    signal: "Persistent elevated pattern",
    action: "Confidential welfare check",
  },
];

function LandingPage({ isLoggedIn }) {
  const navigate = useNavigate();
  const rootRef = useRef(null);

  useEffect(() => {
    if (!rootRef.current || typeof window === "undefined") return undefined;
    let cancelled = false;
    let animationFrame;
    let lenis;
    let context;
    let media;

    const setupMotion = async () => {
      const [{ gsap }, { ScrollTrigger }, lenisModule] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("lenis"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (!reducedMotion) {
        const Lenis = lenisModule.default;
        lenis = new Lenis({
          duration: 1.05,
          smoothWheel: true,
          syncTouch: false,
          lerp: 0.085,
        });
        lenis.on("scroll", ScrollTrigger.update);
        const raf = (time) => {
          lenis.raf(time);
          animationFrame = requestAnimationFrame(raf);
        };
        animationFrame = requestAnimationFrame(raf);
      }

      media = gsap.matchMedia();
      context = gsap.context(() => {
        media.add("(prefers-reduced-motion: no-preference)", () => {
          gsap
            .timeline({ defaults: { ease: "power3.out" } })
            .from(".sentinel-nav", { y: -20, autoAlpha: 0, duration: 0.45 })
            .from(
              ".sentinel-hero-eyebrow, .sentinel-hero-title, .sentinel-hero-copy, .sentinel-hero-actions",
              { y: 26, autoAlpha: 0, duration: 0.7, stagger: 0.09 },
              "-=0.12",
            )
            .from(
              ".sentinel-hero-console",
              { y: 32, autoAlpha: 0, scale: 0.98, duration: 0.82 },
              "-=0.48",
            );
          gsap.utils.toArray(".sentinel-reveal").forEach((element) => {
            gsap.from(element, {
              y: 32,
              autoAlpha: 0,
              duration: 0.65,
              ease: "power3.out",
              scrollTrigger: { trigger: element, start: "top 84%", once: true },
            });
          });
          gsap.to(".sentinel-orbit", {
            rotation: 360,
            duration: 22,
            repeat: -1,
            ease: "none",
            transformOrigin: "50% 50%",
          });
        });
      }, rootRef);
      ScrollTrigger.refresh();
    };
    setupMotion();
    return () => {
      cancelled = true;
      if (animationFrame) cancelAnimationFrame(animationFrame);
      lenis?.destroy();
      media?.revert();
      context?.revert();
    };
  }, []);

  const begin = () => navigate(isLoggedIn ? "/journal" : "/login");

  return (
    <main ref={rootRef} className="sentinel-page landing-page">
      <nav className="sentinel-nav" aria-label="Primary navigation">
        <a href="#top" className="sentinel-brand" aria-label="Sentinel home">
          <span className="sentinel-brand-mark">
            <ShieldCheck size={21} strokeWidth={2.6} />
          </span>
          <span>Sentinel</span>
        </a>
        <div className="sentinel-nav-actions">
          <a className="sentinel-nav-link" href="#how-it-works">
            How it works
          </a>
          <a className="sentinel-nav-link" href="#privacy">
            Privacy by design
          </a>
          <button type="button" className="sentinel-login" onClick={begin}>
            {isLoggedIn ? "Open workspace" : "Login"}{" "}
            {isLoggedIn ? <ArrowRight size={16} /> : <LogIn size={16} />}
          </button>
        </div>
      </nav>

      <section
        id="top"
        className="sentinel-hero"
        aria-labelledby="sentinel-hero-title"
      >
        <div className="sentinel-hero-copy-wrap">
          <p className="sentinel-hero-eyebrow">
            <span className="sentinel-status-dot" /> Welfare intelligence for
            uniformed services
          </p>
          <h1 id="sentinel-hero-title" className="sentinel-hero-title">
            See stress patterns <em>early.</em>
            <br />
            Support people sooner.
          </h1>
          <p className="sentinel-hero-copy">
            Sentinel brings authorized operational signals and voluntary
            wellness check-ins into private, human-led welfare system — so
            stress and fatigue get support before they become crisis.
          </p>
          <div className="sentinel-hero-actions">
            <button
              type="button"
              className="sentinel-primary-action"
              onClick={begin}
            >
              {isLoggedIn ? "Open your workspace" : "Explore Sentinel"}{" "}
              <ArrowRight size={18} />
            </button>
            <a href="#how-it-works" className="sentinel-secondary-action">
              See welfare loop <ChevronRight size={18} />
            </a>
          </div>
          <p className="sentinel-hero-note">
            <ShieldCheck size={16} /> Not diagnostic. Not disciplinary. Always
            human-led.
          </p>
        </div>

        <div
          className="sentinel-hero-visual"
          aria-label="Sample Sentinel welfare overview"
        >
          <div className="sentinel-orbit" aria-hidden="true" />
          <article className="sentinel-hero-console">
            <header className="sentinel-console-head">
              <div>
                <p>Welfare overview</p>
                <span>Authorized view · September 2026</span>
              </div>
              <span className="sentinel-console-live">
                <span /> Secure
              </span>
            </header>
            <div className="sentinel-console-risk">
              <div className="sentinel-risk-ring">
                <span>Elevated</span>
                <strong>64</strong>
              </div>
              <div>
                <span className="sentinel-console-label">
                  Trend, last 14 days
                </span>
                <p>Needs welfare conversation — not label.</p>
                <span className="sentinel-trend">
                  <TrendingArrow /> +12% from baseline
                </span>
              </div>
            </div>
            <div className="sentinel-console-factors">
              <span>Contributing signals</span>
              <div>
                <b>Sleep trend</b>
                <i className="sentinel-factor-warning" /> Declining
              </div>
              <div>
                <b>Duty load</b>
                <i className="sentinel-factor-alert" /> Above baseline
              </div>
              <div>
                <b>Leave use</b>
                <i className="sentinel-factor-steady" /> Review due
              </div>
            </div>
            <footer className="sentinel-console-action">
              <HeartHandshake size={17} /> Recommended: confidential welfare
              check
            </footer>
          </article>
          <div className="sentinel-floating-card sentinel-floating-confidence">
            <Sparkles size={16} />
            <span>
              <b>86%</b> confidence
            </span>
          </div>
          <div className="sentinel-floating-card sentinel-floating-privacy">
            <LockKeyhole size={16} />
            <span>Private AI processing</span>
          </div>
        </div>
      </section>

      <section
        className="sentinel-principle sentinel-reveal"
        aria-label="Sentinel principle"
      >
        <p>
          Sentinel converts reactive welfare process into preventive support
          system — while protecting dignity, confidentiality and trust.
        </p>
      </section>

      <section
        id="signals"
        className="sentinel-section sentinel-signals"
        aria-labelledby="signals-title"
      >
        <div className="sentinel-section-heading sentinel-reveal">
          <p className="sentinel-kicker">Four channels. One humane picture.</p>
          <h2 id="signals-title">
            Built from context, <span>never surveillance.</span>
          </h2>
          <p>
            Signals combine carefully over time. Personal wellness data remains
            voluntary, and future wearable integration requires authorization.
          </p>
        </div>
        <div className="sentinel-signal-grid">
          {signalSources.map(({ icon: Icon, title, copy, tone }) => (
            <article
              key={title}
              className={`sentinel-signal-card sentinel-reveal is-${tone}`}
            >
              <span className="sentinel-icon-box">
                <Icon size={24} strokeWidth={2.25} />
              </span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="how-it-works"
        className="sentinel-section sentinel-loop"
        aria-labelledby="loop-title"
      >
        <div className="sentinel-section-heading sentinel-reveal">
          <p className="sentinel-kicker">More than score</p>
          <h2 id="loop-title">
            Predict. Explain. Intervene. <span>Measure.</span>
          </h2>
          <p>
            Complete welfare loop pairs responsible analytics with accountable
            human action.
          </p>
        </div>
        <div className="sentinel-loop-grid">
          {loopSteps.map(({ icon: Icon, title, copy, tone }, index) => (
            <article
              key={title}
              className={`sentinel-loop-step sentinel-reveal is-${tone}`}
            >
              <span className="sentinel-step-number">0{index + 1}</span>
              <span className="sentinel-icon-box">
                <Icon size={24} strokeWidth={2.25} />
              </span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
        <p className="sentinel-loop-footnote sentinel-reveal">
          <BrainCircuit size={17} /> Dedicated risk model for prediction.
          Explainable factors for transparency. Local LLM for plain-language
          guidance only.
        </p>
      </section>

      <section
        className="sentinel-section sentinel-dashboard-section"
        aria-labelledby="dashboard-title"
      >
        <div className="sentinel-dashboard-copy sentinel-reveal">
          <p className="sentinel-kicker">Actionable, not alarming</p>
          <h2 id="dashboard-title">
            Right insight. <span>Right person.</span>
          </h2>
          <p>
            Sentinel separates individual care from organizational oversight, so
            people who can help have useful context — and everyone else sees
            only what needed.
          </p>
          <div className="sentinel-dashboard-points">
            <span>
              <Check size={16} /> Trends over single-day scores
            </span>
            <span>
              <Check size={16} /> Clear drivers and uncertainty
            </span>
            <span>
              <Check size={16} /> Human review before action
            </span>
          </div>
        </div>
        <article
          className="sentinel-welfare-card sentinel-reveal"
          aria-label="Sample authorized welfare action card"
        >
          <header>
            <span>
              <Activity size={18} /> Welfare officer workspace
            </span>
            <span className="sentinel-state-pill">Review due</span>
          </header>
          <div className="sentinel-welfare-person">
            <span>AS</span>
            <div>
              <b>Pseudonymous personnel record</b>
              <small>Authorized care remit</small>
            </div>
          </div>
          <div className="sentinel-mini-chart" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="sentinel-welfare-summary">
            <span>Top factor</span>
            <b>Extended duty duration</b>
            <small>Confidence: moderate · trend: rising</small>
          </div>
          <button
            type="button"
            className="sentinel-card-button"
            onClick={begin}
          >
            Review support options <ArrowRight size={15} />
          </button>
        </article>
      </section>

      <section
        className="sentinel-section sentinel-roles"
        aria-labelledby="roles-title"
      >
        <div className="sentinel-section-heading sentinel-reveal">
          <p className="sentinel-kicker">Least privilege by default</p>
          <h2 id="roles-title">
            Privacy is not setting. <span>It is architecture.</span>
          </h2>
        </div>
        <div className="sentinel-role-grid">
          {roles.map(({ icon: Icon, role, access, tone }) => (
            <article
              key={role}
              className={`sentinel-role-card sentinel-reveal is-${tone}`}
            >
              <span className="sentinel-icon-box">
                <Icon size={23} strokeWidth={2.25} />
              </span>
              <h3>{role}</h3>
              <p>{access}</p>
            </article>
          ))}
        </div>
        <p className="sentinel-command-note sentinel-reveal">
          <LockKeyhole size={17} /> Commander view is aggregate by default. Raw
          journal text and voice recordings are never commander-visible.
        </p>
      </section>

      <section
        id="privacy"
        className="sentinel-section sentinel-privacy"
        aria-labelledby="privacy-title"
      >
        <div className="sentinel-privacy-grid">
          <div className="sentinel-privacy-copy sentinel-reveal">
            <p className="sentinel-kicker">Trust must be engineered</p>
            <h2 id="privacy-title">
              Welfare data deserves <span>hard boundaries.</span>
            </h2>
            <p>
              Sentinel is designed around data minimization, role-based access,
              authorization tracking and auditable record of every sensitive
              view.
            </p>
          </div>
          <ul className="sentinel-safeguard-list">
            {safeguards.map((safeguard) => (
              <li key={safeguard} className="sentinel-reveal">
                <ShieldCheck size={18} /> {safeguard}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        className="sentinel-section sentinel-voice"
        aria-labelledby="voice-title"
      >
        <div
          className="sentinel-voice-device sentinel-reveal"
          aria-hidden="true"
        >
          <div className="sentinel-device-top">
            <span />
            <span />
            <span />
          </div>
          <Mic size={45} strokeWidth={1.75} />
          <span className="sentinel-device-wave">
            <i />
            <i />
            <i />
            <i />
            <i />
          </span>
          <b>Push to talk</b>
        </div>
        <div className="sentinel-voice-copy sentinel-reveal">
          <p className="sentinel-kicker">Designed for field</p>
          <h2 id="voice-title">
            Voice check-in when screen <span>is not practical.</span>
          </h2>
          <p>
            ESP32 concept captures short voluntary push-to-talk check-in,
            securely transmits it when connected and supports multilingual
            access. It is edge input device — all AI processing stays on
            organization-controlled infrastructure.
          </p>
          <div className="sentinel-voice-tags">
            <span>
              <Mic size={15} /> Button-triggered only
            </span>
            <span>
              <Volume2 size={15} /> Multilingual path
            </span>
            <span>
              <Clock3 size={15} /> Delayed sync support
            </span>
          </div>
        </div>
      </section>

      <section
        className="sentinel-section sentinel-intervention"
        aria-labelledby="intervention-title"
      >
        <div className="sentinel-section-heading sentinel-reveal">
          <p className="sentinel-kicker">Support that closes loop</p>
          <h2 id="intervention-title">
            Patterns become <span>practical care.</span>
          </h2>
          <p>
            Recommendations stay within approved welfare workflows. Assessments
            are fixed, validated and human-routed — never invented by AI.
          </p>
        </div>
        <div
          className="sentinel-intervention-table sentinel-reveal"
          role="table"
          aria-label="Example welfare recommendations"
        >
          <div className="sentinel-table-head" role="row">
            <span role="columnheader">Observed pattern</span>
            <span role="columnheader">Human-led support</span>
          </div>
          {interventions.map(({ signal, action }) => (
            <div key={signal} className="sentinel-table-row" role="row">
              <span role="cell">{signal}</span>
              <b role="cell">
                <HeartHandshake size={16} /> {action}
              </b>
            </div>
          ))}
        </div>
        <p className="sentinel-safety-note sentinel-reveal">
          <AlertTriangle size={18} /> Acute safety signals use separate
          conservative classifier and predefined human escalation protocol — not
          general AI.
        </p>
      </section>

      <section
        className="sentinel-cta sentinel-reveal"
        aria-labelledby="cta-title"
      >
        <div>
          <p className="sentinel-kicker">Prototype with integrity</p>
          <h2 id="cta-title">
            Better welfare starts with{" "}
            <span>better signals — and better safeguards.</span>
          </h2>
          <p>
            Sentinel demonstrates credible support pipeline using clearly
            labelled synthetic and public prototype data. Real deployment needs
            authorized institutional data and ethical governance.
          </p>
        </div>
        <button
          type="button"
          className="sentinel-primary-action"
          onClick={begin}
        >
          {isLoggedIn ? "Open Sentinel" : "Enter Sentinel"}{" "}
          <ArrowRight size={18} />
        </button>
      </section>

      <footer className="sentinel-footer">
        <div className="sentinel-brand">
          <span className="sentinel-brand-mark">
            <ShieldCheck size={20} strokeWidth={2.6} />
          </span>
          <span>Sentinel</span>
        </div>
        <p>Privacy-first welfare intelligence for uniformed services.</p>
        <span>Built by Team Rocket🚀</span>
      </footer>
    </main>
  );
}

function TrendingArrow() {
  return <span aria-hidden="true">↗</span>;
}

export default LandingPage;
