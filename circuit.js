/**
 * Circuit Training Components
 * Belmont Hill Tennis Training Web App
 *
 * Components:
 * - CircuitRing: Circular station layout
 * - CircuitTimer: Countdown timer with state machine
 */

/**
 * CircuitRing Component
 * Renders stations in a circle with dynamic sizing based on number of stations
 */
function CircuitRing({stations, activeIdx, timerIdx, onSelect}) {
  const n = stations.length;
  if (n === 0) return (
    <div style={{textAlign:"center", padding:"60px 20px", color:BH.g500, fontSize:"15px"}}>
      Select exercises to build your circuit
    </div>
  );

  const size = 320, cx = size/2, cy = size/2;
  const rad = Math.min(120, Math.max(80, 140 - n*4));
  const nr = Math.min(38, Math.max(24, 44 - n*2));
  const fs = Math.min(10, Math.max(7, 11 - n*0.3));

  return (
    <svg width={size} height={size} style={{display:"block", margin:"0 auto"}}>
      {/* Connecting ring */}
      <circle cx={cx} cy={cy} r={rad} fill="none" stroke={BH.g300} strokeWidth={1} strokeDasharray="4,3"/>

      {/* Center label */}
      <text x={cx} y={cy-6} textAnchor="middle" fontSize="11" fontWeight="bold" fill={BH.navy}>CIRCUIT</text>
      <text x={cx} y={cy+8} textAnchor="middle" fontSize="9" fill={BH.g500}>{n} stations</text>

      {/* Station nodes */}
      {stations.map((s, i) => {
        const ang = (i / n) * Math.PI * 2 - Math.PI / 2;
        const x = cx + rad * Math.cos(ang);
        const y = cy + rad * Math.sin(ang);
        const isActive = i === activeIdx;
        const isTimer = i === timerIdx;
        const fillCol = isTimer ? BH.shotGold : isActive ? BH.gold : BH.navy;
        const strokeCol = isTimer ? BH.shotRed : isActive ? BH.navy : BH.g400;
        const strokeW = isActive || isTimer ? 3 : 1.5;
        const scale = isActive ? 1.1 : 1;

        // Truncate name to fit
        const displayName = s.name.length > 12 ? s.name.substring(0, 11) + "…" : s.name;

        return (
          <g key={s.id} style={{cursor: onSelect ? "pointer" : "default"}}
             onClick={() => onSelect && onSelect(i)}
             transform={`translate(${x},${y}) scale(${scale})`}>
            <circle cx={0} cy={0} r={nr} fill={fillCol} stroke={strokeCol} strokeWidth={strokeW}/>
            <text x={0} y={-2} textAnchor="middle" dominantBaseline="middle"
                  fontSize={fs} fontWeight="bold" fill={BH.white}
                  style={{pointerEvents:"none"}}>{displayName}</text>
            <text x={0} y={nr*0.45} textAnchor="middle" fontSize={Math.max(6, fs-2)}
                  fill="rgba(255,255,255,0.7)" style={{pointerEvents:"none"}}>{s.reps || ""}</text>
          </g>
        );
      })}
    </svg>
  );
}

/**
 * CircuitTimer Component
 * Countdown timer with state machine for circuit training
 * States: idle → station → rest → (loop) or done
 */
function CircuitTimer({work, rest, rounds, exercises, onStation}) {
  const [phase, setPhase] = React.useState("idle");  // idle, station, rest, pausedStation, pausedRest, done
  const [time, setTime] = React.useState(0);
  const [stIdx, setStIdx] = React.useState(0);
  const [round, setRound] = React.useState(1);
  const timerRef = React.useRef(null);

  const totalStations = exercises.length;
  const dur = phase === "station" || phase === "pausedStation" ? work : phase === "rest" || phase === "pausedRest" ? rest : 0;

  // Reset everything when exercises change
  React.useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setPhase("idle");
    setTime(0);
    setStIdx(0);
    setRound(1);
  }, [exercises.length]);

  const tick = React.useCallback(() => {
    setTime(t => {
      if (t + 1 >= dur) {
        // Time's up for this phase
        if (phase === "station") {
          // Check if last station in round
          setStIdx(si => {
            if (si + 1 >= totalStations) {
              // End of round
              setRound(r => {
                if (r >= rounds) {
                  // All done!
                  setPhase("done");
                  snd.done();
                  if (timerRef.current) clearInterval(timerRef.current);
                  timerRef.current = null;
                  return r;
                }
                // Next round - go to rest
                snd.rest();
                setPhase("rest");
                return r;
              });
              return si;
            }
            // Next station, but rest first
            snd.rest();
            setPhase("rest");
            return si;
          });
        } else if (phase === "rest") {
          // Move to next station
          setStIdx(si => {
            let nextSi = si + 1;
            if (nextSi >= totalStations) {
              // New round
              nextSi = 0;
              setRound(r => r + 1);
            }
            if (onStation) onStation(nextSi);
            return nextSi;
          });
          snd.go();
          setPhase("station");
        }
        return 0;
      }
      // 3-second warning ticks
      if (dur - (t + 1) <= 3 && dur - (t + 1) > 0) snd.tick();
      return t + 1;
    });
  }, [phase, dur, totalStations, rounds, onStation]);

  // Run timer
  React.useEffect(() => {
    if (phase === "station" || phase === "rest") {
      timerRef.current = setInterval(tick, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [phase, tick]);

  function start() {
    setPhase("station");
    setTime(0);
    setStIdx(0);
    setRound(1);
    if (onStation) onStation(0);
    snd.go();
  }

  function pause() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setPhase(p => p === "station" ? "pausedStation" : p === "rest" ? "pausedRest" : p);
  }

  function resume() {
    setPhase(p => p === "pausedStation" ? "station" : p === "pausedRest" ? "rest" : p);
  }

  function reset() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setPhase("idle");
    setTime(0);
    setStIdx(0);
    setRound(1);
    if (onStation) onStation(-1);
  }

  const remaining = Math.max(0, dur - time);
  const pct = dur > 0 ? (time / dur) * 100 : 0;
  const isRunning = phase === "station" || phase === "rest";
  const isPaused = phase === "pausedStation" || phase === "pausedRest";
  const isWork = phase === "station" || phase === "pausedStation";
  const col = isWork ? BH.shotBlue : BH.shotGold;
  const circumference = 2 * Math.PI * 90;

  const currentEx = exercises[stIdx];

  return (
    <div style={{textAlign:"center", padding:"16px 0"}}>
      {/* Current exercise name */}
      {currentEx && phase !== "idle" && phase !== "done" && (
        <div style={{fontSize:"16px", fontWeight:"bold", color:BH.navy, marginBottom:"8px"}}>
          {currentEx.name}
        </div>
      )}

      {/* Circular progress */}
      <div style={{position:"relative", width:"200px", height:"200px", margin:"0 auto"}}>
        <svg width="200" height="200">
          <circle cx="100" cy="100" r="90" fill="none" stroke={BH.g200} strokeWidth="6"/>
          {dur > 0 && (
            <circle cx="100" cy="100" r="90" fill="none" stroke={col} strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - pct/100)}
              strokeLinecap="round"
              transform="rotate(-90 100 100)"
              style={{transition:"stroke-dashoffset 0.3s"}}/>
          )}
        </svg>
        <div style={{position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", textAlign:"center"}}>
          {phase === "idle" ? (
            <div style={{fontSize:"18px", fontWeight:"bold", color:BH.navy}}>READY</div>
          ) : phase === "done" ? (
            <div>
              <div style={{fontSize:"18px", fontWeight:"bold", color:BH.gold}}>DONE!</div>
              <div style={{fontSize:"11px", color:BH.g500, marginTop:"4px"}}>Great work!</div>
            </div>
          ) : (
            <>
              <div style={{fontSize:"48px", fontWeight:"bold", color:col, lineHeight:1}}>{remaining}</div>
              <div style={{fontSize:"13px", fontWeight:"bold", color:isWork?BH.navy:BH.shotGold, marginTop:"4px"}}>
                {isWork ? "WORK" : "REST"}
              </div>
              <div style={{fontSize:"11px", color:BH.g500, marginTop:"2px"}}>
                Round {round}/{rounds} • Station {stIdx+1}/{totalStations}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Controls */}
      <div style={{display:"flex", gap:"8px", justifyContent:"center", marginTop:"16px"}}>
        {phase === "idle" && (
          <button onClick={start} style={{padding:"12px 32px", background:BH.shotBlue, color:BH.white,
            border:"none", borderRadius:"6px", cursor:"pointer", fontSize:"15px", fontWeight:"bold"}}>
            START
          </button>
        )}
        {isRunning && (
          <button onClick={pause} style={{padding:"12px 24px", background:BH.shotGold, color:BH.navy,
            border:"none", borderRadius:"6px", cursor:"pointer", fontSize:"14px", fontWeight:"bold"}}>
            PAUSE
          </button>
        )}
        {isPaused && (
          <button onClick={resume} style={{padding:"12px 24px", background:BH.shotBlue, color:BH.white,
            border:"none", borderRadius:"6px", cursor:"pointer", fontSize:"14px", fontWeight:"bold"}}>
            RESUME
          </button>
        )}
        {(isRunning || isPaused || phase === "done") && (
          <button onClick={reset} style={{padding:"12px 24px", background:BH.g400, color:BH.white,
            border:"none", borderRadius:"6px", cursor:"pointer", fontSize:"14px", fontWeight:"bold"}}>
            RESET
          </button>
        )}
      </div>
    </div>
  );
}
