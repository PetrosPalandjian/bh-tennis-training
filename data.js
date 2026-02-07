const BH = {
  navy:"#1B365D",navyLight:"#2C5282",navyDark:"#0F1F38",
  maroon:"#7A1C2A",maroonLight:"#943548",maroonDim:"#5E1520",
  white:"#FFF",offWhite:"#F7F8FA",
  g100:"#F3F4F6",g200:"#E5E7EB",g300:"#D1D5DB",
  g400:"#9CA3AF",g500:"#6B7280",g700:"#374151",g800:"#1F2937",
  courtGreen:"#1B6B2B",courtDark:"#145220",
  shotBlue:"#3B82F6",shotRed:"#EF4444",shotGold:"#F59E0B",
};

const CRT={W:400,H:760,PAD:30};
const cw=CRT.W-2*CRT.PAD,ch=CRT.H-2*CRT.PAD;
const mX=x=>CRT.PAD+(x/100)*cw;
const mY=y=>CRT.PAD+(y/100)*ch;
const SL={l:CRT.PAD+(4.5/36)*cw,r:CRT.W-CRT.PAD-(4.5/36)*cw};
const NET_Y=mY(50);
const SVC={far:NET_Y-(21/39)*(ch/2),near:NET_Y+(21/39)*(ch/2)};

const POSES={
  forehand:[9,-2,22,-10,-55],backhand:[-9,-2,-22,-10,55],
  serve:[5,-6,8,-24,-10],fh_volley:[8,-4,18,-12,-45],bh_volley:[-8,-4,-18,-12,45],
  overhead:[4,-5,6,-23,-5],slice_fh:[10,-1,20,-6,-65],slice_bh:[-10,-1,-20,-6,65],
};
const BODY_ROT={forehand:25,backhand:-25,serve:12,fh_volley:15,bh_volley:-15,overhead:10,slice_fh:20,slice_bh:-20};

const beep=(freq,dur,vol=0.25)=>{try{const c=new(window.AudioContext||window.webkitAudioContext)(),o=c.createOscillator(),g=c.createGain();o.frequency.value=freq;o.type="sine";g.gain.setValueAtTime(vol,c.currentTime);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+dur/1000);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+dur/1000)}catch(e){}};
const snd={
  go:()=>{beep(880,150);setTimeout(()=>beep(880,150),200);setTimeout(()=>beep(1100,250),400)},
  rest:()=>beep(440,400,0.2),tick:()=>beep(660,80,0.15),
  done:()=>{beep(523,120);setTimeout(()=>beep(659,120),160);setTimeout(()=>beep(784,120),320);setTimeout(()=>beep(1047,350),480)},
};

async function sha256(msg){const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(msg));return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');}

const EXERCISES=[
  {id:"russian-twist",name:"Russian Twists",cat:"Core",desc:"Seated twists with med ball. Feet off ground, rotate fully side to side.",reps:"20 reps",equip:"Med Ball 8-12lb",youtubeId:"S_odouUnGOc"},
  {id:"plank",name:"Plank Hold",cat:"Core",desc:"Forearm plank, tight core, hips level. Don't let hips sag.",reps:"45 sec",equip:"None",youtubeId:"pvIjsG5Svck",youtubeStart:0,youtubeEnd:15},
  {id:"bicycle",name:"Bicycle Crunches",cat:"Core",desc:"Alternating elbow-to-knee crunches. Controlled, no yanking the neck.",reps:"20 each",equip:"None",youtubeId:"hP-ol0LxLZ8",youtubeStart:3,youtubeEnd:29},
  {id:"dead-bug",name:"Dead Bugs",cat:"Core",desc:"Lying on back, extend opposite arm/leg while keeping low back flat.",reps:"10 each",equip:"None"},
  {id:"v-ups",name:"V-Ups",cat:"Core",desc:"Simultaneously lift legs and torso to touch toes at the top.",reps:"15 reps",equip:"None"},
  {id:"side-plank",name:"Side Plank",cat:"Core",desc:"Forearm side plank, hips stacked. Hold each side.",reps:"30s each",equip:"None"},
  {id:"rot-throw",name:"Rotational Throws",cat:"Rotation",desc:"Stand sideways to wall, rotate explosively to throw med ball.",reps:"10 each",equip:"Med Ball + Wall"},
  {id:"woodchop",name:"Band Woodchops",cat:"Rotation",desc:"High-to-low diagonal pull with resistance band. Control the decel.",reps:"12 each",equip:"Resistance Band"},
  {id:"pallof-press",name:"Pallof Press",cat:"Rotation",desc:"Anti-rotation press with band. Resist the pull, arms fully extended.",reps:"10 each",equip:"Resistance Band"},
  {id:"torso-rot",name:"Standing Rotation",cat:"Rotation",desc:"Band at chest height, rotate torso away. Hips stay square.",reps:"15 each",equip:"Resistance Band"},
  {id:"ladder",name:"Ladder Drills",cat:"Agility",desc:"Quick feet through agility ladder. In-in-out-out or icky shuffle.",reps:"4 lengths",equip:"Agility Ladder"},
  {id:"cone-shuffle",name:"Cone Shuffles",cat:"Agility",desc:"Defensive lateral shuffles between cones 10ft apart. Stay low.",reps:"8 trips",equip:"2 Cones"},
  {id:"split-step",name:"Split Step Jumps",cat:"Agility",desc:"Continuous split steps. Land balanced, ready to move any direction.",reps:"20 reps",equip:"None"},
  {id:"suicides",name:"Suicide Sprints",cat:"Agility",desc:"Sprint to line 1, back, line 2, back, line 3, back. Full speed.",reps:"4 sets",equip:"4 Cones"},
  {id:"sprint-back",name:"Sprint + Backpedal",cat:"Agility",desc:"Sprint 20ft forward, backpedal to start. Stay on balls of feet.",reps:"6 trips",equip:"None"},
  {id:"box-jump",name:"Box Jumps",cat:"Lower Body",desc:"Explosive jump onto box, step down. Land soft, knees over toes.",reps:"12 reps",equip:'20-24" Box'},
  {id:"lat-lunge",name:"Lateral Lunges",cat:"Lower Body",desc:"Deep lateral lunges, push off explosively back to center.",reps:"10 each",equip:"None"},
  {id:"squat-jump",name:"Squat Jumps",cat:"Lower Body",desc:"Full squat then explode up. Land soft, immediately descend.",reps:"15 reps",equip:"None"},
  {id:"single-hop",name:"Single Leg Hops",cat:"Lower Body",desc:"Forward hops on one leg. Stick the landing, control the knee.",reps:"8 each",equip:"None"},
  {id:"calf-raise",name:"Calf Raises",cat:"Lower Body",desc:"Slow calf raises on edge of step. 3 second hold at the top.",reps:"20 reps",equip:"Step"},
  {id:"wall-throw",name:"Wall Throws",cat:"Upper Body",desc:"Med ball chest throws against wall. Explosive push, catch on rebound.",reps:"15 reps",equip:"Med Ball + Wall"},
  {id:"pushups",name:"Push-Up Variations",cat:"Upper Body",desc:"Mix of standard, wide, diamond. Chest to floor each rep.",reps:"15 reps",equip:"None"},
  {id:"band-pull",name:"Band Pull-Aparts",cat:"Upper Body",desc:"Resistance band at chest height, pull apart to full extension.",reps:"15 reps",equip:"Resistance Band"},
  {id:"oh-throw",name:"Overhead Throws",cat:"Upper Body",desc:"Med ball overhead slam throws. Full extension, explosive.",reps:"12 reps",equip:"Med Ball"},
  {id:"jump-rope",name:"Jump Rope",cat:"Cardio",desc:"Alternate regular bounce, boxer skip, and high knees.",reps:"Full dur",equip:"Jump Rope"},
  {id:"mt-climbers",name:"Mountain Climbers",cat:"Cardio",desc:"Fast alternating knee drives from push-up position.",reps:"30 reps",equip:"None"},
  {id:"burpees",name:"Burpees",cat:"Cardio",desc:"Squat, jump back, push-up, jump forward, jump up. No stopping.",reps:"10 reps",equip:"None"},
  {id:"high-knees",name:"High Knees",cat:"Cardio",desc:"Running in place, driving knees above hip height. Pump the arms.",reps:"30 sec",equip:"None"},
];
const EX_CATS=["All",...Array.from(new Set(EXERCISES.map(e=>e.cat)))];

const DRILLS=[
  {
    id:"cc-fh",name:"Crosscourt Forehand",cat:"Groundstrokes",diff:"Beginner",skill:"Forehand",
    desc:"Rally crosscourt FH from deuce side. Both players start on the deuce (right) side of the baseline. Hit forehands diagonally crosscourt to each other, aiming deep into the service box corner. Focus on consistent topspin, high net clearance, and recovering to center after each shot.",
    tips:["Keep a high net clearance — aim 3-5 feet over the net","Follow through across your body for natural topspin","Small split step between shots to stay balanced","Turn sideways before contact and rotate through the core","Use targets or cones in the crosscourt zone to build accuracy"],
    youtubeId:"UwIPqGkQO80",youtubeStart:80,youtubeEnd:150,courtType:"singles",
    players:[{id:"A",x:50,y:95,color:BH.shotBlue},{id:"B",x:50,y:5,color:BH.shotRed}],
    steps:[
      {t:"move",f:[50,95],to:[72,95],c:BH.shotBlue,note:"A moves to deuce side"},
      {t:"hit",f:[72,95],to:[28,8],c:BH.shotBlue,n:"1",shot:"forehand",hitter:"A",note:"Crosscourt FH deep"},
      {t:"move",f:[72,95],to:[50,95],c:BH.shotBlue,note:"A recovers to center"},
      {t:"move",f:[50,5],to:[28,5],c:BH.shotRed,note:"B moves to ball"},
      {t:"hit",f:[28,5],to:[72,95],c:BH.shotRed,n:"2",shot:"forehand",hitter:"B",note:"Crosscourt FH back"},
      {t:"move",f:[28,5],to:[50,5],c:BH.shotRed,note:"B recovers to center"},
      {t:"move",f:[50,95],to:[72,95],c:BH.shotBlue,note:"A moves to ball"},
      {t:"hit",f:[72,95],to:[28,8],c:BH.shotBlue,n:"3",shot:"forehand",hitter:"A",note:"Crosscourt FH deep"},
      {t:"move",f:[72,95],to:[50,95],c:BH.shotBlue,note:"A recovers to center"}
    ]
  },
  // === SKILL FOCUS ADDITIONS (VIDEO-BASED, TIMECODED) ===
  {
    id:"sv-grip",name:"Serve Grip Check",cat:"Skill Focus",diff:"Beginner",skill:"Serve",
    desc:"Confirm a neutral continental grip before accelerating.",
    tips:["Continental grip","Relax the hand","Check the V lines"],
    youtubeId:"QiVszYWaIO0",youtubeStart:285,youtubeEnd:310,courtType:"singles",
    players:[{id:"S",x:50,y:52,color:BH.shotBlue}],
    steps:[
      {t:"move",f:[50,52],to:[50,52],c:BH.shotBlue,note:"Trophy position (racquet up, ready)"},
      {t:"move",f:[50,52],to:[50,52],c:BH.shotBlue,note:"Toss the ball"},
      {t:"hit",f:[50,52],to:[50,25],c:BH.shotBlue,n:"1",shot:"serve",hitter:"S",note:"Contact at full extension, stop at contact"}
    ]
  },
  {
    id:"sv-stance",name:"Serve Stance Setup",cat:"Skill Focus",diff:"Beginner",skill:"Serve",
    desc:"Build a stable base and balanced posture at the start.",
    tips:["Athletic base","Weight centered","Repeatable stance"],
    youtubeId:"QiVszYWaIO0",youtubeStart:310,youtubeEnd:347,courtType:"singles",
    players:[{id:"S",x:55,y:98,color:BH.shotBlue},{id:"R",x:50,y:5,color:BH.shotRed}],
    steps:[{t:"hit",f:[55,98],to:[50,22],c:BH.shotBlue,n:"1",shot:"serve",hitter:"S",note:"Stance focus"}]
  },
  {
    id:"sv-toss",name:"Serve Toss Drill",cat:"Skill Focus",diff:"Beginner",skill:"Serve",
    desc:"Groove a consistent toss placement before contact.",
    tips:["Same release every time","Toss to target","Hold finish"],
    youtubeId:"QiVszYWaIO0",youtubeStart:363,youtubeEnd:426,courtType:"singles",
    players:[{id:"S",x:56,y:68,color:BH.shotBlue}],
    steps:[
      {t:"move",f:[56,68],to:[56,68],c:BH.shotBlue,note:"Trophy position at service line"},
      {t:"move",f:[56,68],to:[56,68],c:BH.shotBlue,note:"Toss the ball"},
      {t:"hit",f:[56,68],to:[50,28],c:BH.shotBlue,n:"1",shot:"serve",hitter:"S",note:"Contact + full pronation"},
      {t:"move",f:[56,68],to:[56,68],c:BH.shotBlue,note:"Finish balanced, racquet to opposite quad"}
    ]
  },
  {
    id:"sv-contact",name:"Serve Contact & Pronation",cat:"Skill Focus",diff:"Intermediate",skill:"Serve",
    desc:"Accelerate through contact with clean pronation.",
    tips:["Reach up","Loose wrist","Finish across body"],
    youtubeId:"QiVszYWaIO0",youtubeStart:480,youtubeEnd:528,courtType:"singles",
    players:[{id:"S",x:55,y:98,color:BH.shotBlue},{id:"R",x:50,y:5,color:BH.shotRed}],
    steps:[{t:"hit",f:[55,98],to:[50,25],c:BH.shotBlue,n:"1",shot:"serve",hitter:"S",note:"Contact focus"}]
  },
  {
    id:"sv-placement",name:"Serve Placement Drill",cat:"Skill Focus",diff:"Intermediate",skill:"Serve",
    desc:"Hit 3 targets to build precision before adding pace.",
    tips:["Aim first","Use targets","Same rhythm each serve"],
    youtubeId:"QiVszYWaIO0",youtubeStart:609,youtubeEnd:642,courtType:"singles",
    players:[{id:"S",x:55,y:98,color:BH.shotBlue},{id:"R",x:50,y:5,color:BH.shotRed}],
    steps:[{t:"hit",f:[55,98],to:[72,22],c:BH.shotBlue,n:"1",shot:"serve",hitter:"S",note:"Target serve"}]
  },
  {
    id:"fh-ball-1",name:"FH Ball Machine Drill 1",cat:"Skill Focus",diff:"Beginner",skill:"Forehand",
    desc:"Groove the first ball-machine pattern with clean contact.",
    tips:["Racquet set early","Stay balanced","Finish across body"],
    youtubeId:"nyQSDaXOCQ8",youtubeStart:51,youtubeEnd:177,courtType:"singles",
    players:[{id:"A",x:50,y:92,color:BH.shotBlue}],
    steps:[{t:"hit",f:[50,92],to:[28,8],c:BH.shotBlue,n:"1",shot:"forehand",hitter:"A"}]
  },
  {
    id:"fh-ball-2",name:"FH Ball Machine Drill 2",cat:"Skill Focus",diff:"Beginner",skill:"Forehand",
    desc:"Build depth control with the second ball-machine pattern.",
    tips:["High net clearance","Use legs","Recover to center"],
    youtubeId:"nyQSDaXOCQ8",youtubeStart:177,youtubeEnd:292,courtType:"singles",
    players:[{id:"A",x:60,y:92,color:BH.shotBlue}],
    steps:[{t:"hit",f:[60,92],to:[40,8],c:BH.shotBlue,n:"1",shot:"forehand",hitter:"A"}]
  },
  {
    id:"fh-ball-3",name:"FH Ball Machine Drill 3",cat:"Skill Focus",diff:"Intermediate",skill:"Forehand",
    desc:"Use forehand patterns to handle height changes.",
    tips:["Adjust with legs","Brush up","Finish balanced"],
    youtubeId:"nyQSDaXOCQ8",youtubeStart:292,youtubeEnd:370,courtType:"singles",
    players:[{id:"A",x:50,y:90,color:BH.shotBlue}],
    steps:[{t:"hit",f:[50,90],to:[72,8],c:BH.shotBlue,n:"1",shot:"forehand",hitter:"A"}]
  },
  {
    id:"fh-ball-4",name:"FH Ball Machine Drill 4",cat:"Skill Focus",diff:"Intermediate",skill:"Forehand",
    desc:"Attack short balls and recover quickly.",
    tips:["Explode forward","Stay low","Recover fast"],
    youtubeId:"nyQSDaXOCQ8",youtubeStart:370,youtubeEnd:492,courtType:"singles",
    players:[{id:"A",x:50,y:85,color:BH.shotBlue}],
    steps:[{t:"hit",f:[50,85],to:[72,28],c:BH.shotBlue,n:"1",shot:"forehand",hitter:"A",note:"Short ball"}]
  },
  {
    id:"fh-ball-5",name:"FH Ball Machine Drill 5",cat:"Skill Focus",diff:"Intermediate",skill:"Forehand",
    desc:"Handle deep balls with heavy topspin.",
    tips:["Load on back leg","Drive up","Recover to middle"],
    youtubeId:"nyQSDaXOCQ8",youtubeStart:492,youtubeEnd:552,courtType:"singles",
    players:[{id:"A",x:50,y:92,color:BH.shotBlue}],
    steps:[{t:"hit",f:[50,92],to:[50,8],c:BH.shotBlue,n:"1",shot:"forehand",hitter:"A"}]
  },
  {
    id:"bh-options",name:"Backhand High-Ball Options",cat:"Skill Focus",diff:"Intermediate",skill:"Backhand",
    desc:"Choose the best option when the ball rises above shoulder height.",
    tips:["Decide early","Use spacing","Commit to the choice"],
    youtubeId:"5eWB8YyIz8o",youtubeStart:30,youtubeEnd:148,courtType:"singles",
    players:[{id:"A",x:28,y:90,color:BH.shotBlue}],
    steps:[{t:"hit",f:[28,90],to:[72,8],c:BH.shotBlue,n:"1",shot:"backhand",hitter:"A",note:"High ball"}]
  },
  {
    id:"bh-technique",name:"Backhand High-Ball Technique",cat:"Skill Focus",diff:"Intermediate",skill:"Backhand",
    desc:"Key technique cues for high-ball backhands.",
    tips:["Create space","Stay tall","Finish through target"],
    youtubeId:"5eWB8YyIz8o",youtubeStart:148,youtubeEnd:183,courtType:"singles",
    players:[{id:"A",x:28,y:90,color:BH.shotBlue}],
    steps:[{t:"hit",f:[28,90],to:[72,8],c:BH.shotBlue,n:"1",shot:"backhand",hitter:"A"}]
  },
  {
    id:"bh-contact",name:"Backhand Contact Point",cat:"Skill Focus",diff:"Beginner",skill:"Backhand",
    desc:"Find clean contact on high balls with a stable head.",
    tips:["Contact out in front","Stable wrist","Balanced finish"],
    youtubeId:"5eWB8YyIz8o",youtubeStart:183,youtubeEnd:211,courtType:"singles",
    players:[{id:"A",x:28,y:90,color:BH.shotBlue}],
    steps:[{t:"hit",f:[28,90],to:[72,8],c:BH.shotBlue,n:"1",shot:"backhand",hitter:"A"}]
  },
  {
    id:"bh-drill-1",name:"Backhand Drill 1",cat:"Skill Focus",diff:"Intermediate",skill:"Backhand",
    desc:"Use a repeatable pattern to build high-ball consistency.",
    tips:["Same rhythm","Aim big targets","Recover quickly"],
    youtubeId:"5eWB8YyIz8o",youtubeStart:211,youtubeEnd:250,courtType:"singles",
    players:[{id:"A",x:28,y:90,color:BH.shotBlue}],
    steps:[{t:"hit",f:[28,90],to:[72,8],c:BH.shotBlue,n:"1",shot:"backhand",hitter:"A"}]
  },
  {
    id:"bh-ball-machine",name:"Backhand Ball Machine Drills",cat:"Skill Focus",diff:"Intermediate",skill:"Backhand",
    desc:"Ball-machine sequences for high-ball backhands.",
    tips:["Move through the ball","Finish balanced","Recover to center"],
    youtubeId:"5eWB8YyIz8o",youtubeStart:417,youtubeEnd:521,courtType:"singles",
    players:[{id:"A",x:28,y:92,color:BH.shotBlue}],
    steps:[{t:"hit",f:[28,92],to:[72,8],c:BH.shotBlue,n:"1",shot:"backhand",hitter:"A"}]
  },
  {
    id:"ret-split",name:"Return Split Step",cat:"Skill Focus",diff:"Beginner",skill:"Return",
    desc:"Time the split step to react to the serve.",
    tips:["Split as ball leaves strings","Stay low","Short first step"],
    youtubeId:"QnKKocEn77g",youtubeStart:18,youtubeEnd:60,courtType:"singles",
    players:[{id:"S",x:55,y:98,color:BH.shotBlue},{id:"R",x:50,y:5,color:BH.shotRed}],
    steps:[
      {t:"hit",f:[55,98],to:[50,22],c:BH.shotBlue,n:"1",shot:"serve",hitter:"S"},
      {t:"hit",f:[50,5],to:[50,45],c:BH.shotRed,n:"2",shot:"forehand",hitter:"R",note:"Split + return"}
    ]
  },
  {
    id:"ret-timing",name:"Return Timing",cat:"Skill Focus",diff:"Beginner",skill:"Return",
    desc:"Load early and meet the ball in front.",
    tips:["Early prep","Compact swing","Eyes on contact"],
    youtubeId:"QnKKocEn77g",youtubeStart:60,youtubeEnd:91,courtType:"singles",
    players:[{id:"S",x:55,y:98,color:BH.shotBlue},{id:"R",x:50,y:5,color:BH.shotRed}],
    steps:[
      {t:"hit",f:[55,98],to:[50,22],c:BH.shotBlue,n:"1",shot:"serve",hitter:"S"},
      {t:"hit",f:[50,5],to:[50,45],c:BH.shotRed,n:"2",shot:"backhand",hitter:"R"}
    ]
  },
  {
    id:"ret-position",name:"Return Positioning",cat:"Skill Focus",diff:"Beginner",skill:"Return",
    desc:"Adjust return position based on serve and court speed.",
    tips:["Start neutral","Adjust depth","Recover quickly"],
    youtubeId:"QnKKocEn77g",youtubeStart:91,youtubeEnd:159,courtType:"singles",
    players:[{id:"S",x:55,y:98,color:BH.shotBlue},{id:"R",x:50,y:5,color:BH.shotRed}],
    steps:[
      {t:"hit",f:[55,98],to:[50,22],c:BH.shotBlue,n:"1",shot:"serve",hitter:"S"},
      {t:"hit",f:[50,5],to:[50,45],c:BH.shotRed,n:"2",shot:"forehand",hitter:"R"}
    ]
  },
  {
    id:"ret-stance",name:"Return Stance",cat:"Skill Focus",diff:"Beginner",skill:"Return",
    desc:"Use an athletic stance to handle pace and direction.",
    tips:["Wide base","Hands in front","Explode to the ball"],
    youtubeId:"QnKKocEn77g",youtubeStart:159,youtubeEnd:212,courtType:"singles",
    players:[{id:"S",x:55,y:98,color:BH.shotBlue},{id:"R",x:50,y:5,color:BH.shotRed}],
    steps:[
      {t:"hit",f:[55,98],to:[50,22],c:BH.shotBlue,n:"1",shot:"serve",hitter:"S"},
      {t:"hit",f:[50,5],to:[50,45],c:BH.shotRed,n:"2",shot:"forehand",hitter:"R"}
    ]
  },
  {
    id:"ret-block",name:"Block Return",cat:"Skill Focus",diff:"Intermediate",skill:"Return",
    desc:"Neutralize pace with a firm block return.",
    tips:["Short punch","Stable wrist","Aim deep middle"],
    youtubeId:"QnKKocEn77g",youtubeStart:212,youtubeEnd:257,courtType:"singles",
    players:[{id:"S",x:55,y:98,color:BH.shotBlue},{id:"R",x:50,y:5,color:BH.shotRed}],
    steps:[
      {t:"hit",f:[55,98],to:[50,22],c:BH.shotBlue,n:"1",shot:"serve",hitter:"S"},
      {t:"hit",f:[50,5],to:[50,45],c:BH.shotRed,n:"2",shot:"backhand",hitter:"R",note:"Block"}
    ]
  },
  {
    id:"fw-fh-tech",name:"Footwork: FH Technique & Steps",cat:"Skill Focus",diff:"Beginner",skill:"Footwork",
    desc:"Use clean setup steps to organize the forehand.",
    tips:["Early unit turn","Small adjustment steps","Balance at contact"],
    youtubeId:"nyQSDaXOCQ8",youtubeStart:33,youtubeEnd:124,courtType:"singles",
    players:[{id:"A",x:50,y:92,color:BH.shotBlue}],
    steps:[{t:"move",f:[50,92],to:[60,88],c:BH.shotBlue,note:"Adjust steps"}]
  },
  {
    id:"fw-self-feed",name:"Footwork: Self-Feed Rhythm",cat:"Skill Focus",diff:"Beginner",skill:"Footwork",
    desc:"Self-feed to control spacing and rhythm before striking.",
    tips:["Feed to the hitting zone","Set feet early","Balance through contact"],
    youtubeId:"R5w7dnZmC18",youtubeStart:61,youtubeEnd:98,courtType:"singles",
    players:[{id:"A",x:50,y:92,color:BH.shotBlue}],
    steps:[{t:"move",f:[50,92],to:[55,88],c:BH.shotBlue,note:"Self-feed + set"}]
  },
  {
    id:"fw-stance",name:"Footwork: Stance Training",cat:"Skill Focus",diff:"Beginner",skill:"Footwork",
    desc:"Choose open vs. neutral stance under control.",
    tips:["Lower center of gravity","Stay athletic","Recover to center"],
    youtubeId:"R5w7dnZmC18",youtubeStart:129,youtubeEnd:213,courtType:"singles",
    players:[{id:"A",x:50,y:92,color:BH.shotBlue}],
    steps:[{t:"move",f:[50,92],to:[40,88],c:BH.shotBlue,note:"Stance reps"}]
  },
  {
    id:"fw-footwork",name:"Footwork: Movement Patterns",cat:"Skill Focus",diff:"Beginner",skill:"Footwork",
    desc:"Lateral and diagonal movement patterns to the ball.",
    tips:["Stay low","Short steps","Explode to ball"],
    youtubeId:"R5w7dnZmC18",youtubeStart:213,youtubeEnd:273,courtType:"singles",
    players:[{id:"A",x:50,y:92,color:BH.shotBlue}],
    steps:[{t:"move",f:[50,92],to:[35,85],c:BH.shotBlue,note:"Lateral move"}]
  },
  {
    id:"fw-low-balls",name:"Footwork: Low-Ball Movement",cat:"Skill Focus",diff:"Intermediate",skill:"Footwork",
    desc:"Get under low balls with strong leg drive.",
    tips:["Bend knees","Keep chest up","Drive through contact"],
    youtubeId:"R5w7dnZmC18",youtubeStart:273,youtubeEnd:307,courtType:"singles",
    players:[{id:"A",x:50,y:92,color:BH.shotBlue}],
    steps:[{t:"move",f:[50,92],to:[45,88],c:BH.shotBlue,note:"Low-ball setup"}]
  },
  {
    id:"tr-midcourt-attack",name:"Transition: Midcourt Attack",cat:"Skill Focus",diff:"Intermediate",skill:"Transition/Approach",
    desc:"Attack midcourt balls and move forward.",
    tips:["Explode forward","Stay balanced","Recover to net"],
    youtubeId:"R5w7dnZmC18",youtubeStart:307,youtubeEnd:399,courtType:"singles",
    players:[{id:"A",x:50,y:85,color:BH.shotBlue}],
    steps:[
      {t:"hit",f:[50,85],to:[72,28],c:BH.shotBlue,n:"1",shot:"forehand",hitter:"A"},
      {t:"move",f:[50,85],to:[50,60],c:BH.shotBlue,note:"Close in"}
    ]
  },
  {
    id:"tr-abcd",name:"Transition: ABCD Combos",cat:"Skill Focus",diff:"Intermediate",skill:"Transition/Approach",
    desc:"Build point patterns from midcourt with ABCD combos.",
    tips:["Play with margin","Finish forward","Recover quickly"],
    youtubeId:"R5w7dnZmC18",youtubeStart:399,youtubeEnd:429,courtType:"singles",
    players:[{id:"A",x:50,y:85,color:BH.shotBlue}],
    steps:[{t:"hit",f:[50,85],to:[50,28],c:BH.shotBlue,n:"1",shot:"forehand",hitter:"A"}]
  },
  {
    id:"tr-tactic-game",name:"Transition: Tactics Game",cat:"Skill Focus",diff:"Intermediate",skill:"Transition/Approach",
    desc:"Play transition points with a tactical constraint.",
    tips:["Commit to the plan","Attack the short ball","Recover to net"],
    youtubeId:"R5w7dnZmC18",youtubeStart:429,youtubeEnd:493,courtType:"singles",
    players:[{id:"A",x:50,y:85,color:BH.shotBlue},{id:"B",x:50,y:15,color:BH.shotRed}],
    steps:[
      {t:"hit",f:[50,15],to:[50,70],c:BH.shotRed,n:"1",shot:"forehand",hitter:"B"},
      {t:"hit",f:[50,70],to:[72,28],c:BH.shotBlue,n:"2",shot:"forehand",hitter:"A",note:"Attack"}
    ]
  },
  {
    id:"pt-x-drill",name:"Pattern: X-Drill (Zone B/C)",cat:"Skill Focus",diff:"Intermediate",skill:"Patterns",
    desc:"Crossing pattern in the middle to build consistency.",
    tips:["Aim big middle targets","Recover after each hit","Stay patient"],
    youtubeId:"a-KsAAdIxP0",youtubeStart:198,youtubeEnd:229,courtType:"singles",
    players:[{id:"A",x:50,y:90,color:BH.shotBlue},{id:"B",x:50,y:10,color:BH.shotRed}],
    steps:[
      {t:"hit",f:[50,90],to:[50,10],c:BH.shotBlue,n:"1",shot:"forehand",hitter:"A"},
      {t:"hit",f:[50,10],to:[50,90],c:BH.shotRed,n:"2",shot:"forehand",hitter:"B"}
    ]
  },
  {
    id:"pt-warmup",name:"Pattern: Middle Warm-Up",cat:"Skill Focus",diff:"Beginner",skill:"Patterns",
    desc:"Warm-up in the middle to control depth and shape.",
    tips:["Heavy spin","Aim to the middle","Recover to center"],
    youtubeId:"a-KsAAdIxP0",youtubeStart:229,youtubeEnd:272,courtType:"singles",
    players:[{id:"A",x:50,y:90,color:BH.shotBlue},{id:"B",x:50,y:10,color:BH.shotRed}],
    steps:[
      {t:"hit",f:[50,90],to:[50,10],c:BH.shotBlue,n:"1",shot:"forehand",hitter:"A"},
      {t:"hit",f:[50,10],to:[50,90],c:BH.shotRed,n:"2",shot:"forehand",hitter:"B"}
    ]
  },
  {
    id:"pt-middle",name:"Pattern: Play Middle (Zone B/C)",cat:"Skill Focus",diff:"Intermediate",skill:"Patterns",
    desc:"Neutralize points by playing through the middle.",
    tips:["Avoid the sidelines","Use height","Be consistent"],
    youtubeId:"a-KsAAdIxP0",youtubeStart:272,youtubeEnd:404,courtType:"singles",
    players:[{id:"A",x:50,y:90,color:BH.shotBlue},{id:"B",x:50,y:10,color:BH.shotRed}],
    steps:[
      {t:"hit",f:[50,90],to:[50,10],c:BH.shotBlue,n:"1",shot:"forehand",hitter:"A"},
      {t:"hit",f:[50,10],to:[50,90],c:BH.shotRed,n:"2",shot:"forehand",hitter:"B"}
    ]
  },
  {
    id:"df-high-ball",name:"Defense: High-Ball Options",cat:"Skill Focus",diff:"Intermediate",skill:"Defense",
    desc:"Defend high balls with smart shot selection.",
    tips:["Create spacing","Stay tall","Reset the point"],
    youtubeId:"5eWB8YyIz8o",youtubeStart:30,youtubeEnd:148,courtType:"singles",
    players:[{id:"A",x:28,y:90,color:BH.shotBlue}],
    steps:[{t:"hit",f:[28,90],to:[72,8],c:BH.shotBlue,n:"1",shot:"backhand",hitter:"A",note:"Defensive option"}]
  },
  {
    id:"df-block-return",name:"Defense: Block Return",cat:"Skill Focus",diff:"Intermediate",skill:"Defense",
    desc:"Use a block return to neutralize pace.",
    tips:["Compact swing","Firm wrist","Aim deep middle"],
    youtubeId:"QnKKocEn77g",youtubeStart:212,youtubeEnd:257,courtType:"singles",
    players:[{id:"S",x:55,y:98,color:BH.shotBlue},{id:"R",x:50,y:5,color:BH.shotRed}],
    steps:[
      {t:"hit",f:[55,98],to:[50,22],c:BH.shotBlue,n:"1",shot:"serve",hitter:"S"},
      {t:"hit",f:[50,5],to:[50,45],c:BH.shotRed,n:"2",shot:"backhand",hitter:"R",note:"Block"}
    ]
  },
  {
    id:"df-slice-lob",name:"Defense: Slice Lob",cat:"Skill Focus",diff:"Intermediate",skill:"Defense",
    desc:"Use the slice lob to reset under pressure.",
    tips:["Open face","High arc","Recover quickly"],
    youtubeId:"Y8-_g03MEVs",youtubeStart:39,youtubeEnd:73,courtType:"singles",
    players:[{id:"A",x:50,y:85,color:BH.shotBlue},{id:"B",x:50,y:15,color:BH.shotRed}],
    steps:[{t:"hit",f:[50,85],to:[50,15],c:BH.shotBlue,n:"1",shot:"slice_fh",hitter:"A",note:"Defensive lob"}]
  },
  {
    id:"sl-fh-lob",name:"Slice: FH Slice Lob",cat:"Skill Focus",diff:"Intermediate",skill:"Slice",
    desc:"Forehand slice lob technique and contact.",
    tips:["Open face","Brush under","High finish"],
    youtubeId:"Y8-_g03MEVs",youtubeStart:39,youtubeEnd:73,courtType:"singles",
    players:[{id:"A",x:50,y:85,color:BH.shotBlue}],
    steps:[{t:"hit",f:[50,85],to:[50,15],c:BH.shotBlue,n:"1",shot:"slice_fh",hitter:"A"}]
  },
  {
    id:"sl-bh-lob",name:"Slice: BH Slice Lob",cat:"Skill Focus",diff:"Intermediate",skill:"Slice",
    desc:"Backhand slice lob mechanics and shape.",
    tips:["Stable wrist","High arc","Recover to middle"],
    youtubeId:"Y8-_g03MEVs",youtubeStart:73,youtubeEnd:131,courtType:"singles",
    players:[{id:"A",x:28,y:85,color:BH.shotBlue}],
    steps:[{t:"hit",f:[28,85],to:[72,15],c:BH.shotBlue,n:"1",shot:"slice_bh",hitter:"A"}]
  },
  {
    id:"sl-stance",name:"Slice: Stance & Setup",cat:"Skill Focus",diff:"Beginner",skill:"Slice",
    desc:"Use the right stance to control slice height and depth.",
    tips:["Side-on stance","Stay low","Finish forward"],
    youtubeId:"Y8-_g03MEVs",youtubeStart:198,youtubeEnd:248,courtType:"singles",
    players:[{id:"A",x:28,y:85,color:BH.shotBlue}],
    steps:[{t:"hit",f:[28,85],to:[72,15],c:BH.shotBlue,n:"1",shot:"slice_bh",hitter:"A"}]
  },
  {
    id:"lob-fh-topspin",name:"Lobs: Forehand Topspin",cat:"Skill Focus",diff:"Intermediate",skill:"Lobs",
    desc:"Lift the forehand topspin lob for defense and reset.",
    tips:["Brush up","Aim high","Recover quickly"],
    youtubeId:"4ybMXpEr5hg",youtubeStart:34,youtubeEnd:236,courtType:"singles",
    players:[{id:"A",x:50,y:85,color:BH.shotBlue}],
    steps:[{t:"hit",f:[50,85],to:[50,10],c:BH.shotBlue,n:"1",shot:"forehand",hitter:"A",note:"Topspin lob"}]
  },
  {
    id:"lob-one-hand",name:"Lobs: One-Handed",cat:"Skill Focus",diff:"Intermediate",skill:"Lobs",
    desc:"One-handed topspin lob technique.",
    tips:["High finish","Use legs","Keep balance"],
    youtubeId:"4ybMXpEr5hg",youtubeStart:236,youtubeEnd:382,courtType:"singles",
    players:[{id:"A",x:28,y:85,color:BH.shotBlue}],
    steps:[{t:"hit",f:[28,85],to:[50,10],c:BH.shotBlue,n:"1",shot:"forehand",hitter:"A",note:"One-hand lob"}]
  },
  {
    id:"lob-two-hand",name:"Lobs: Two-Handed",cat:"Skill Focus",diff:"Intermediate",skill:"Lobs",
    desc:"Two-handed topspin lob technique.",
    tips:["Drive up","Aim deep","Recover fast"],
    youtubeId:"4ybMXpEr5hg",youtubeStart:382,youtubeEnd:432,courtType:"singles",
    players:[{id:"A",x:28,y:85,color:BH.shotBlue}],
    steps:[{t:"hit",f:[28,85],to:[50,10],c:BH.shotBlue,n:"1",shot:"backhand",hitter:"A",note:"Two-hand lob"}]
  }
];
const DRILL_CATS=["All",...Array.from(new Set(DRILLS.map(d=>d.cat)))];
const DRILL_SKILLS=["All",...Array.from(new Set(DRILLS.map(d=>d.skill).filter(Boolean)))];
