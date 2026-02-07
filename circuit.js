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

  const size = 520, cx = size/2, cy = size/2;
  const rad = 200;
  const nr = 48;
  const fs = 11;

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
    <svg width={size} height={size} style={{display:"block", margin:"0 auto"}}>
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
            <text x={x} y={y - nr + 4} textAnchor="middle" fontSize="12" fontWeight="bold"
                  fill={BH.navy} style={{pointerEvents:"none"}}>
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
function CircuitTimer({work, rest, rounds, exercises, onStation, onPhaseInfo}) {
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

  // Expose phase info to parent
  React.useEffect(() => {
    if (onPhaseInfo) {
      onPhaseInfo({
        phase,
        time,
        round,
        stIdx,
        remaining: Math.max(0, dur - time),
        totalStations,
        rounds
      });
    }
  }, [phase, time, round, stIdx, dur, totalStations, rounds, onPhaseInfo]);

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
  const isRunning = phase === "station" || phase === "rest";
  const isPaused = phase === "pausedStation" || phase === "pausedRest";
  const isWork = phase === "station" || phase === "pausedStation";
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
        color: phase === "idle" ? BH.g400 : col,
        minWidth: "80px",
        textAlign: "center",
        fontVariantNumeric: "tabular-nums"
      }}>
        {phase === "idle" ? "—" : phase === "done" ? "✓" : remaining}
      </div>

      {/* Divider */}
      <div style={{width: "1px", height: "50px", background: BH.g300}} />

      {/* Phase label and info */}
      <div style={{flex: 1}}>
        {phase === "idle" && (
          <div style={{color: BH.g500, fontSize: "13px"}}>Ready to start</div>
        )}
        {phase === "done" && (
          <div style={{fontWeight: "bold", color: BH.maroon}}>CIRCUIT COMPLETE!</div>
        )}
        {(phase === "station" || phase === "pausedStation") && (
          <>
            <div style={{fontWeight: "bold", color: BH.shotBlue, marginBottom: "2px"}}>WORK</div>
            <div style={{fontSize: "12px", color: BH.g500}}>
              Round {round}/{rounds} • Station {stIdx + 1}/{totalStations}
            </div>
          </>
        )}
        {(phase === "rest" || phase === "pausedRest") && (
          <>
            <div style={{fontWeight: "bold", color: BH.shotGold, marginBottom: "2px"}}>REST</div>
            <div style={{fontSize: "12px", color: BH.g500}}>
              Round {round}/{rounds} • Next: Station {(stIdx + 1) % totalStations + 1}
            </div>
          </>
        )}
      </div>

      {/* Control buttons */}
      <div style={{display: "flex", gap: "8px"}}>
        {phase === "idle" && (
          <button onClick={start} style={{
            padding: "8px 16px",
            background: BH.shotBlue,
            color: BH.white,
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "bold",
            whiteSpace: "nowrap"
          }}>
            START
          </button>
        )}
        {isRunning && (
          <button onClick={pause} style={{
            padding: "8px 14px",
            background: BH.shotGold,
            color: BH.navy,
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "bold",
            whiteSpace: "nowrap"
          }}>
            PAUSE
          </button>
        )}
        {isPaused && (
          <button onClick={resume} style={{
            padding: "8px 14px",
            background: BH.shotBlue,
            color: BH.white,
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "bold",
            whiteSpace: "nowrap"
          }}>
            RESUME
          </button>
        )}
        {(isRunning || isPaused || phase === "done") && (
          <button onClick={reset} style={{
            padding: "8px 14px",
            background: BH.g400,
            color: BH.white,
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "bold",
            whiteSpace: "nowrap"
          }}>
            RESET
          </button>
        )}
      </div>
    </div>
  );
}
