const BH = {
  navy:"#1B365D",navyLight:"#2C5282",navyDark:"#0F1F38",
  gold:"#C9A227",goldLight:"#D4B94E",goldDim:"#A8892A",
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
  {id:"russian-twist",name:"Russian Twists",cat:"Core",desc:"Seated twists with med ball. Feet off ground, rotate fully side to side.",reps:"20 reps",equip:"Med Ball 8-12lb"},
  {id:"plank",name:"Plank Hold",cat:"Core",desc:"Forearm plank, tight core, hips level. Don't let hips sag.",reps:"45 sec",equip:"None"},
  {id:"bicycle",name:"Bicycle Crunches",cat:"Core",desc:"Alternating elbow-to-knee crunches. Controlled, no yanking the neck.",reps:"20 each",equip:"None"},
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
    id:"cc-fh",name:"Crosscourt Forehand",cat:"Groundstrokes",diff:"Beginner",
    desc:"Rally crosscourt FH from deuce side. Both players start on the deuce (right) side of the baseline. Hit forehands diagonally crosscourt to each other, aiming deep into the service box corner. Focus on consistent topspin, high net clearance, and recovering to center after each shot.",
    tips:["Keep a high net clearance — aim 3-5 feet over the net","Follow through across your body for natural topspin","Small split step between shots to stay balanced","Turn sideways before contact and rotate through the core","Use targets or cones in the crosscourt zone to build accuracy"],
    youtubeId:"UwIPqGkQO80",youtubeStart:80,youtubeEnd:150,courtType:"singles",
    players:[{id:"A",x:72,y:92,color:BH.shotBlue},{id:"B",x:28,y:8,color:BH.shotRed}],
    steps:[
      {t:"hit",f:[72,92],to:[28,8],c:BH.shotBlue,n:"1",shot:"forehand",hitter:"A"},
      {t:"move",f:[72,92],to:[50,80],c:BH.shotBlue},
      {t:"hit",f:[28,8],to:[72,8],c:BH.shotRed,n:"2",shot:"forehand",hitter:"B"},
      {t:"move",f:[28,8],to:[50,20],c:BH.shotRed},
      {t:"hit",f:[50,80],to:[28,8],c:BH.shotBlue,n:"3",shot:"forehand",hitter:"A"}
    ]
  },
  {
    id:"cc-bh",name:"Crosscourt Backhand",cat:"Groundstrokes",diff:"Beginner",
    desc:"Rally crosscourt BH from ad side",
    tips:["Rotate shoulders fully","Let the racquet do the work","Stay on the balls of your feet"],
    youtubeId:null,courtType:"singles",
    players:[{id:"A",x:28,y:92,color:BH.shotBlue},{id:"B",x:72,y:8,color:BH.shotRed}],
    steps:[
      {t:"hit",f:[28,92],to:[72,8],c:BH.shotBlue,n:"1",shot:"backhand",hitter:"A"},
      {t:"move",f:[28,92],to:[50,80],c:BH.shotBlue},
      {t:"hit",f:[72,8],to:[28,8],c:BH.shotRed,n:"2",shot:"backhand",hitter:"B"},
      {t:"move",f:[72,8],to:[50,20],c:BH.shotRed},
      {t:"hit",f:[50,80],to:[72,8],c:BH.shotBlue,n:"3",shot:"backhand",hitter:"A"}
    ]
  },
  {
    id:"dtl-fh",name:"Down the Line Forehand",cat:"Groundstrokes",diff:"Intermediate",
    desc:"DTL forehands from deuce",
    tips:["Hit up the line, not across","Adjust your court position","Trust your footwork"],
    youtubeId:null,courtType:"singles",
    players:[{id:"A",x:72,y:92,color:BH.shotBlue},{id:"B",x:72,y:8,color:BH.shotRed}],
    steps:[
      {t:"hit",f:[72,92],to:[72,8],c:BH.shotBlue,n:"1",shot:"forehand",hitter:"A"},
      {t:"move",f:[72,92],to:[50,80],c:BH.shotBlue},
      {t:"hit",f:[72,8],to:[72,8],c:BH.shotRed,n:"2",shot:"forehand",hitter:"B"},
      {t:"move",f:[72,8],to:[50,20],c:BH.shotRed}
    ]
  },
  {
    id:"dtl-bh",name:"Down the Line Backhand",cat:"Groundstrokes",diff:"Intermediate",
    desc:"DTL backhands from ad",
    tips:["Keep your wrist firm","Follow the line through","Explosive start and recovery"],
    youtubeId:null,courtType:"singles",
    players:[{id:"A",x:28,y:92,color:BH.shotBlue},{id:"B",x:28,y:8,color:BH.shotRed}],
    steps:[
      {t:"hit",f:[28,92],to:[28,8],c:BH.shotBlue,n:"1",shot:"backhand",hitter:"A"},
      {t:"move",f:[28,92],to:[50,80],c:BH.shotBlue},
      {t:"hit",f:[28,8],to:[28,8],c:BH.shotRed,n:"2",shot:"backhand",hitter:"B"}
    ]
  },
  {
    id:"io-fh",name:"Inside-Out Forehand",cat:"Groundstrokes",diff:"Advanced",
    desc:"Run around BH to hit IO FH",
    tips:["Read the incoming ball early","Take a big first step","Finish with a strong FH"],
    youtubeId:null,courtType:"singles",
    players:[{id:"A",x:50,y:90,color:BH.shotBlue},{id:"B",x:72,y:8,color:BH.shotRed}],
    steps:[
      {t:"hit",f:[72,8],to:[28,82],c:BH.shotRed,n:"1",shot:"forehand",hitter:"B",note:"To BH side"},
      {t:"move",f:[50,90],to:[35,85],c:BH.shotBlue,note:"Run around"},
      {t:"hit",f:[35,85],to:[72,8],c:BH.shotBlue,n:"2",shot:"forehand",hitter:"A",note:"Inside-out FH!"},
      {t:"move",f:[35,85],to:[50,80],c:BH.shotBlue}
    ]
  },
  {
    id:"fig8",name:"Figure 8 Rally",cat:"Groundstrokes",diff:"Advanced",
    desc:"Alternate crosscourt and DTL",
    tips:["Stay ready between shots","Vary your court position","Mix speeds and spins"],
    youtubeId:null,courtType:"singles",
    players:[{id:"A",x:50,y:90,color:BH.shotBlue},{id:"B",x:50,y:10,color:BH.shotRed}],
    steps:[
      {t:"hit",f:[50,90],to:[72,8],c:BH.shotBlue,n:"1",shot:"forehand",hitter:"A",note:"Crosscourt"},
      {t:"hit",f:[50,10],to:[28,8],c:BH.shotRed,n:"2",shot:"backhand",hitter:"B",note:"DTL"},
      {t:"move",f:[50,90],to:[28,85],c:BH.shotBlue},
      {t:"hit",f:[28,85],to:[72,8],c:BH.shotBlue,n:"3",shot:"backhand",hitter:"A",note:"Crosscourt"},
      {t:"hit",f:[28,8],to:[28,8],c:BH.shotRed,n:"4",shot:"forehand",hitter:"B",note:"DTL"}
    ]
  },
  {
    id:"sv-wide-d",name:"Serve Wide Deuce",cat:"Serve & Return",diff:"Intermediate",
    desc:"Wide serve + first ball attack",
    tips:["Kick it out wide","Close to net quickly","Attack the open court"],
    youtubeId:null,courtType:"singles",
    players:[{id:"S",x:55,y:98,color:BH.shotBlue},{id:"R",x:50,y:5,color:BH.shotRed}],
    steps:[
      {t:"hit",f:[55,98],to:[72,20],c:BH.shotBlue,n:"1",shot:"serve",hitter:"S",note:"Wide"},
      {t:"move",f:[50,5],to:[72,20],c:BH.shotRed,note:"Pushed wide"},
      {t:"hit",f:[72,20],to:[50,45],c:BH.shotRed,n:"2",shot:"forehand",hitter:"R"},
      {t:"move",f:[55,98],to:[50,65],c:BH.shotBlue,note:"Approach"},
      {t:"hit",f:[50,65],to:[28,8],c:BH.shotBlue,n:"3",shot:"forehand",hitter:"S",note:"Attack open court"}
    ]
  },
  {
    id:"sv-t-d",name:"Serve T Deuce",cat:"Serve & Return",diff:"Intermediate",
    desc:"T serve + first ball",
    tips:["Precision over speed","Play the percentages","First ball dictates point"],
    youtubeId:null,courtType:"singles",
    players:[{id:"S",x:55,y:98,color:BH.shotBlue},{id:"R",x:50,y:5,color:BH.shotRed}],
    steps:[
      {t:"hit",f:[55,98],to:[50,25],c:BH.shotBlue,n:"1",shot:"serve",hitter:"S",note:"To T"},
      {t:"move",f:[50,5],to:[50,25],c:BH.shotRed,note:"Jammed"},
      {t:"hit",f:[50,25],to:[72,45],c:BH.shotRed,n:"2",shot:"forehand",hitter:"R"},
      {t:"move",f:[55,98],to:[50,65],c:BH.shotBlue,note:"In"},
      {t:"hit",f:[50,65],to:[28,8],c:BH.shotBlue,n:"3",shot:"forehand",hitter:"S"}
    ]
  },
  {
    id:"sv-wide-a",name:"Serve Wide Ad",cat:"Serve & Return",diff:"Intermediate",
    desc:"Wide serve to ad court",
    tips:["Different angle for ad court","Follow your serve","Exploit the open court"],
    youtubeId:null,courtType:"singles",
    players:[{id:"S",x:45,y:98,color:BH.shotBlue},{id:"R",x:50,y:5,color:BH.shotRed}],
    steps:[
      {t:"hit",f:[45,98],to:[28,20],c:BH.shotBlue,n:"1",shot:"serve",hitter:"S",note:"Wide ad"},
      {t:"move",f:[50,5],to:[28,20],c:BH.shotRed,note:"Pushed wide"},
      {t:"hit",f:[28,20],to:[50,45],c:BH.shotRed,n:"2",shot:"backhand",hitter:"R"},
      {t:"move",f:[45,98],to:[50,65],c:BH.shotBlue,note:"In"},
      {t:"hit",f:[50,65],to:[72,8],c:BH.shotBlue,n:"3",shot:"forehand",hitter:"S",note:"Open court"}
    ]
  },
  {
    id:"sv-kick",name:"Kick Serve + Approach",cat:"Serve & Return",diff:"Advanced",
    desc:"Kick serve and follow to net",
    tips:["Use kick to control returner","Attack with authority","Commit to the net"],
    youtubeId:null,courtType:"singles",
    players:[{id:"S",x:55,y:98,color:BH.shotBlue},{id:"R",x:50,y:5,color:BH.shotRed}],
    steps:[
      {t:"hit",f:[55,98],to:[50,28],c:BH.shotBlue,n:"1",shot:"serve",hitter:"S",note:"Kick"},
      {t:"move",f:[55,98],to:[50,60],c:BH.shotBlue,note:"Approach"},
      {t:"hit",f:[50,5],to:[50,60],c:BH.shotRed,n:"2",shot:"forehand",hitter:"R"},
      {t:"hit",f:[50,60],to:[60,35],c:BH.shotBlue,n:"3",shot:"fh_volley",hitter:"S"}
    ]
  },
  {
    id:"ret-cc",name:"Return Crosscourt",cat:"Serve & Return",diff:"Beginner",
    desc:"Practice CC returns",
    tips:["Early racquet prep","Step into it","Consistent depth"],
    youtubeId:null,courtType:"singles",
    players:[{id:"S",x:55,y:98,color:BH.shotBlue},{id:"R",x:72,y:5,color:BH.shotRed}],
    steps:[
      {t:"hit",f:[55,98],to:[50,20],c:BH.shotBlue,n:"1",shot:"serve",hitter:"S"},
      {t:"hit",f:[72,5],to:[50,45],c:BH.shotRed,n:"2",shot:"forehand",hitter:"R",note:"CC return"},
      {t:"move",f:[55,98],to:[50,65],c:BH.shotBlue},
      {t:"hit",f:[50,65],to:[72,8],c:BH.shotBlue,n:"3",shot:"forehand",hitter:"S"},
      {t:"move",f:[50,45],to:[50,25],c:BH.shotRed}
    ]
  },
  {
    id:"app-fh",name:"Approach FH + Volley",cat:"Net Play",diff:"Intermediate",
    desc:"FH approach DTL, close, volley CC",
    tips:["Take the ball on the rise","Move your feet to net","Angle the volley"],
    youtubeId:null,courtType:"singles",
    players:[{id:"A",x:50,y:85,color:BH.shotBlue},{id:"B",x:50,y:8,color:BH.shotRed}],
    steps:[
      {t:"hit",f:[50,8],to:[50,65],c:BH.shotRed,n:"1",shot:"forehand",hitter:"B",note:"Short ball"},
      {t:"move",f:[50,85],to:[50,65],c:BH.shotBlue,note:"Move in"},
      {t:"hit",f:[50,65],to:[72,28],c:BH.shotBlue,n:"2",shot:"forehand",hitter:"A",note:"Approach DTL"},
      {t:"move",f:[50,65],to:[50,55],c:BH.shotBlue,note:"Close to net"},
      {t:"hit",f:[50,65],to:[50,55],c:BH.shotRed,n:"3",shot:"forehand",hitter:"B",note:"Pass attempt"},
      {t:"hit",f:[50,55],to:[28,28],c:BH.shotBlue,n:"4",shot:"fh_volley",hitter:"A",note:"Volley CC"}
    ]
  },
  {
    id:"app-bh",name:"Approach BH + Volley",cat:"Net Play",diff:"Intermediate",
    desc:"BH approach DTL, close, volley",
    tips:["Approach at an angle","Get sideways on the volley","Use your legs"],
    youtubeId:null,courtType:"singles",
    players:[{id:"A",x:50,y:85,color:BH.shotBlue},{id:"B",x:50,y:8,color:BH.shotRed}],
    steps:[
      {t:"hit",f:[50,8],to:[28,68],c:BH.shotRed,n:"1",shot:"forehand",hitter:"B",note:"To BH side"},
      {t:"move",f:[50,85],to:[28,68],c:BH.shotBlue,note:"Move in"},
      {t:"hit",f:[28,68],to:[28,28],c:BH.shotBlue,n:"2",shot:"backhand",hitter:"A",note:"Approach DTL"},
      {t:"move",f:[28,68],to:[50,55],c:BH.shotBlue,note:"Close to net"},
      {t:"hit",f:[28,28],to:[50,55],c:BH.shotRed,n:"3",shot:"forehand",hitter:"B",note:"Pass"},
      {t:"hit",f:[50,55],to:[72,28],c:BH.shotBlue,n:"4",shot:"bh_volley",hitter:"A",note:"Volley"}
    ]
  },
  {
    id:"vol-vol",name:"Volley-to-Volley",cat:"Net Play",diff:"Intermediate",
    desc:"Close range volley exchange",
    tips:["Quick reactions","Short backswing","Control and placement"],
    youtubeId:null,courtType:"singles",
    players:[{id:"A",x:40,y:62,color:BH.shotBlue},{id:"B",x:60,y:38,color:BH.shotRed}],
    steps:[
      {t:"hit",f:[40,62],to:[60,38],c:BH.shotBlue,n:"1",shot:"fh_volley",hitter:"A"},
      {t:"hit",f:[60,38],to:[40,62],c:BH.shotRed,n:"2",shot:"bh_volley",hitter:"B"},
      {t:"hit",f:[40,62],to:[60,38],c:BH.shotBlue,n:"3",shot:"bh_volley",hitter:"A"},
      {t:"hit",f:[60,38],to:[40,62],c:BH.shotRed,n:"4",shot:"fh_volley",hitter:"B"}
    ]
  },
  {
    id:"oh-drill",name:"Overhead + Recovery",cat:"Net Play",diff:"Advanced",
    desc:"Lob defense with overhead",
    tips:["Turn sideways for the lob","Use explosive leg drive","Follow your shot back"],
    youtubeId:null,courtType:"singles",
    players:[{id:"A",x:50,y:58,color:BH.shotBlue},{id:"B",x:50,y:8,color:BH.shotRed}],
    steps:[
      {t:"hit",f:[50,8],to:[50,28],c:BH.shotRed,n:"1",shot:"forehand",hitter:"B",note:"Lob"},
      {t:"move",f:[50,58],to:[50,35],c:BH.shotBlue,note:"Back for lob"},
      {t:"hit",f:[50,35],to:[50,8],c:BH.shotBlue,n:"2",shot:"overhead",hitter:"A"},
      {t:"move",f:[50,35],to:[50,55],c:BH.shotBlue,note:"Back to net"},
      {t:"hit",f:[50,8],to:[50,35],c:BH.shotRed,n:"3",shot:"forehand",hitter:"B",note:"Another lob"},
      {t:"hit",f:[50,55],to:[50,8],c:BH.shotBlue,n:"4",shot:"overhead",hitter:"A"}
    ]
  },
  {
    id:"drop-vol",name:"Drop Volley Touch",cat:"Net Play",diff:"Advanced",
    desc:"Soft drop volley from net",
    tips:["Shorten your stroke","Soft hands","Draw the opponent in"],
    youtubeId:null,courtType:"singles",
    players:[{id:"A",x:50,y:56,color:BH.shotBlue},{id:"B",x:50,y:92,color:BH.shotRed}],
    steps:[
      {t:"hit",f:[50,92],to:[50,56],c:BH.shotRed,n:"1",shot:"forehand",hitter:"B",note:"Drive"},
      {t:"hit",f:[50,56],to:[50,75],c:BH.shotBlue,n:"2",shot:"fh_volley",hitter:"A",note:"Drop volley"},
      {t:"move",f:[50,92],to:[50,75],c:BH.shotRed,note:"Run in"},
      {t:"hit",f:[50,75],to:[50,62],c:BH.shotRed,n:"3",shot:"forehand",hitter:"B",note:"Short"},
      {t:"hit",f:[50,75],to:[50,70],c:BH.shotBlue,n:"4",shot:"fh_volley",hitter:"A",note:"Another drop"}
    ]
  },
  {
    id:"sv-io",name:"Serve + Inside-Out FH",cat:"Patterns",diff:"Advanced",
    desc:"Serve then run around for IO FH",
    tips:["Set up with wide serve","Take big first step","Trust your FH"],
    youtubeId:null,courtType:"singles",
    players:[{id:"S",x:55,y:98,color:BH.shotBlue},{id:"R",x:50,y:5,color:BH.shotRed}],
    steps:[
      {t:"hit",f:[55,98],to:[72,22],c:BH.shotBlue,n:"1",shot:"serve",hitter:"S",note:"Wide"},
      {t:"hit",f:[50,5],to:[50,48],c:BH.shotRed,n:"2",shot:"forehand",hitter:"R",note:"Return CC/BH side"},
      {t:"move",f:[55,98],to:[35,72],c:BH.shotBlue,note:"Run around BH"},
      {t:"hit",f:[35,72],to:[72,8],c:BH.shotBlue,n:"3",shot:"forehand",hitter:"S",note:"Inside-out!"}
    ]
  },
  {
    id:"cc-atk",name:"Rally Cross → Attack DTL",cat:"Patterns",diff:"Intermediate",
    desc:"Build rally CC then attack DTL",
    tips:["Patience then aggression","Set up your attack","Finish the point"],
    youtubeId:null,courtType:"singles",
    players:[{id:"A",x:72,y:90,color:BH.shotBlue},{id:"B",x:28,y:10,color:BH.shotRed}],
    steps:[
      {t:"hit",f:[72,90],to:[28,8],c:BH.shotBlue,n:"1",shot:"forehand",hitter:"A",note:"CC"},
      {t:"hit",f:[28,10],to:[72,8],c:BH.shotRed,n:"2",shot:"forehand",hitter:"B",note:"CC"},
      {t:"hit",f:[72,90],to:[28,8],c:BH.shotBlue,n:"3",shot:"forehand",hitter:"A",note:"CC heavy"},
      {t:"hit",f:[28,10],to:[50,45],c:BH.shotRed,n:"4",shot:"forehand",hitter:"B",note:"Floats short"},
      {t:"hit",f:[72,90],to:[72,8],c:BH.shotBlue,n:"5",shot:"forehand",hitter:"A",note:"Attack DTL!"}
    ]
  },
  {
    id:"def-off",name:"Defense to Offense",cat:"Patterns",diff:"Advanced",
    desc:"Pushed wide, recover, counterattack",
    tips:["Defensive positioning","Load up on recovery","Strike when ready"],
    youtubeId:null,courtType:"singles",
    players:[{id:"A",x:50,y:90,color:BH.shotBlue},{id:"B",x:50,y:10,color:BH.shotRed}],
    steps:[
      {t:"hit",f:[50,10],to:[72,80],c:BH.shotRed,n:"1",shot:"forehand",hitter:"B",note:"Push wide"},
      {t:"hit",f:[50,90],to:[50,45],c:BH.shotBlue,n:"2",shot:"slice_fh",hitter:"A",note:"Defensive CC"},
      {t:"hit",f:[72,80],to:[50,55],c:BH.shotRed,n:"3",shot:"forehand",hitter:"B",note:"To center"},
      {t:"move",f:[50,90],to:[35,85],c:BH.shotBlue,note:"Load"},
      {t:"hit",f:[35,85],to:[28,8],c:BH.shotBlue,n:"4",shot:"backhand",hitter:"A",note:"Counterattack DTL"}
    ]
  },
  {
    id:"two-ball",name:"Two-Ball Attack",cat:"Patterns",diff:"Intermediate",
    desc:"Hit approach + pass then volley",
    tips:["First shot decisive","Move forward on second","Volley for winner"],
    youtubeId:null,courtType:"singles",
    players:[{id:"A",x:50,y:80,color:BH.shotBlue},{id:"B",x:50,y:15,color:BH.shotRed}],
    steps:[
      {t:"hit",f:[50,15],to:[50,65],c:BH.shotRed,n:"1",shot:"forehand",hitter:"B",note:"Short feed"},
      {t:"hit",f:[50,80],to:[72,35],c:BH.shotBlue,n:"2",shot:"forehand",hitter:"A",note:"Approach"},
      {t:"move",f:[50,80],to:[50,55],c:BH.shotBlue,note:"To net"},
      {t:"hit",f:[50,65],to:[50,55],c:BH.shotRed,n:"3",shot:"forehand",hitter:"B",note:"Pass try"},
      {t:"hit",f:[50,55],to:[28,28],c:BH.shotBlue,n:"4",shot:"fh_volley",hitter:"A",note:"Volley winner"}
    ]
  },
  {
    id:"dbl-poach",name:"Doubles Poach",cat:"Doubles",diff:"Intermediate",
    desc:"Net player reads and poaches",
    tips:["Read the rally","Time the intercept","Put away the volley"],
    youtubeId:null,courtType:"doubles",
    players:[{id:"A1",x:72,y:90,color:BH.shotBlue},{id:"A2",x:32,y:58,color:BH.shotBlue},{id:"B1",x:28,y:10,color:BH.shotRed},{id:"B2",x:68,y:42,color:BH.shotRed}],
    steps:[
      {t:"hit",f:[72,90],to:[28,8],c:BH.shotBlue,n:"1",shot:"forehand",hitter:"A1",note:"CC"},
      {t:"hit",f:[28,10],to:[72,8],c:BH.shotRed,n:"2",shot:"forehand",hitter:"B1",note:"CC"},
      {t:"move",f:[32,58],to:[50,58],c:BH.shotBlue,note:"Poach read"},
      {t:"hit",f:[28,10],to:[50,58],c:BH.shotRed,n:"3",shot:"forehand",hitter:"B1",note:"To center"},
      {t:"hit",f:[50,58],to:[28,28],c:BH.shotBlue,n:"4",shot:"fh_volley",hitter:"A2",note:"Poach volley"}
    ]
  },
  {
    id:"dbl-sv",name:"Doubles S&V",cat:"Doubles",diff:"Intermediate",
    desc:"Serve and both close to net",
    tips:["Aggressive serving position","Net player supports","Quick first volley"],
    youtubeId:null,courtType:"doubles",
    players:[{id:"S",x:58,y:98,color:BH.shotBlue},{id:"N1",x:28,y:56,color:BH.shotBlue},{id:"R",x:28,y:5,color:BH.shotRed},{id:"N2",x:72,y:44,color:BH.shotRed}],
    steps:[
      {t:"hit",f:[58,98],to:[50,22],c:BH.shotBlue,n:"1",shot:"serve",hitter:"S",note:"Wide"},
      {t:"move",f:[58,98],to:[50,60],c:BH.shotBlue,note:"Approach"},
      {t:"hit",f:[28,5],to:[50,50],c:BH.shotRed,n:"2",shot:"backhand",hitter:"R",note:"Return"},
      {t:"hit",f:[50,60],to:[50,35],c:BH.shotBlue,n:"3",shot:"fh_volley",hitter:"S",note:"Deep volley"},
      {t:"move",f:[50,60],to:[50,55],c:BH.shotBlue,note:"Closer"}
    ]
  },
  {
    id:"dbl-ifm",name:"I-Formation",cat:"Doubles",diff:"Advanced",
    desc:"I-formation serve with signal plays",
    tips:["Communicate the play","Execute the movement","Finish at net"],
    youtubeId:null,courtType:"doubles",
    players:[{id:"S",x:50,y:98,color:BH.shotBlue},{id:"N",x:50,y:56,color:BH.shotBlue},{id:"R",x:28,y:5,color:BH.shotRed},{id:"R2",x:72,y:44,color:BH.shotRed}],
    steps:[
      {t:"hit",f:[50,98],to:[72,20],c:BH.shotBlue,n:"1",shot:"serve",hitter:"S",note:"Wide"},
      {t:"move",f:[50,56],to:[72,56],c:BH.shotBlue,note:"Move to deuce"},
      {t:"hit",f:[28,5],to:[50,45],c:BH.shotRed,n:"2",shot:"forehand",hitter:"R",note:"Return CC"},
      {t:"hit",f:[72,56],to:[50,45],c:BH.shotBlue,n:"3",shot:"fh_volley",hitter:"N",note:"Intercept volley"}
    ]
  },
  {
    id:"dbl-lob",name:"Lob Defense",cat:"Doubles",diff:"Intermediate",
    desc:"Handle lob over net player",
    tips:["Communicate switch","Track the ball","Explosive recovery"],
    youtubeId:null,courtType:"doubles",
    players:[{id:"A1",x:65,y:58,color:BH.shotBlue},{id:"A2",x:35,y:90,color:BH.shotBlue},{id:"B1",x:35,y:42,color:BH.shotRed},{id:"B2",x:65,y:10,color:BH.shotRed}],
    steps:[
      {t:"hit",f:[35,42],to:[50,35],c:BH.shotRed,n:"1",shot:"forehand",hitter:"B1",note:"Lob over A1"},
      {t:"move",f:[65,58],to:[50,42],c:BH.shotBlue,note:"Track"},
      {t:"move",f:[35,90],to:[50,60],c:BH.shotBlue,note:"Switch"},
      {t:"hit",f:[50,60],to:[50,8],c:BH.shotBlue,n:"2",shot:"overhead",hitter:"A2"}
    ]
  }
];
const DRILL_CATS=["All","Groundstrokes","Serve & Return","Net Play","Patterns","Doubles"];
