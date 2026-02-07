// Court Components for Belmont Hill Tennis Training Web App
// Loaded via <script type="text/babel"> - uses global variables from data.js

/**
 * PlayerIcon Component
 * Bird's-eye view player icon with shot-type poses
 * Renders with white strokes, labels, ellipse body with head
 */
function PlayerIcon({px, py, color, label, shot, courtY}) {
  const up = courtY > 50;
  const baseR = up ? 0 : 180;

  // No shot: simple circle body + small head circle + label text
  if (!shot) return (
    <g>
      <circle cx={px} cy={py} r={14} fill={color} stroke={BH.white} strokeWidth={2.5}/>
      <circle cx={px} cy={py + (up ? -18 : 18)} r={3} fill={color} stroke={BH.white} strokeWidth={1.5}/>
      <text x={px} y={py + 1} textAnchor="middle" dominantBaseline="middle"
            fontSize="10" fontWeight="800" fill={BH.white}>{label}</text>
    </g>
  );

  // With shot: ellipse body + head + arm line + racquet ellipse
  const pose = POSES[shot] || POSES.forehand;
  const bRot = BODY_ROT[shot] || 0;
  return (
    <g transform={`translate(${px},${py}) rotate(${baseR + bRot})`}>
      <ellipse cx={0} cy={0} rx={10} ry={13} fill={color} stroke={BH.white} strokeWidth={2.5}/>
      <circle cx={0} cy={-11} r={4.5} fill={color} stroke={BH.white} strokeWidth={1.5}/>
      <line x1={pose[0]} y1={pose[1]} x2={pose[2]} y2={pose[3]}
            stroke={BH.white} strokeWidth={2.5} strokeLinecap="round"/>
      <ellipse cx={pose[2]} cy={pose[3]} rx={5} ry={3} fill="none" stroke={BH.white} strokeWidth={1.5}
        transform={`rotate(${pose[4]},${pose[2]},${pose[3]})`}/>
      <text x={0} y={2} textAnchor="middle" dominantBaseline="middle"
            fontSize="9" fontWeight="800" fill={BH.white}>{label}</text>
    </g>
  );
}

/**
 * Court Component
 * Renders full tennis court SVG with white lines, service boxes, net, and overlays
 * Displays shot arrows and player icons
 */
function Court({courtType, players, steps, activeStep, showAll}) {
  const L = CRT.PAD, R = CRT.W - CRT.PAD, T = CRT.PAD, B = CRT.H - CRT.PAD;

  // Filter visible steps
  const vis = steps.filter((_, i) => showAll || i <= activeStep);

  // Find the active hitter and their shot for PlayerIcon rendering
  const activeS = steps[activeStep];
  const hId = activeS && activeS.t === "hit" ? activeS.hitter : null;
  const hShot = activeS ? activeS.shot : null;

  // Arrow rendering function
  function arrow(s, i) {
    const x1 = mX(s.f[0]), y1 = mY(s.f[1]);
    const x2 = mX(s.to[0]), y2 = mY(s.to[1]);
    const isActive = i === activeStep;
    const op = isActive ? 1 : 0.4;
    const sw = isActive ? 3 : 2;
    const col = s.c || BH.shotBlue;
    const dashArr = s.t === "move" ? "6,4" : "none";
    const markerId = `ah${i}`;

    return (
      <g key={i} opacity={op}>
        <defs>
          <marker id={markerId} markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
            <path d="M0,0 L10,4 L0,8 Z" fill={col}/>
          </marker>
        </defs>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={col} strokeWidth={sw}
              markerEnd={`url(#${markerId})`} strokeDasharray={dashArr}/>
        {s.t === "hit" && s.n && (
          <g>
            <circle cx={(x1+x2)/2} cy={(y1+y2)/2} r={10} fill={BH.navy} stroke={BH.white} strokeWidth={1.5}/>
            <text x={(x1+x2)/2} y={(y1+y2)/2+1} textAnchor="middle" dominantBaseline="middle"
                  fontSize="9" fontWeight="bold" fill={BH.white}>{s.n}</text>
          </g>
        )}
        {s.note && isActive && (
          <text x={(x1+x2)/2} y={(y1+y2)/2 - 16} textAnchor="middle"
                fontSize="9" fontWeight="bold" fill={BH.navy}
                stroke={BH.white} strokeWidth={3} paintOrder="stroke">{s.note}</text>
        )}
      </g>
    );
  }

  return (
    <svg viewBox={`0 0 ${CRT.W} ${CRT.H}`}
         style={{width:"100%", maxWidth:360, background:BH.courtDark, borderRadius:12}}>
      {/* Court surface */}
      <rect x={L} y={T} width={R-L} height={B-T} fill={BH.courtGreen} rx={2}/>

      {/* Court outline - white */}
      <rect x={L} y={T} width={R-L} height={B-T} fill="none" stroke={BH.white} strokeWidth={2}/>

      {/* Singles sidelines */}
      <line x1={SL.l} y1={T} x2={SL.l} y2={B} stroke={BH.white} strokeWidth={1.5}/>
      <line x1={SL.r} y1={T} x2={SL.r} y2={B} stroke={BH.white} strokeWidth={1.5}/>

      {/* Service box lines */}
      <line x1={SL.l} y1={SVC.far} x2={SL.r} y2={SVC.far} stroke={BH.white} strokeWidth={1.5}/>
      <line x1={SL.l} y1={SVC.near} x2={SL.r} y2={SVC.near} stroke={BH.white} strokeWidth={1.5}/>

      {/* Center service line */}
      <line x1={mX(50)} y1={SVC.far} x2={mX(50)} y2={SVC.near} stroke={BH.white} strokeWidth={1.5}/>

      {/* Center marks at baselines */}
      <line x1={mX(50)} y1={T} x2={mX(50)} y2={T+12} stroke={BH.white} strokeWidth={1.5}/>
      <line x1={mX(50)} y1={B} x2={mX(50)} y2={B-12} stroke={BH.white} strokeWidth={1.5}/>

      {/* Net with posts */}
      <line x1={L-8} y1={NET_Y} x2={R+8} y2={NET_Y} stroke={BH.white} strokeWidth={3}/>
      <line x1={L-8} y1={NET_Y} x2={L-8} y2={NET_Y-8} stroke={BH.white} strokeWidth={2}/>
      <line x1={R+8} y1={NET_Y} x2={R+8} y2={NET_Y-8} stroke={BH.white} strokeWidth={2}/>

      {/* Shot arrows */}
      {vis.map((s, i) => arrow(s, i))}

      {/* Player icons */}
      {players.map(p => (
        <PlayerIcon key={p.id}
          px={mX(p.x)} py={mY(p.y)}
          color={p.color} label={p.id}
          shot={p.id === hId ? hShot : null}
          courtY={p.y}/>
      ))}
    </svg>
  );
}
