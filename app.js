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
function DrillTimer({duration, resetKey, onNext, canNext}) {
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
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px"}}>
        <div style={{fontSize:"12px", fontWeight:"bold", color:BH.navy}}>Drill Timer</div>
        <div style={{fontSize:"18px", fontWeight:"bold", color:BH.maroon}}>{mm}:{ss}</div>
      </div>
      <div style={{display:"flex", gap:"8px", flexWrap:"wrap"}}>
        <button onClick={() => setRunning(r => !r)} style={btn(running ? BH.shotRed : BH.shotBlue)}>
          {running ? "Pause" : "Start"}
        </button>
        <button onClick={() => setTimeLeft(duration)} style={btn(BH.g500)}>Reset</button>
        <button onClick={() => setTimeLeft(t => t + 30)} style={btn(BH.navy)}>+30s</button>
        <button onClick={onNext} disabled={!canNext} style={{
          ...btn(canNext ? BH.maroon : BH.g300),
          cursor: canNext ? "pointer" : "not-allowed"
        }}>Next Drill</button>
      </div>
    </div>
  );
}

// LoginModal Component
function LoginModal({onLogin, onClose}) {
  const [un, setUn] = React.useState("");
  const [pw, setPw] = React.useState("");
  const [err, setErr] = React.useState("");

  const handleLogin = async () => {
    if (!un.trim() || !pw.trim()) { setErr("Enter username and password"); return; }
    const pwh = await sha256(pw);
    if (un === "BHTennis" && pwh === "b58f004c95d0a0c859256c96ac33f70e5ccc9cadaf17997425f883bbcbb6cfdd") {
      setErr("");
      onLogin();
    } else {
      setErr("Invalid credentials");
    }
  };

  return (
    <div style={{position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.5)",
                 display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000}}>
      <div style={{background:BH.white, padding:"32px", borderRadius:"12px", width:"100%", maxWidth:"340px",
                   boxShadow:"0 10px 40px rgba(0,0,0,0.2)"}}>
        <div style={{textAlign:"center", marginBottom:"20px"}}>
          <div style={{fontSize:"20px", fontWeight:"bold", color:BH.navy}}>Admin Login</div>
          <div style={{fontSize:"12px", color:BH.g500, marginTop:"4px"}}>Belmont Hill Tennis</div>
        </div>
        <input type="text" placeholder="Username" value={un} onChange={e => setUn(e.target.value)}
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
  const SUPABASE_URL = "https://uievqtckkotplvyfqshu.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_8YcUvmNO3QWfFqOnqMKcdg_y_-L2QRg";
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
  const [admin, setAdmin] = React.useState(false);
  const [showLogin, setShowLogin] = React.useState(false);
  const [drillTime, setDrillTime] = React.useState(90);

  // Published plan state
  const [pubDrills, setPubDrills] = React.useState([]);
  const [pubExercises, setPubExercises] = React.useState([]);
  const [work, setWork] = React.useState(45);
  const [rest, setRest] = React.useState(15);
  const [rounds, setRounds] = React.useState(3);

  // Admin selection state
  const [selDrills, setSelDrills] = React.useState([]);
  const [selExercises, setSelExercises] = React.useState([]);

  // UI state
  const [drSkill, setDrSkill] = React.useState("All");
  const [exCat, setExCat] = React.useState("All");
  const [viewDrill, setViewDrill] = React.useState(null);
  const [practiceMode, setPracticeMode] = React.useState(false);
  const [showDrillTimer, setShowDrillTimer] = React.useState(true);
  const [pmIdx, setPmIdx] = React.useState(0);
  const [toast, setToast] = React.useState("");
  const [circuitStIdx, setCircuitStIdx] = React.useState(-1);

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
      setSelDrills(normDrills);
      setSelExercises(c.exercises || []);
      setWork(c.work || 45);
      setRest(c.rest || 15);
      setRounds(c.rounds || 3);
      setDrillTime(defaultTime);
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
    if (sessionStorage.getItem("bh-admin")) setAdmin(true);
  }, []);

  // Login/logout handlers
  const handleLogin = () => { setShowLogin(false); setAdmin(true); sessionStorage.setItem("bh-admin","1"); };
  const handleLogout = () => { setAdmin(false); sessionStorage.removeItem("bh-admin"); };

  // Publish handler
  const handlePublish = () => {
    const cfg = { drills: selDrills, exercises: selExercises, work, rest, rounds, drillTime };
    const doLocalPublish = () => {
      localStorage.setItem("bh-tennis-published", JSON.stringify(cfg));
      setPubDrills(selDrills);
      setPubExercises(selExercises);
      const url = window.location.origin + window.location.pathname + "#config=" + btoa(JSON.stringify(cfg));
      navigator.clipboard.writeText(url).then(() => {
        setToast("Plan published! Link copied to clipboard.");
        setTimeout(() => setToast(""), 3000);
      });
    };
    sbRest("published_plan", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({ id: 1, data: cfg })
    }).then(async (res) => {
      if (!res.ok) {
        doLocalPublish();
        setToast("Published locally. Supabase write failed.");
        setTimeout(() => setToast(""), 4000);
        return;
      }
      setPubDrills(selDrills);
      setPubExercises(selExercises);
      setToast("Plan published for everyone!");
      setTimeout(() => setToast(""), 3000);
    });
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

  // Filtered lists for admin category browsing
  const filteredDrills = DRILLS.filter(d =>
    (drSkill === "All" || d.skill === drSkill)
  );
  const filteredExercises = exCat === "All" ? EXERCISES : EXERCISES.filter(e => e.cat === exCat);

  // The drill list that non-admin players see (only published drills, in order)
  const playerDrills = pubDrills.map(d => {
    const drill = DRILLS.find(x => x.id === d.id);
    return drill ? { drill, time: d.time } : null;
  }).filter(Boolean);

  // The exercise list for non-admin
  const playerExercises = pubExercises.map(id => EXERCISES.find(e => e.id === id)).filter(Boolean);

  // Current drill for viewer
  const currentViewDrill = viewDrill ? DRILLS.find(d => d.id === viewDrill) : null;

  // Practice mode drill
  const pmDrills = admin
    ? selDrills.map(d => {
        const drill = DRILLS.find(x => x.id === d.id);
        return drill ? { drill, time: d.time } : null;
      }).filter(Boolean)
    : playerDrills;
  const pmDrill = pmDrills[pmIdx];

  // Admin's selected exercises for circuit
  const adminExercises = selExercises.map(id => EXERCISES.find(e => e.id === id)).filter(Boolean);

  // Circuit exercises to display
  const circuitExercises = admin ? adminExercises : playerExercises;

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
        <button onClick={() => { setTab("circuits"); setPracticeMode(false); }} style={tabBtn(tab==="circuits")}>
          Circuits
        </button>
        <button onClick={() => { setTab("drills"); setPracticeMode(false); }} style={tabBtn(tab==="drills")}>
          Drills
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
          practiceMode && pmDrills.length > 0 ? (
            /* Practice Mode */
            <div>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px"}}>
                <button onClick={() => setPracticeMode(false)} style={{padding:"8px 16px", background:BH.navy,
                  color:BH.white, border:"none", borderRadius:"6px", cursor:"pointer", fontSize:"13px"}}>
                  ← Back to Plan
                </button>
                <div style={{fontSize:"13px", color:BH.g700, fontWeight:"bold"}}>
                  Drill {pmIdx+1} of {pmDrills.length}: {pmDrill && pmDrill.drill && pmDrill.drill.name}
                </div>
              </div>
              {showDrillTimer && pmDrill && (
                <DrillTimer
                  duration={pmDrill.time}
                  resetKey={pmDrill.drill && pmDrill.drill.id}
                  onNext={() => setPmIdx(Math.min(pmDrills.length-1, pmIdx+1))}
                  canNext={pmIdx < pmDrills.length - 1}
                />
              )}
              <div style={{display:"flex", justifyContent:"flex-end", marginBottom:"12px"}}>
                <button onClick={() => setShowDrillTimer(v => !v)} style={{
                  padding:"6px 10px", background:BH.g200, color:BH.navy, border:`1px solid ${BH.g300}`,
                  borderRadius:"6px", cursor:"pointer", fontSize:"12px", fontWeight:"bold"
                }}>
                  {showDrillTimer ? "Hide Timer" : "Show Timer"}
                </button>
              </div>
              {pmDrill && <DrillViewer drill={pmDrill.drill}/>}
              <div style={{display:"flex", gap:"8px", marginTop:"16px"}}>
                <button onClick={() => setPmIdx(Math.max(0, pmIdx-1))} disabled={pmIdx<=0}
                  style={{flex:1, padding:"12px", background:pmIdx<=0?BH.g300:BH.navy, color:BH.white,
                    border:"none", borderRadius:"6px", cursor:"pointer", fontSize:"14px", fontWeight:"bold"}}>
                  ← Previous Drill
                </button>
                <button onClick={() => setPmIdx(Math.min(pmDrills.length-1, pmIdx+1))} disabled={pmIdx>=pmDrills.length-1}
                  style={{flex:1, padding:"12px", background:pmIdx>=pmDrills.length-1?BH.g300:BH.navy, color:BH.white,
                    border:"none", borderRadius:"6px", cursor:"pointer", fontSize:"14px", fontWeight:"bold"}}>
                  Next Drill →
                </button>
              </div>
            </div>
          ) : (
            /* Normal Drills View */
            <div style={{display:"flex", gap:"20px"}}>
              {/* Left sidebar */}
              <div style={{width:"300px", flexShrink:0}}>

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
                                 maxHeight:"350px", overflowY:"auto"}}>
                      <div style={{padding:"12px 14px", borderBottom:`1px solid ${BH.g200}`,
                                   fontSize:"13px", fontWeight:"bold", color:BH.navy}}>
                        All Drills
                      </div>
                      {filteredDrills.map(d => (
                        <div key={d.id} style={{padding:"8px 14px", display:"flex", gap:"8px", alignItems:"center",
                          cursor:"pointer", borderBottom:`1px solid ${BH.g100}`,
                          background:viewDrill===d.id ? `rgba(59,130,246,0.08)` : "transparent"}}
                          onClick={() => setViewDrill(d.id)}>
                          <input type="checkbox" checked={selDrills.some(x => x.id === d.id)}
                            onChange={(e) => { e.stopPropagation(); toggleDrill(d.id); }}
                            style={{cursor:"pointer", accentColor:BH.navy}}/>
                          <div style={{flex:1}}>
                            <div style={{fontSize:"12px", fontWeight:"bold", color:BH.navy}}>{d.name}</div>
                            <div style={{fontSize:"10px", color:BH.g500}}>{d.skill || d.cat} • {d.diff}</div>
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
                      <div style={{padding:"8px 14px", maxHeight:"200px", overflowY:"auto"}}>
                        {selDrills.length === 0 ? (
                          <div style={{fontSize:"12px", color:BH.g500, padding:"8px 0"}}>
                            Check drills above to build today's plan
                          </div>
                        ) : (
                          selDrills.map((entry, i) => {
                            const d = DRILLS.find(dr => dr.id === entry.id);
                            if (!d) return null;
                            return (
                              <div key={entry.id} style={{display:"flex", gap:"8px", alignItems:"center", padding:"4px 0",
                                borderBottom:i < selDrills.length-1 ? `1px solid ${BH.g100}` : "none"}}>
                                <span style={{fontSize:"11px", fontWeight:"bold", color:BH.maroon, minWidth:"18px"}}>{i+1}.</span>
                                <div style={{display:"flex", flexDirection:"column", gap:"2px"}}>
                                  <span style={{fontSize:"12px", color:BH.navy}}>{d.name}</span>
                                  <div style={{display:"flex", alignItems:"center", gap:"6px"}}>
                                    <span style={{fontSize:"10px", color:BH.g500}}>Time (sec)</span>
                                    <input type="number" value={entry.time}
                                      onChange={(e) => {
                                        const v = Math.max(10, Math.min(900, +e.target.value || 0));
                                        setSelDrills(sel => sel.map(x => x.id === entry.id ? { ...x, time: v } : x));
                                      }}
                                      style={{width:"64px", padding:"2px 6px", border:`1px solid ${BH.g300}`, borderRadius:"4px", fontSize:"11px"}}/>
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

                    {/* Drill timer setting */}
                    <div style={{background:BH.white, borderRadius:"8px", border:`1px solid ${BH.g300}`,
                                 marginTop:"16px", padding:"14px"}}>
                      <div style={{fontSize:"13px", fontWeight:"bold", color:BH.navy, marginBottom:"10px"}}>
                        Drill Timer
                      </div>
                      <label style={{fontSize:"12px", color:BH.g700, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                        Duration (sec)
                        <input type="number" value={drillTime} onChange={e => setDrillTime(+e.target.value)}
                          style={{width:"70px", padding:"4px 8px", border:`1px solid ${BH.g300}`, borderRadius:"4px"}} min="10" max="900"/>
                      </label>
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
                    {playerDrills.length > 0 && (
                      <div style={{padding:"12px 16px", borderTop:`1px solid ${BH.g200}`}}>
                        <button onClick={() => { setPracticeMode(true); setPmIdx(0); }}
                          style={{width:"100%", padding:"12px", background:BH.navy, color:BH.white,
                            border:"none", borderRadius:"6px", cursor:"pointer", fontSize:"14px", fontWeight:"bold"}}>
                          ▶ Practice Mode
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right: Drill Viewer */}
              <div style={{flex:1, minWidth:0}}>
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
          <div style={{display:"flex", gap:"20px"}}>
            {/* Left sidebar */}
            <div style={{width:"300px", flexShrink:0}}>
              {admin ? (
                /* Admin: category filter + exercise list + settings */
                <>
                  <div style={{display:"flex", flexWrap:"wrap", gap:"6px", marginBottom:"16px"}}>
                    {EX_CATS.map(c => (
                      <button key={c} onClick={() => setExCat(c)} style={catBtn(exCat===c)}>{c}</button>
                    ))}
                  </div>

                  <div style={{background:BH.white, borderRadius:"8px", border:`1px solid ${BH.g300}`,
                               maxHeight:"350px", overflowY:"auto"}}>
                    <div style={{padding:"12px 14px", borderBottom:`1px solid ${BH.g200}`,
                                 fontSize:"13px", fontWeight:"bold", color:BH.navy}}>
                      Exercises
                    </div>
                    {filteredExercises.map(e => (
                      <div key={e.id} style={{padding:"8px 14px", display:"flex", gap:"8px", alignItems:"center",
                        cursor:"pointer", borderBottom:`1px solid ${BH.g100}`}}
                        onClick={() => toggleExercise(e.id)}>
                        <input type="checkbox" checked={selExercises.includes(e.id)}
                          onChange={() => {}} style={{cursor:"pointer", accentColor:BH.navy}}/>
                        <div style={{flex:1}}>
                          <div style={{fontSize:"12px", fontWeight:"bold", color:BH.navy}}>{e.name}</div>
                          <div style={{fontSize:"10px", color:BH.g500}}>{e.cat} • {e.reps}</div>
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
                            <div key={id} style={{display:"flex", gap:"8px", alignItems:"center", padding:"3px 0"}}>
                              <span style={{fontSize:"11px", fontWeight:"bold", color:BH.maroon, minWidth:"18px"}}>{i+1}.</span>
                              <span style={{fontSize:"12px", color:BH.navy}}>{e.name}</span>
                              <button onClick={() => toggleExercise(id)} style={{marginLeft:"auto", background:"none",
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
                        onStation={(i) => setCircuitStIdx(i)}/>
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
                          <div key={e.id} style={{padding:"8px 16px", display:"flex", gap:"10px", alignItems:"center",
                            borderBottom:`1px solid ${BH.g100}`,
                            background:circuitStIdx===i ? `rgba(201,162,39,0.12)` : "transparent"}}>
                            <span style={{fontSize:"14px", fontWeight:"bold", color:BH.maroon, minWidth:"24px"}}>{i+1}</span>
                            <div>
                              <div style={{fontSize:"13px", fontWeight:"bold", color:BH.navy}}>{e.name}</div>
                              <div style={{fontSize:"11px", color:BH.g500}}>{e.reps} • {e.equip}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {playerExercises.length > 0 && (
                    <div style={{marginTop:"16px"}}>
                      <CircuitTimer work={work} rest={rest} rounds={rounds} exercises={playerExercises}
                        onStation={(i) => setCircuitStIdx(i)}/>
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
      </div>
    </div>
  );
}

// Mount the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
