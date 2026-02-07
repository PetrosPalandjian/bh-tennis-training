// Court Components for Belmont Hill Tennis Training Web App
// Loaded via <script type="text/babel"> - uses global variables from data.js

/**
 * Tennis Player Silhouette Paths (side-view, centered at origin)
 * Each path is 30-36 units tall, showing body, legs, arm with racquet
 * "near" position faces up, "far" position is flipped vertically
 */
const PLAYER_PATHS = {
  ready: "M-3,-14 Q-5,-10 -4,-4 L-6,-2 L-6,8 M3,-14 Q5,-10 4,-4 L6,-2 L6,8 M-3,-14 L3,-14 L2,-8 L-2,-8 Z M-2,-6 Q-4,-5 -5,2 M2,-6 Q4,-5 5,2",

  forehand: "M-4,-14 Q-6,-10 -5,-4 L-8,-2 L-8,10 M2,-14 Q3,-10 2,-2 L4,1 L4,10 M-4,-14 L2,-14 L1,-8 L-3,-8 Z M1,-5 L8,-8 L11,-12 Q12,-14 10,-14 L8,-12 Z",

  backhand: "M-2,-14 Q-3,-10 -2,-2 L-4,1 L-4,10 M4,-14 Q6,-10 5,-4 L8,-2 L8,10 M-2,-14 L4,-14 L3,-8 L-1,-8 Z M-1,-5 L-8,-8 L-11,-12 Q-12,-14 -10,-14 L-8,-12 Z",

  serve: "M-3,-14 Q-5,-9 -4,-2 L-7,2 L-7,10 M3,-14 Q5,-9 4,-2 L5,4 L5,10 M-3,-14 L3,-14 L1,-8 L-1,-8 Z M3,-4 L6,-14 L9,-16 Q10,-17 9,-18 L7,-16 Z",

  fh_volley: "M-3,-12 Q-5,-8 -4,0 L-6,2 L-6,8 M3,-12 Q4,-8 3,0 L5,2 L5,8 M-3,-12 L3,-12 L2,-6 L-2,-6 Z M2,-4 L7,-6 L9,-10 Q9,-12 7,-11 L6,-8 Z",

  bh_volley: "M-3,-12 Q-4,-8 -3,0 L-5,2 L-5,8 M3,-12 Q5,-8 4,0 L6,2 L6,8 M-3,-12 L3,-12 L2,-6 L-2,-6 Z M-2,-4 L-7,-6 L-9,-10 Q-9,-12 -7,-11 L-6,-8 Z",

  overhead: "M-3,-14 Q-5,-9 -4,-1 L-7,2 L-7,10 M3,-14 Q5,-9 4,-1 L5,3 L5,10 M-3,-14 L3,-14 L1,-7 L-1,-7 Z M3,-3 L8,-14 L10,-18 Q11,-19 10,-20 L8,-17 Z",

  slice_fh: "M-3,-14 Q-5,-10 -4,-3 L-7,0 L-7,8 M3,-14 Q4,-10 3,-3 L5,1 L5,8 M-3,-14 L3,-14 L1,-8 L-1,-8 Z M2,-1 L8,-1 L10,-3 Q11,-4 10,-5 L8,-4 Z",

  slice_bh: "M-3,-14 Q-4,-10 -3,-3 L-5,1 L-5,8 M3,-14 Q5,-10 4,-3 L7,0 L7,8 M-3,-14 L3,-14 L1,-8 L-1,-8 Z M-2,-1 L-8,-1 L-10,-3 Q-11,-4 -10,-5 L-8,-4 Z"
};

/**
 * PlayerIcon Component
 * Bird's-eye view player icon with shot-type silhouettes
 * Renders with team color fill, white strokes, and player label
 */
function PlayerIcon({px, py, color, label, shot, courtY}) {
  // Determine if player is on "far" side (top of court, looking away)
  const isFar = courtY < 50;
  const scaleY = isFar ? -1 : 1;

  // Get the silhouette path for this shot type
  const pathKey = shot ? shot : "ready";
  const pathD = PLAYER_PATHS[pathKey] || PLAYER_PATHS.ready;

  return (
    <g transform={`translate(${px},${py})`}>
      {/* Player silhouette */}
      <path d={pathD} fill={color} stroke={BH.white} strokeWidth={1.8}
            transform={`scale(1,${scaleY})`} strokeLinejoin="round" strokeLinecap="round"/>

      {/* Player label positioned below/above silhouette */}
      <text x={0} y={isFar ? -20 : 20} textAnchor="middle" dominantBaseline="middle"
            fontSize="11" fontWeight="800" fill={BH.white}>{label}</text>
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
