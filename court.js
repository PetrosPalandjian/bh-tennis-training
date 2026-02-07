// Court Components for Belmont Hill Tennis Training Web App
// Loaded via <script type="text/babel"> - uses global variables from data.js

/**
 * Shot Type Abbreviations & Colors
 * Used as badges on player markers, Sportplan-style
 */
const SHOT_INFO = {
  forehand:  { abbr: "FH", icon: "→" },
  backhand:  { abbr: "BH", icon: "←" },
  serve:     { abbr: "SV", icon: "↑" },
  fh_volley: { abbr: "FV", icon: "⤴" },
  bh_volley: { abbr: "BV", icon: "⤵" },
  overhead:  { abbr: "OH", icon: "⬆" },
  slice_fh:  { abbr: "SF", icon: "↗" },
  slice_bh:  { abbr: "SB", icon: "↖" },
};

/**
 * PlayerIcon Component — Sportplan-style clean marker
 *
 * Design: Colored circle with player letter in center,
 * small shot-type badge offset to the side when active.
 * Clean, readable on iPad screens at any size.
 */
function PlayerIcon({px, py, color, label, shot, courtY}) {
  const isFar = courtY < 50;
  const info = shot ? SHOT_INFO[shot] : null;

  // Main circle radius
  const r = 16;
  // Badge offset direction (show badge toward center of court for readability)
  const badgeX = 14;
  const badgeY = isFar ? 14 : -14;

  return (
    <g style={{transform:`translate(${px}px,${py}px)`, transition:"transform 0.4s ease-in-out"}}>
      {/* Drop shadow for depth */}
      <circle cx={1} cy={2} r={r} fill="rgba(0,0,0,0.25)"/>

      {/* Main player circle */}
      <circle cx={0} cy={0} r={r} fill={color} stroke={BH.white} strokeWidth={2.5}/>

      {/* Player label (letter) centered */}
      <text x={0} y={1} textAnchor="middle" dominantBaseline="middle"
            fontSize="14" fontWeight="900" fill={BH.white}
            style={{letterSpacing:"0.5px"}}>{label}</text>

      {/* Shot-type badge when active */}
      {info && (
        <g>
          <rect x={badgeX - 13} y={badgeY - 7} width={26} height={14}
                rx={3} fill={BH.navy} stroke={BH.white} strokeWidth={1.2}/>
          <text x={badgeX} y={badgeY + 1} textAnchor="middle" dominantBaseline="middle"
                fontSize="8" fontWeight="bold" fill={BH.white}
                style={{letterSpacing:"0.5px"}}>{info.abbr}</text>
        </g>
      )}

      {/* Direction indicator - small arrow showing facing direction */}
      {!info && (
        <g>
          {isFar ? (
            <polygon points="-4,-20 4,-20 0,-25" fill={color} stroke={BH.white} strokeWidth={1} opacity={0.7}/>
          ) : (
            <polygon points="-4,20 4,20 0,25" fill={color} stroke={BH.white} strokeWidth={1} opacity={0.7}/>
          )}
        </g>
      )}
    </g>
  );
}

/**
 * Court Component
 * Renders full tennis court SVG with white lines, service boxes, net, and overlays
 * Displays shot arrows and player icons
 * Now includes smooth animated transitions via SVG <animate> elements
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
    const op = isActive ? 1 : 0.35;
    const sw = isActive ? 3 : 1.8;
    const col = s.c || BH.shotBlue;
    const dashArr = s.t === "move" ? "6,4" : "none";
    const markerId = `ah${i}`;

    return (
      <g key={i} opacity={op} style={{transition:"opacity 0.3s ease"}}>
        <defs>
          <marker id={markerId} markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
            <path d="M0,0 L10,4 L0,8 Z" fill={col}/>
          </marker>
        </defs>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={col} strokeWidth={sw}
              markerEnd={`url(#${markerId})`} strokeDasharray={dashArr}/>
        {/* Step number badge on arrow midpoint */}
        {s.t === "hit" && s.n && (
          <g>
            <circle cx={(x1+x2)/2} cy={(y1+y2)/2} r={10} fill={BH.navy} stroke={BH.white} strokeWidth={1.5}/>
            <text x={(x1+x2)/2} y={(y1+y2)/2+1} textAnchor="middle" dominantBaseline="middle"
                  fontSize="9" fontWeight="bold" fill={BH.white}>{s.n}</text>
          </g>
        )}
        {/* Note label on active arrow */}
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
