---
name: bh-tennis-training
description: |
  Build, edit, and extend the Belmont Hill Tennis Training web app — a multi-file React app (no build step) with two core features: an animated SVG drill visualizer with step-by-step court diagrams and a circuit training module with a ring layout and countdown timer. Use this skill whenever the user asks to add drills, edit exercises, update branding, add YouTube videos to drills, fix court visualizations, modify the circuit trainer, or make any change to the BH Tennis Training app. Also trigger when the user mentions "tennis training app", "drill visualizer", "circuit trainer", "tennis website", or references files like data.js, court.js, circuit.js, or app.js in the context of this project.
---

# BH Tennis Training — Skill Guide

This skill helps you work on the Belmont Hill School Varsity Tennis Training web app. The app is deployed via GitHub Pages and uses a no-build-step React architecture. Everything below reflects hard-won patterns from iterative development — follow them to avoid regressions and keep the user happy.

## Architecture Overview

The app is a **multi-file React app using CDN-loaded React 18 + Babel standalone** (no webpack, no npm, no build step). It lives in a git repo and deploys via GitHub Pages.

### File Loading Order (Critical)

```html
<!-- index.html -->
<script src="data.js"></script>                    <!-- Sync, plain JS, loads first -->
<script type="text/babel" src="court.js"></script>  <!-- JSX, compiled by Babel -->
<script type="text/babel" src="circuit.js"></script><!-- JSX, compiled by Babel -->
<script type="text/babel" src="app.js"></script>    <!-- JSX, compiled by Babel, loads last -->
```

`data.js` is a regular `<script>` tag (NOT `text/babel`) because it contains no JSX — just plain JS constants. The other three files use `type="text/babel"` and are compiled client-side by Babel standalone. **This means globals defined in data.js (like `BH`, `EXERCISES`, `DRILLS`, coordinate helpers) are available everywhere.**

### File Responsibilities

| File | Purpose | Globals it defines |
|------|---------|-------------------|
| `data.js` | Colors, court constants, coordinate math, exercises, drills, audio, auth | `BH`, `CRT`, `mX`, `mY`, `SL`, `NET_Y`, `SVC`, `EXERCISES`, `DRILLS`, `snd`, `sha256` |
| `court.js` | SVG court rendering + Sportplan-style player markers | `SHOT_INFO`, `PlayerIcon`, `Court` |
| `circuit.js` | Circular station ring + countdown timer | `CircuitRing`, `CircuitTimer` |
| `app.js` | DrillViewer, LoginModal, App (main component) | `DrillViewer`, `LoginModal`, `App` |

### Why This Matters

Because there's no build step, you can't use `import/export`. All communication between files is through globals. If you add a new constant or component, make sure it's defined in the right file and referenced correctly downstream. When in doubt, check the loading order above.

## Editing Workflow

Follow this sequence every time you make changes:

1. **Edit files directly in the git repo** — the repo is at `Tennis/bh-tennis-training/` in the user's workspace. Never create loose copies of files outside the repo.
2. **Verify Babel compilation** — after editing any JSX file (court.js, circuit.js, app.js), run it through Babel to catch syntax errors:
   ```bash
   npx babel --presets=@babel/preset-react <file> > /dev/null
   ```
   If Babel isn't installed, use: `npx -y @babel/cli@7 --presets=@babel/preset-react <file> > /dev/null`
3. **Commit changes** in the repo with a clear message.
4. **Tell the user to push** — Claude typically can't push to GitHub from the VM environment. Remind the user: "Run `git push` from your terminal to deploy."

The user strongly prefers edits to existing files over rewrites. Never rewrite a file from scratch — use targeted edits. And keep variable naming clean and self-documenting (e.g. don't repurpose `gold` to mean maroon).

## Belmont Hill Branding

The `BH` color palette in data.js:

```js
const BH = {
  navy: "#1B365D",       // Primary dark — header bg, badges, text
  navyLight: "#2C5282",
  navyDark: "#0F1F38",
  maroon: "#7A1C2A",     // Accent — active states, admin badges, highlights
  maroonLight: "#943548",
  maroonDim: "#5E1520",
  white: "#FFF",
  offWhite: "#F7F8FA",   // Page background
  // ...grays, court colors, shot colors
};
```

**Key branding rules:**
- Header uses `Georgia, 'Times New Roman', serif` font, wide letter-spacing (3.5px), white text, matching belmonthill.org
- Subtitle reads "Varsity Tennis" (not "Varsity Tennis Training")
- Navy is the dominant color (header bg, badges, buttons)
- Maroon is the accent (active step highlights, admin badge, publish button)
- When text sits on a maroon background, use `BH.white` for contrast (never `BH.navy`)
- Tab order: Circuits first (left), Drills second (right) — Circuits is the default tab

## Drill Data Format

Each drill in the `DRILLS` array follows this structure:

```js
{
  id: "cc-fh",                    // Unique kebab-case ID
  name: "Crosscourt Forehand",    // Display name
  cat: "Groundstrokes",           // Category (see DRILL_CATS below)
  diff: "Beginner",               // Difficulty: Beginner | Intermediate | Advanced
  desc: "Rally crosscourt FH...", // Full description (2-3 sentences)
  tips: ["Tip 1", "Tip 2", ...],  // 3-5 coaching tips
  youtubeId: "UwIPqGkQO80",       // YouTube video ID (or null)
  youtubeStart: 80,               // Start timestamp in seconds (or undefined)
  youtubeEnd: 150,                // End timestamp in seconds (or undefined)
  courtType: "singles",           // "singles" or "doubles"
  players: [
    { id: "A", x: 50, y: 95, color: BH.shotBlue },  // Starting position
    { id: "B", x: 50, y: 5,  color: BH.shotRed }
  ],
  steps: [ /* see Step Format below */ ]
}
```

**Drill categories:** Groundstrokes, Serve & Return, Net Play, Patterns, Doubles

### Step Format (V2)

Each step is either a `"move"` or a `"hit"`:

```js
// Move step — player repositions
{ t: "move", f: [50,95], to: [72,95], c: BH.shotBlue, note: "A moves to deuce side" }

// Hit step — player strikes the ball
{ t: "hit", f: [72,95], to: [28,8], c: BH.shotBlue, n: "1", shot: "forehand", hitter: "A", note: "Crosscourt FH deep" }
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `t` | `"move"` or `"hit"` | Yes | Step type |
| `f` | `[x, y]` | Yes | From position (0-100 coordinate space) |
| `to` | `[x, y]` | Yes | To position |
| `c` | color string | Yes | Arrow color (use player's color from `players[]`) |
| `n` | string | Hits only | Shot number for badge ("1", "2", etc.) |
| `shot` | string | Hits only | Shot type key (see SHOT_INFO) |
| `hitter` | string | Hits only | Player ID ("A", "B", "S", "R") |
| `note` | string | Optional | Text label shown on active step |

### Court Coordinate System

Positions use a **0-100 normalized coordinate space** mapped to the SVG viewBox (0 0 400 760):
- `x: 0` = left doubles sideline, `x: 100` = right doubles sideline
- `y: 0` = far baseline (top), `y: 100` = near baseline (bottom)
- `x: 50` = center of court
- Singles sidelines are roughly at x=12.5 and x=87.5
- Center baseline positions: `[50, 95]` (near/bottom player) and `[50, 5]` (far/top player)
- Deuce side positions: around x=72, Ad side: around x=28

### Move-Hit-Recover Pattern

Drills should follow a realistic tennis pattern. Each player's sequence is:

1. **Move** from center to the ball position (dashed arrow)
2. **Hit** from ball position to target (solid arrow with shot number)
3. **Move** back to center baseline (dashed arrow, recovery)

Then it switches to the other player's turn. This creates a natural rally rhythm. Both players start at center baseline `[50, 95]` and `[50, 5]`.

### Shot Types

The `shot` field maps to abbreviations via `SHOT_INFO` in court.js:

| Key | Badge | Description |
|-----|-------|-------------|
| `forehand` | FH | Forehand groundstroke |
| `backhand` | BH | Backhand groundstroke |
| `serve` | SV | Serve |
| `fh_volley` | FV | Forehand volley |
| `bh_volley` | BV | Backhand volley |
| `overhead` | OH | Overhead smash |
| `slice_fh` | SF | Forehand slice |
| `slice_bh` | SB | Backhand slice |

### Player Colors

- Player A / Server: `BH.shotBlue` (#3B82F6) — blue
- Player B / Returner: `BH.shotRed` (#EF4444) — red
- For special shots: `BH.shotGold` (#F59E0B) is available

## Adding YouTube Videos to Drills

The user's preferred workflow for adding YouTube drill videos:

1. **User sends a YouTube URL** in chat
2. **Watch the video** using Chrome browser tools — navigate to the URL, take screenshots at multiple timestamps (every ~30 seconds) to understand the drill content
3. **Identify the relevant segment** — find the timestamps where the specific drill is demonstrated (usually a subset of the full video)
4. **Update the drill in data.js:**
   - Set `youtubeId` to the video ID (the part after `v=` in the URL)
   - Set `youtubeStart` and `youtubeEnd` to the relevant timestamps in seconds
   - Update `desc` with a detailed description of what happens in the drill
   - Add/update `tips` with coaching points observed in the video
   - Write proper `steps` following the move-hit-recover pattern

The YouTube embed renders at 16:9 aspect ratio using a responsive wrapper (`padding-bottom: 56.25%`) with `?start=X&end=Y&rel=0&modestbranding=1` URL parameters.

## Exercise Data Format

Each exercise in the `EXERCISES` array:

```js
{
  id: "russian-twist",           // Unique kebab-case ID
  name: "Russian Twists",        // Display name
  cat: "Core",                   // Category
  desc: "Seated twists with...", // Brief description
  reps: "20 reps",              // Rep count or duration
  equip: "Med Ball 8-12lb"      // Equipment needed (or "None")
}
```

**Exercise categories:** Core, Rotation, Agility, Lower Body, Upper Body, Cardio

## Circuit Ring (circuit.js)

The circuit ring renders exercises in a circular layout (520px diameter). Each station is a circle node with the exercise name word-wrapped inside. Key features:

- Admin mode shows red × buttons on each station for removal (uses `e.stopPropagation()` to prevent selecting the station)
- Navy color scheme, white text
- The `onRemove` callback adjusts selection indices properly when removing stations

## Circuit Timer

The compact bar-style timer handles work/rest intervals with audio cues (`snd.go`, `snd.rest`, `snd.tick`, `snd.done`). Timing defaults: 45s work, 15s rest, 3 rounds.

## Admin System

- Login: username `BHTennis`, password verified via SHA-256 hash
- Admin badge is maroon with white text
- Admin can select drills/exercises, customize circuit timing, and publish plans
- Published plans are stored in localStorage and can be shared via URL hash (`#config=base64`)
- Non-admin players see only published content

## Common Tasks

### Adding a new drill
1. Add the drill object to the `DRILLS` array in data.js
2. Follow the drill data format above exactly
3. Use the move-hit-recover step pattern
4. Verify data.js loads without errors (it's plain JS, not JSX)

### Modifying the court visualization
1. Edit court.js (PlayerIcon or Court components)
2. Remember coordinates go through `mX()` and `mY()` helpers
3. Verify with Babel after changes

### Changing branding/layout
1. Most layout is in app.js (header, tabs, panels)
2. Colors are in `BH` object in data.js — rename properly, don't overload
3. Always check text contrast when changing background colors

### Adding a new exercise
1. Add to the `EXERCISES` array in data.js
2. Follow the exercise format: id, name, cat, desc, reps, equip
3. Use an existing category or discuss with the user before creating new ones

## Things to Avoid

- **Never rewrite files from scratch** — always make targeted edits
- **Never overload variable names** — if a color changes meaning, rename the variable
- **Never create loose file copies** — work only in the git repo
- **Never skip Babel verification** after editing JSX files
- **Never put navy text on maroon backgrounds** — use white for contrast
- **Never change the loading order** in index.html without very good reason
- **Never use import/export** — this is a no-build-step app using globals
