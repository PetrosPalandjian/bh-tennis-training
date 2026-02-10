/**
 * Circuit Training Components
 * Belmont Hill Tennis Training Web App
 *
 * Components:
 * - CircuitRing: Circular station layout
 * - CircuitTimer: Compact horizontal countdown timer with state machine
 */

/**
 * CircuitRing Component
 * Renders stations in a circle with dynamic sizing based on number of stations
 * All stations are same color (navy). Selected station gets subtle highlight.
 */
function CircuitRing({stations, selectedIdx, onSelect, onRemove}) {
  const n = stations.length;
  if (n === 0) return (
    <div style={{textAlign:"center", padding:"60px 20px", color:BH.g500, fontSize:"15px"}}>
      Select exercises to build your circuit
    </div>
  );

  const size = Math.max(320, Math.min(520, (typeof window !== "undefined" ? window.innerWidth : 520) - 40));
  const padY = size * 0.08;
  const width = size;
  const height = size + padY * 2;
  const cx = width / 2, cy = height / 2;
  const rad = size * 0.385;
  const nr = size * 0.092;
  const fs = size < 420 ? 10 : 11;

  // Helper to wrap text into multiple lines
  function wrapText(text, maxLen) {
    const words = text.split(" ");
    const lines = [];
    let currentLine = "";
    for (const word of words) {
      if ((currentLine + " " + word).trim().length <= maxLen) {
        currentLine = currentLine ? currentLine + " " + word : word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  return (
    <svg width={width} height={height} style={{display:"block", margin:"0 auto", maxWidth:"100%"}}>
      {/* Connecting ring */}
      <circle cx={cx} cy={cy} r={rad} fill="none" stroke={BH.g300} strokeWidth={1} strokeDasharray="4,3"/>

      {/* Center label */}
      <text x={cx} y={cy-6} textAnchor="middle" fontSize="13" fontWeight="bold" fill={BH.navy}>CIRCUIT</text>
      <text x={cx} y={cy+10} textAnchor="middle" fontSize="11" fill={BH.g500}>{n} stations</text>

      {/* Station nodes */}
      {stations.map((s, i) => {
        const ang = (i / n) * Math.PI * 2 - Math.PI / 2;
        const x = cx + rad * Math.cos(ang);
        const y = cy + rad * Math.sin(ang);
        const isSelected = i === selectedIdx;

        // All stations are navy, selected gets gold border
        const fillCol = BH.navy;
        const strokeCol = isSelected ? BH.maroon : BH.g400;
        const strokeW = isSelected ? 3 : 1.5;

        // Wrap exercise name
        const lines = wrapText(s.name, 10);
        const stationNum = String(i + 1);

        return (
          <g key={s.id} style={{cursor: onSelect ? "pointer" : "default"}}
             onClick={() => onSelect && onSelect(i)}>
            <circle cx={x} cy={y} r={nr} fill={fillCol} stroke={strokeCol} strokeWidth={strokeW}/>

            {/* Station number above */}
            <text x={x} y={y - nr - 12} textAnchor="middle" fontSize="12" fontWeight="bold"
                  fill={BH.navy} style={{pointerEvents:"none", paintOrder:"stroke", stroke:BH.white, strokeWidth:3}}>
              {stationNum}
            </text>

            {/* Exercise name, wrapped */}
            {lines.length === 1 && (
              <text x={x} y={y + 2} textAnchor="middle" dominantBaseline="middle"
                    fontSize={fs} fontWeight="bold" fill={BH.white}
                    style={{pointerEvents:"none"}}>{lines[0]}</text>
            )}
            {lines.length === 2 && (
              <>
                <text x={x} y={y - 4} textAnchor="middle" dominantBaseline="middle"
                      fontSize={fs} fontWeight="bold" fill={BH.white}
                      style={{pointerEvents:"none"}}>{lines[0]}</text>
                <text x={x} y={y + 8} textAnchor="middle" dominantBaseline="middle"
                      fontSize={fs} fontWeight="bold" fill={BH.white}
                      style={{pointerEvents:"none"}}>{lines[1]}</text>
              </>
            )}
            {lines.length >= 3 && (
              <>
                <text x={x} y={y - 8} textAnchor="middle" dominantBaseline="middle"
                      fontSize={fs} fontWeight="bold" fill={BH.white}
                      style={{pointerEvents:"none"}}>{lines[0]}</text>
                <text x={x} y={y + 2} textAnchor="middle" dominantBaseline="middle"
                      fontSize={fs} fontWeight="bold" fill={BH.white}
                      style={{pointerEvents:"none"}}>{lines[1]}</text>
                <text x={x} y={y + 12} textAnchor="middle" dominantBaseline="middle"
                      fontSize={fs} fontWeight="bold" fill={BH.white}
                      style={{pointerEvents:"none"}}>{lines[2]}</text>
              </>
            )}

            {/* Reps/sets info below */}
            <text x={x} y={y + nr + 12} textAnchor="middle" fontSize="9"
                  fill={BH.g500} style={{pointerEvents:"none"}}>{s.reps || ""}</text>

            {/* Remove button (admin only) */}
            {onRemove && (
              <g style={{cursor:"pointer"}}
                 onClick={(e) => { e.stopPropagation(); onRemove(i); }}>
                <circle cx={x + nr * 0.7} cy={y - nr * 0.7} r={10}
                        fill={BH.shotRed || "#E74C3C"} stroke={BH.white} strokeWidth={1.5}/>
                <text x={x + nr * 0.7} y={y - nr * 0.7 + 1} textAnchor="middle"
                      dominantBaseline="middle" fontSize="13" fontWeight="bold"
                      fill={BH.white} style={{pointerEvents:"none"}}>×</text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/**
 * CircuitTimer Component
 * Compact horizontal countdown timer with state machine for circuit training
 * States: idle → station → rest → (loop) or done
 * Renders as a compact toolbar-style timer bar (~70px height)
 */
function CircuitTimer({work, rest, rounds, exercises, onStation, onPhaseInfo, session, isAdmin, onAdminStart, onAdminPause, onAdminResume, onAdminReset}) {
  const [phase, setPhase] = React.useState("idle");  // idle, station, rest, pausedStation, pausedRest, done
  const [time, setTime] = React.useState(0);
  const [stIdx, setStIdx] = React.useState(0);
  const [round, setRound] = React.useState(1);
  const timerRef = React.useRef(null);
  const [nowTs, setNowTs] = React.useState(Date.now());

  const totalStations = exercises.length;
  const dur = phase === "station" || phase === "pausedStation" ? work : phase === "rest" || phase === "pausedRest" ? rest : 0;
  const sessionMode = !!session;

  function deriveFromSession() {
    if (!session || totalStations <= 0 || rounds <= 0) {
      return { phase: "idle", remaining: 0, round: 1, stIdx: 0 };
    }
    const status = session.status || "idle";
    if (status === "idle" || !session.start_time) {
      return { phase: "idle", remaining: 0, round: 1, stIdx: 0 };
    }
    const elapsed = status === "paused"
      ? (session.elapsed_at_pause || 0)
      : Math.max(0, Math.floor((nowTs - Date.parse(session.start_time)) / 1000));
    const unit = work + rest;
    const totalStationsAll = totalStations * rounds;
    const totalDuration = totalStationsAll > 0 ? (totalStationsAll - 1) * unit + work : 0;
    if (elapsed >= totalDuration) {
      return { phase: "done", remaining: 0, round: rounds, stIdx: totalStations - 1 };
    }
    let blockIndex = 0;
    let timeInBlock = elapsed;
    if (totalStationsAll > 1) {
      const lastStart = (totalStationsAll - 1) * unit;
      if (elapsed >= lastStart) {
        blockIndex = totalStationsAll - 1;
        timeInBlock = elapsed - lastStart;
      } else {
        blockIndex = Math.floor(elapsed / unit);
        timeInBlock = elapsed % unit;
      }
    }
    const st = blockIndex % totalStations;
    const rd = Math.floor(blockIndex / totalStations) + 1;
    const isWork = timeInBlock < work;
    const rem = isWork ? (work - timeInBlock) : (unit - timeInBlock);
    let ph = isWork ? "station" : "rest";
    if (status === "paused") ph = ph === "station" ? "pausedStation" : "pausedRest";
    return { phase: ph, remaining: rem, round: rd, stIdx: st };
  }

  const derived = sessionMode ? deriveFromSession() : null;

  // Reset everything when exercises change (local mode only)
  React.useEffect(() => {
    if (sessionMode) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setPhase("idle");
    setTime(0);
    setStIdx(0);
    setRound(1);
  }, [exercises.length, sessionMode]);

  // Expose phase info to parent
  React.useEffect(() => {
    if (onPhaseInfo) {
      onPhaseInfo({
        phase: sessionMode ? derived.phase : phase,
        time: sessionMode ? (dur - derived.remaining) : time,
        round: sessionMode ? derived.round : round,
        stIdx: sessionMode ? derived.stIdx : stIdx,
        remaining: sessionMode ? derived.remaining : Math.max(0, dur - time),
        totalStations,
        rounds
      });
    }
  }, [phase, time, round, stIdx, dur, totalStations, rounds, onPhaseInfo, sessionMode, derived]);

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

  // Run timer (local mode only)
  React.useEffect(() => {
    if (sessionMode) return;
    if (phase === "station" || phase === "rest") {
      timerRef.current = setInterval(tick, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [phase, tick, sessionMode]);

  // Tick clock for session mode
  React.useEffect(() => {
    if (!sessionMode) return;
    if (!session || session.status !== "running") return;
    const t = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(t);
  }, [sessionMode, session && session.status]);

  // Sync selection for session mode
  React.useEffect(() => {
    if (!sessionMode || !onStation || !derived) return;
    onStation(derived.stIdx);
  }, [sessionMode, derived && derived.stIdx, onStation]);

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

  const effectivePhase = sessionMode ? derived.phase : phase;
  const remaining = sessionMode ? derived.remaining : Math.max(0, dur - time);
  const isRunning = effectivePhase === "station" || effectivePhase === "rest";
  const isPaused = effectivePhase === "pausedStation" || effectivePhase === "pausedRest";
  const isWork = effectivePhase === "station" || effectivePhase === "pausedStation";
  const col = isWork ? BH.shotBlue : BH.shotGold;

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "16px",
      padding: "8px 16px",
      background: BH.g100,
      borderRadius: "8px",
      minHeight: "70px",
      fontSize: "14px",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      {/* Countdown number - big and bold */}
      <div style={{
        fontSize: "42px",
        fontWeight: "bold",
        color: effectivePhase === "idle" ? BH.g400 : col,
        minWidth: "80px",
        textAlign: "center",
        fontVariantNumeric: "tabular-nums"
      }}>
        {effectivePhase === "idle" ? "—" : effectivePhase === "done" ? "✓" : remaining}
      </div>

      {/* Divider */}
      <div style={{width: "1px", height: "50px", background: BH.g300}} />

      {/* Phase label and info */}
      <div style={{flex: 1}}>
        {effectivePhase === "idle" && (
          <div style={{color: BH.g500, fontSize: "13px"}}>
            {isAdmin ? "Ready to start" : "Waiting for coach..."}
          </div>
        )}
        {effectivePhase === "done" && (
          <div style={{fontWeight: "bold", color: BH.maroon}}>CIRCUIT COMPLETE!</div>
        )}
        {(effectivePhase === "station" || effectivePhase === "pausedStation") && (
          <>
            <div style={{fontWeight: "bold", color: BH.shotBlue, marginBottom: "2px"}}>WORK</div>
            <div style={{fontSize: "12px", color: BH.g500}}>
              Round {sessionMode ? derived.round : round}/{rounds} • Station {(sessionMode ? derived.stIdx : stIdx) + 1}/{totalStations}
            </div>
          </>
        )}
        {(effectivePhase === "rest" || effectivePhase === "pausedRest") && (
          <>
            <div style={{fontWeight: "bold", color: BH.shotGold, marginBottom: "2px"}}>REST</div>
            <div style={{fontSize: "12px", color: BH.g500}}>
              Round {sessionMode ? derived.round : round}/{rounds} • Next: Station {((sessionMode ? derived.stIdx : stIdx) + 1) % totalStations + 1}
            </div>
          </>
        )}
      </div>

      {/* Control buttons */}
      <div style={{display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end"}}>
        {effectivePhase === "idle" && (
          <button onClick={sessionMode ? onAdminStart : start} disabled={sessionMode && !isAdmin} style={{
            padding: "8px 12px",
            background: BH.shotBlue,
            color: BH.white,
            border: "none",
            borderRadius: "4px",
            cursor: sessionMode && !isAdmin ? "not-allowed" : "pointer",
            fontSize: "13px",
            fontWeight: "bold",
            whiteSpace: "nowrap",
            opacity: sessionMode && !isAdmin ? 0.5 : 1
          }}>
            START
          </button>
        )}
        {isRunning && (
          <button onClick={sessionMode ? onAdminPause : pause} disabled={sessionMode && !isAdmin} style={{
            padding: "8px 12px",
            background: BH.shotGold,
            color: BH.navy,
            border: "none",
            borderRadius: "4px",
            cursor: sessionMode && !isAdmin ? "not-allowed" : "pointer",
            fontSize: "13px",
            fontWeight: "bold",
            whiteSpace: "nowrap",
            opacity: sessionMode && !isAdmin ? 0.5 : 1
          }}>
            PAUSE
          </button>
        )}
        {isPaused && (
          <button onClick={sessionMode ? onAdminResume : resume} disabled={sessionMode && !isAdmin} style={{
            padding: "8px 12px",
            background: BH.shotBlue,
            color: BH.white,
            border: "none",
            borderRadius: "4px",
            cursor: sessionMode && !isAdmin ? "not-allowed" : "pointer",
            fontSize: "13px",
            fontWeight: "bold",
            whiteSpace: "nowrap",
            opacity: sessionMode && !isAdmin ? 0.5 : 1
          }}>
            RESUME
          </button>
        )}
        {(isRunning || isPaused || effectivePhase === "done") && (
          <button onClick={sessionMode ? onAdminReset : reset} disabled={sessionMode && !isAdmin} style={{
            padding: "8px 12px",
            background: BH.g400,
            color: BH.white,
            border: "none",
            borderRadius: "4px",
            cursor: sessionMode && !isAdmin ? "not-allowed" : "pointer",
            fontSize: "13px",
            fontWeight: "bold",
            whiteSpace: "nowrap",
            opacity: sessionMode && !isAdmin ? 0.5 : 1
          }}>
            RESET
          </button>
        )}
      </div>
    </div>
  );
}
