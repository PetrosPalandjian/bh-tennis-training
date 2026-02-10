// DrillViewer Component
function DrillViewer({drill}) {
  const [step, setStep] = React.useState(-1);
  const [playing, setPlaying] = React.useState(false);
  const [showAll, setShowAll] = React.useState(false);
  const tmr = React.useRef(null);

  // Reset when drill changes
  React.useEffect(() => {
    setStep(-1);
    setPlaying(false);
    setShowAll(false);
  }, [drill && drill.id]);

  // Auto-play timer
  React.useEffect(() => {
    if (!playing || !drill) return;
    tmr.current = setInterval(() => {
      setStep(s => {
        if (s >= drill.steps.length - 1) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 1200);
    return () => clearInterval(tmr.current);
  }, [playing, drill]);

  if (!drill) return null;
  const steps = drill.steps || [];
  const maxStep = steps.length - 1;

  // Button style helper
  const btn = (bg, small) => ({
    padding: small ? "6px 10px" : "8px 14px",
    background: bg,
    color: BH.white,
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: small ? "12px" : "13px",
    fontWeight: "bold",
    flex: small ? undefined : 1,
  });

  return (
    <div style={{display:"flex", flexDirection:"column", gap:"12px"}}>
      {/* Court visualization */}
      <Court
        courtType={drill.courtType}
        players={drill.players}
        steps={steps}
        activeStep={step}
        showAll={showAll}
      />

      {/* Step counter */}
      <div style={{textAlign:"center", fontSize:"13px", color:BH.g700, fontWeight:"bold"}}>
        Step {Math.max(0, step) + 1} / {steps.length}
        {showAll && <span style={{color:BH.maroon, marginLeft:"8px"}}>(All visible)</span>}
      </div>

      {/* Playback controls */}
      <div style={{display:"flex", gap:"6px", flexWrap:"wrap", justifyContent:"center"}}>
        <button onClick={() => { setStep(-1); setPlaying(false); setShowAll(false); }} style={btn(BH.g500)}>
          Reset
        </button>
        <button onClick={() => setStep(s => Math.max(-1, s - 1))} style={btn(BH.navy)}
                disabled={step <= -1}>
          ← Back
        </button>
        <button onClick={() => {
          if (playing) { setPlaying(false); }
          else { if (step >= maxStep) setStep(-1); setPlaying(true); }
        }} style={btn(playing ? BH.shotRed : BH.shotBlue)}>
          {playing ? "⏸ Pause" : "▶ Play"}
        </button>
        <button onClick={() => setStep(s => Math.min(maxStep, s + 1))} style={btn(BH.navy)}
                disabled={step >= maxStep}>
          Next →
        </button>
        <button onClick={() => { setShowAll(!showAll); setStep(maxStep); }} style={btn(BH.maroon)}>
          {showAll ? "Step View" : "Show All"}
        </button>
      </div>

      {/* Step-by-step breakdown */}
      <div style={{background:BH.white, padding:"12px 16px", borderRadius:"8px", border:`1px solid ${BH.g300}`}}>
        <div style={{fontSize:"12px", fontWeight:"bold", color:BH.navy, marginBottom:"8px"}}>
          Step Breakdown
        </div>
        {steps.map((s, i) => {
          const isActive = i === step;
          const isPast = i < step;
          const desc = s.t === "hit"
            ? `${s.hitter} hits ${(s.shot||"").replace(/_/g," ")}${s.note ? " — "+s.note : ""}`
            : `Player moves${s.note ? " — "+s.note : " to position"}`;
          return (
            <div key={i} style={{
              padding:"6px 10px", marginBottom:"2px", borderRadius:"4px", fontSize:"12px",
              display:"flex", gap:"8px", alignItems:"center",
              background: isActive ? BH.maroon : "transparent",
              color: isActive ? BH.white : isPast ? BH.g400 : BH.g700,
              fontWeight: isActive ? "bold" : "normal",
              transition: "all 0.2s"
            }}>
              <span style={{minWidth:"20px", fontWeight:"bold", color: isActive ? BH.white : BH.g400}}>
                {s.t === "hit" ? s.n : "·"}
              </span>
              <span>{desc}</span>
            </div>
          );
        })}
      </div>

      {/* Coaching tips */}
      {drill.tips && drill.tips.length > 0 && (
        <div style={{background:BH.white, padding:"14px 16px", borderRadius:"8px", border:`1px solid ${BH.g300}`}}>
          <div style={{fontSize:"12px", fontWeight:"bold", color:BH.navy, marginBottom:"6px"}}>
            Coaching Tips
          </div>
          <ul style={{margin:0, paddingLeft:"18px", fontSize:"12px", color:BH.g700, lineHeight:"1.7"}}>
            {drill.tips.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>
      )}

      {/* YouTube embed with timestamp support */}
      {drill.youtubeId && (
        <div style={{borderRadius:"8px", overflow:"hidden", border:`1px solid ${BH.g300}`}}>
          <div style={{padding:"8px 12px", background:BH.navy, display:"flex", alignItems:"center", gap:"8px"}}>
            <span style={{fontSize:"12px", fontWeight:"bold", color:BH.white}}>Video Demo</span>
            {(drill.youtubeStart || drill.youtubeEnd) && (
              <span style={{fontSize:"10px", color:BH.maroon, opacity:0.8}}>
                {drill.youtubeStart ? `from ${Math.floor(drill.youtubeStart/60)}:${String(drill.youtubeStart%60).padStart(2,"0")}` : ""}
                {drill.youtubeEnd ? ` to ${Math.floor(drill.youtubeEnd/60)}:${String(drill.youtubeEnd%60).padStart(2,"0")}` : ""}
              </span>
            )}
          </div>
          <div style={{position:"relative", paddingBottom:"56.25%", height:0, overflow:"hidden"}}>
            <iframe
              src={`https://www.youtube.com/embed/${drill.youtubeId}?${drill.youtubeStart ? "start="+drill.youtubeStart : ""}${drill.youtubeEnd ? "&end="+drill.youtubeEnd : ""}&rel=0&modestbranding=1`}
              frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
              allowFullScreen style={{position:"absolute", top:0, left:0, width:"100%", height:"100%"}}/>
          </div>
        </div>
      )}
    </div>
  );
}

// DrillTimer Component
function DrillTimer({duration, resetKey, onNext, canNext, isAdmin}) {
  const [running, setRunning] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState(duration);
  const tmr = React.useRef(null);

  React.useEffect(() => {
    setRunning(false);
    setTimeLeft(duration);
    if (tmr.current) clearInterval(tmr.current);
    tmr.current = null;
  }, [duration, resetKey]);

  React.useEffect(() => {
    if (!running) {
      if (tmr.current) clearInterval(tmr.current);
      tmr.current = null;
      return;
    }
    tmr.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setRunning(false);
          if (tmr.current) clearInterval(tmr.current);
          tmr.current = null;
          try { snd.done(); } catch(e) {}
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (tmr.current) clearInterval(tmr.current); };
  }, [running]);

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  const btn = (bg) => ({
    padding:"8px 12px",
    background:bg,
    color:BH.white,
    border:"none",
    borderRadius:"6px",
    cursor:"pointer",
    fontSize:"12px",
    fontWeight:"bold"
  });

  return (
    <div style={{background:BH.white, border:`1px solid ${BH.g300}`, borderRadius:"8px", padding:"12px 14px", marginBottom:"10px"}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px", gap:"8px"}}>
        <div style={{fontSize:"12px", fontWeight:"bold", color:BH.navy}}>Drill Timer</div>
        <div style={{fontSize:"18px", fontWeight:"bold", color:BH.maroon}}>{mm}:{ss}</div>
      </div>
      <div style={{display:"flex", gap:"8px", flexWrap:"wrap"}}>
        <button onClick={() => { if (isAdmin) setRunning(r => !r); }} disabled={!isAdmin}
          style={{...btn(running ? BH.shotRed : BH.shotBlue), cursor:isAdmin ? "pointer" : "not-allowed", opacity:isAdmin ? 1 : 0.6}}>
          {running ? "Pause" : "Start"}
        </button>
        <button onClick={() => { if (isAdmin) setTimeLeft(duration); }} disabled={!isAdmin}
          style={{...btn(BH.g500), cursor:isAdmin ? "pointer" : "not-allowed", opacity:isAdmin ? 1 : 0.6}}>Reset</button>
        <button onClick={() => { if (isAdmin) setTimeLeft(t => t + 30); }} disabled={!isAdmin}
          style={{...btn(BH.navy), cursor:isAdmin ? "pointer" : "not-allowed", opacity:isAdmin ? 1 : 0.6}}>+30s</button>
        <button onClick={onNext} disabled={!canNext} style={{
          ...btn(canNext ? BH.maroon : BH.g300),
          cursor: canNext ? "pointer" : "not-allowed"
        }}>Next Drill</button>
      </div>
    </div>
  );
}

// StretchTimer Component
function StretchTimer({label, color, session, kind, isAdmin, onAdminStart, onAdminPause, onAdminResume, onAdminReset, list, work, rest}) {
  const [tick, setTick] = React.useState(0);
  const tmr = React.useRef(null);

  const getStatus = () => session ? session[`${kind}_status`] : "idle";
  const getStart = () => session ? session[`${kind}_start_time`] : null;
  const getElapsedAtPause = () => session ? (session[`${kind}_elapsed_at_pause`] || 0) : 0;
  const getElapsed = () => {
    const status = getStatus();
    if (status === "paused") return getElapsedAtPause();
    if (status !== "running") return 0;
    const start = getStart();
    if (!start) return 0;
    return Math.max(0, Math.floor((Date.now() - Date.parse(start)) / 1000));
  };

  React.useEffect(() => {
    if (!session) return;
    setTick(t => t + 1);
    tmr.current = setInterval(() => setTick(t => t + 1), 1000);
    return () => { if (tmr.current) clearInterval(tmr.current); };
  }, [session]);

  const safeWork = Math.max(1, work || 0);
  const safeRest = Math.max(0, rest || 0);
  const count = Array.isArray(list) ? list.length : 0;
  const per = safeWork + safeRest;
  const total = count > 0 ? (count * safeWork + Math.max(0, count - 1) * safeRest) : 0;
  const elapsed = Math.min(getElapsed(), total);

  let idx = -1;
  let phase = "idle";
  let timeLeft = safeWork;
  let title = "No stretches selected";
  if (count > 0) {
    if (elapsed >= total) {
      idx = count - 1;
      phase = "done";
      timeLeft = 0;
      title = "Complete";
    } else {
      idx = Math.min(count - 1, Math.floor(elapsed / per));
      const cycleStart = idx * per;
      const cyclePos = Math.max(0, elapsed - cycleStart);
      if (idx === count - 1) {
        if (cyclePos < safeWork) {
          phase = "stretch";
          timeLeft = safeWork - cyclePos;
          title = list[idx].name;
        } else {
          phase = "done";
          timeLeft = 0;
          title = "Complete";
        }
      } else {
        if (cyclePos < safeWork) {
          phase = "stretch";
          timeLeft = safeWork - cyclePos;
          title = list[idx].name;
        } else {
          phase = "rest";
          timeLeft = safeRest - (cyclePos - safeWork);
          title = "Rest";
        }
      }
    }
  }

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(Math.floor(timeLeft % 60)).padStart(2, "0");
  const btn = (bg) => ({
    padding:"8px 12px",
    background:bg,
    color:BH.white,
    border:"none",
    borderRadius:"6px",
    cursor:"pointer",
    fontSize:"12px",
    fontWeight:"bold"
  });

  const status = getStatus();
  const canAdmin = isAdmin && !!session;
  const startLabel = status === "running" ? "Pause" : status === "paused" ? "Resume" : "Start";
  const sub = phase === "rest" ? `Rest ${safeRest}s` : phase === "done" ? "Done" : `Stretch ${safeWork}s`;

  return (
    <div style={{background:BH.white, border:`1px solid ${BH.g300}`, borderRadius:"8px", padding:"12px 14px"}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"6px", gap:"8px"}}>
        <div style={{fontSize:"12px", fontWeight:"bold", color:BH.navy}}>{label}</div>
        <div style={{fontSize:"18px", fontWeight:"bold", color:color}}>{mm}:{ss}</div>
      </div>
      <div style={{fontSize:"12px", color:BH.g700, marginBottom:"8px"}}>
        {title}{count > 0 ? ` • ${idx + 1}/${count}` : ""} • {sub}
      </div>
      <div style={{display:"flex", gap:"8px", flexWrap:"wrap"}}>
        <button
          onClick={() => {
            if (!canAdmin) return;
            if (status === "running") onAdminPause();
            else if (status === "paused") onAdminResume();
            else onAdminStart();
          }}
          disabled={!canAdmin || count === 0}
          style={{
            ...btn(status === "running" ? BH.shotRed : BH.shotBlue),
            cursor: canAdmin ? "pointer" : "not-allowed",
            opacity: canAdmin && count > 0 ? 1 : 0.6
          }}>
          {startLabel}
        </button>
        <button onClick={() => { if (canAdmin) onAdminReset(); }} disabled={!canAdmin} style={{
          ...btn(BH.g500),
          cursor: canAdmin ? "pointer" : "not-allowed",
          opacity: canAdmin ? 1 : 0.6
        }}>Reset</button>
      </div>
    </div>
  );
}

// LoginModal Component (Supabase email/password)
function LoginModal({onLogin, onClose}) {
  const [email, setEmail] = React.useState("");
  const [pw, setPw] = React.useState("");
  const [err, setErr] = React.useState("");

  const handleLogin = async () => {
    setErr("");
    const e = email.trim().toLowerCase();
    if (!e || !pw) { setErr("Enter email and password"); return; }
    const ok = await onLogin(e, pw);
    if (!ok) setErr("Invalid credentials or not authorized");
  };

  return (
    <div style={{position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.5)",
                 display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000}}>
      <div style={{background:BH.white, padding:"32px", borderRadius:"12px", width:"100%", maxWidth:"360px",
                   boxShadow:"0 10px 40px rgba(0,0,0,0.2)"}}>
        <div style={{textAlign:"center", marginBottom:"20px"}}>
          <div style={{fontSize:"20px", fontWeight:"bold", color:BH.navy}}>Admin Login</div>
          <div style={{fontSize:"12px", color:BH.g500, marginTop:"4px"}}>Belmont Hill Tennis</div>
        </div>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
          style={{width:"100%", padding:"10px 12px", marginBottom:"12px", border:`1px solid ${BH.g300}`,
                  borderRadius:"6px", fontSize:"14px", boxSizing:"border-box"}}
          onKeyDown={e => e.key === "Enter" && handleLogin()}/>
        <input type="password" placeholder="Password" value={pw} onChange={e => setPw(e.target.value)}
          style={{width:"100%", padding:"10px 12px", marginBottom:"12px", border:`1px solid ${BH.g300}`,
                  borderRadius:"6px", fontSize:"14px", boxSizing:"border-box"}}
          onKeyDown={e => e.key === "Enter" && handleLogin()}/>
        {err && <div style={{color:BH.shotRed, fontSize:"12px", marginBottom:"12px", textAlign:"center"}}>{err}</div>}
        <div style={{display:"flex", gap:"8px"}}>
          <button onClick={handleLogin} style={{flex:1, padding:"10px", background:BH.navy, color:BH.white,
            border:"none", borderRadius:"6px", cursor:"pointer", fontWeight:"bold", fontSize:"14px"}}>Login</button>
          <button onClick={onClose} style={{flex:1, padding:"10px", background:BH.g300, color:BH.navy,
            border:"none", borderRadius:"6px", cursor:"pointer", fontSize:"14px"}}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// App Component
function App() {
  const ADMIN_EMAILS = [
    "palandjian@belmonthill.org",
    "speer@belmonthill.org",
    "markham@belmonthill.org"
  ];
  const SUPABASE_URL = "https://uievqtckkotplvyfqshu.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_8YcUvmNO3QWfFqOnqMKcdg_y_-L2QRg";
  const sb = React.useMemo(() => (window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null), []);
  const sbRest = async (path, opts = {}) => {
    const headers = Object.assign({
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json"
    }, opts.headers || {});
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, Object.assign({}, opts, { headers }));
    return res;
  };

  const [tab, setTab] = React.useState("circuits");
  const [user, setUser] = React.useState(null);
  const [showLogin, setShowLogin] = React.useState(false);
  const [drillTime, setDrillTime] = React.useState(90);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 900);
  const [isSmall, setIsSmall] = React.useState(window.innerWidth < 768);
  const [session, setSession] = React.useState(null);
  const [sessionReady, setSessionReady] = React.useState(false);
  const [stretchSession, setStretchSession] = React.useState(null);
  const [stretchReady, setStretchReady] = React.useState(false);

  // Published plan state
  const [pubDrills, setPubDrills] = React.useState([]);
  const [pubExercises, setPubExercises] = React.useState([]);
  const [pubStretches, setPubStretches] = React.useState([]);
  const [work, setWork] = React.useState(45);
  const [rest, setRest] = React.useState(15);
  const [rounds, setRounds] = React.useState(3);

  // Admin selection state
  const [selDrills, setSelDrills] = React.useState([]);
  const [selExercises, setSelExercises] = React.useState([]);
  const [selStretches, setSelStretches] = React.useState([]);

  // UI state
  const [drSkill, setDrSkill] = React.useState("All");
  const [exCat, setExCat] = React.useState("All");
  const [stretchType, setStretchType] = React.useState("All");
  const [dynStretchTime, setDynStretchTime] = React.useState(30);
  const [dynStretchRest, setDynStretchRest] = React.useState(5);
  const [statStretchTime, setStatStretchTime] = React.useState(20);
  const [statStretchRest, setStatStretchRest] = React.useState(5);
  const [viewDrill, setViewDrill] = React.useState(null);
  const [toast, setToast] = React.useState("");
  const [circuitStIdx, setCircuitStIdx] = React.useState(-1);

  // Sync stretch durations from session
  React.useEffect(() => {
    if (!stretchSession) return;
    if (typeof stretchSession.dyn_duration === "number") setDynStretchTime(stretchSession.dyn_duration);
    if (typeof stretchSession.dyn_rest === "number") setDynStretchRest(stretchSession.dyn_rest);
    if (typeof stretchSession.stat_duration === "number") setStatStretchTime(stretchSession.stat_duration);
    if (typeof stretchSession.stat_rest === "number") setStatStretchRest(stretchSession.stat_rest);
  }, [stretchSession]);

  // Load config on mount
  React.useEffect(() => {
    let cfg = null;
    const h = window.location.hash.substring(1);
    if (h.startsWith("config=")) {
      try { cfg = JSON.parse(atob(h.slice(7))); } catch(e) {}
    }
    const normalizeDrills = (drills, defaultTime) => {
      if (!Array.isArray(drills)) return [];
      if (drills.length === 0) return [];
      if (typeof drills[0] === "string") {
        return drills.map(id => ({ id, time: defaultTime || 90 }));
      }
      return drills.map(d => ({
        id: d.id,
        time: typeof d.time === "number" ? d.time : (defaultTime || 90)
      }));
    };
    const applyCfg = (c) => {
      if (!c) return;
      const defaultTime = c.drillTime || 90;
      const normDrills = normalizeDrills(c.drills || [], defaultTime);
      setPubDrills(normDrills);
      setPubExercises(c.exercises || []);
      setPubStretches(c.stretches || []);
      setSelDrills(normDrills);
      setSelExercises(c.exercises || []);
      setSelStretches(c.stretches || []);
      setWork(c.work || 45);
      setRest(c.rest || 15);
      setRounds(c.rounds || 3);
      setDrillTime(defaultTime);
      if (typeof c.dynStretchTime === "number") setDynStretchTime(c.dynStretchTime);
      if (typeof c.dynStretchRest === "number") setDynStretchRest(c.dynStretchRest);
      if (typeof c.statStretchTime === "number") setStatStretchTime(c.statStretchTime);
      if (typeof c.statStretchRest === "number") setStatStretchRest(c.statStretchRest);
    };
    const loadFromSupabase = async () => {
      const res = await sbRest("published_plan?select=data&id=eq.1", { method: "GET" });
      if (!res.ok) return null;
      const rows = await res.json();
      if (!rows || !rows[0] || !rows[0].data) return null;
      return rows[0].data;
    };
    if (cfg) {
      applyCfg(cfg);
    } else {
      (async () => {
        const sbCfg = await loadFromSupabase();
        if (sbCfg) {
          applyCfg(sbCfg);
        } else {
          const lc = localStorage.getItem("bh-tennis-published");
          if (lc) {
            try { applyCfg(JSON.parse(lc)); } catch(e) {}
          }
        }
      })();
    }
  }, []);

  const admin = !!(user && ADMIN_EMAILS.includes((user.email || "").toLowerCase()));

  // Auth state
  React.useEffect(() => {
    let active = true;
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => {
      if (active) setUser(data && data.session ? data.session.user : null);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      setUser(session ? session.user : null);
    });
    return () => {
      active = false;
      if (sub && sub.subscription) sub.subscription.unsubscribe();
    };
  }, [sb]);

  // Load circuit session + subscribe to realtime
  React.useEffect(() => {
    let channel = null;
    if (!sb) return;
    const loadSession = async () => {
      const { data, error } = await sb.from("circuit_session").select("*").eq("id", 1).single();
      if (!error) setSession(data);
      setSessionReady(true);
    };
    loadSession();
    channel = sb.channel("circuit_session")
      .on("postgres_changes", { event: "*", schema: "public", table: "circuit_session", filter: "id=eq.1" }, (payload) => {
        if (payload.new) setSession(payload.new);
      })
      .subscribe();
    return () => {
      if (channel) sb.removeChannel(channel);
    };
  }, [sb]);

  // Load stretch session + subscribe to realtime
  React.useEffect(() => {
    let channel = null;
    if (!sb) return;
    const loadStretchSession = async () => {
      const { data, error } = await sb.from("stretch_session").select("*").eq("id", 1).single();
      if (!error) setStretchSession(data);
      setStretchReady(true);
    };
    loadStretchSession();
    channel = sb.channel("stretch_session")
      .on("postgres_changes", { event: "*", schema: "public", table: "stretch_session", filter: "id=eq.1" }, (payload) => {
        if (payload.new) setStretchSession(payload.new);
      })
      .subscribe();
    return () => {
      if (channel) sb.removeChannel(channel);
    };
  }, [sb]);

  // Track viewport for responsive layout
  React.useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 900);
      setIsSmall(window.innerWidth < 768);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Login/logout handlers
  const handleLogin = async (email, password) => {
    if (!sb) return false;
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error || !data || !data.user) return false;
    const isAllowed = ADMIN_EMAILS.includes((data.user.email || "").toLowerCase());
    if (!isAllowed) {
      await sb.auth.signOut();
      return false;
    }
    setShowLogin(false);
    return true;
  };
  const handleLogout = async () => {
    if (!sb) return;
    await sb.auth.signOut();
  };

  // Publish handler
  const handlePublish = async () => {
    const cfg = {
      drills: selDrills,
      exercises: selExercises,
      stretches: selStretches,
      work,
      rest,
      rounds,
      drillTime,
      dynStretchTime,
      dynStretchRest,
      statStretchTime,
      statStretchRest
    };
    const doLocalPublish = () => {
      localStorage.setItem("bh-tennis-published", JSON.stringify(cfg));
      setPubDrills(selDrills);
      setPubExercises(selExercises);
      setPubStretches(selStretches);
      const url = window.location.origin + window.location.pathname + "#config=" + btoa(JSON.stringify(cfg));
      navigator.clipboard.writeText(url).then(() => {
        setToast("Plan published! Link copied to clipboard.");
        setTimeout(() => setToast(""), 3000);
      });
    };
    if (!sb) { doLocalPublish(); return; }
    const { error } = await sb.from("published_plan").upsert({ id: 1, data: cfg });
    if (error) {
      doLocalPublish();
      setToast("Published locally. Supabase write failed.");
      setTimeout(() => setToast(""), 4000);
      return;
    }
    setPubDrills(selDrills);
    setPubExercises(selExercises);
    setPubStretches(selStretches);
    setToast("Plan published for everyone!");
    setTimeout(() => setToast(""), 3000);
  };

  // Toggle drill selection (admin)
  const toggleDrill = (id) => {
    setSelDrills(sel => {
      const exists = sel.find(d => d.id === id);
      if (exists) return sel.filter(d => d.id !== id);
      return [...sel, { id, time: drillTime }];
    });
  };

  // Toggle exercise selection (admin)
  const toggleExercise = (id) => {
    setSelExercises(sel => sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]);
  };
  const toggleStretch = (id) => {
    setSelStretches(sel => sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]);
  };

  // Filtered lists for admin category browsing
  const filteredDrills = DRILLS.filter(d =>
    (drSkill === "All" || d.skill === drSkill)
  );
  const filteredExercises = exCat === "All" ? EXERCISES : EXERCISES.filter(e => e.cat === exCat);
  const filteredStretches = stretchType === "All" ? STRETCHES : STRETCHES.filter(s => s.type === stretchType);

  // The drill list that non-admin players see (only published drills, in order)
  const playerDrills = pubDrills.map(d => {
    const drill = DRILLS.find(x => x.id === d.id);
    return drill ? { drill, time: d.time } : null;
  }).filter(Boolean);

  // The exercise list for non-admin
  const playerExercises = pubExercises.map(id => EXERCISES.find(e => e.id === id)).filter(Boolean);
  const playerStretches = pubStretches.map(id => STRETCHES.find(s => s.id === id)).filter(Boolean);

  // Current drill for viewer
  const currentViewDrill = viewDrill ? DRILLS.find(d => d.id === viewDrill) : null;

  // Practice mode drill
  const orderedDrillIds = admin ? selDrills.map(d => d.id) : pubDrills.map(d => d.id);
  const currentDrillTime = admin
    ? (selDrills.find(d => d.id === viewDrill) || {}).time
    : (pubDrills.find(d => d.id === viewDrill) || {}).time;
  const currentDrillTimeSafe = typeof currentDrillTime === "number" ? currentDrillTime : drillTime;
  const currentDrillIdx = viewDrill ? orderedDrillIds.indexOf(viewDrill) : -1;
  const canNextDrill = currentDrillIdx >= 0 && currentDrillIdx < orderedDrillIds.length - 1;
  const goNextDrill = () => {
    if (!canNextDrill) return;
    setViewDrill(orderedDrillIds[currentDrillIdx + 1]);
  };

  // Admin's selected exercises for circuit
  const adminExercises = selExercises.map(id => EXERCISES.find(e => e.id === id)).filter(Boolean);
  const adminStretches = selStretches.map(id => STRETCHES.find(s => s.id === id)).filter(Boolean);

  // Circuit exercises to display
  const circuitExercises = admin ? adminExercises : playerExercises;
  const stretchList = admin ? adminStretches : playerStretches;
  const dynamicList = stretchList.filter(s => s.type === "Dynamic");
  const staticList = stretchList.filter(s => s.type === "Static");
  const displayStretches = stretchList;

  // Equipment summary for circuit exercises
  const summarizeEquipment = (items) => {
    const map = new Map();
    const normalizeName = (raw) => {
      const s = raw.trim().toLowerCase();
      if (!s || s === "none") return null;
      if (s.includes("wall")) return null;
      if (s.includes("med ball") || s.includes("medicine ball")) return "Medicine Balls";
      if (s.includes("agility ladder") || s.includes("ladder")) return "Ladders";
      if (s.includes("cone")) return "Cones";
      if (s.includes("resistance band") || s.includes("band")) return "Bands";
      if (s.includes("dumbbell")) return "Dumbbells";
      if (s.includes("jump rope")) return "Jump Ropes";
      if (s.includes("bench") || s.includes("box")) return "Boxes/Benches";
      if (s.includes("step")) return "Steps";
      return raw.trim().replace(/\s+/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    };
    const addItem = (name, count, weight) => {
      if (!name) return;
      const cur = map.get(name) || { name, count: 0, weights: new Set() };
      cur.count += count || 1;
      if (weight) cur.weights.add(weight);
      map.set(name, cur);
    };
    items.forEach(e => {
      if (!e || !e.equip) return;
      const parts = e.equip.split(/,|\/|\s\+\s/).map(p => p.trim()).filter(Boolean);
      parts.forEach(p => {
        const countMatch = p.match(/^(\d+)\s+/);
        const count = countMatch ? parseInt(countMatch[1], 10) : 1;
        const weightMatch = p.match(/(\d+\s*-\s*\d+\s*(?:lb|lbs|kg|kgs)|\d+\s*(?:lb|lbs|kg|kgs))/i);
        const weight = weightMatch ? weightMatch[1].replace(/\s+/g, "") : null;
        const name = normalizeName(p.replace(/^\d+\s+/, "").replace(weightMatch ? weightMatch[0] : "", "").trim());
        addItem(name, count, weight);
      });
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  };

  const circuitEquipment = summarizeEquipment(circuitExercises);
  const circuitEquipTotal = circuitEquipment.reduce((sum, item) => sum + (item.count || 0), 0);

  // Global circuit session controls (admin)
  const calcElapsed = () => {
    if (!session || !session.start_time) return 0;
    return Math.max(0, Math.floor((Date.now() - Date.parse(session.start_time)) / 1000));
  };
  const adminStart = async () => {
    const stations = circuitExercises.map(e => e.id);
    if (!sb) return;
    await sb.from("circuit_session").update({
      status: "running",
      start_time: new Date().toISOString(),
      elapsed_at_pause: 0,
      work,
      rest,
      rounds,
      stations
    }).eq("id", 1);
  };
  const adminPause = async () => {
    if (!sb) return;
    await sb.from("circuit_session").update({
      status: "paused",
      elapsed_at_pause: calcElapsed()
    }).eq("id", 1);
  };
  const adminResume = async () => {
    const elapsed = session && session.elapsed_at_pause ? session.elapsed_at_pause : 0;
    if (!sb) return;
    await sb.from("circuit_session").update({
      status: "running",
      start_time: new Date(Date.now() - elapsed * 1000).toISOString()
    }).eq("id", 1);
  };
  const adminReset = async () => {
    if (!sb) return;
    await sb.from("circuit_session").update({
      status: "idle",
      start_time: null,
      elapsed_at_pause: 0
    }).eq("id", 1);
  };

  // Stretch session helpers (admin)
  const calcStretchElapsed = (kind) => {
    if (!stretchSession) return 0;
    const status = stretchSession[`${kind}_status`];
    if (status !== "running") return stretchSession[`${kind}_elapsed_at_pause`] || 0;
    const start = stretchSession[`${kind}_start_time`];
    if (!start) return 0;
    return Math.max(0, Math.floor((Date.now() - Date.parse(start)) / 1000));
  };
  const updateStretchSettings = async (nextDyn, nextDynRest, nextStat, nextStatRest) => {
    if (!sb) return;
    await sb.from("stretch_session").update({
      dyn_duration: nextDyn,
      dyn_rest: nextDynRest,
      stat_duration: nextStat,
      stat_rest: nextStatRest
    }).eq("id", 1);
  };
  const adminStretchStart = async (kind) => {
    if (!sb) return;
    const duration = kind === "dyn" ? dynStretchTime : statStretchTime;
    const restVal = kind === "dyn" ? dynStretchRest : statStretchRest;
    const patch = {};
    patch[`${kind}_status`] = "running";
    patch[`${kind}_start_time`] = new Date().toISOString();
    patch[`${kind}_elapsed_at_pause`] = 0;
    patch[`${kind}_duration`] = duration;
    patch[`${kind}_rest`] = restVal;
    await sb.from("stretch_session").update(patch).eq("id", 1);
  };
  const adminStretchPause = async (kind) => {
    if (!sb) return;
    const patch = {};
    patch[`${kind}_status`] = "paused";
    patch[`${kind}_elapsed_at_pause`] = calcStretchElapsed(kind);
    await sb.from("stretch_session").update(patch).eq("id", 1);
  };
  const adminStretchResume = async (kind) => {
    if (!sb) return;
    const elapsed = calcStretchElapsed(kind);
    const patch = {};
    patch[`${kind}_status`] = "running";
    patch[`${kind}_start_time`] = new Date(Date.now() - elapsed * 1000).toISOString();
    await sb.from("stretch_session").update(patch).eq("id", 1);
  };
  const adminStretchReset = async (kind) => {
    if (!sb) return;
    const duration = kind === "dyn" ? dynStretchTime : statStretchTime;
    const restVal = kind === "dyn" ? dynStretchRest : statStretchRest;
    const patch = {};
    patch[`${kind}_status`] = "idle";
    patch[`${kind}_start_time`] = null;
    patch[`${kind}_elapsed_at_pause`] = 0;
    patch[`${kind}_duration`] = duration;
    patch[`${kind}_rest`] = restVal;
    await sb.from("stretch_session").update(patch).eq("id", 1);
  };

  // Auto-select first circuit station when list changes
  React.useEffect(() => {
    if (circuitExercises.length > 0 && (circuitStIdx < 0 || circuitStIdx >= circuitExercises.length)) {
      setCircuitStIdx(0);
    }
  }, [circuitExercises.length]);

  // Auto-select first drill when view drill is null
  React.useEffect(() => {
    if (!viewDrill) {
      if (admin && selDrills.length > 0) setViewDrill(selDrills[0]);
      else if (!admin && playerDrills.length > 0) setViewDrill(playerDrills[0].id);
    }
  }, [admin, selDrills, playerDrills.length]);

  // --- RENDER ---

  // Button style helpers
  const tabBtn = (active) => ({
    padding:"10px 24px", background:active?BH.navy:BH.g200, color:active?BH.white:BH.navy,
    border:"none", borderRadius:"6px", cursor:"pointer", fontWeight:"bold", fontSize:"14px"
  });

  const catBtn = (active) => ({
    padding:"6px 12px", background:active?BH.navy:BH.g100, color:active?BH.white:BH.navy,
    border:`1px solid ${active?BH.navy:BH.g300}`, borderRadius:"4px", cursor:"pointer", fontSize:"12px"
  });

  return (
    <div style={{minHeight:"100vh", background:BH.offWhite}}>
      {/* Header */}
      <header style={{background:BH.navy, color:BH.white, padding:"16px 24px", display:"flex",
                      justifyContent:"space-between", alignItems:"center",
                      boxShadow:"0 2px 8px rgba(0,0,0,0.15)"}}>
        <div>
          <div style={{fontSize:"20px", fontWeight:"normal", color:BH.white, letterSpacing:"3.5px",
                      fontFamily:"Georgia, 'Times New Roman', serif"}}>BELMONT HILL</div>
          <div style={{fontSize:"12px", opacity:0.85, letterSpacing:"1px"}}>Varsity Tennis</div>
        </div>
        <div style={{display:"flex", gap:"12px", alignItems:"center"}}>
          {admin ? (
            <>
              <span style={{fontSize:"11px", background:BH.maroon, color:BH.white, padding:"4px 10px",
                            borderRadius:"4px", fontWeight:"bold"}}>ADMIN</span>
              <button onClick={handlePublish} style={{padding:"8px 14px", background:BH.maroon, color:BH.white,
                border:"none", borderRadius:"6px", cursor:"pointer", fontSize:"12px", fontWeight:"bold"}}>
                Publish Plan
              </button>
              <button onClick={handleLogout} style={{padding:"8px 14px", background:"rgba(255,255,255,0.15)",
                color:BH.white, border:"none", borderRadius:"6px", cursor:"pointer", fontSize:"12px"}}>
                Logout
              </button>
            </>
          ) : (
            <button onClick={() => setShowLogin(true)} style={{fontSize:"16px", background:"none",
              border:"none", cursor:"pointer", color:BH.white, opacity:0.6, padding:"4px"}}>
              🔒
            </button>
          )}
        </div>
      </header>

      {/* Tab bar */}
      <div style={{display:"flex", justifyContent:"center", gap:"12px", padding:"16px",
                   background:BH.white, borderBottom:`1px solid ${BH.g300}`}}>
        <button onClick={() => { setTab("circuits"); }} style={tabBtn(tab==="circuits")}>
          Circuits
        </button>
        <button onClick={() => { setTab("drills"); }} style={tabBtn(tab==="drills")}>
          Drills
        </button>
        <button onClick={() => { setTab("stretches"); }} style={tabBtn(tab==="stretches")}>
          Stretches
        </button>
      </div>

      {/* Login modal */}
      {showLogin && <LoginModal onLogin={handleLogin} onClose={() => setShowLogin(false)}/>}

      {/* Toast */}
      {toast && (
        <div style={{position:"fixed", bottom:"20px", right:"20px", background:BH.navy, color:BH.white,
                     padding:"12px 20px", borderRadius:"8px", zIndex:500, fontSize:"13px",
                     boxShadow:"0 4px 12px rgba(0,0,0,0.2)"}}>{toast}</div>
      )}

      {/* Main content */}
      <div style={{maxWidth:"1200px", margin:"0 auto", padding:"20px"}}>

        {/* ===== DRILLS TAB ===== */}
        {tab === "drills" && (
          (
            /* Drills View */
            <div style={{display:"flex", gap:"20px", flexDirection:isMobile ? "column" : "row"}}>
              {/* Left sidebar */}
              <div style={{width:isMobile ? "100%" : "300px", flexShrink:0}}>

                {admin ? (
                  /* Admin: category filter + drill list with checkboxes + today's plan summary */
                  <>
                    {/* Skill filter */}
                    <div style={{display:"flex", flexWrap:"wrap", gap:"6px", marginBottom:"16px"}}>
                      {DRILL_SKILLS.map(s => (
                        <button key={s} onClick={() => setDrSkill(s)} style={catBtn(drSkill===s)}>{s}</button>
                      ))}
                    </div>

                    {/* Drill list with checkboxes */}
                    <div style={{background:BH.white, borderRadius:"8px", border:`1px solid ${BH.g300}`,
                                 maxHeight:isSmall ? "260px" : "350px", overflowY:"auto"}}>
                      <div style={{padding:"12px 14px", borderBottom:`1px solid ${BH.g200}`,
                                   fontSize:"13px", fontWeight:"bold", color:BH.navy}}>
                        All Drills
                      </div>
                      {filteredDrills.map(d => (
                        <div key={d.id} style={{padding:isSmall ? "10px 14px" : "8px 14px", display:"flex", gap:"8px", alignItems:"center",
                          cursor:"pointer", borderBottom:`1px solid ${BH.g100}`,
                          background:viewDrill===d.id ? `rgba(59,130,246,0.08)` : "transparent"}}
                          onClick={() => setViewDrill(d.id)}>
                          <input type="checkbox" checked={selDrills.some(x => x.id === d.id)}
                            onChange={(e) => { e.stopPropagation(); toggleDrill(d.id); }}
                            style={{cursor:"pointer", accentColor:BH.navy, transform:isSmall ? "scale(1.1)" : "none"}}/>
                          <div style={{flex:1}}>
                            <div style={{fontSize:isSmall ? "13px" : "12px", fontWeight:"bold", color:BH.navy}}>{d.name}</div>
                            <div style={{fontSize:isSmall ? "11px" : "10px", color:BH.g500}}>{d.skill || d.cat} • {d.diff}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Today's Plan summary */}
                    <div style={{background:BH.white, borderRadius:"8px", border:`2px solid ${BH.maroon}`,
                                 marginTop:"16px", overflow:"hidden"}}>
                      <div style={{padding:"10px 14px", background:BH.maroon, color:BH.white,
                                   fontSize:"13px", fontWeight:"bold"}}>
                        Today's Plan ({selDrills.length} drills)
                      </div>
                      <div style={{padding:"8px 14px", maxHeight:isSmall ? "180px" : "200px", overflowY:"auto"}}>
                        {selDrills.length === 0 ? (
                          <div style={{fontSize:"12px", color:BH.g500, padding:"8px 0"}}>
                            Check drills above to build today's plan
                          </div>
                        ) : (
                          selDrills.map((entry, i) => {
                            const d = DRILLS.find(dr => dr.id === entry.id);
                            if (!d) return null;
                            return (
                              <div key={entry.id} style={{display:"flex", gap:"8px", alignItems:"center", padding:isSmall ? "6px 0" : "4px 0",
                                borderBottom:i < selDrills.length-1 ? `1px solid ${BH.g100}` : "none"}}>
                                <span style={{fontSize:"11px", fontWeight:"bold", color:BH.maroon, minWidth:"18px"}}>{i+1}.</span>
                                <div style={{display:"flex", flexDirection:"column", gap:"2px"}}>
                                  <span style={{fontSize:isSmall ? "13px" : "12px", color:BH.navy}}>{d.name}</span>
                                  <div style={{display:"flex", alignItems:"center", gap:"6px"}}>
                                    <span style={{fontSize:"10px", color:BH.g500}}>Time (sec)</span>
                                    <input type="number" value={entry.time}
                                      onChange={(e) => {
                                        const v = Math.max(10, Math.min(900, +e.target.value || 0));
                                        setSelDrills(sel => sel.map(x => x.id === entry.id ? { ...x, time: v } : x));
                                      }}
                                      style={{width:isSmall ? "72px" : "64px", padding:"4px 6px", border:`1px solid ${BH.g300}`, borderRadius:"4px", fontSize:"12px"}}/>
                                  </div>
                                </div>
                                <button onClick={() => toggleDrill(entry.id)} style={{marginLeft:"auto", background:"none",
                                  border:"none", cursor:"pointer", fontSize:"14px", color:BH.g400, padding:"0 2px"}}>×</button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                  </>
                ) : (
                  /* Non-Admin: Today's Plan (read-only numbered list) */
                  <div style={{background:BH.white, borderRadius:"8px", border:`2px solid ${BH.maroon}`, overflow:"hidden"}}>
                    <div style={{padding:"12px 16px", background:BH.maroon, color:BH.white}}>
                      <div style={{fontSize:"15px", fontWeight:"bold"}}>Today's Plan</div>
                      <div style={{fontSize:"11px", opacity:0.8}}>{playerDrills.length} drills</div>
                    </div>
                    <div style={{padding:"8px 0"}}>
                    {playerDrills.length === 0 ? (
                      <div style={{padding:"20px 16px", textAlign:"center", fontSize:"13px", color:BH.g500}}>
                        No drills published yet. Check back later!
                      </div>
                    ) : (
                        playerDrills.map((item, i) => (
                          <div key={item.drill.id} onClick={() => setViewDrill(item.drill.id)}
                            style={{padding:"10px 16px", display:"flex", gap:"10px", alignItems:"center",
                              cursor:"pointer", borderBottom:`1px solid ${BH.g100}`,
                              background:viewDrill===item.drill.id ? `rgba(201,162,39,0.12)` : "transparent"}}>
                            <span style={{fontSize:"14px", fontWeight:"bold", color:BH.maroon, minWidth:"24px"}}>{i+1}</span>
                            <div>
                              <div style={{fontSize:"13px", fontWeight:"bold", color:BH.navy}}>{item.drill.name}</div>
                              <div style={{fontSize:"11px", color:BH.g500}}>{item.drill.desc}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Drill Viewer */}
              <div style={{flex:1, minWidth:0, position:"relative"}}>
                {viewDrill && (
                  <div style={{
                    position: isMobile ? "relative" : "absolute",
                    top: isMobile ? "auto" : 0,
                    right: isMobile ? "auto" : 0,
                    zIndex:5,
                    width: isMobile ? "100%" : "260px",
                    marginBottom: isMobile ? "12px" : 0
                  }}>
                    <DrillTimer
                      duration={currentDrillTimeSafe}
                      resetKey={viewDrill}
                      onNext={goNextDrill}
                      canNext={canNextDrill}
                      isAdmin={admin}
                    />
                  </div>
                )}
                {currentViewDrill ? (
                  <DrillViewer drill={currentViewDrill}/>
                ) : (
                  <div style={{textAlign:"center", padding:"60px 20px", color:BH.g500}}>
                    {admin ? "Select a drill to preview" : "Select a drill from today's plan"}
                  </div>
                )}
              </div>
            </div>
          )
        )}

        {/* ===== CIRCUITS TAB ===== */}
        {tab === "circuits" && (
          <div style={{display:"flex", gap:"20px", flexDirection:isMobile ? "column" : "row"}}>
            {/* Left sidebar */}
            <div style={{width:isMobile ? "100%" : "300px", flexShrink:0}}>
              {admin ? (
                /* Admin: category filter + exercise list + settings */
                <>
                  <div style={{display:"flex", flexWrap:"wrap", gap:"6px", marginBottom:"16px"}}>
                    {EX_CATS.map(c => (
                      <button key={c} onClick={() => setExCat(c)} style={catBtn(exCat===c)}>{c}</button>
                    ))}
                  </div>

                  <div style={{background:BH.white, borderRadius:"8px", border:`1px solid ${BH.g300}`,
                               maxHeight:isSmall ? "260px" : "350px", overflowY:"auto"}}>
                    <div style={{padding:"12px 14px", borderBottom:`1px solid ${BH.g200}`,
                                 fontSize:"13px", fontWeight:"bold", color:BH.navy}}>
                      Exercises
                    </div>
                    {filteredExercises.map(e => (
                      <div key={e.id} style={{padding:isSmall ? "10px 14px" : "8px 14px", display:"flex", gap:"8px", alignItems:"center",
                        cursor:"pointer", borderBottom:`1px solid ${BH.g100}`}}
                        onClick={() => toggleExercise(e.id)}>
                        <input type="checkbox" checked={selExercises.includes(e.id)}
                          onChange={() => {}} style={{cursor:"pointer", accentColor:BH.navy, transform:isSmall ? "scale(1.1)" : "none"}}/>
                        <div style={{flex:1}}>
                          <div style={{fontSize:isSmall ? "13px" : "12px", fontWeight:"bold", color:BH.navy}}>{e.name}</div>
                          <div style={{fontSize:isSmall ? "11px" : "10px", color:BH.g500}}>{e.cat} • {e.reps}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Timer settings */}
                  <div style={{background:BH.white, borderRadius:"8px", border:`1px solid ${BH.g300}`,
                               marginTop:"16px", padding:"14px"}}>
                    <div style={{fontSize:"13px", fontWeight:"bold", color:BH.navy, marginBottom:"10px"}}>
                      Timer Settings
                    </div>
                    <div style={{display:"flex", flexDirection:"column", gap:"8px"}}>
                      <label style={{fontSize:"12px", color:BH.g700, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                        Work (sec)
                        <input type="number" value={work} onChange={e => setWork(+e.target.value)}
                          style={{width:"60px", padding:"4px 8px", border:`1px solid ${BH.g300}`, borderRadius:"4px"}} min="10" max="120"/>
                      </label>
                      <label style={{fontSize:"12px", color:BH.g700, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                        Rest (sec)
                        <input type="number" value={rest} onChange={e => setRest(+e.target.value)}
                          style={{width:"60px", padding:"4px 8px", border:`1px solid ${BH.g300}`, borderRadius:"4px"}} min="5" max="60"/>
                      </label>
                      <label style={{fontSize:"12px", color:BH.g700, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                        Rounds
                        <input type="number" value={rounds} onChange={e => setRounds(+e.target.value)}
                          style={{width:"60px", padding:"4px 8px", border:`1px solid ${BH.g300}`, borderRadius:"4px"}} min="1" max="10"/>
                      </label>
                    </div>
                  </div>

                  {/* Selected exercises summary */}
                  <div style={{background:BH.white, borderRadius:"8px", border:`2px solid ${BH.maroon}`,
                               marginTop:"16px", overflow:"hidden"}}>
                    <div style={{padding:"10px 14px", background:BH.maroon, color:BH.white,
                                 fontSize:"13px", fontWeight:"bold"}}>
                      Today's Circuit ({selExercises.length} exercises)
                    </div>
                    <div style={{padding:"8px 14px", maxHeight:"150px", overflowY:"auto"}}>
                      {selExercises.length === 0 ? (
                        <div style={{fontSize:"12px", color:BH.g500, padding:"8px 0"}}>
                          Check exercises above to build circuit
                        </div>
                      ) : (
                        selExercises.map((id, i) => {
                          const e = EXERCISES.find(ex => ex.id === id);
                          if (!e) return null;
                          return (
                            <div key={id}
                                 role="button" tabIndex={0}
                                 onClick={() => setCircuitStIdx(i)}
                                 onMouseDown={() => setCircuitStIdx(i)}
                                 onTouchStart={(ev) => { ev.preventDefault(); setCircuitStIdx(i); }}
                                 onTouchEnd={(ev) => { ev.preventDefault(); setCircuitStIdx(i); }}
                                 style={{display:"flex", gap:"8px", alignItems:"center", padding:"3px 0", cursor:"pointer", userSelect:"none"}}>
                              <span style={{fontSize:"11px", fontWeight:"bold", color:BH.maroon, minWidth:"18px"}}>{i+1}.</span>
                              <span style={{fontSize:"12px", color:BH.navy}}>{e.name}</span>
                              <button onClick={(ev) => { ev.stopPropagation(); toggleExercise(id); }} style={{marginLeft:"auto", background:"none",
                                border:"none", cursor:"pointer", fontSize:"14px", color:BH.g400}}>×</button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>


                  {adminExercises.length > 0 && (
                    <div style={{marginTop:"16px"}}>
                      <CircuitTimer work={work} rest={rest} rounds={rounds} exercises={adminExercises}
                        onStation={(i) => setCircuitStIdx(i)}
                        session={sessionReady ? session : null}
                        isAdmin={admin}
                        onAdminStart={adminStart}
                        onAdminPause={adminPause}
                        onAdminResume={adminResume}
                        onAdminReset={adminReset}/>
                    </div>
                  )}

                  {circuitExercises.length > 0 && (
                    <div style={{background:BH.white, borderRadius:"8px", border:`2px solid ${BH.maroon}`,
                                 marginTop:"16px", overflow:"hidden"}}>
                      <div style={{padding:"10px 14px", background:BH.maroon, color:BH.white,
                                   fontSize:"13px", fontWeight:"bold", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                        <span>Equipment Needed</span>
                        <span style={{fontSize:"11px", opacity:0.85}}>Total items: {circuitEquipTotal}</span>
                      </div>
                      <div style={{padding:"8px 14px"}}>
                        {circuitEquipment.length === 0 ? (
                          <div style={{fontSize:"12px", color:BH.g500, padding:"6px 0"}}>
                            No equipment required.
                          </div>
                        ) : (
                          <div style={{display:"flex", flexDirection:"column", gap:"6px"}}>
                            {circuitEquipment.map(item => (
                              <div key={item.name} style={{fontSize:"12px", color:BH.g700, display:"flex", justifyContent:"space-between"}}>
                                <span>{item.name}{item.weights.size ? ` (${Array.from(item.weights).join(", ")})` : ""}</span>
                                <span style={{color:BH.g500}}>x{item.count}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Non-Admin: Published circuit (read-only) */
                <>
                  <div style={{background:BH.white, borderRadius:"8px", border:`2px solid ${BH.maroon}`, overflow:"hidden"}}>
                    <div style={{padding:"12px 16px", background:BH.maroon, color:BH.white}}>
                      <div style={{fontSize:"15px", fontWeight:"bold"}}>Today's Circuit</div>
                      <div style={{fontSize:"11px", opacity:0.8}}>
                        {playerExercises.length} exercises • {work}s work / {rest}s rest • {rounds} rounds
                      </div>
                    </div>
                    <div style={{padding:"8px 0"}}>
                      {playerExercises.length === 0 ? (
                        <div style={{padding:"20px 16px", textAlign:"center", fontSize:"13px", color:BH.g500}}>
                          No circuit published yet. Check back later!
                        </div>
                      ) : (
                        playerExercises.map((e, i) => (
                          <button key={e.id} type="button"
                            onClick={() => setCircuitStIdx(i)}
                            onPointerDown={() => setCircuitStIdx(i)}
                            onPointerUp={() => setCircuitStIdx(i)}
                            onMouseDown={() => setCircuitStIdx(i)}
                            onTouchStart={(ev) => { ev.preventDefault(); setCircuitStIdx(i); }}
                            onTouchEnd={(ev) => { ev.preventDefault(); setCircuitStIdx(i); }}
                            style={{width:"100%", textAlign:"left", padding:"8px 16px", display:"flex", gap:"10px", alignItems:"center",
                              cursor:"pointer", userSelect:"none", border:"none", background:"transparent",
                              borderBottom:`1px solid ${BH.g100}`,
                              outline:"none", pointerEvents:"auto",
                              backgroundColor: circuitStIdx===i ? `rgba(201,162,39,0.12)` : "transparent"}}>
                            <span style={{fontSize:"14px", fontWeight:"bold", color:BH.maroon, minWidth:"24px"}}>{i+1}</span>
                            <div>
                              <div style={{fontSize:"13px", fontWeight:"bold", color:BH.navy}}>{e.name}</div>
                              <div style={{fontSize:"11px", color:BH.g500}}>{e.reps} • {e.equip}</div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  {playerExercises.length > 0 && (
                    <div style={{marginTop:"16px"}}>
                      <CircuitTimer work={work} rest={rest} rounds={rounds} exercises={playerExercises}
                        onStation={(i) => setCircuitStIdx(i)}
                        session={sessionReady ? session : null}
                        isAdmin={false}
                        onAdminStart={adminStart}
                        onAdminPause={adminPause}
                        onAdminResume={adminResume}
                        onAdminReset={adminReset}/>
                    </div>
                  )}

                  {circuitExercises.length > 0 && (
                    <div style={{background:BH.white, borderRadius:"8px", border:`2px solid ${BH.maroon}`,
                                 marginTop:"16px", overflow:"hidden"}}>
                      <div style={{padding:"10px 14px", background:BH.maroon, color:BH.white,
                                   fontSize:"13px", fontWeight:"bold", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                        <span>Equipment Needed</span>
                        <span style={{fontSize:"11px", opacity:0.85}}>Total items: {circuitEquipTotal}</span>
                      </div>
                      <div style={{padding:"8px 14px"}}>
                        {circuitEquipment.length === 0 ? (
                          <div style={{fontSize:"12px", color:BH.g500, padding:"6px 0"}}>
                            No equipment required.
                          </div>
                        ) : (
                          <div style={{display:"flex", flexDirection:"column", gap:"6px"}}>
                            {circuitEquipment.map(item => (
                              <div key={item.name} style={{fontSize:"12px", color:BH.g700, display:"flex", justifyContent:"space-between"}}>
                                <span>{item.name}{item.weights.size ? ` (${Array.from(item.weights).join(", ")})` : ""}</span>
                                <span style={{color:BH.g500}}>x{item.count}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Right: Circuit Ring + Timer */}
            <div style={{flex:1, minWidth:0}}>
              {circuitExercises.length === 0 ? (
                <div style={{textAlign:"center", padding:"60px 20px", color:BH.g500}}>
                  {admin ? "Select exercises from the left to build your circuit" : "No circuit published yet."}
                </div>
              ) : (
                <>
                  <CircuitRing stations={circuitExercises} selectedIdx={circuitStIdx}
                    onSelect={(i) => setCircuitStIdx(i)}
                    onRemove={admin ? (i) => {
                      const id = circuitExercises[i] && circuitExercises[i].id;
                      if (id) {
                        setSelExercises(sel => sel.filter(x => x !== id));
                        if (circuitStIdx === i) setCircuitStIdx(-1);
                        else if (circuitStIdx > i) setCircuitStIdx(circuitStIdx - 1);
                      }
                    } : null}/>
                  {/* Selected exercise detail card */}
                  {circuitStIdx >= 0 && circuitStIdx < circuitExercises.length && (
                    <div style={{background:BH.white, padding:"16px", borderRadius:"8px", border:`2px solid ${BH.maroon}`, marginTop:"16px", textAlign:"center"}}>
                      <div style={{fontSize:"16px", fontWeight:"bold", color:BH.navy, marginBottom:"4px"}}>
                        {circuitExercises[circuitStIdx].name}
                      </div>
                      <div style={{fontSize:"13px", color:BH.g700, marginBottom:"8px"}}>
                        {circuitExercises[circuitStIdx].desc}
                      </div>
                      <div style={{display:"flex", justifyContent:"center", gap:"16px", fontSize:"12px", color:BH.g500}}>
                        <span>{circuitExercises[circuitStIdx].reps}</span>
                        <span>•</span>
                        <span>{circuitExercises[circuitStIdx].equip}</span>
                      </div>
                      {circuitExercises[circuitStIdx].youtubeId && (
                        <div style={{borderRadius:"8px", overflow:"hidden", border:`1px solid ${BH.g300}`, marginTop:"12px", textAlign:"left"}}>
                          <div style={{padding:"8px 12px", background:BH.navy, display:"flex", alignItems:"center", gap:"8px"}}>
                            <span style={{fontSize:"12px", fontWeight:"bold", color:BH.white}}>Video Demo</span>
                            {(circuitExercises[circuitStIdx].youtubeStart || circuitExercises[circuitStIdx].youtubeEnd) && (
                              <span style={{fontSize:"10px", color:BH.maroon, opacity:0.8}}>
                                {circuitExercises[circuitStIdx].youtubeStart ? `from ${Math.floor(circuitExercises[circuitStIdx].youtubeStart/60)}:${String(circuitExercises[circuitStIdx].youtubeStart%60).padStart(2,"0")}` : ""}
                                {circuitExercises[circuitStIdx].youtubeEnd ? ` to ${Math.floor(circuitExercises[circuitStIdx].youtubeEnd/60)}:${String(circuitExercises[circuitStIdx].youtubeEnd%60).padStart(2,"0")}` : ""}
                              </span>
                            )}
                            <a href={`https://www.youtube.com/watch?v=${circuitExercises[circuitStIdx].youtubeId}`}
                               target="_blank" rel="noopener noreferrer"
                               style={{marginLeft:"auto", fontSize:"10px", color:BH.g200, textDecoration:"underline"}}>
                              Open on YouTube
                            </a>
                          </div>
                          <div style={{position:"relative", paddingBottom:"56.25%", height:0, overflow:"hidden"}}>
                            <iframe
                              src={`https://www.youtube.com/embed/${circuitExercises[circuitStIdx].youtubeId}?${circuitExercises[circuitStIdx].youtubeStart ? "start="+circuitExercises[circuitStIdx].youtubeStart : ""}${circuitExercises[circuitStIdx].youtubeEnd ? "&end="+circuitExercises[circuitStIdx].youtubeEnd : ""}&rel=0&modestbranding=1`}
                              frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                              allowFullScreen style={{position:"absolute", top:0, left:0, width:"100%", height:"100%"}}/>
                          </div>
                        </div>
                    )}
                  </div>
                )}
                </>
              )}
            </div>
          </div>
        )}

        {/* ===== STRETCHES TAB ===== */}
        {tab === "stretches" && (
          <div style={{display:"flex", gap:"20px", flexDirection:isMobile ? "column" : "row"}}>
            <div style={{width:isMobile ? "100%" : "300px", flexShrink:0}}>
              <div style={{display:"flex", flexWrap:"wrap", gap:"6px", marginBottom:"16px"}}>
                {STRETCH_TYPES.map(t => (
                  <button key={t} onClick={() => setStretchType(t)} style={catBtn(stretchType===t)}>{t}</button>
                ))}
              </div>

              {admin ? (
                <>
                  <div style={{background:BH.white, borderRadius:"8px", border:`1px solid ${BH.g300}`,
                               maxHeight:isSmall ? "260px" : "350px", overflowY:"auto"}}>
                    <div style={{padding:"12px 14px", borderBottom:`1px solid ${BH.g200}`,
                                 fontSize:"13px", fontWeight:"bold", color:BH.navy}}>
                      All Stretches
                    </div>
                    {filteredStretches.map(s => (
                      <div key={s.id} style={{padding:isSmall ? "10px 14px" : "8px 14px", display:"flex", gap:"8px", alignItems:"center",
                        cursor:"pointer", borderBottom:`1px solid ${BH.g100}`}}
                        onClick={() => toggleStretch(s.id)}>
                        <input type="checkbox" checked={selStretches.includes(s.id)}
                          onChange={() => {}} style={{cursor:"pointer", accentColor:BH.navy, transform:isSmall ? "scale(1.1)" : "none"}}/>
                        <div style={{flex:1}}>
                          <div style={{fontSize:isSmall ? "13px" : "12px", fontWeight:"bold", color:BH.navy}}>{s.name}</div>
                          <div style={{fontSize:isSmall ? "11px" : "10px", color:BH.g500}}>{s.type} • {s.area}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{background:BH.white, borderRadius:"8px", border:`2px solid ${BH.maroon}`,
                               marginTop:"16px", overflow:"hidden"}}>
                    <div style={{padding:"10px 14px", background:BH.maroon, color:BH.white,
                                 fontSize:"13px", fontWeight:"bold"}}>
                      Today's Stretches ({selStretches.length})
                    </div>
                    <div style={{padding:"8px 14px", maxHeight:"150px", overflowY:"auto"}}>
                      {selStretches.length === 0 ? (
                        <div style={{fontSize:"12px", color:BH.g500, padding:"8px 0"}}>
                          Check stretches above to build today's plan
                        </div>
                      ) : (
                        selStretches.map((id, i) => {
                          const s = STRETCHES.find(st => st.id === id);
                          if (!s) return null;
                          return (
                            <div key={id} style={{display:"flex", gap:"8px", alignItems:"center", padding:"3px 0"}}>
                              <span style={{fontSize:"11px", fontWeight:"bold", color:BH.maroon, minWidth:"18px"}}>{i+1}.</span>
                              <span style={{fontSize:"12px", color:BH.navy}}>{s.name}</span>
                              <button onClick={(ev) => { ev.stopPropagation(); toggleStretch(id); }} style={{marginLeft:"auto", background:"none",
                                border:"none", cursor:"pointer", fontSize:"14px", color:BH.g400}}>×</button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div style={{background:BH.white, borderRadius:"8px", border:`2px solid ${BH.shotBlue}`,
                               marginTop:"12px", overflow:"hidden"}}>
                    <div style={{padding:"10px 14px", background:BH.shotBlue, color:BH.white,
                                 fontSize:"13px", fontWeight:"bold"}}>
                      Today's Dynamic Stretches ({dynamicList.length})
                    </div>
                    <div style={{padding:"8px 14px", maxHeight:"140px", overflowY:"auto"}}>
                      {dynamicList.length === 0 ? (
                        <div style={{fontSize:"12px", color:BH.g500, padding:"8px 0"}}>
                          No dynamic stretches selected.
                        </div>
                      ) : (
                        dynamicList.map((s, i) => (
                          <div key={s.id} style={{display:"flex", gap:"8px", alignItems:"center", padding:"3px 0"}}>
                            <span style={{fontSize:"11px", fontWeight:"bold", color:BH.shotBlue, minWidth:"18px"}}>{i+1}.</span>
                            <span style={{fontSize:"12px", color:BH.navy}}>{s.name}</span>
                            <button onClick={(ev) => { ev.stopPropagation(); toggleStretch(s.id); }} style={{marginLeft:"auto", background:"none",
                              border:"none", cursor:"pointer", fontSize:"14px", color:BH.g400}}>×</button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div style={{background:BH.white, borderRadius:"8px", border:`2px solid ${BH.maroon}`,
                               marginTop:"12px", overflow:"hidden"}}>
                    <div style={{padding:"10px 14px", background:BH.maroon, color:BH.white,
                                 fontSize:"13px", fontWeight:"bold"}}>
                      Today's Static Stretches ({staticList.length})
                    </div>
                    <div style={{padding:"8px 14px", maxHeight:"140px", overflowY:"auto"}}>
                      {staticList.length === 0 ? (
                        <div style={{fontSize:"12px", color:BH.g500, padding:"8px 0"}}>
                          No static stretches selected.
                        </div>
                      ) : (
                        staticList.map((s, i) => (
                          <div key={s.id} style={{display:"flex", gap:"8px", alignItems:"center", padding:"3px 0"}}>
                            <span style={{fontSize:"11px", fontWeight:"bold", color:BH.maroon, minWidth:"18px"}}>{i+1}.</span>
                            <span style={{fontSize:"12px", color:BH.navy}}>{s.name}</span>
                            <button onClick={(ev) => { ev.stopPropagation(); toggleStretch(s.id); }} style={{marginLeft:"auto", background:"none",
                              border:"none", cursor:"pointer", fontSize:"14px", color:BH.g400}}>×</button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div style={{background:BH.white, borderRadius:"8px", border:`2px solid ${BH.maroon}`, overflow:"hidden"}}>
                  <div style={{padding:"12px 16px", background:BH.maroon, color:BH.white}}>
                    <div style={{fontSize:"15px", fontWeight:"bold"}}>Today's Stretches</div>
                    <div style={{fontSize:"11px", opacity:0.8}}>
                      {dynamicList.length} dynamic • {staticList.length} static
                    </div>
                  </div>
                  <div style={{padding:"8px 0"}}>
                    {stretchList.length === 0 ? (
                      <div style={{padding:"20px 16px", textAlign:"center", fontSize:"13px", color:BH.g500}}>
                        No stretches published yet. Check back later!
                      </div>
                    ) : (
                      stretchList.map((s, i) => (
                        <div key={s.id}
                          style={{padding:"8px 16px", display:"flex", gap:"10px", alignItems:"center",
                            borderBottom:`1px solid ${BH.g100}`}}>
                          <span style={{fontSize:"14px", fontWeight:"bold", color:BH.maroon, minWidth:"24px"}}>{i+1}</span>
                          <div>
                            <div style={{fontSize:"13px", fontWeight:"bold", color:BH.navy}}>{s.name}</div>
                            <div style={{fontSize:"11px", color:BH.g500}}>{s.type} • {s.reps}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              <div style={{background:BH.white, borderRadius:"8px", border:`1px solid ${BH.g300}`, padding:"12px 14px"}}>
                <div style={{fontSize:"12px", fontWeight:"bold", color:BH.navy, marginBottom:"6px"}}>Stretching Notes</div>
                <div style={{fontSize:"12px", color:BH.g700, lineHeight:1.4}}>
                  Dynamic before hitting. Static after practice. Breathe and never force the range.
                </div>
              </div>
              {admin ? (
                <div style={{background:BH.white, borderRadius:"8px", border:`1px solid ${BH.g300}`, padding:"12px 14px", marginTop:"12px"}}>
                  <div style={{fontSize:"12px", fontWeight:"bold", color:BH.navy, marginBottom:"8px"}}>Timer Settings</div>
                  <div style={{display:"flex", flexDirection:"column", gap:"8px"}}>
                    <label style={{fontSize:"12px", color:BH.g700, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                      Dynamic Stretch (sec)
                      <input type="number" value={dynStretchTime} onChange={e => {
                        const v = Math.max(5, +e.target.value || 0);
                        setDynStretchTime(v);
                        if (sb) updateStretchSettings(v, dynStretchRest, statStretchTime, statStretchRest);
                      }}
                        style={{width:"70px", padding:"4px 8px", border:`1px solid ${BH.g300}`, borderRadius:"4px"}} min="5" max="1800"/>
                    </label>
                    <label style={{fontSize:"12px", color:BH.g700, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                      Dynamic Rest (sec)
                      <input type="number" value={dynStretchRest} onChange={e => {
                        const v = Math.max(0, +e.target.value || 0);
                        setDynStretchRest(v);
                        if (sb) updateStretchSettings(dynStretchTime, v, statStretchTime, statStretchRest);
                      }}
                        style={{width:"70px", padding:"4px 8px", border:`1px solid ${BH.g300}`, borderRadius:"4px"}} min="0" max="300"/>
                    </label>
                    <label style={{fontSize:"12px", color:BH.g700, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                      Static Stretch (sec)
                      <input type="number" value={statStretchTime} onChange={e => {
                        const v = Math.max(5, +e.target.value || 0);
                        setStatStretchTime(v);
                        if (sb) updateStretchSettings(dynStretchTime, dynStretchRest, v, statStretchRest);
                      }}
                        style={{width:"70px", padding:"4px 8px", border:`1px solid ${BH.g300}`, borderRadius:"4px"}} min="5" max="1800"/>
                    </label>
                    <label style={{fontSize:"12px", color:BH.g700, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                      Static Rest (sec)
                      <input type="number" value={statStretchRest} onChange={e => {
                        const v = Math.max(0, +e.target.value || 0);
                        setStatStretchRest(v);
                        if (sb) updateStretchSettings(dynStretchTime, dynStretchRest, statStretchTime, v);
                      }}
                        style={{width:"70px", padding:"4px 8px", border:`1px solid ${BH.g300}`, borderRadius:"4px"}} min="0" max="300"/>
                    </label>
                  </div>
                </div>
              ) : (
                <div style={{background:BH.white, borderRadius:"8px", border:`1px solid ${BH.g300}`, padding:"12px 14px", marginTop:"12px"}}>
                  <div style={{fontSize:"12px", fontWeight:"bold", color:BH.navy, marginBottom:"6px"}}>Timer Settings</div>
                  <div style={{fontSize:"12px", color:BH.g700}}>
                    Dynamic: {dynStretchTime}s + {dynStretchRest}s rest • Static: {statStretchTime}s + {statStretchRest}s rest
                  </div>
                </div>
              )}
            </div>
            <div style={{flex:1, minWidth:0}}>
              {displayStretches.length === 0 ? (
                <div style={{textAlign:"center", padding:"60px 20px", color:BH.g500}}>
                  No stretches found for this filter.
                </div>
              ) : (
                <>
                  <div style={{display:"flex", gap:"10px", flexWrap:"wrap", marginBottom:"10px"}}>
                    <div style={{flex:1, minWidth:"220px"}}>
                      <StretchTimer
                        label="Dynamic Timer"
                        color={BH.shotBlue}
                        session={stretchReady ? stretchSession : null}
                        kind="dyn"
                        isAdmin={admin}
                        onAdminStart={() => adminStretchStart("dyn")}
                        onAdminPause={() => adminStretchPause("dyn")}
                        onAdminResume={() => adminStretchResume("dyn")}
                        onAdminReset={() => adminStretchReset("dyn")}
                        list={dynamicList}
                        work={dynStretchTime}
                        rest={dynStretchRest}
                      />
                    </div>
                    <div style={{flex:1, minWidth:"220px"}}>
                      <StretchTimer
                        label="Static Timer"
                        color={BH.maroon}
                        session={stretchReady ? stretchSession : null}
                        kind="stat"
                        isAdmin={admin}
                        onAdminStart={() => adminStretchStart("stat")}
                        onAdminPause={() => adminStretchPause("stat")}
                        onAdminResume={() => adminStretchResume("stat")}
                        onAdminReset={() => adminStretchReset("stat")}
                        list={staticList}
                        work={statStretchTime}
                        rest={statStretchRest}
                      />
                    </div>
                  </div>
                  <div style={{display:"grid", gridTemplateColumns:isSmall ? "1fr" : "1fr 1fr", gap:"14px"}}>
                    <div>
                      <div style={{fontSize:"13px", fontWeight:"bold", color:BH.navy, margin:"4px 0 10px"}}>Pre-Practice</div>
                      <div style={{background:BH.white, borderRadius:"8px", border:`1px solid ${BH.g300}`}}>
                        {dynamicList.length === 0 ? (
                          <div style={{padding:"16px", fontSize:"12px", color:BH.g500}}>No dynamic stretches selected.</div>
                        ) : (
                          dynamicList.map((s, i) => (
                            <div key={s.id} style={{padding:"10px 14px", borderBottom:`1px solid ${BH.g100}`}}>
                              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", gap:"10px"}}>
                                <div style={{fontSize:"13px", fontWeight:"bold", color:BH.navy}}>{i+1}. {s.name}</div>
                                <span style={{fontSize:"10px", color:BH.white, background:BH.shotBlue, padding:"3px 8px",
                                  borderRadius:"999px", fontWeight:"bold", letterSpacing:"0.3px"}}>Dynamic</span>
                              </div>
                              <div style={{fontSize:"11px", color:BH.g700, marginTop:"4px"}}>{s.desc}</div>
                              <div style={{fontSize:"11px", color:BH.g500, marginTop:"4px"}}>{s.area} • {s.reps}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    <div>
                      <div style={{fontSize:"13px", fontWeight:"bold", color:BH.navy, margin:"4px 0 10px"}}>After Practice</div>
                      <div style={{background:BH.white, borderRadius:"8px", border:`1px solid ${BH.g300}`}}>
                        {staticList.length === 0 ? (
                          <div style={{padding:"16px", fontSize:"12px", color:BH.g500}}>No static stretches selected.</div>
                        ) : (
                          staticList.map((s, i) => (
                            <div key={s.id} style={{padding:"10px 14px", borderBottom:`1px solid ${BH.g100}`}}>
                              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", gap:"10px"}}>
                                <div style={{fontSize:"13px", fontWeight:"bold", color:BH.navy}}>{i+1}. {s.name}</div>
                                <span style={{fontSize:"10px", color:BH.white, background:BH.maroon, padding:"3px 8px",
                                  borderRadius:"999px", fontWeight:"bold", letterSpacing:"0.3px"}}>Static</span>
                              </div>
                              <div style={{fontSize:"11px", color:BH.g700, marginTop:"4px"}}>{s.desc}</div>
                              <div style={{fontSize:"11px", color:BH.g500, marginTop:"4px"}}>{s.area} • {s.reps}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Mount the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
