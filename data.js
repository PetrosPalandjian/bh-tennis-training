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
  {id:"russian-twist",name:"Russian Twists",cat:"Core",desc:"Sit tall, lean back slightly, rotate through your ribs, and keep the legs quiet. Control every rep.",reps:"20 reps",equip:"Med Ball 8-12lb",youtubeId:"LlccOWys8IU"},
  {id:"plank",name:"Plank Hold",cat:"Core",desc:"Elbows under shoulders, glutes tight, ribs down. Hold a straight line head-to-heels.",reps:"45 sec",equip:"None",youtubeId:"UQ78pw0WNZI",youtubeStart:0,youtubeEnd:15},
  {id:"bicycle",name:"Bicycle Crunches",cat:"Core",desc:"Slow and controlled elbow-to-knee. Keep low back glued down and neck relaxed.",reps:"20 each",equip:"None",youtubeId:"kUY4WA71e0Q",youtubeStart:3,youtubeEnd:29},
  {id:"dead-bug",name:"Dead Bugs",cat:"Core",desc:"Press low back into the floor, extend opposite arm/leg, and keep ribs down.",reps:"10 each",equip:"None",youtubeId:"vWGVXZltbqE"},
  {id:"v-ups",name:"V-Ups",cat:"Core",desc:"Lift legs and torso together, reach tall, then lower under control.",reps:"15 reps",equip:"None",youtubeId:"Vnep1dTa_IQ"},
  {id:"side-plank",name:"Side Plank",cat:"Core",desc:"Stack shoulders and hips, lift to a straight line, and keep the glutes tight.",reps:"30s each",equip:"None",youtubeId:"fMDZyiEAGZw"},
  {id:"rot-throw",name:"Rotational Throws",cat:"Rotation",desc:"Load the hips, rotate hard, and throw explosively. Catch and reset under control.",reps:"10 each",equip:"Med Ball + Wall",youtubeId:"A-WchCuHC4c"},
  {id:"woodchop",name:"Band Woodchops",cat:"Rotation",desc:"Pull high-to-low on a diagonal, rotate through the torso, and control the return.",reps:"12 each",equip:"Resistance Band",youtubeId:"EeFp3ggbr1c"},
  {id:"pallof-press",name:"Pallof Press",cat:"Rotation",desc:"Press straight out and resist rotation. Ribs down, glutes on.",reps:"10 each",equip:"Resistance Band",youtubeId:"6wV02D5aAWA"},
  {id:"torso-rot",name:"Standing Rotation",cat:"Rotation",desc:"Band at chest height, rotate the torso while keeping hips quiet and knees soft.",reps:"15 each",equip:"Resistance Band",youtubeId:"2iZC699PsZg"},
  {id:"ladder",name:"Ladder Drills",cat:"Agility",desc:"Fast feet, light steps, and clean patterns. Stay low and stay quick.",reps:"4 lengths",equip:"Agility Ladder",youtubeId:"afgg4HUhqcQ"},
  {id:"cone-shuffle",name:"Cone Shuffles",cat:"Agility",desc:"Stay low, chest up, and push off the outside leg. Touch the cone and go.",reps:"8 trips",equip:"2 Cones",youtubeId:"QnWw-fYURww"},
  {id:"split-step",name:"Split Step Jumps",cat:"Agility",desc:"Small hop, land wide on the balls of your feet, then explode to the ball.",reps:"20 reps",equip:"None",youtubeId:"dU6tm_gaqO4"},
  {id:"suicides",name:"Suicide Sprints",cat:"Agility",desc:"Touch each line, change direction hard, and keep the pace honest.",reps:"4 sets",equip:"4 Cones",youtubeId:"jXQAt9zQWeI"},
  {id:"sprint-back",name:"Sprint + Backpedal",cat:"Agility",desc:"Sprint out, decelerate under control, then backpedal with low hips.",reps:"6 trips",equip:"None",youtubeId:"a2sCgSIOFIg"},
  {id:"box-jump",name:"Box Jumps",cat:"Lower Body",desc:"Swing arms, jump tall, land softly in a squat, and step down each rep.",youtubeId:"WgbMsNeTcoA",reps:"12 reps",equip:'20-24" Box'},
  {id:"lat-lunge",name:"Lateral Lunges",cat:"Lower Body",desc:"Hinge back into the hip, keep the planted leg straight, and drive out strong.",reps:"10 each",equip:"None",youtubeId:"pX77ux9avK0"},
  {id:"squat-jump",name:"Squat Jumps",cat:"Lower Body",desc:"Drop to a strong squat, explode up, and land softly into the next rep.",reps:"15 reps",equip:"None",youtubeId:"72BSZupb-1I"},
  {id:"single-hop",name:"Single Leg Hops",cat:"Lower Body",desc:"Hop on one leg, land quietly, knee tracking over toes, then stick the balance.",reps:"8 each",equip:"None",youtubeId:"BOLTnfYNgQ0"},
  {id:"calf-raise",name:"Calf Raises",cat:"Lower Body",desc:"Full range: pause at the top, squeeze hard, then lower slowly.",reps:"20 reps",equip:"Step",youtubeId:"YMmgqO8Jo-k"},
  {id:"wall-throw",name:"Wall Throws",cat:"Upper Body",desc:"Explosive chest pass to the wall, catch the rebound, and reset fast.",reps:"15 reps",equip:"Med Ball + Wall",youtubeId:"zukE-ziGls4"},
  {id:"pushups",name:"Push-Up Variations",cat:"Upper Body",desc:"Hands under shoulders, body straight, chest to floor, full lockout.",reps:"15 reps",equip:"None",youtubeId:"B_Qgxbabd6E"},
  {id:"band-pull",name:"Band Pull-Aparts",cat:"Upper Body",desc:"Pull the band apart, squeeze shoulder blades, and avoid shrugging.",reps:"15 reps",equip:"Resistance Band",youtubeId:"NqFnPPjib-Q"},
  {id:"oh-throw",name:"Overhead Throws",cat:"Upper Body",desc:"Load hips, drive up, and throw overhead with full-body power.",reps:"12 reps",equip:"Med Ball",youtubeId:"z1JiHB8a4PY"},
  {id:"jump-rope",name:"Jump Rope",cat:"Cardio",desc:"Small, quick jumps with wrists turning the rope and elbows tucked.",reps:"Full dur",equip:"Jump Rope",youtubeId:"nMHfZ-yrFjA"},
  {id:"mt-climbers",name:"Mountain Climbers",cat:"Cardio",desc:"Shoulders over wrists, core tight, and drive knees fast under control.",reps:"30 reps",equip:"None",youtubeId:"De3Gl-nC7IQ"},
  {id:"burpees",name:"Burpees",cat:"Cardio",desc:"Hands down, jump back, chest to floor, snap feet in, then jump up.",reps:"10 reps",equip:"None",youtubeId:"c1M1wjeZOYY"},
  {id:"high-knees",name:"High Knees",cat:"Cardio",desc:"Drive knees above hip height, pump the arms, and stay light on your feet.",reps:"30 sec",equip:"None",youtubeId:"lR3cpCVBjPM"}];
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
    id:"sv-grip",name:"Serve Progression 1: Impact & Pronation",cat:"Skill Focus",diff:"Beginner",skill:"Serve",
    desc:"Isolate contact and pronation without a full swing.",
    tips:["Continental (hammer) grip","High-five the ball","Loose hand = faster snap"],
    youtubeId:"QiVszYWaIO0",youtubeStart:274,youtubeEnd:368,courtType:"singles",
    players:[{id:"S",x:50,y:52,color:BH.shotBlue}],
    steps:[
      {t:"move",f:[50,52],to:[50,52],c:BH.shotBlue,note:"Stand near service line"},
      {t:"move",f:[50,52],to:[50,52],c:BH.shotBlue,note:"Racket high at contact"},
      {t:"move",f:[50,52],to:[50,52],c:BH.shotBlue,note:"Toss slightly in front"},
      {t:"hit",f:[50,52],to:[50,25],c:BH.shotBlue,n:"1",shot:"serve",hitter:"S",note:"High-five + pronate"}
    ]
  },
  {
    id:"sv-stance",name:"Serve Progression 2: Half-Swing (Trophy)",cat:"Skill Focus",diff:"Beginner",skill:"Serve",
    desc:"Learn the racket drop and upward swing from the trophy position.",
    tips:["Sideways stance","Racket head up","Continuous drop-to-hit"],
    youtubeId:"QiVszYWaIO0",youtubeStart:368,youtubeEnd:472,courtType:"singles",
    players:[{id:"S",x:55,y:98,color:BH.shotBlue},{id:"R",x:50,y:5,color:BH.shotRed}],
    steps:[
      {t:"move",f:[55,98],to:[55,98],c:BH.shotBlue,note:"Start in trophy position"},
      {t:"move",f:[55,98],to:[55,98],c:BH.shotBlue,note:"Drop racket behind back"},
      {t:"hit",f:[55,98],to:[50,22],c:BH.shotBlue,n:"1",shot:"serve",hitter:"S",note:"Swing up to contact"}
    ]
  },
  {
    id:"sv-toss",name:"Serve Progression 3: Add the Toss",cat:"Skill Focus",diff:"Beginner",skill:"Serve",
    desc:"Coordinate the tossing arm with the half-swing.",
    tips:["Straight arm toss","Wait for peak","Stay smooth"],
    youtubeId:"QiVszYWaIO0",youtubeStart:472,youtubeEnd:591,courtType:"singles",
    players:[{id:"S",x:56,y:68,color:BH.shotBlue}],
    steps:[
      {t:"move",f:[56,68],to:[56,68],c:BH.shotBlue,note:"Start in trophy position"},
      {t:"move",f:[56,68],to:[56,68],c:BH.shotBlue,note:"Toss with straight arm"},
      {t:"move",f:[56,68],to:[56,68],c:BH.shotBlue,note:"Let racket drop"},
      {t:"hit",f:[56,68],to:[50,28],c:BH.shotBlue,n:"1",shot:"serve",hitter:"S",note:"Explode up at peak"}
    ]
  },
  {
    id:"sv-contact",name:"Serve Progression 4: Full Motion",cat:"Skill Focus",diff:"Intermediate",skill:"Serve",
    desc:"Integrate the takeback and toss into one smooth motion.",
    tips:["Down together / up together","Smooth trophy","Same swing as Prog 3"],
    youtubeId:"QiVszYWaIO0",youtubeStart:591,youtubeEnd:788,courtType:"singles",
    players:[{id:"S",x:55,y:98,color:BH.shotBlue},{id:"R",x:50,y:5,color:BH.shotRed}],
    steps:[
      {t:"move",f:[55,98],to:[55,98],c:BH.shotBlue,note:"Ready stance: hands together"},
      {t:"move",f:[55,98],to:[55,98],c:BH.shotBlue,note:"Down together / up together"},
      {t:"move",f:[55,98],to:[55,98],c:BH.shotBlue,note:"Hit trophy then drop"},
      {t:"hit",f:[55,98],to:[50,25],c:BH.shotBlue,n:"1",shot:"serve",hitter:"S",note:"Explode to contact"}
    ]
  },
  {
    id:"sv-placement",name:"Serve Progression 5: Leg Drive & Rhythm",cat:"Skill Focus",diff:"Intermediate",skill:"Serve",
    desc:"Add leg drive and rhythm for power and forward transfer.",
    tips:["Deep knee bend","Drive up to full extension","Land inside court"],
    youtubeId:"QiVszYWaIO0",youtubeStart:788,youtubeEnd:941,courtType:"singles",
    players:[{id:"S",x:55,y:98,color:BH.shotBlue},{id:"R",x:50,y:5,color:BH.shotRed}],
    steps:[
      {t:"move",f:[55,98],to:[55,98],c:BH.shotBlue,note:"Full motion from Prog 4"},
      {t:"move",f:[55,98],to:[55,98],c:BH.shotBlue,note:"Knees bend on toss"},
      {t:"hit",f:[55,98],to:[72,22],c:BH.shotBlue,n:"1",shot:"serve",hitter:"S",note:"Drive up + pronate"},
      {t:"move",f:[55,98],to:[55,98],c:BH.shotBlue,note:"Land inside court"}
    ]
  },
  {
    id:"fh-ball-1",name:"FH Ball Machine Drill 1",cat:"Skill Focus",diff:"Beginner",skill:"Forehand",
    desc:"Groove the first ball-machine pattern with clean contact.",
    tips:["Racquet set early","Stay balanced","Finish across body"],
    youtubeId:"nyQSDaXOCQ8",youtubeStart:51,youtubeEnd:177,courtType:"singles",
    players:[{id:"A",x:50,y:92,color:BH.shotBlue}],
    steps:[
      {t:"move",f:[50,92],to:[50,92],c:BH.shotBlue,note:"Neutral stance, single feed"},
      {t:"hit",f:[50,92],to:[28,8],c:BH.shotBlue,n:"1",shot:"forehand",hitter:"A",note:"Steady cross-court"},
      {t:"move",f:[50,92],to:[50,92],c:BH.shotBlue,note:"Recover to center mark"}
    ]
  },
  {
    id:"fh-ball-2",name:"FH Ball Machine Drill 2",cat:"Skill Focus",diff:"Beginner",skill:"Forehand",
    desc:"Build depth control with the second ball-machine pattern.",
    tips:["High net clearance","Use legs","Recover to center"],
    youtubeId:"nyQSDaXOCQ8",youtubeStart:177,youtubeEnd:292,courtType:"singles",
    players:[{id:"A",x:60,y:92,color:BH.shotBlue}],
    steps:[
      {t:"move",f:[60,92],to:[72,92],c:BH.shotBlue,note:"Run around BH corner"},
      {t:"hit",f:[72,92],to:[40,8],c:BH.shotBlue,n:"1",shot:"forehand",hitter:"A",note:"Inside-out FH"},
      {t:"move",f:[72,92],to:[50,92],c:BH.shotBlue,note:"Recover to center"}
    ]
  },
  {
    id:"fh-ball-3",name:"FH Ball Machine Drill 3",cat:"Skill Focus",diff:"Intermediate",skill:"Forehand",
    desc:"Use forehand patterns to handle height changes.",
    tips:["Adjust with legs","Brush up","Finish balanced"],
    youtubeId:"nyQSDaXOCQ8",youtubeStart:292,youtubeEnd:370,courtType:"singles",
    players:[{id:"A",x:50,y:90,color:BH.shotBlue}],
    steps:[
      {t:"move",f:[50,90],to:[50,96],c:BH.shotBlue,note:"Deep ball: load back"},
      {t:"hit",f:[50,96],to:[72,8],c:BH.shotBlue,n:"1",shot:"forehand",hitter:"A",note:"Heavy topspin loop"},
      {t:"move",f:[50,96],to:[50,82],c:BH.shotBlue,note:"Short ball: step in"},
      {t:"hit",f:[50,82],to:[72,28],c:BH.shotBlue,n:"2",shot:"forehand",hitter:"A",note:"Flatten for winner"},
      {t:"move",f:[50,82],to:[50,92],c:BH.shotBlue,note:"Backpedal to center"}
    ]
  },
  {
    id:"fh-ball-4",name:"FH Ball Machine Drill 4",cat:"Skill Focus",diff:"Intermediate",skill:"Forehand",
    desc:"Attack short balls and recover quickly.",
    tips:["Explode forward","Stay low","Recover fast"],
    youtubeId:"nyQSDaXOCQ8",youtubeStart:370,youtubeEnd:492,courtType:"singles",
    players:[{id:"A",x:50,y:85,color:BH.shotBlue}],
    steps:[
      {t:"move",f:[50,85],to:[80,86],c:BH.shotBlue,note:"Sprint wide FH"},
      {t:"hit",f:[80,86],to:[72,28],c:BH.shotBlue,n:"1",shot:"forehand",hitter:"A",note:"Open-stance on run"},
      {t:"move",f:[80,86],to:[50,85],c:BH.shotBlue,note:"Push off to recover"}
    ]
  },
  {
    id:"fh-ball-5",name:"FH Ball Machine Drill 5",cat:"Skill Focus",diff:"Intermediate",skill:"Forehand",
    desc:"Handle deep balls with heavy topspin.",
    tips:["Load on back leg","Drive up","Recover to middle"],
    youtubeId:"nyQSDaXOCQ8",youtubeStart:492,youtubeEnd:552,courtType:"singles",
    players:[{id:"A",x:50,y:92,color:BH.shotBlue}],
    steps:[
      {t:"move",f:[50,92],to:[50,92],c:BH.shotBlue,note:"Hold ground vs high ball"},
      {t:"hit",f:[50,92],to:[50,8],c:BH.shotBlue,n:"1",shot:"forehand",hitter:"A",note:"Attack at shoulder height"},
      {t:"move",f:[50,92],to:[50,92],c:BH.shotBlue,note:"Reset quickly"}
    ]
  },
  {
    id:"fh-ball-6",name:"FH Ball Machine Drill 6: 2-1 Pattern",cat:"Skill Focus",diff:"Intermediate",skill:"Forehand",
    desc:"Pattern play: two cross-courts then change direction.",
    tips:["Rally, rally, attack","Set feet early","Change direction on ball 3"],
    youtubeId:"nyQSDaXOCQ8",youtubeStart:552,youtubeEnd:616,courtType:"singles",
    players:[{id:"A",x:50,y:92,color:BH.shotBlue}],
    steps:[
      {t:"hit",f:[50,92],to:[28,8],c:BH.shotBlue,n:"1",shot:"forehand",hitter:"A",note:"CC 1"},
      {t:"move",f:[50,92],to:[50,92],c:BH.shotBlue,note:"Recover"},
      {t:"hit",f:[50,92],to:[28,8],c:BH.shotBlue,n:"2",shot:"forehand",hitter:"A",note:"CC 2"},
      {t:"move",f:[50,92],to:[52,92],c:BH.shotBlue,note:"Set for change"},
      {t:"hit",f:[52,92],to:[72,8],c:BH.shotBlue,n:"3",shot:"forehand",hitter:"A",note:"DTL attack"}
    ]
  },
  {
    id:"fh-ball-7",name:"FH Ball Machine Drill 7: Random Reaction",cat:"Skill Focus",diff:"Intermediate",skill:"Forehand",
    desc:"React to random feeds while committing to forehands.",
    tips:["Explosive footwork","Cut off angles","Max intensity 30-45s"],
    youtubeId:"nyQSDaXOCQ8",youtubeStart:616,youtubeEnd:690,courtType:"singles",
    players:[{id:"A",x:50,y:92,color:BH.shotBlue}],
    steps:[
      {t:"move",f:[50,92],to:[70,90],c:BH.shotBlue,note:"Explode to FH side"},
      {t:"hit",f:[70,90],to:[28,8],c:BH.shotBlue,n:"1",shot:"forehand",hitter:"A",note:"Forehand only"},
      {t:"move",f:[70,90],to:[30,90],c:BH.shotBlue,note:"Run around BH"},
      {t:"hit",f:[30,90],to:[72,10],c:BH.shotBlue,n:"2",shot:"forehand",hitter:"A",note:"Forehand only"},
      {t:"move",f:[30,90],to:[50,92],c:BH.shotBlue,note:"Reset quickly"}
    ]
  },
  {
    id:"bh-options",name:"Backhand High-Ball Options",cat:"Skill Focus",diff:"Intermediate",skill:"Backhand",
    desc:"Choose the best option when the ball rises above shoulder height.",
    tips:["Decide early","Use spacing","Commit to the choice"],
    youtubeId:"5eWB8YyIz8o",youtubeStart:30,youtubeEnd:148,courtType:"singles",
    players:[{id:"A",x:28,y:90,color:BH.shotBlue}],
    steps:[
      {t:"move",f:[28,90],to:[42,88],c:BH.shotBlue,note:"Recognize high floater early"},
      {t:"move",f:[42,88],to:[50,86],c:BH.shotBlue,note:"Run around: clear BH side"},
      {t:"hit",f:[50,86],to:[72,10],c:BH.shotBlue,n:"1",shot:"forehand",hitter:"A",note:"Option 1: Inside-out FH"},
      {t:"move",f:[50,86],to:[28,90],c:BH.shotBlue,note:"Reset for BH option"},
      {t:"move",f:[28,90],to:[26,92],c:BH.shotBlue,note:"Slice prep: racket high"},
      {t:"hit",f:[26,92],to:[60,12],c:BH.shotBlue,n:"2",shot:"slice_bh",hitter:"A",note:"Option 2: BH slice (chop)"},
      {t:"move",f:[26,92],to:[24,92],c:BH.shotBlue,note:"Drive prep: shoulders turned"},
      {t:"hit",f:[24,92],to:[70,12],c:BH.shotBlue,n:"3",shot:"backhand",hitter:"A",note:"Option 3: High BH drive"},
      {t:"move",f:[24,92],to:[30,92],c:BH.shotBlue,note:"Recover to base"}
    ]
  },
  {
    id:"bh-technique",name:"Backhand High-Ball Technique",cat:"Skill Focus",diff:"Intermediate",skill:"Backhand",
    desc:"Key technique cues for high-ball backhands.",
    tips:["Create space","Stay tall","Finish through target"],
    youtubeId:"5eWB8YyIz8o",youtubeStart:148,youtubeEnd:183,courtType:"singles",
    players:[{id:"A",x:28,y:90,color:BH.shotBlue}],
    steps:[
      {t:"move",f:[28,90],to:[24,92],c:BH.shotBlue,note:"Create space behind ball"},
      {t:"move",f:[24,92],to:[24,92],c:BH.shotBlue,note:"Racket high, closed stance"},
      {t:"hit",f:[24,92],to:[70,12],c:BH.shotBlue,n:"1",shot:"backhand",hitter:"A",note:"Drive level through"},
      {t:"move",f:[24,92],to:[28,90],c:BH.shotBlue,note:"Balanced finish"}
    ]
  },
  {
    id:"bh-contact",name:"Backhand Contact Point",cat:"Skill Focus",diff:"Beginner",skill:"Backhand",
    desc:"Find clean contact on high balls with a stable head.",
    tips:["Contact out in front","Stable wrist","Balanced finish"],
    youtubeId:"5eWB8YyIz8o",youtubeStart:183,youtubeEnd:211,courtType:"singles",
    players:[{id:"A",x:28,y:90,color:BH.shotBlue}],
    steps:[
      {t:"move",f:[28,90],to:[24,92],c:BH.shotBlue,note:"Spacing: ball farther out"},
      {t:"hit",f:[24,92],to:[70,10],c:BH.shotBlue,n:"1",shot:"backhand",hitter:"A",note:"Contact at shoulder height"},
      {t:"move",f:[24,92],to:[28,90],c:BH.shotBlue,note:"Recover to base"}
    ]
  },
  {
    id:"bh-drill-1",name:"Backhand Drill 1",cat:"Skill Focus",diff:"Intermediate",skill:"Backhand",
    desc:"Use a repeatable pattern to build high-ball consistency.",
    tips:["Same rhythm","Aim big targets","Recover quickly"],
    youtubeId:"5eWB8YyIz8o",youtubeStart:211,youtubeEnd:417,courtType:"singles",
    players:[{id:"A",x:28,y:90,color:BH.shotBlue}],
    steps:[
      {t:"move",f:[28,90],to:[26,92],c:BH.shotBlue,note:"Baseline position"},
      {t:"move",f:[26,92],to:[26,92],c:BH.shotBlue,note:"Self-drop from high hand"},
      {t:"hit",f:[26,92],to:[70,12],c:BH.shotBlue,n:"1",shot:"backhand",hitter:"A",note:"Contact at shoulder height"},
      {t:"move",f:[26,92],to:[26,92],c:BH.shotBlue,note:"Drive level (no big brush)"},
      {t:"move",f:[26,92],to:[28,90],c:BH.shotBlue,note:"Reset and repeat"}
    ]
  },
  {
    id:"bh-ball-machine",name:"Backhand Ball Machine Drills",cat:"Skill Focus",diff:"Intermediate",skill:"Backhand",
    desc:"Ball-machine sequences for high-ball backhands.",
    tips:["Move through the ball","Finish balanced","Recover to center"],
    youtubeId:"5eWB8YyIz8o",youtubeStart:417,youtubeEnd:521,courtType:"singles",
    players:[{id:"A",x:28,y:92,color:BH.shotBlue}],
    steps:[
      {t:"move",f:[28,92],to:[28,92],c:BH.shotBlue,note:"Ready on baseline"},
      {t:"move",f:[28,92],to:[24,92],c:BH.shotBlue,note:"Split + unit turn"},
      {t:"hit",f:[24,92],to:[70,10],c:BH.shotBlue,n:"1",shot:"backhand",hitter:"A",note:"Drive at shoulder height"},
      {t:"move",f:[24,92],to:[28,92],c:BH.shotBlue,note:"Reset quickly"},
      {t:"move",f:[28,92],to:[40,88],c:BH.shotBlue,note:"Decision set: run around"},
      {t:"hit",f:[40,88],to:[72,10],c:BH.shotBlue,n:"2",shot:"forehand",hitter:"A",note:"Option 1: Inside-out FH"},
      {t:"move",f:[40,88],to:[24,92],c:BH.shotBlue,note:"Decision set: stay BH"},
      {t:"hit",f:[24,92],to:[70,12],c:BH.shotBlue,n:"3",shot:"backhand",hitter:"A",note:"Option 3: Drive"},
      {t:"move",f:[24,92],to:[26,92],c:BH.shotBlue,note:"Decision set: slice"},
      {t:"hit",f:[26,92],to:[60,12],c:BH.shotBlue,n:"4",shot:"slice_bh",hitter:"A",note:"Option 2: Slice"}
    ]
  },
  {
    id:"ret-split",name:"Return Split Step",cat:"Skill Focus",diff:"Beginner",skill:"Return",
    desc:"Time the split step to react to the serve.",
    tips:["Split as ball leaves strings","Stay low","Short first step"],
    youtubeId:"QnKKocEn77g",youtubeStart:18,youtubeEnd:60,courtType:"singles",
    players:[{id:"S",x:55,y:98,color:BH.shotBlue},{id:"R",x:50,y:5,color:BH.shotRed}],
    steps:[
      {t:"move",f:[50,5],to:[50,5],c:BH.shotRed,note:"Hop into wide base"},
      {t:"move",f:[50,5],to:[50,5],c:BH.shotRed,note:"Land on balls of feet"},
      {t:"hit",f:[55,98],to:[50,22],c:BH.shotBlue,n:"1",shot:"serve",hitter:"S"},
      {t:"hit",f:[50,5],to:[50,45],c:BH.shotRed,n:"2",shot:"forehand",hitter:"R",note:"Explode after landing"}
    ]
  },
  {
    id:"ret-timing",name:"Return Timing",cat:"Skill Focus",diff:"Beginner",skill:"Return",
    desc:"Load early and meet the ball in front.",
    tips:["Early prep","Compact swing","Eyes on contact"],
    youtubeId:"QnKKocEn77g",youtubeStart:60,youtubeEnd:91,courtType:"singles",
    players:[{id:"S",x:55,y:98,color:BH.shotBlue},{id:"R",x:50,y:5,color:BH.shotRed}],
    steps:[
      {t:"move",f:[50,5],to:[50,5],c:BH.shotRed,note:"Start forward as toss goes up"},
      {t:"move",f:[50,5],to:[50,5],c:BH.shotRed,note:"In air at contact"},
      {t:"hit",f:[55,98],to:[50,22],c:BH.shotBlue,n:"1",shot:"serve",hitter:"S"},
      {t:"hit",f:[50,5],to:[50,45],c:BH.shotRed,n:"2",shot:"backhand",hitter:"R",note:"Land then push"}
    ]
  },
  {
    id:"ret-position",name:"Return Positioning",cat:"Skill Focus",diff:"Beginner",skill:"Return",
    desc:"Adjust return position based on serve and court speed.",
    tips:["Start neutral","Adjust depth","Recover quickly"],
    youtubeId:"QnKKocEn77g",youtubeStart:91,youtubeEnd:159,courtType:"singles",
    players:[{id:"S",x:55,y:98,color:BH.shotBlue},{id:"R",x:50,y:5,color:BH.shotRed}],
    steps:[
      {t:"move",f:[50,5],to:[50,8],c:BH.shotRed,note:"Step back for 1st serve"},
      {t:"hit",f:[55,98],to:[50,22],c:BH.shotBlue,n:"1",shot:"serve",hitter:"S"},
      {t:"hit",f:[50,8],to:[50,45],c:BH.shotRed,n:"2",shot:"forehand",hitter:"R",note:"More time to react"},
      {t:"move",f:[50,8],to:[50,2],c:BH.shotRed,note:"Step in for 2nd serve"},
      {t:"hit",f:[55,98],to:[50,22],c:BH.shotBlue,n:"3",shot:"serve",hitter:"S",note:"Slower serve"},
      {t:"hit",f:[50,2],to:[50,45],c:BH.shotRed,n:"4",shot:"forehand",hitter:"R",note:"Take time away"}
    ]
  },
  {
    id:"ret-stance",name:"Return Stance",cat:"Skill Focus",diff:"Beginner",skill:"Return",
    desc:"Use an athletic stance to handle pace and direction.",
    tips:["Wide base","Hands in front","Explode to the ball"],
    youtubeId:"QnKKocEn77g",youtubeStart:159,youtubeEnd:212,courtType:"singles",
    players:[{id:"S",x:55,y:98,color:BH.shotBlue},{id:"R",x:50,y:5,color:BH.shotRed}],
    steps:[
      {t:"move",f:[50,5],to:[50,5],c:BH.shotRed,note:"Wide base + low center"},
      {t:"move",f:[50,5],to:[50,5],c:BH.shotRed,note:"Hands in front, ready"},
      {t:"hit",f:[55,98],to:[50,22],c:BH.shotBlue,n:"1",shot:"serve",hitter:"S"},
      {t:"hit",f:[50,5],to:[50,45],c:BH.shotRed,n:"2",shot:"forehand",hitter:"R",note:"Explode from stance"}
    ]
  },
  {
    id:"ret-block",name:"Block Return",cat:"Skill Focus",diff:"Intermediate",skill:"Return",
    desc:"Neutralize pace with a firm block return.",
    tips:["Short punch","Stable wrist","Aim deep middle"],
    youtubeId:"QnKKocEn77g",youtubeStart:212,youtubeEnd:257,courtType:"singles",
    players:[{id:"S",x:55,y:98,color:BH.shotBlue},{id:"R",x:50,y:5,color:BH.shotRed}],
    steps:[
      {t:"move",f:[50,5],to:[50,5],c:BH.shotRed,note:"Unit turn, compact back"},
      {t:"hit",f:[55,98],to:[50,22],c:BH.shotBlue,n:"1",shot:"serve",hitter:"S"},
      {t:"hit",f:[50,5],to:[50,45],c:BH.shotRed,n:"2",shot:"backhand",hitter:"R",note:"Block to deep middle"}
    ]
  },
  {
    id:"ret-middle",name:"Return Placement: Middle",cat:"Skill Focus",diff:"Beginner",skill:"Return",
    desc:"Use the middle for maximum margin on fast serves.",
    tips:["Aim through the center","Lowest net height","Takes away angles"],
    youtubeId:"QnKKocEn77g",youtubeStart:1234,youtubeEnd:1268,courtType:"singles",
    players:[{id:"S",x:55,y:98,color:BH.shotBlue},{id:"R",x:50,y:5,color:BH.shotRed}],
    steps:[
      {t:"hit",f:[55,98],to:[50,22],c:BH.shotBlue,n:"1",shot:"serve",hitter:"S"},
      {t:"hit",f:[50,5],to:[50,50],c:BH.shotRed,n:"2",shot:"forehand",hitter:"R",note:"Return to middle"}
    ]
  },
  {
    id:"ret-2nd-attack",name:"Second Serve Attack",cat:"Skill Focus",diff:"Beginner",skill:"Return",
    desc:"Step in and pressure the server on second serves.",
    tips:["Move 1–2m forward","Look for forehand","Big safe target"],
    youtubeId:"QnKKocEn77g",youtubeStart:1064,youtubeEnd:1159,courtType:"singles",
    players:[{id:"S",x:55,y:98,color:BH.shotBlue},{id:"R",x:50,y:5,color:BH.shotRed}],
    steps:[
      {t:"move",f:[50,5],to:[50,2],c:BH.shotRed,note:"Step in for 2nd serve"},
      {t:"move",f:[50,2],to:[62,4],c:BH.shotRed,note:"Run around to FH"},
      {t:"hit",f:[62,4],to:[50,60],c:BH.shotRed,n:"1",shot:"forehand",hitter:"R",note:"Attack big target"}
    ]
  },
  {
    id:"fw-fh-tech",name:"Footwork: FH Technique & Steps",cat:"Skill Focus",diff:"Beginner",skill:"Footwork",
    desc:"Use clean setup steps to organize the forehand.",
    tips:["Early unit turn","Small adjustment steps","Balance at contact"],
    youtubeId:"nyQSDaXOCQ8",youtubeStart:33,youtubeEnd:124,courtType:"singles",
    players:[{id:"A",x:50,y:92,color:BH.shotBlue}],
    steps:[
      {t:"move",f:[50,92],to:[50,92],c:BH.shotBlue,note:"Split step + unit turn"},
      {t:"move",f:[50,92],to:[58,90],c:BH.shotBlue,note:"Small adjustment steps"},
      {t:"hit",f:[58,90],to:[72,12],c:BH.shotBlue,n:"1",shot:"forehand",hitter:"A",note:"Set then strike"},
      {t:"move",f:[58,90],to:[50,92],c:BH.shotBlue,note:"Recover to center"}
    ]
  },
  {
    id:"fw-self-feed",name:"Footwork: Self-Feed Rhythm",cat:"Skill Focus",diff:"Beginner",skill:"Footwork",
    desc:"Self-feed to control spacing and rhythm before striking.",
    tips:["Feed to the hitting zone","Set feet early","Balance through contact"],
    youtubeId:"R5w7dnZmC18",youtubeStart:61,youtubeEnd:97,courtType:"singles",
    players:[{id:"A",x:50,y:92,color:BH.shotBlue}],
    steps:[
      {t:"move",f:[50,92],to:[50,92],c:BH.shotBlue,note:"Stand baseline or service line"},
      {t:"move",f:[50,92],to:[50,92],c:BH.shotBlue,note:"Hold ball out front"},
      {t:"move",f:[50,92],to:[50,92],c:BH.shotBlue,note:"Drop (no toss), 1 bounce"},
      {t:"hit",f:[50,92],to:[72,12],c:BH.shotBlue,n:"1",shot:"forehand",hitter:"A",note:"Swing right after bounce"},
      {t:"move",f:[50,92],to:[50,92],c:BH.shotBlue,note:"Head still, watch contact"}
    ]
  },
  {
    id:"fw-stance",name:"Footwork: Stance Training",cat:"Skill Focus",diff:"Beginner",skill:"Footwork",
    desc:"Choose open vs. neutral stance under control.",
    tips:["Lower center of gravity","Stay athletic","Recover to center"],
    youtubeId:"R5w7dnZmC18",youtubeStart:129,youtubeEnd:212,courtType:"singles",
    players:[{id:"A",x:50,y:92,color:BH.shotBlue}],
    steps:[
      {t:"move",f:[50,92],to:[46,92],c:BH.shotBlue,note:"Neutral: step in"},
      {t:"hit",f:[46,92],to:[72,12],c:BH.shotBlue,n:"1",shot:"forehand",hitter:"A",note:"Neutral stance rep"},
      {t:"move",f:[46,92],to:[54,92],c:BH.shotBlue,note:"Open: load outside leg"},
      {t:"hit",f:[54,92],to:[72,12],c:BH.shotBlue,n:"2",shot:"forehand",hitter:"A",note:"Open stance rep"},
      {t:"move",f:[54,92],to:[50,92],c:BH.shotBlue,note:"Alternate 5/5 reps"}
    ]
  },
  {
    id:"fw-footwork",name:"Footwork: Movement Patterns",cat:"Skill Focus",diff:"Beginner",skill:"Footwork",
    desc:"Lateral and diagonal movement patterns to the ball.",
    tips:["Stay low","Short steps","Explode to ball"],
    youtubeId:"R5w7dnZmC18",youtubeStart:213,youtubeEnd:272,courtType:"singles",
    players:[{id:"A",x:50,y:92,color:BH.shotBlue}],
    steps:[
      {t:"move",f:[50,92],to:[62,84],c:BH.shotBlue,note:"Sprint diagonally to ball"},
      {t:"hit",f:[62,84],to:[72,12],c:BH.shotBlue,n:"1",shot:"forehand",hitter:"A",note:"Self-feed + strike"},
      {t:"move",f:[62,84],to:[50,92],c:BH.shotBlue,note:"Shuffle/backpedal to center"},
      {t:"move",f:[50,92],to:[38,84],c:BH.shotBlue,note:"Repeat to BH side"}
    ]
  },
  {
    id:"fw-low-balls",name:"Footwork: Low-Ball Movement",cat:"Skill Focus",diff:"Intermediate",skill:"Footwork",
    desc:"Get under low balls with strong leg drive.",
    tips:["Bend knees","Keep chest up","Drive through contact"],
    youtubeId:"R5w7dnZmC18",youtubeStart:273,youtubeEnd:306,courtType:"singles",
    players:[{id:"A",x:50,y:92,color:BH.shotBlue}],
    steps:[
      {t:"move",f:[50,92],to:[50,86],c:BH.shotBlue,note:"Low feed near feet"},
      {t:"move",f:[50,86],to:[50,86],c:BH.shotBlue,note:"Bend knees (not back)"},
      {t:"hit",f:[50,86],to:[72,22],c:BH.shotBlue,n:"1",shot:"forehand",hitter:"A",note:"Brush up for dip"},
      {t:"move",f:[50,86],to:[50,70],c:BH.shotBlue,note:"Follow ball forward"}
    ]
  },
  {
    id:"tr-midcourt-attack",name:"Transition: Midcourt Attack",cat:"Skill Focus",diff:"Intermediate",skill:"Transition/Approach",
    desc:"Attack midcourt balls and move forward.",
    tips:["Explode forward","Stay balanced","Recover to net"],
    youtubeId:"R5w7dnZmC18",youtubeStart:307,youtubeEnd:398,courtType:"singles",
    players:[{id:"A",x:50,y:85,color:BH.shotBlue}],
    steps:[
      {t:"move",f:[50,85],to:[50,96],c:BH.shotBlue,note:"Start 2m behind baseline"},
      {t:"move",f:[50,96],to:[50,88],c:BH.shotBlue,note:"Toss short ball forward"},
      {t:"hit",f:[50,88],to:[72,28],c:BH.shotBlue,n:"1",shot:"forehand",hitter:"A",note:"Hit at top of bounce"},
      {t:"move",f:[50,88],to:[50,60],c:BH.shotBlue,note:"Carry momentum inside"}
    ]
  },
  {
    id:"tr-abcd",name:"Transition: ABCD Combos",cat:"Skill Focus",diff:"Intermediate",skill:"Transition/Approach",
    desc:"Build point patterns from midcourt with ABCD combos.",
    tips:["Play with margin","Finish forward","Recover quickly"],
    youtubeId:"R5w7dnZmC18",youtubeStart:399,youtubeEnd:428,courtType:"singles",
    players:[{id:"A",x:50,y:85,color:BH.shotBlue}],
    steps:[
      {t:"move",f:[50,85],to:[50,85],c:BH.shotBlue,note:"Call target A/B/C/D"},
      {t:"hit",f:[50,85],to:[72,28],c:BH.shotBlue,n:"1",shot:"forehand",hitter:"A",note:"Hit called target"},
      {t:"move",f:[50,85],to:[50,85],c:BH.shotBlue,note:"Miss = restart set"}
    ]
  },
  {
    id:"tr-tactic-game",name:"Transition: Tactics Game",cat:"Skill Focus",diff:"Intermediate",skill:"Transition/Approach",
    desc:"Play transition points with a tactical constraint.",
    tips:["Commit to the plan","Attack the short ball","Recover to net"],
    youtubeId:"R5w7dnZmC18",youtubeStart:429,youtubeEnd:492,courtType:"singles",
    players:[{id:"A",x:50,y:85,color:BH.shotBlue},{id:"B",x:50,y:15,color:BH.shotRed}],
    steps:[
      {t:"move",f:[50,85],to:[50,85],c:BH.shotBlue,note:"Serve or self-feed start"},
      {t:"move",f:[50,85],to:[62,72],c:BH.shotBlue,note:"Shadow return to spot"},
      {t:"hit",f:[62,72],to:[72,28],c:BH.shotBlue,n:"1",shot:"forehand",hitter:"A",note:"Approach shot"},
      {t:"move",f:[62,72],to:[50,50],c:BH.shotBlue,note:"Move in + split step"}
    ]
  },
  {
    id:"pt-x-drill",name:"Pattern: X-Drill (Zone B/C)",cat:"Skill Focus",diff:"Intermediate",skill:"Patterns",
    desc:"Crossing pattern in the middle to build consistency.",
    tips:["Aim big middle targets","Recover after each hit","Stay patient"],
    youtubeId:"a-KsAAdIxP0",youtubeStart:198,youtubeEnd:272,courtType:"singles",
    players:[{id:"A",x:50,y:90,color:BH.shotBlue},{id:"B",x:50,y:10,color:BH.shotRed}],
    steps:[
      {t:"hit",f:[50,90],to:[42,10],c:BH.shotBlue,n:"1",shot:"forehand",hitter:"A",note:"CC to safe target"},
      {t:"hit",f:[50,10],to:[58,90],c:BH.shotRed,n:"2",shot:"forehand",hitter:"B",note:"CC back"},
      {t:"move",f:[50,90],to:[50,90],c:BH.shotBlue,note:"Recover to center"},
      {t:"move",f:[50,10],to:[50,10],c:BH.shotRed,note:"Recover to center"}
    ]
  },
  {
    id:"pt-warmup",name:"Pattern: Middle Warm-Up",cat:"Skill Focus",diff:"Beginner",skill:"Patterns",
    desc:"Warm-up in the middle to control depth and shape.",
    tips:["Heavy spin","Aim to the middle","Recover to center"],
    youtubeId:"a-KsAAdIxP0",youtubeStart:229,youtubeEnd:272,courtType:"singles",
    players:[{id:"A",x:50,y:90,color:BH.shotBlue},{id:"B",x:50,y:10,color:BH.shotRed}],
    steps:[
      {t:"hit",f:[50,90],to:[50,10],c:BH.shotBlue,n:"1",shot:"forehand",hitter:"A",note:"Middle target"},
      {t:"hit",f:[50,10],to:[50,90],c:BH.shotRed,n:"2",shot:"forehand",hitter:"B",note:"Middle target"},
      {t:"move",f:[50,90],to:[50,90],c:BH.shotBlue,note:"Recover to middle"},
      {t:"move",f:[50,10],to:[50,10],c:BH.shotRed,note:"Recover to middle"}
    ]
  },
  {
    id:"pt-middle",name:"Pattern: Play Middle (Zone B/C)",cat:"Skill Focus",diff:"Intermediate",skill:"Patterns",
    desc:"Neutralize points by playing through the middle.",
    tips:["Avoid the sidelines","Use height","Be consistent"],
    youtubeId:"a-KsAAdIxP0",youtubeStart:272,youtubeEnd:404,courtType:"singles",
    players:[{id:"A",x:50,y:90,color:BH.shotBlue},{id:"B",x:50,y:10,color:BH.shotRed}],
    steps:[
      {t:"hit",f:[50,90],to:[50,10],c:BH.shotBlue,n:"1",shot:"forehand",hitter:"A",note:"Zone B/C only"},
      {t:"hit",f:[50,10],to:[50,90],c:BH.shotRed,n:"2",shot:"forehand",hitter:"B",note:"Zone B/C only"},
      {t:"move",f:[50,90],to:[50,90],c:BH.shotBlue,note:"Patience + margin"},
      {t:"move",f:[50,10],to:[50,10],c:BH.shotRed,note:"Patience + margin"}
    ]
  },
  {
    id:"pt-attack-short",name:"Pattern: Attack the Short Ball",cat:"Skill Focus",diff:"Intermediate",skill:"Patterns",
    desc:"Rally middle until a short ball appears, then attack the corners.",
    tips:["B/C until short","Step in aggressively","Finish to A or D"],
    youtubeId:"a-KsAAdIxP0",youtubeStart:404,youtubeEnd:472,courtType:"singles",
    players:[{id:"A",x:50,y:90,color:BH.shotBlue},{id:"B",x:50,y:10,color:BH.shotRed}],
    steps:[
      {t:"hit",f:[50,90],to:[50,12],c:BH.shotBlue,n:"1",shot:"forehand",hitter:"A",note:"Rally middle"},
      {t:"hit",f:[50,12],to:[50,85],c:BH.shotRed,n:"2",shot:"forehand",hitter:"B",note:"Short ball"},
      {t:"move",f:[50,90],to:[50,78],c:BH.shotBlue,note:"Step in"},
      {t:"hit",f:[50,78],to:[72,12],c:BH.shotBlue,n:"3",shot:"forehand",hitter:"A",note:"Attack corner"}
    ]
  },
  {
    id:"df-high-ball",name:"Defense: High-Ball Options",cat:"Skill Focus",diff:"Intermediate",skill:"Defense",
    desc:"Defend high balls with smart shot selection.",
    tips:["Create spacing","Stay tall","Reset the point"],
    youtubeId:"5eWB8YyIz8o",youtubeStart:30,youtubeEnd:148,courtType:"singles",
    players:[{id:"A",x:28,y:90,color:BH.shotBlue}],
    steps:[
      {t:"move",f:[28,90],to:[24,92],c:BH.shotBlue,note:"Back up for space"},
      {t:"hit",f:[24,92],to:[50,12],c:BH.shotBlue,n:"1",shot:"slice_bh",hitter:"A",note:"Deep slice reset"},
      {t:"move",f:[24,92],to:[28,90],c:BH.shotBlue,note:"Recover to middle"}
    ]
  },
  {
    id:"df-block-return",name:"Defense: Block Return",cat:"Skill Focus",diff:"Intermediate",skill:"Defense",
    desc:"Use a block return to neutralize pace.",
    tips:["Compact swing","Firm wrist","Aim deep middle"],
    youtubeId:"QnKKocEn77g",youtubeStart:212,youtubeEnd:257,courtType:"singles",
    players:[{id:"S",x:55,y:98,color:BH.shotBlue},{id:"R",x:50,y:5,color:BH.shotRed}],
    steps:[
      {t:"move",f:[50,5],to:[50,5],c:BH.shotRed,note:"Short backswing"},
      {t:"hit",f:[55,98],to:[50,22],c:BH.shotBlue,n:"1",shot:"serve",hitter:"S"},
      {t:"hit",f:[50,5],to:[50,45],c:BH.shotRed,n:"2",shot:"backhand",hitter:"R",note:"Block to middle"}
    ]
  },
  {
    id:"df-slice-lob",name:"Defense: Slice Lob",cat:"Skill Focus",diff:"Intermediate",skill:"Defense",
    desc:"Use the slice lob to reset under pressure.",
    tips:["Open face","High arc","Recover quickly"],
    youtubeId:"Y8-_g03MEVs",youtubeStart:42,youtubeEnd:130,courtType:"singles",
    players:[{id:"A",x:50,y:85,color:BH.shotBlue},{id:"B",x:50,y:15,color:BH.shotRed}],
    steps:[
      {t:"move",f:[50,85],to:[50,85],c:BH.shotBlue,note:"Continental grip"},
      {t:"hit",f:[50,85],to:[50,15],c:BH.shotBlue,n:"1",shot:"slice_fh",hitter:"A",note:"High-to-low-to-high"},
      {t:"move",f:[50,85],to:[50,70],c:BH.shotBlue,note:"Recover to middle"}
    ]
  },
  {
    id:"sl-fh-lob",name:"Slice: FH Slice Lob",cat:"Skill Focus",diff:"Intermediate",skill:"Slice",
    desc:"Forehand slice lob technique and contact.",
    tips:["Open face","Brush under","High finish"],
    youtubeId:"Y8-_g03MEVs",youtubeStart:52,youtubeEnd:130,courtType:"singles",
    players:[{id:"A",x:50,y:85,color:BH.shotBlue}],
    steps:[
      {t:"move",f:[50,85],to:[50,85],c:BH.shotBlue,note:"Open face, racket high"},
      {t:"hit",f:[50,85],to:[50,15],c:BH.shotBlue,n:"1",shot:"slice_fh",hitter:"A",note:"Squash + lift"},
      {t:"move",f:[50,85],to:[50,85],c:BH.shotBlue,note:"Finish high"}
    ]
  },
  {
    id:"sl-bh-lob",name:"Slice: BH Slice Lob",cat:"Skill Focus",diff:"Intermediate",skill:"Slice",
    desc:"Backhand slice lob mechanics and shape.",
    tips:["Stable wrist","High arc","Recover to middle"],
    youtubeId:"Y8-_g03MEVs",youtubeStart:214,youtubeEnd:249,courtType:"singles",
    players:[{id:"A",x:28,y:85,color:BH.shotBlue}],
    steps:[
      {t:"move",f:[28,85],to:[28,85],c:BH.shotBlue,note:"Chip forward + up"},
      {t:"hit",f:[28,85],to:[72,15],c:BH.shotBlue,n:"1",shot:"slice_bh",hitter:"A",note:"Lift with open face"},
      {t:"move",f:[28,85],to:[28,85],c:BH.shotBlue,note:"Aim over BH shoulder"}
    ]
  },
  {
    id:"sl-stance",name:"Slice: Stance & Setup",cat:"Skill Focus",diff:"Beginner",skill:"Slice",
    desc:"Use the right stance to control slice height and depth.",
    tips:["Side-on stance","Stay low","Finish forward"],
    youtubeId:"Y8-_g03MEVs",youtubeStart:244,youtubeEnd:281,courtType:"singles",
    players:[{id:"A",x:28,y:85,color:BH.shotBlue}],
    steps:[
      {t:"move",f:[28,85],to:[28,85],c:BH.shotBlue,note:"Side-on stance"},
      {t:"hit",f:[28,85],to:[72,15],c:BH.shotBlue,n:"1",shot:"slice_bh",hitter:"A",note:"Forward + up swing"},
      {t:"move",f:[28,85],to:[28,85],c:BH.shotBlue,note:"Finish high"}
    ]
  },
  {
    id:"lob-fh-topspin",name:"Lobs: Forehand Topspin",cat:"Skill Focus",diff:"Intermediate",skill:"Lobs",
    desc:"Lift the forehand topspin lob for defense and reset.",
    tips:["Brush up","Aim high","Recover quickly"],
    youtubeId:"4ybMXpEr5hg",youtubeStart:34,youtubeEnd:236,courtType:"singles",
    players:[{id:"A",x:50,y:85,color:BH.shotBlue}],
    steps:[
      {t:"move",f:[50,85],to:[50,85],c:BH.shotBlue,note:"Disguise like pass"},
      {t:"hit",f:[50,85],to:[50,10],c:BH.shotBlue,n:"1",shot:"forehand",hitter:"A",note:"Brush straight up"},
      {t:"move",f:[50,85],to:[50,85],c:BH.shotBlue,note:"Snap wrist upward"}
    ]
  },
  {
    id:"lob-one-hand",name:"Lobs: One-Handed",cat:"Skill Focus",diff:"Intermediate",skill:"Lobs",
    desc:"One-handed topspin lob technique.",
    tips:["High finish","Use legs","Keep balance"],
    youtubeId:"4ybMXpEr5hg",youtubeStart:236,youtubeEnd:382,courtType:"singles",
    players:[{id:"A",x:28,y:85,color:BH.shotBlue}],
    steps:[
      {t:"move",f:[28,85],to:[28,85],c:BH.shotBlue,note:"Drop racket low"},
      {t:"hit",f:[28,85],to:[50,10],c:BH.shotBlue,n:"1",shot:"forehand",hitter:"A",note:"Flick up to sky"},
      {t:"move",f:[28,85],to:[28,85],c:BH.shotBlue,note:"Finish high, balanced"}
    ]
  },
  {
    id:"lob-two-hand",name:"Lobs: Two-Handed",cat:"Skill Focus",diff:"Intermediate",skill:"Lobs",
    desc:"Two-handed topspin lob technique.",
    tips:["Drive up","Aim deep","Recover fast"],
    youtubeId:"4ybMXpEr5hg",youtubeStart:382,youtubeEnd:432,courtType:"singles",
    players:[{id:"A",x:28,y:85,color:BH.shotBlue}],
    steps:[
      {t:"move",f:[28,85],to:[28,85],c:BH.shotBlue,note:"Load legs + left hand"},
      {t:"hit",f:[28,85],to:[50,10],c:BH.shotBlue,n:"1",shot:"backhand",hitter:"A",note:"Scoop up with non-dom"},
      {t:"move",f:[28,85],to:[28,85],c:BH.shotBlue,note:"Recover quickly"}
    ]
  }
];
const DRILL_CATS=["All",...Array.from(new Set(DRILLS.map(d=>d.cat)))];
const DRILL_SKILLS=["All",...Array.from(new Set(DRILLS.map(d=>d.skill).filter(Boolean)))];
