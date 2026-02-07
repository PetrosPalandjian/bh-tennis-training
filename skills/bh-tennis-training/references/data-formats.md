# Data Format Reference

Quick-reference for the exact data structures used in data.js. Copy these templates when adding new content.

## Complete Drill Example (with YouTube + move-hit-recover)

```js
{
  id:"cc-fh",
  name:"Crosscourt Forehand",
  cat:"Groundstrokes",
  diff:"Beginner",
  desc:"Rally crosscourt FH from deuce side. Both players start on the deuce (right) side of the baseline. Hit forehands diagonally crosscourt to each other, aiming deep into the service box corner. Focus on consistent topspin, high net clearance, and recovering to center after each shot.",
  tips:[
    "Keep a high net clearance — aim 3-5 feet over the net",
    "Follow through across your body for natural topspin",
    "Small split step between shots to stay balanced",
    "Turn sideways before contact and rotate through the core",
    "Use targets or cones in the crosscourt zone to build accuracy"
  ],
  youtubeId:"UwIPqGkQO80",
  youtubeStart:80,
  youtubeEnd:150,
  courtType:"singles",
  players:[
    {id:"A",x:50,y:95,color:BH.shotBlue},
    {id:"B",x:50,y:5,color:BH.shotRed}
  ],
  steps:[
    // Player A: move to ball → hit → recover
    {t:"move",f:[50,95],to:[72,95],c:BH.shotBlue,note:"A moves to deuce side"},
    {t:"hit",f:[72,95],to:[28,8],c:BH.shotBlue,n:"1",shot:"forehand",hitter:"A",note:"Crosscourt FH deep"},
    {t:"move",f:[72,95],to:[50,95],c:BH.shotBlue,note:"A recovers to center"},
    // Player B: move to ball → hit → recover
    {t:"move",f:[50,5],to:[28,5],c:BH.shotRed,note:"B moves to ball"},
    {t:"hit",f:[28,5],to:[72,95],c:BH.shotRed,n:"2",shot:"forehand",hitter:"B",note:"Crosscourt FH back"},
    {t:"move",f:[28,5],to:[50,5],c:BH.shotRed,note:"B recovers to center"},
    // Player A again
    {t:"move",f:[50,95],to:[72,95],c:BH.shotBlue,note:"A moves to ball"},
    {t:"hit",f:[72,95],to:[28,8],c:BH.shotBlue,n:"3",shot:"forehand",hitter:"A",note:"Crosscourt FH deep"},
    {t:"move",f:[72,95],to:[50,95],c:BH.shotBlue,note:"A recovers to center"}
  ]
}
```

## Serve Pattern Example

```js
{
  id:"sv-wide-d",
  name:"Serve Wide Deuce",
  cat:"Serve & Return",
  diff:"Intermediate",
  desc:"Wide serve + first ball attack",
  tips:["Kick it out wide","Close to net quickly","Attack the open court"],
  youtubeId:null,
  courtType:"singles",
  players:[
    {id:"S",x:55,y:98,color:BH.shotBlue},  // Server near baseline center-right
    {id:"R",x:50,y:5,color:BH.shotRed}      // Returner at far baseline
  ],
  steps:[
    {t:"hit",f:[55,98],to:[72,20],c:BH.shotBlue,n:"1",shot:"serve",hitter:"S",note:"Wide"},
    {t:"move",f:[50,5],to:[72,20],c:BH.shotRed,note:"Pushed wide"},
    {t:"hit",f:[72,20],to:[50,45],c:BH.shotRed,n:"2",shot:"forehand",hitter:"R"},
    {t:"move",f:[55,98],to:[50,65],c:BH.shotBlue,note:"Approach"},
    {t:"hit",f:[50,65],to:[28,8],c:BH.shotBlue,n:"3",shot:"forehand",hitter:"S",note:"Attack open court"}
  ]
}
```

## Exercise Example

```js
{
  id:"russian-twist",
  name:"Russian Twists",
  cat:"Core",
  desc:"Seated twists with med ball. Feet off ground, rotate fully side to side.",
  reps:"20 reps",
  equip:"Med Ball 8-12lb"
}
```

## Court Position Reference

```
        x=0     x=28    x=50    x=72    x=100
y=0   ┌─────────────────────────────────────┐  Far baseline
      │         │               │           │
y=5   │    Far  │  baseline     │  zone     │  ← Player B starts [50,5]
      │         │               │           │
      │    Ad   │   Service     │  Deuce    │
      │   side  │    boxes      │  side     │
y=50  ├─────────┼───────────────┼───────────┤  Net
      │         │               │           │
      │    Ad   │   Service     │  Deuce    │
      │   side  │    boxes      │  side     │
      │         │               │           │
y=95  │   Near  │  baseline     │  zone     │  ← Player A starts [50,95]
y=100 └─────────────────────────────────────┘  Near baseline

Key positions:
  Center near baseline: [50, 95]     Center far baseline: [50, 5]
  Deuce near:           [72, 95]     Deuce far:           [72, 5]
  Ad near:              [28, 95]     Ad far:              [28, 5]
  Net approach:         [50, 65]     Net far:             [50, 35]
  Server deuce:         [55, 98]     Server ad:           [45, 98]
```

## Available Shot Types

| Key | Badge | Use for |
|-----|-------|---------|
| `forehand` | FH | Standard forehand groundstroke |
| `backhand` | BH | Standard backhand groundstroke |
| `serve` | SV | First or second serve |
| `fh_volley` | FV | Forehand volley at net |
| `bh_volley` | BV | Backhand volley at net |
| `overhead` | OH | Overhead smash |
| `slice_fh` | SF | Forehand slice / drop shot |
| `slice_bh` | SB | Backhand slice |

## Color Constants

```js
// Player colors
BH.shotBlue  = "#3B82F6"  // Player A / Server
BH.shotRed   = "#EF4444"  // Player B / Returner
BH.shotGold  = "#F59E0B"  // Special/highlight

// Branding
BH.navy      = "#1B365D"  // Primary dark
BH.maroon    = "#7A1C2A"  // Accent
BH.white     = "#FFF"
BH.offWhite  = "#F7F8FA"

// Court
BH.courtGreen = "#1B6B2B"
BH.courtDark  = "#145220"
```

## Drill Categories

- **Groundstrokes** — baseline rallies (cc-fh, cc-bh, dtl-fh, dtl-bh, io-fh, fig8)
- **Serve & Return** — serve patterns and return games
- **Net Play** — volleys, approach shots, overheads
- **Patterns** — tactical point construction
- **Doubles** — doubles-specific formations and plays

## Exercise Categories

Core, Rotation, Agility, Lower Body, Upper Body, Cardio
