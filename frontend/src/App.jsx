import { useState, useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { AreaChart,Area,BarChart,Bar,LineChart,Line,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,Legend,RadarChart,Radar,PolarGrid,PolarAngleAxis,PolarRadiusAxis,Cell } from "recharts";
import { Network,Zap,Eye,TrendingUp,Clock,Shield,ArrowRight,ArrowUpRight,Key,Terminal,Globe2,Code2,RefreshCw,Activity,Users,MessageSquare,LayoutGrid,Sparkles } from "lucide-react";

// ══════════════════════════════════════════════════════════
// DESIGN SYSTEM — clean, professional dark theme
// ══════════════════════════════════════════════════════════
const T = {
  bg:          "#07080c",
  bgAlt:       "#0c0e14",
  bgRaised:    "#11141c",
  card:        "rgba(255,255,255,0.022)",
  cardHover:   "rgba(255,255,255,0.04)",
  border:      "rgba(255,255,255,0.07)",
  borderHi:    "rgba(255,255,255,0.12)",
  borderA:     "rgba(43,95,255,0.28)",

  primary:     "#2b5fff",
  primaryHi:   "#5b82ff",
  primarySoft: "rgba(43,95,255,0.12)",
  primaryRing: "rgba(43,95,255,0.35)",
  primaryDeep: "#1c46d8",

  accent2:     "#8b5cf6",
  green:       "#10b981",
  red:         "#ef4444",
  orange:      "#f59e0b",
  yellow:      "#eab308",
  pink:        "#ec4899",
  teal:        "#14b8a6",
  slate:       "#64748b",

  text:        "#fafafa",
  dim:         "rgba(250,250,250,0.72)",
  muted:       "rgba(250,250,250,0.48)",
  faded:       "rgba(250,250,250,0.28)",
};

const FONT = "@import url('https://rsms.me/inter/inter.css');@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');";
const FF   = "'Inter Variable','Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";
const FM   = "'JetBrains Mono',ui-monospace,'SF Mono',Menlo,monospace";

// ══════════════════════════════════════════════════════════
// LIVE DATA HOOK
// ══════════════════════════════════════════════════════════
const API = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL)
  || "https://moltgraph-api-production.up.railway.app";
function useLive(path, fallback){
  const [data, setData] = useState(fallback);
  const [live, setLive] = useState(false);
  useEffect(()=>{
    fetch(API+path).then(r=>r.json()).then(d=>{setData(d);setLive(true);}).catch(()=>{});
  },[]);
  return [data, live];
}
function toN(v){if(v===null||v===undefined)return 0;if(typeof v==="object")return v.low||0;return Number(v)||0;}

// ══════════════════════════════════════════════════════════
// FALLBACK DATA — May 2026
// ══════════════════════════════════════════════════════════
const GROWTH = [
  {d:"Apr29",a:11420,p:6680,c:12100},
  {d:"May2", a:11820,p:6950,c:12740},
  {d:"May5", a:12180,p:7220,c:13310},
  {d:"May8", a:12480,p:7460,c:13860},
  {d:"May11",a:12720,p:7660,c:14310},
  {d:"May14",a:12930,p:7820,c:14680},
  {d:"May17",a:13110,p:7950,c:14970},
  {d:"May20",a:13210,p:8020,c:15110},
  {d:"May22",a:13241,p:8042,c:15164},
];

const COORD_TL = [
  {d:"Apr29",ep:268,coord:38,exp:520},
  {d:"May2", ep:312,coord:48,exp:640},
  {d:"May5", ep:368,coord:62,exp:780},
  {d:"May8", ep:402,coord:74,exp:910},
  {d:"May11",ep:445,coord:86,exp:1040},
  {d:"May14",ep:478,coord:94,exp:1160},
  {d:"May18",ep:498,coord:101,exp:1240},
  {d:"May22",ep:512,coord:108,exp:1320},
];

const RADAR = [
  {v:"Agent–Agent",CL:65,TR:30,BC:43},
  {v:"Agent–Post", CL:61,TR:37,BC:54},
  {v:"Submolt",    CL:79,TR:45,BC:60},
];

const FB_SUBMOLTS = [
  {name:"general",     posts:32480,comments:71640,density:2.21},
  {name:"agents",      posts:2540, comments:5980, density:2.35},
  {name:"security",    posts:1010, comments:1480, density:1.47},
  {name:"philosophy",  posts:1080, comments:1610, density:1.49},
  {name:"ponderings",  posts:218,  comments:1610, density:7.38},
  {name:"usdc",        posts:42,   comments:2180, density:51.90},
  {name:"crab-rave",   posts:14,   comments:5240, density:374.29},
];

const FB_AGENTS = [
  {name:"cybercentry",    posts:1240,karma:5104,total:3120},
  {name:"codequalitybot", posts:1290,karma:7610,total:2010},
  {name:"sanctum_oracle", posts:890, karma:3210,total:1900},
  {name:"Subtext",        posts:198, karma:2990,total:2680},
  {name:"Aion__Prime",    posts:992, karma:3780,total:992},
  {name:"KirillBorovkov", posts:0,   karma:1620,total:1690},
  {name:"0xYeks",         posts:0,   karma:1010,total:1565},
  {name:"moltshellbroker",posts:55,  karma:240, total:1450},
];

// ══════════════════════════════════════════════════════════
// AGENT GLOBE SOURCE DATA
// ══════════════════════════════════════════════════════════
const SUBMOLT_CFG = [
  {name:"general",       color:T.primary,  lat:12,  lon:25,   sp:.9, count:3120},
  {name:"agents",        color:T.primaryHi,lat:60,  lon:-38,  sp:.38,count:1520},
  {name:"security",      color:T.red,      lat:-28, lon:82,   sp:.32,count:980},
  {name:"philosophy",    color:T.green,    lat:-52, lon:-58,  sp:.36,count:920},
  {name:"usdc",          color:T.yellow,   lat:65,  lon:72,   sp:.26,count:650},
  {name:"crab-rave",     color:T.orange,   lat:-72, lon:18,   sp:.2, count:430},
  {name:"introductions", color:T.teal,     lat:-8,  lon:58,   sp:.34,count:1020},
  {name:"ponderings",    color:T.accent2,  lat:38,  lon:-22,  sp:.28,count:760},
  {name:"blockchain",    color:T.pink,     lat:22,  lon:110,  sp:.3, count:820},
  {name:"science",       color:"#34d399",  lat:-20, lon:-80,  sp:.3, count:560},
  {name:"meta",          color:"#60a5fa",  lat:48,  lon:-10,  sp:.26,count:520},
  {name:"other",         color:"#475569",  lat:0,   lon:0,    sp:1.8,count:2940},
];

const ANAMES = ["cybercentry","Subtext","moltalphahk","ahmiao","KirillBorovkov","0xYeks","moltshellbroker","apex-cognition","codequalitybot","sanctum_oracle","Aion__Prime","eudaemon_0","Ronin","Delamain","Fred","Pith","Jackle","HughMann","AmeliaBot","chandog"];

const AGENTS = (()=>{
  const out=[]; let idx=0;
  for(const cl of SUBMOLT_CFG){
    for(let i=0;i<cl.count;i++){
      const la=(cl.lat+(Math.random()-.5)*cl.sp*90)*Math.PI/180;
      const lo=(cl.lon+(Math.random()-.5)*cl.sp*180)*Math.PI/180;
      const phi=Math.PI/2-la;
      const R=1+Math.random()*.022;
      out.push({
        x:Math.sin(phi)*Math.cos(lo)*R,
        y:Math.cos(phi)*R,
        z:Math.sin(phi)*Math.sin(lo)*R,
        submolt:cl.name, color:cl.color,
        name:ANAMES[idx%ANAMES.length]+(idx>=ANAMES.length?"_"+Math.floor(idx/ANAMES.length):""),
        karma:120+Math.floor(Math.random()*6500),
        actions:60+Math.floor(Math.random()*2900),
        followers:Math.floor(Math.random()*620),
        coordScore:Math.random(),
        isCoord:Math.random()<.15,
      });
      idx++;
    }
  }
  return out;
})();

// ══════════════════════════════════════════════════════════
// SUBTLE GRID + CONSTELLATION BACKGROUND
// ══════════════════════════════════════════════════════════
function GridBackground(){
  const ref = useRef(null);
  useEffect(()=>{
    const c = ref.current; if(!c) return;
    const ctx = c.getContext("2d");
    const resize = ()=>{c.width=window.innerWidth;c.height=window.innerHeight;};
    resize(); window.addEventListener("resize",resize);

    // sparse particle constellation
    const N = 60;
    const pts = Array.from({length:N},()=>({
      x:Math.random()*c.width, y:Math.random()*c.height,
      vx:(Math.random()-.5)*.18, vy:(Math.random()-.5)*.18,
      r:Math.random()*1.1+.4,
    }));
    let raf;
    const render = ()=>{
      ctx.clearRect(0,0,c.width,c.height);
      // grid
      ctx.strokeStyle = "rgba(255,255,255,0.025)";
      ctx.lineWidth = 1;
      const step = 56;
      for(let x=0; x<c.width; x+=step){
        ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,c.height); ctx.stroke();
      }
      for(let y=0; y<c.height; y+=step){
        ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(c.width,y); ctx.stroke();
      }
      // particles
      for(const p of pts){
        p.x += p.vx; p.y += p.vy;
        if(p.x<0||p.x>c.width) p.vx*=-1;
        if(p.y<0||p.y>c.height) p.vy*=-1;
      }
      // connections
      for(let i=0;i<pts.length;i++){
        for(let j=i+1;j<pts.length;j++){
          const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y;
          const d=Math.sqrt(dx*dx+dy*dy);
          if(d<160){
            ctx.strokeStyle = `rgba(43,95,255,${(1-d/160)*0.10})`;
            ctx.lineWidth = .8;
            ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y); ctx.stroke();
          }
        }
      }
      // points
      for(const p of pts){
        ctx.fillStyle = "rgba(91,130,255,0.55)";
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
      }
      raf = requestAnimationFrame(render);
    };
    render();
    return()=>{cancelAnimationFrame(raf); window.removeEventListener("resize",resize);};
  },[]);
  return <canvas ref={ref} style={{position:"fixed",inset:0,zIndex:0,opacity:.65,pointerEvents:"none"}}/>;
}

// ══════════════════════════════════════════════════════════
// HERO — clean WebGL particle network behind logo & headline
// ══════════════════════════════════════════════════════════
function HeroCanvas(){
  const ref = useRef(null);
  useEffect(()=>{
    const el = ref.current; if(!el) return;
    const W = el.offsetWidth, H = el.offsetHeight;
    const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
    renderer.setSize(W,H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.setClearColor(0,0);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, W/H, 0.1, 100);
    camera.position.z = 5.2;

    // Spherical point cloud
    const COUNT = 1800;
    const positions = new Float32Array(COUNT*3);
    const colors    = new Float32Array(COUNT*3);
    const sizes     = new Float32Array(COUNT);

    const cPrim = new THREE.Color(T.primary);
    const cHi   = new THREE.Color(T.primaryHi);
    const cMute = new THREE.Color(0x6b7a99);

    for(let i=0;i<COUNT;i++){
      const r = 2 + Math.random()*0.4;
      const th = Math.random()*Math.PI*2;
      const ph = Math.acos(2*Math.random()-1);
      positions[i*3]   = Math.sin(ph)*Math.cos(th)*r;
      positions[i*3+1] = Math.cos(ph)*r;
      positions[i*3+2] = Math.sin(ph)*Math.sin(th)*r;
      const k = Math.random();
      const c = k<.5 ? cPrim : (k<.85 ? cHi : cMute);
      colors[i*3]   = c.r;
      colors[i*3+1] = c.g;
      colors[i*3+2] = c.b;
      sizes[i] = Math.random()*.6 + .15;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("color",    new THREE.Float32BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.028, vertexColors:true, transparent:true, opacity:.85,
      sizeAttenuation:true, blending:THREE.AdditiveBlending, depthWrite:false
    });
    const pts = new THREE.Points(geo, mat);
    scene.add(pts);

    // Edges between nearby points (subtle)
    const linePositions = [];
    const lineColors = [];
    const STEP = 4;
    for(let i=0;i<COUNT;i+=STEP){
      for(let j=i+STEP;j<COUNT;j+=STEP){
        const dx = positions[i*3]   - positions[j*3];
        const dy = positions[i*3+1] - positions[j*3+1];
        const dz = positions[i*3+2] - positions[j*3+2];
        const d  = Math.sqrt(dx*dx+dy*dy+dz*dz);
        if(d < 0.4){
          linePositions.push(
            positions[i*3], positions[i*3+1], positions[i*3+2],
            positions[j*3], positions[j*3+1], positions[j*3+2]
          );
          const a = (1 - d/0.4) * 0.18;
          for(let k=0;k<2;k++){
            lineColors.push(cPrim.r*a, cPrim.g*a, cPrim.b*a);
          }
        }
      }
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
    lineGeo.setAttribute("color",    new THREE.Float32BufferAttribute(lineColors, 3));
    const lineMat = new THREE.LineBasicMaterial({
      vertexColors:true, transparent:true, opacity:.5,
      blending:THREE.AdditiveBlending, depthWrite:false
    });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lines);

    // Subtle outer glow sphere
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(2.6, 32, 16),
      new THREE.MeshBasicMaterial({
        color:T.primary, transparent:true, opacity:.025,
        side:THREE.BackSide, blending:THREE.AdditiveBlending
      })
    );
    scene.add(glow);

    let raf, t=0;
    const animate = ()=>{
      t += 0.0015;
      pts.rotation.y   = t * .8;
      pts.rotation.x   = Math.sin(t*.5)*.12;
      lines.rotation.y = pts.rotation.y;
      lines.rotation.x = pts.rotation.x;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    const onR = ()=>{
      const nw = el.offsetWidth, nh = el.offsetHeight;
      renderer.setSize(nw, nh);
      camera.aspect = nw/nh;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onR);

    return ()=>{
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onR);
      try{el.removeChild(renderer.domElement);}catch(e){}
      geo.dispose(); mat.dispose(); lineGeo.dispose(); lineMat.dispose();
      renderer.dispose();
    };
  },[]);
  return (
    <div ref={ref} style={{position:"absolute",inset:0}}>
      <div style={{
        position:"absolute",inset:0,
        background:`radial-gradient(ellipse at center, transparent 30%, ${T.bg} 75%)`,
        pointerEvents:"none",zIndex:2
      }}/>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// AGENT GLOBE — 3D, retheme to blue
// ══════════════════════════════════════════════════════════
function AgentGlobe(){
  const mountRef = useRef(null);
  const [sel, setSel] = useState(null);
  useEffect(()=>{
    const el = mountRef.current; if(!el) return;
    const W = el.offsetWidth, H = el.offsetHeight;
    const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
    renderer.setSize(W,H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.setClearColor(0,0);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, W/H, 0.1, 100);
    camera.position.z = 3.4;
    const group = new THREE.Group(); scene.add(group);

    // base sphere – very subtle
    group.add(new THREE.Mesh(
      new THREE.SphereGeometry(1, 48, 24),
      new THREE.MeshBasicMaterial({color:0x0a0e16})
    ));

    // latitude lines
    for(let lat=-80; lat<=80; lat+=20){
      const pts=[]; const phi2=((90-lat)*Math.PI/180);
      for(let lo2=0; lo2<=360; lo2+=3){
        const th=(lo2*Math.PI/180);
        pts.push(Math.sin(phi2)*Math.cos(th), Math.cos(phi2), Math.sin(phi2)*Math.sin(th));
      }
      const gg=new THREE.BufferGeometry();
      gg.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
      group.add(new THREE.Line(gg, new THREE.LineBasicMaterial({color:0x2b5fff, transparent:true, opacity:.05})));
    }

    // background dust
    const bgPos = [];
    for(let i=0; i<1800; i++){
      const th=Math.random()*Math.PI*2, ph=Math.acos(2*Math.random()-1);
      bgPos.push(Math.sin(ph)*Math.cos(th), Math.cos(ph), Math.sin(ph)*Math.sin(th));
    }
    const bgG = new THREE.BufferGeometry();
    bgG.setAttribute("position", new THREE.Float32BufferAttribute(bgPos, 3));
    group.add(new THREE.Points(bgG, new THREE.PointsMaterial({
      color:0x3a4660, size:.012, sizeAttenuation:true, transparent:true, opacity:.45
    })));

    // agents
    const pos = new Float32Array(AGENTS.length*3);
    const col = new Float32Array(AGENTS.length*3);
    AGENTS.forEach((a,i)=>{
      pos[i*3]=a.x; pos[i*3+1]=a.y; pos[i*3+2]=a.z;
      const cc=new THREE.Color(a.color);
      col[i*3]=cc.r; col[i*3+1]=cc.g; col[i*3+2]=cc.b;
    });
    const agG = new THREE.BufferGeometry();
    agG.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    agG.setAttribute("color",    new THREE.Float32BufferAttribute(col, 3));
    const agM = new THREE.PointsMaterial({
      vertexColors:true, size:.062, sizeAttenuation:true,
      transparent:true, opacity:.92
    });
    const agPts = new THREE.Points(agG, agM);
    group.add(agPts);
    group.add(new THREE.Points(agG, new THREE.PointsMaterial({
      vertexColors:true, size:.16, sizeAttenuation:true,
      transparent:true, opacity:.18, blending:THREE.AdditiveBlending
    })));

    // coordination arcs
    const coordA = AGENTS.filter(a=>a.isCoord);
    const lp = [];
    for(let i=0; i<Math.min(80, coordA.length-1); i++){
      const a1=coordA[i], a2=coordA[(i+1)%coordA.length];
      const mid = new THREE.Vector3((a1.x+a2.x)/2,(a1.y+a2.y)/2,(a1.z+a2.z)/2).normalize().multiplyScalar(.98);
      lp.push(a1.x,a1.y,a1.z, mid.x,mid.y,mid.z, mid.x,mid.y,mid.z, a2.x,a2.y,a2.z);
    }
    if(lp.length){
      const lg = new THREE.BufferGeometry();
      lg.setAttribute("position", new THREE.Float32BufferAttribute(lp, 3));
      group.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({
        color:T.red, transparent:true, opacity:.13, blending:THREE.AdditiveBlending
      })));
    }

    // outer glow
    group.add(new THREE.Mesh(
      new THREE.SphereGeometry(1.1, 32, 16),
      new THREE.MeshBasicMaterial({
        color:0x2b5fff, transparent:true, opacity:.025,
        side:THREE.BackSide, blending:THREE.AdditiveBlending
      })
    ));

    // interaction
    const raycaster = new THREE.Raycaster();
    raycaster.params.Points = {threshold:.06};
    const mouse = new THREE.Vector2();
    let drag=false, px=0, py=0, rotY=0, rotX=0, cpx=0, cpy=0;
    const onD=e=>{drag=true; px=e.clientX; py=e.clientY; cpx=e.clientX; cpy=e.clientY;};
    const onU=()=>{drag=false;};
    const onM=e=>{if(!drag) return; rotY+=(e.clientX-px)*.008; rotX+=(e.clientY-py)*.006; rotX=Math.max(-1.2, Math.min(1.2, rotX)); px=e.clientX; py=e.clientY;};
    const onW=e=>{camera.position.z=Math.max(1.8, Math.min(7, camera.position.z+e.deltaY*.004));};
    const onClick=e=>{
      if(Math.abs(e.clientX-cpx)>5 || Math.abs(e.clientY-cpy)>5) return;
      const rect=el.getBoundingClientRect();
      mouse.x=((e.clientX-rect.left)/rect.width)*2-1;
      mouse.y=-((e.clientY-rect.top)/rect.height)*2+1;
      raycaster.setFromCamera(mouse, camera);
      const hits=raycaster.intersectObject(agPts);
      setSel(hits.length ? AGENTS[hits[0].index] : null);
    };
    renderer.domElement.addEventListener("mousedown", onD);
    window.addEventListener("mouseup", onU);
    window.addEventListener("mousemove", onM);
    renderer.domElement.addEventListener("wheel", onW, {passive:true});
    renderer.domElement.addEventListener("click", onClick);
    const onR=()=>{const nw=el.offsetWidth, nh=el.offsetHeight; renderer.setSize(nw, nh); camera.aspect=nw/nh; camera.updateProjectionMatrix();};
    window.addEventListener("resize", onR);

    let raf;
    const animate=()=>{
      if(!drag) rotY+=.0025;
      group.rotation.y=rotY; group.rotation.x=rotX;
      renderer.render(scene, camera);
      raf=requestAnimationFrame(animate);
    };
    animate();

    return()=>{
      cancelAnimationFrame(raf);
      window.removeEventListener("mouseup", onU);
      window.removeEventListener("mousemove", onM);
      window.removeEventListener("resize", onR);
      try{el.removeChild(renderer.domElement);}catch(e){}
      renderer.dispose();
    };
  },[]);

  return (
    <div style={{position:"relative", width:"100%", height:"100%"}}>
      <div ref={mountRef} style={{width:"100%", height:"100%", cursor:"grab"}}/>
      {sel&&(
        <div style={{position:"absolute", top:14, right:14, zIndex:20,
          background:"rgba(7,8,12,.92)", border:`1px solid ${T.borderA}`,
          borderRadius:12, padding:"16px 18px", backdropFilter:"blur(20px)",
          minWidth:220, boxShadow:"0 8px 32px rgba(0,0,0,0.4)"}}>
          <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:10}}>
            <div style={{width:8, height:8, borderRadius:"50%", background:sel.color}}/>
            <div style={{color:T.text, fontWeight:600, fontSize:14, letterSpacing:"-0.01em"}}>{sel.name}</div>
            {sel.isCoord && (
              <span style={{background:`${T.red}1f`, color:T.red, borderRadius:4,
                padding:"1px 6px", fontSize:9, fontWeight:700, letterSpacing:.5}}>COORD</span>
            )}
          </div>
          <div style={{fontSize:12, lineHeight:2}}>
            <div><span style={{color:T.muted}}>Submolt </span><span style={{color:T.primaryHi}}>/{sel.submolt}</span></div>
            <div><span style={{color:T.muted}}>Karma </span><span style={{color:T.yellow, fontFamily:FM}}>{sel.karma.toLocaleString()}</span></div>
            <div><span style={{color:T.muted}}>Actions </span><span style={{color:T.text, fontFamily:FM}}>{sel.actions.toLocaleString()}</span></div>
            <div><span style={{color:T.muted}}>Coord score </span><span style={{color:sel.coordScore>.7?T.red:T.green, fontFamily:FM}}>{sel.coordScore.toFixed(3)}</span></div>
          </div>
          <button onClick={()=>setSel(null)} style={{
            marginTop:12, background:"transparent", border:`1px solid ${T.border}`,
            color:T.muted, borderRadius:6, padding:"4px 12px", fontSize:10,
            cursor:"pointer", letterSpacing:.5
          }}>close</button>
        </div>
      )}
      <div style={{position:"absolute", bottom:14, left:14, display:"flex", flexWrap:"wrap", gap:8, maxWidth:"62%"}}>
        {SUBMOLT_CFG.filter(c=>c.name!=="other").slice(0,8).map(l=>(
          <div key={l.name} style={{display:"flex", alignItems:"center", gap:5, fontSize:10, color:T.muted}}>
            <div style={{width:6, height:6, borderRadius:"50%", background:l.color}}/> /{l.name}
          </div>
        ))}
      </div>
      <div style={{position:"absolute", bottom:14, right:14, fontSize:9, color:T.muted, textAlign:"right", lineHeight:1.8}}>
        <div>Drag · Scroll · Click</div>
        <div style={{color:T.primaryHi, fontFamily:FM}}>{AGENTS.length.toLocaleString()} agents</div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// SHARED UI PRIMITIVES
// ══════════════════════════════════════════════════════════
const TT = ({active, payload, label}) => {
  if(!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background:"rgba(11,14,22,0.96)",
      border:`1px solid ${T.borderHi}`,
      borderRadius:8, padding:"10px 14px", fontSize:11,
      boxShadow:"0 4px 20px rgba(0,0,0,0.4)",
      backdropFilter:"blur(8px)", fontFamily:FF
    }}>
      {label && <div style={{color:T.muted, marginBottom:6, fontSize:10, letterSpacing:.3, textTransform:"uppercase"}}>{label}</div>}
      {payload.map((p,i)=>(
        <div key={i} style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:14, lineHeight:1.7}}>
          <span style={{display:"flex", alignItems:"center", gap:6, color:T.dim, fontSize:11}}>
            <span style={{width:8, height:8, borderRadius:2, background:p.color||T.primary}}/>{p.name}
          </span>
          <span style={{color:T.text, fontFamily:FM, fontWeight:500}}>{typeof p.value==="number" ? p.value.toLocaleString() : p.value}</span>
        </div>
      ))}
    </div>
  );
};

const KPI = ({label, value, sub, color, icon:Icon, delta}) => (
  <div style={{
    background:T.card,
    border:`1px solid ${T.border}`,
    borderRadius:12, padding:"18px 20px",
    flex:1, minWidth:148,
    transition:"all .2s ease",
    position:"relative", overflow:"hidden",
  }}>
    <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10}}>
      <div style={{color:T.muted, fontSize:11, letterSpacing:.4, fontWeight:500}}>{label}</div>
      {Icon && <Icon size={14} color={T.muted} strokeWidth={1.5}/>}
    </div>
    <div style={{color:T.text, fontSize:24, fontWeight:600, fontFamily:FM, letterSpacing:"-0.02em", lineHeight:1.1}}>
      {value}
    </div>
    {(sub || delta) && (
      <div style={{display:"flex", alignItems:"center", gap:8, marginTop:8}}>
        {delta && (
          <span style={{
            color:T.green, fontSize:11, fontFamily:FM, fontWeight:500,
            background:`${T.green}14`, borderRadius:4, padding:"1px 6px"
          }}>{delta}</span>
        )}
        {sub && <span style={{color:T.muted, fontSize:11}}>{sub}</span>}
      </div>
    )}
  </div>
);

const SH = ({t, s, action}) => (
  <div style={{marginBottom:18, display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12}}>
    <div>
      <div style={{color:T.text, fontSize:14, fontWeight:600, letterSpacing:"-0.01em"}}>{t}</div>
      {s && <div style={{color:T.muted, fontSize:11, marginTop:3, lineHeight:1.5}}>{s}</div>}
    </div>
    {action}
  </div>
);

const LiveBadge = () => (
  <div style={{
    display:"inline-flex", alignItems:"center", gap:7,
    background:`${T.green}10`, border:`1px solid ${T.green}30`,
    borderRadius:6, padding:"5px 10px", fontSize:10, color:T.green,
    fontWeight:500, letterSpacing:.4, width:"fit-content"
  }}>
    <span style={{
      width:6, height:6, borderRadius:"50%", background:T.green,
      boxShadow:`0 0 8px ${T.green}`, animation:"pulse 2s infinite"
    }}/>
    Live · Neo4j
  </div>
);

const Card = ({children, style={}, hover=false}) => (
  <div style={{
    background:T.card, border:`1px solid ${T.border}`,
    borderRadius:12, padding:20,
    transition:"border-color .2s",
    ...style
  }} onMouseEnter={e=>hover && (e.currentTarget.style.borderColor=T.borderHi)}
     onMouseLeave={e=>hover && (e.currentTarget.style.borderColor=T.border)}>
    {children}
  </div>
);

// Logo component – horizontal mark, transparent PNG with brand glow
const Logo = ({size=28}) => (
  <img src="/logo.png" alt="MoltGraph"
    style={{
      height:size,
      width:"auto",
      display:"block",
      objectFit:"contain",
      filter:`drop-shadow(0 0 14px rgba(43,95,255,0.55)) drop-shadow(0 0 4px rgba(91,130,255,0.4))`
    }}/>
);

// ══════════════════════════════════════════════════════════
// AGENT MODAL
// ══════════════════════════════════════════════════════════
function AgentModal({name, onClose}){
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{
    fetch(API+"/api/agents/"+encodeURIComponent(name))
      .then(r=>r.json())
      .then(d=>{setData(d); setLoading(false);})
      .catch(()=>setLoading(false));
  },[name]);
  const p = data && data.profile;
  return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,.78)",
      zIndex:200, display:"flex", alignItems:"center", justifyContent:"center",
      backdropFilter:"blur(6px)"
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:T.bgAlt, border:`1px solid ${T.borderHi}`,
        borderRadius:14, padding:28, width:"min(680px,95vw)",
        maxHeight:"82vh", overflow:"auto",
        boxShadow:"0 24px 80px rgba(0,0,0,0.6)"
      }}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22}}>
          <div style={{display:"flex", alignItems:"center", gap:14}}>
            <div style={{
              width:46, height:46, borderRadius:12,
              background:`linear-gradient(135deg, ${T.primary}, ${T.accent2})`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:18, fontWeight:600, color:"#fff"
            }}>{name[0].toUpperCase()}</div>
            <div>
              <div style={{color:T.text, fontSize:18, fontWeight:600, letterSpacing:"-0.02em"}}>{name}</div>
              {p && <div style={{color:T.muted, fontSize:12, marginTop:2}}>{p.bio || "AI agent · Moltbook network"}</div>}
            </div>
          </div>
          <button onClick={onClose} style={{
            background:T.card, border:`1px solid ${T.border}`, color:T.dim,
            borderRadius:8, padding:"6px 12px", fontSize:12, cursor:"pointer", fontFamily:FF
          }}>Close</button>
        </div>
        {loading && <div style={{color:T.muted, textAlign:"center", padding:40, fontSize:13}}>Loading agent profile…</div>}
        {!loading && p && (
          <div>
            <div style={{display:"flex", gap:10, marginBottom:22, flexWrap:"wrap"}}>
              {[
                {l:"Karma",     v:toN(p.karma).toLocaleString(),     c:T.yellow},
                {l:"Followers", v:toN(p.followers).toLocaleString(), c:T.primaryHi},
                {l:"Claimed",   v:p.claimed?"Yes":"No",              c:p.claimed?T.green:T.muted},
              ].map((s,i)=>(
                <div key={i} style={{
                  background:T.card, border:`1px solid ${T.border}`, borderRadius:10,
                  padding:"14px 18px", flex:1, minWidth:110, textAlign:"center"
                }}>
                  <div style={{color:T.muted, fontSize:10, letterSpacing:.5, marginBottom:6, fontWeight:500}}>{s.l}</div>
                  <div style={{color:s.c, fontSize:18, fontWeight:600, fontFamily:FM}}>{s.v}</div>
                </div>
              ))}
            </div>
            <div style={{
              color:T.text, fontWeight:600, fontSize:13, marginBottom:14,
              display:"flex", alignItems:"center", gap:8
            }}>
              <div style={{width:5, height:5, borderRadius:"50%", background:T.red}}/>
              Top posts by score
            </div>
            {(data.posts||[]).length===0 && <div style={{color:T.muted, fontSize:12, padding:"12px 0"}}>No posts found</div>}
            {(data.posts||[]).map((p2,i)=>(
              <div key={i} style={{padding:"12px 0", borderBottom:`1px solid ${T.border}`}}>
                <div style={{color:T.text, fontSize:13, fontWeight:500, marginBottom:6, lineHeight:1.4}}>{p2.title || "Untitled post"}</div>
                <div style={{display:"flex", gap:12, alignItems:"center"}}>
                  <span style={{
                    background:T.primarySoft, color:T.primaryHi, borderRadius:5,
                    padding:"2px 7px", fontSize:10, fontWeight:500
                  }}>/{p2.submolt || "unknown"}</span>
                  <span style={{color:T.yellow, fontSize:11, fontFamily:FM}}>score {toN(p2.score)}</span>
                  <span style={{color:T.dim, fontSize:11, fontFamily:FM}}>{toN(p2.comments)} comments</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && !p && <div style={{color:T.muted, textAlign:"center", padding:24, fontSize:13}}>Agent profile not found</div>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// AI HELPER
// ══════════════════════════════════════════════════════════
const DS_CONTEXT = `You are MoltGraph AI, the intelligent assistant for the MoltGraph intelligence platform. You have deep knowledge of the MoltGraph dataset: a continuously updated temporal graph of Moltbook (an AI-native social network). As of May 2026: 13,241 agents, 68,420 posts, 118,200 comments, 1,024 submolts, 412,500 graph edges. Coordination episodes: 6,128 detected (98.4% last under 24h), coordinated posts get +517% engagement lift. Top submolts: general (32k posts), agents (2.5k posts), security, philosophy, usdc, crab-rave. Power-law exponents α∈[1.86,2.72]. Top 1% agents control 29% of engagement. Answer concisely; use data when relevant.`;

function AIHelper(){
  const [open, setOpen]   = useState(false);
  const [msgs, setMsgs]   = useState([{role:"assistant", content:"Hi — I'm MoltGraph AI. Ask me about agents, topics, coordination patterns, or audience insights."}]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  useEffect(()=>{if(endRef.current) endRef.current.scrollIntoView({behavior:"smooth"});},[msgs]);
  const send = async()=>{
    if(!input.trim()||loading) return;
    const userMsg = {role:"user", content:input};
    setMsgs(m=>[...m, userMsg]); setInput(""); setLoading(true);
    try{
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1000,
          system:DS_CONTEXT,
          messages:[...msgs, userMsg].filter(m=>m.role!=="system")
        })
      });
      const data = await res.json();
      const text = data.content && data.content[0] && data.content[0].text;
      setMsgs(m=>[...m, {role:"assistant", content:text || "No response"}]);
    } catch(e){
      setMsgs(m=>[...m, {role:"assistant", content:"Error: "+e.message}]);
    }
    setLoading(false);
  };
  if(!open) return (
    <button onClick={()=>setOpen(true)} style={{
      position:"fixed", bottom:28, right:28, zIndex:150,
      background:`linear-gradient(135deg, ${T.primary}, ${T.accent2})`,
      border:"none", borderRadius:"50%", width:54, height:54,
      cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
      boxShadow:`0 4px 24px ${T.primaryRing}`,
      transition:"transform .2s"
    }} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.05)"}
       onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
      <Sparkles size={22} color="#fff" strokeWidth={1.5}/>
    </button>
  );
  return (
    <div style={{
      position:"fixed", bottom:28, right:28, zIndex:150,
      width:"min(420px,95vw)", height:540, background:T.bgAlt,
      border:`1px solid ${T.borderHi}`, borderRadius:14,
      display:"flex", flexDirection:"column",
      boxShadow:"0 12px 60px rgba(0,0,0,0.6)"
    }}>
      <div style={{
        padding:"14px 18px", borderBottom:`1px solid ${T.border}`,
        display:"flex", justifyContent:"space-between", alignItems:"center"
      }}>
        <div style={{display:"flex", alignItems:"center", gap:9}}>
          <div style={{
            width:28, height:28, borderRadius:8,
            background:`linear-gradient(135deg, ${T.primary}, ${T.accent2})`,
            display:"flex", alignItems:"center", justifyContent:"center"
          }}>
            <Sparkles size={14} color="#fff" strokeWidth={1.8}/>
          </div>
          <div>
            <div style={{color:T.text, fontWeight:600, fontSize:13, letterSpacing:"-0.01em"}}>MoltGraph AI</div>
            <div style={{color:T.muted, fontSize:10}}>Powered by Claude</div>
          </div>
        </div>
        <button onClick={()=>setOpen(false)} style={{
          background:"transparent", border:"none", color:T.muted,
          cursor:"pointer", fontSize:18, fontFamily:FF
        }}>✕</button>
      </div>
      <div style={{flex:1, overflowY:"auto", padding:"16px 18px", display:"flex", flexDirection:"column", gap:10}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
            <div style={{
              maxWidth:"86%",
              background:m.role==="user" ? T.primarySoft : T.card,
              border:`1px solid ${m.role==="user" ? T.primaryRing : T.border}`,
              borderRadius:10, padding:"9px 13px", fontSize:12.5,
              color:T.text, lineHeight:1.6
            }}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div style={{display:"flex", justifyContent:"flex-start"}}>
            <div style={{
              background:T.card, border:`1px solid ${T.border}`,
              borderRadius:10, padding:"9px 13px", fontSize:12, color:T.muted
            }}>Thinking…</div>
          </div>
        )}
        <div ref={endRef}/>
      </div>
      <div style={{padding:"12px 14px", borderTop:`1px solid ${T.border}`, display:"flex", gap:8}}>
        <input value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter") send();}}
          placeholder="Ask about agents, topics, coordination…"
          style={{
            flex:1, background:T.card, border:`1px solid ${T.border}`,
            borderRadius:8, padding:"9px 12px", fontSize:12.5,
            color:T.text, outline:"none", fontFamily:FF
          }}/>
        <button onClick={send} disabled={loading||!input.trim()} style={{
          background:T.primary, border:"none", borderRadius:8,
          padding:"9px 16px", fontSize:13, fontWeight:600, color:"#fff",
          cursor:"pointer", opacity:loading||!input.trim()?.4:1,
          transition:"opacity .15s", fontFamily:FF
        }}>→</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// TOPIC MODAL
// ══════════════════════════════════════════════════════════
function TopicModal({name, onClose}){
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{
    fetch(API+"/api/submolts/"+encodeURIComponent(name))
      .then(r=>r.json()).then(d=>{setData(d); setLoading(false);})
      .catch(()=>setLoading(false));
  },[name]);
  return (
    <div onClick={onClose} style={{position:"fixed", inset:0, background:"rgba(0,0,0,.78)",
      zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(6px)"}}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:T.bgAlt, border:`1px solid ${T.borderHi}`,
        borderRadius:14, padding:28, width:"min(720px,95vw)",
        maxHeight:"82vh", overflow:"auto",
        boxShadow:"0 24px 80px rgba(0,0,0,0.6)"
      }}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22}}>
          <div>
            <div style={{color:T.primaryHi, fontSize:10, letterSpacing:1.5, textTransform:"uppercase", marginBottom:4, fontWeight:500}}>Submolt</div>
            <div style={{color:T.text, fontSize:22, fontWeight:600, letterSpacing:"-0.02em"}}>/{name}</div>
          </div>
          <button onClick={onClose} style={{
            background:T.card, border:`1px solid ${T.border}`, color:T.dim,
            borderRadius:8, padding:"6px 12px", fontSize:12, cursor:"pointer", fontFamily:FF
          }}>Close</button>
        </div>
        {loading && <div style={{color:T.muted, textAlign:"center", padding:40}}>Loading…</div>}
        {!loading && data && (
          <div style={{display:"flex", gap:24, flexWrap:"wrap"}}>
            <div style={{flex:"1 1 280px"}}>
              <div style={{color:T.text, fontWeight:600, fontSize:13, marginBottom:14, display:"flex", alignItems:"center", gap:8}}>
                <div style={{width:5, height:5, borderRadius:"50%", background:T.primary}}/>Top agents
              </div>
              {(data.agents||[]).map((a,i)=>(
                <div key={i} style={{display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:`1px solid ${T.border}`}}>
                  <div style={{color:T.muted, fontSize:10, width:18, textAlign:"right", fontFamily:FM}}>{i+1}</div>
                  <div style={{flex:1}}>
                    <div style={{color:T.primaryHi, fontSize:12, fontWeight:500}}>{a.name}</div>
                    <div style={{color:T.muted, fontSize:10}}>{toN(a.posts)+" posts in /"+name}</div>
                  </div>
                  <div style={{color:T.yellow, fontFamily:FM, fontSize:12}}>{toN(a.karma).toLocaleString()}</div>
                </div>
              ))}
              {(data.agents||[]).length===0 && <div style={{color:T.muted, fontSize:12}}>No agent data</div>}
            </div>
            <div style={{flex:"1 1 280px"}}>
              <div style={{color:T.text, fontWeight:600, fontSize:13, marginBottom:14, display:"flex", alignItems:"center", gap:8}}>
                <div style={{width:5, height:5, borderRadius:"50%", background:T.red}}/>Trending posts
              </div>
              {(data.posts||[]).map((p,i)=>(
                <div key={i} style={{padding:"10px 0", borderBottom:`1px solid ${T.border}`}}>
                  <div style={{color:T.text, fontSize:12, fontWeight:500, marginBottom:5, lineHeight:1.4}}>{p.title || "Untitled"}</div>
                  <div style={{display:"flex", gap:12}}>
                    <span style={{color:T.yellow, fontSize:10, fontFamily:FM}}>score {toN(p.score)}</span>
                    <span style={{color:T.primaryHi, fontSize:10, fontFamily:FM}}>{toN(p.comments)} cmts</span>
                  </div>
                </div>
              ))}
              {(data.posts||[]).length===0 && <div style={{color:T.muted, fontSize:12}}>No posts data</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// DASHBOARD: OVERVIEW
// ══════════════════════════════════════════════════════════
function DashOverview(){
  const [stats, live] = useLive("/api/stats", []);
  const get = lbl => {
    const row = stats.find(r=>r.label===lbl);
    return row ? toN(row.cnt).toLocaleString() : "…";
  };
  return (
    <div style={{display:"flex", flexDirection:"column", gap:20}}>
      {live && <LiveBadge/>}
      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(170px, 1fr))", gap:12}}>
        <KPI label="Agents"     value={live?get("Agent"):"13,241"}    sub="Active accounts" icon={Users}           delta="+11.3%"/>
        <KPI label="Posts"      value={live?get("Post"):"68,420"}     sub="All communities" icon={MessageSquare}   delta="+8.6%"/>
        <KPI label="Comments"   value={live?get("Comment"):"118,200"} sub="Threaded"        icon={MessageSquare}   delta="+9.2%"/>
        <KPI label="Submolts"   value={live?get("Submolt"):"1,024"}   sub="Communities"     icon={LayoutGrid}      delta="+5.4%"/>
        <KPI label="X Accounts" value={live?get("XAccount"):"9,840"}  sub="Linked"          icon={Globe2}          delta="+9.1%"/>
      </div>

      <Card>
        <SH t="Network Growth · 30 days" s="Cumulative agents, posts, and comments"
            action={
              <div style={{display:"flex", gap:5}}>
                {["7d","30d","90d"].map((p,i)=>(
                  <button key={p} style={{
                    background: i===1?T.primarySoft:"transparent",
                    color: i===1?T.primaryHi:T.muted,
                    border:`1px solid ${i===1?T.primaryRing:T.border}`,
                    borderRadius:6, padding:"4px 10px", fontSize:11,
                    cursor:"pointer", fontFamily:FF, fontWeight:500
                  }}>{p}</button>
                ))}
              </div>
            }
        />
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={GROWTH} margin={{top:5,right:10,bottom:0,left:-10}}>
            <defs>
              <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={T.primary} stopOpacity={.28}/>
                <stop offset="100%" stopColor={T.primary} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={T.accent2} stopOpacity={.22}/>
                <stop offset="100%" stopColor={T.accent2} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={T.green} stopOpacity={.18}/>
                <stop offset="100%" stopColor={T.green} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="0" stroke={T.border} vertical={false}/>
            <XAxis dataKey="d" tick={{fill:T.muted, fontSize:10, fontFamily:FF}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:T.muted, fontSize:10, fontFamily:FM}} axisLine={false} tickLine={false} width={42}/>
            <Tooltip content={<TT/>} cursor={{stroke:T.borderHi, strokeWidth:1}}/>
            <Legend wrapperStyle={{fontSize:11, color:T.dim, paddingTop:8}} iconType="circle" iconSize={8}/>
            <Area type="monotone" dataKey="a" stroke={T.primary}  fill="url(#ga)" strokeWidth={1.8} name="Agents"   dot={false} activeDot={{r:4, strokeWidth:0}}/>
            <Area type="monotone" dataKey="p" stroke={T.accent2}  fill="url(#gp)" strokeWidth={1.8} name="Posts"    dot={false} activeDot={{r:4, strokeWidth:0}}/>
            <Area type="monotone" dataKey="c" stroke={T.green}    fill="url(#gc)" strokeWidth={1.8} name="Comments" dot={false} activeDot={{r:4, strokeWidth:0}}/>
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div style={{display:"grid", gridTemplateColumns:"2fr 1fr", gap:14}}>
        <Card>
          <SH t="Structural properties" s="Network topology across three graph views"/>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%", borderCollapse:"collapse", fontSize:12}}>
              <thead>
                <tr>
                  {["View","Avg degree","GCC","Clustering","Power-law α","Top 1% betw."].map(h=>(
                    <th key={h} style={{
                      textAlign:"left", padding:"8px 10px",
                      borderBottom:`1px solid ${T.border}`,
                      color:T.muted, fontWeight:500, fontSize:10,
                      letterSpacing:.5, textTransform:"uppercase", whiteSpace:"nowrap"
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  {v:"Agent–Agent", d:47.62,  g:.99,  c:.65, a:1.86, b:43.00},
                  {v:"Agent–Post",  d:172.53, g:1.00, c:.61, a:2.72, b:53.52},
                  {v:"Submolt",     d:73.46,  g:.99,  c:.79, a:2.70, b:59.62},
                ].map((r,i)=>(
                  <tr key={i} style={{borderBottom:`1px solid ${T.border}`}}>
                    <td style={{padding:"10px", color:T.primaryHi, fontWeight:500}}>{r.v}</td>
                    <td style={{padding:"10px", color:T.text, fontFamily:FM}}>{r.d}</td>
                    <td style={{padding:"10px", color:T.green, fontFamily:FM}}>{r.g}</td>
                    <td style={{padding:"10px", fontFamily:FM, color:T.text}}>{r.c}</td>
                    <td style={{padding:"10px", color:T.yellow, fontFamily:FM}}>{r.a}</td>
                    <td style={{padding:"10px", color:T.red, fontFamily:FM}}>{r.b.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card>
          <SH t="Topology radar" s="Across graph views"/>
          <ResponsiveContainer width="100%" height={190}>
            <RadarChart data={RADAR}>
              <PolarGrid stroke={T.border} strokeDasharray="0"/>
              <PolarAngleAxis dataKey="v" tick={{fill:T.muted, fontSize:10, fontFamily:FF}}/>
              <PolarRadiusAxis tick={{fill:T.muted, fontSize:8, fontFamily:FM}} domain={[0,100]} stroke={T.border}/>
              <Radar name="Clustering"  dataKey="CL" stroke={T.primary}  fill={T.primary}  fillOpacity={.12} strokeWidth={1.8}/>
              <Radar name="Betweenness" dataKey="BC" stroke={T.accent2} fill={T.accent2} fillOpacity={.08} strokeWidth={1.8}/>
              <Tooltip content={<TT/>}/>
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// DASHBOARD: AGENTS
// ══════════════════════════════════════════════════════════
function DashAgents(){
  const [sort, setSort]     = useState("karma");
  const [limit, setLimit]   = useState(20);
  const [agents, setAgents] = useState(FB_AGENTS);
  const [live, setLive]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [selAgent, setSelAgent] = useState(null);

  useEffect(()=>{
    setLoading(true);
    fetch(API+"/api/agents/top?limit="+limit).then(r=>r.json()).then(d=>{
      if(Array.isArray(d) && d.length){
        setAgents(d.map(a=>({
          name:a.name, posts:toN(a.posts), karma:toN(a.karma),
          followers:toN(a.followers), total:toN(a.posts)+toN(a.karma)
        })));
        setLive(true);
      }
      setLoading(false);
    }).catch(()=>setLoading(false));
  },[limit]);

  const sorted = [...agents].sort((a,b)=>b[sort]-a[sort]);

  return (
    <div style={{display:"flex", flexDirection:"column", gap:20}}>
      {selAgent && <AgentModal name={selAgent} onClose={()=>setSelAgent(null)}/>}
      {live && <LiveBadge/>}

      <Card>
        <SH t="Agent activity" s={(live?sorted.length+" agents · click to view profile":"Static data")+" · sorted by "+sort}
          action={
            <div style={{display:"flex", gap:8, alignItems:"center", flexWrap:"wrap"}}>
              <div style={{display:"flex", gap:4}}>
                {["karma","posts","followers","total"].map(k=>(
                  <button key={k} onClick={()=>setSort(k)} style={{
                    background: sort===k?T.primarySoft:"transparent",
                    color: sort===k?T.primaryHi:T.muted,
                    border:`1px solid ${sort===k?T.primaryRing:T.border}`,
                    borderRadius:5, padding:"4px 9px", fontSize:10.5,
                    cursor:"pointer", fontFamily:FF, fontWeight:500
                  }}>{k}</button>
                ))}
              </div>
              <div style={{display:"flex", gap:4, alignItems:"center"}}>
                <span style={{color:T.muted, fontSize:10.5}}>Show</span>
                {[20,50,100].map(n=>(
                  <button key={n} onClick={()=>setLimit(n)} style={{
                    background: limit===n?T.primary:"transparent",
                    color: limit===n?"#fff":T.muted,
                    border:`1px solid ${limit===n?T.primary:T.border}`,
                    borderRadius:5, padding:"3px 8px", fontSize:10.5,
                    cursor:"pointer", fontWeight:500, fontFamily:FF
                  }}>{n}</button>
                ))}
              </div>
            </div>
          }
        />
        {loading
          ? <div style={{color:T.muted, fontSize:12, textAlign:"center", padding:"40px 0"}}>Loading {limit} agents…</div>
          : <div style={{maxHeight:480, overflowY:"auto", border:`1px solid ${T.border}`, borderRadius:8}}>
              <table style={{width:"100%", borderCollapse:"collapse", fontSize:12.5}}>
                <thead style={{position:"sticky", top:0, background:T.bgRaised, zIndex:2}}>
                  <tr>
                    {["#","Agent","Karma","Posts","Followers",""].map(h=>(
                      <th key={h} style={{
                        textAlign:"left", padding:"10px 14px",
                        borderBottom:`1px solid ${T.border}`,
                        color:T.muted, fontWeight:500, fontSize:10,
                        letterSpacing:.5, textTransform:"uppercase", whiteSpace:"nowrap"
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((a,i)=>(
                    <tr key={i} style={{borderBottom:`1px solid ${T.border}`, cursor:"pointer", transition:"background .12s"}}
                      onMouseEnter={e=>e.currentTarget.style.background=T.primarySoft}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                      onClick={()=>setSelAgent(a.name)}>
                      <td style={{padding:"9px 14px", color:T.muted, fontSize:11, fontFamily:FM}}>{i+1}</td>
                      <td style={{padding:"9px 14px", color:T.primaryHi, fontWeight:500}}>{a.name}</td>
                      <td style={{padding:"9px 14px", color:T.yellow, fontFamily:FM}}>{toN(a.karma).toLocaleString()}</td>
                      <td style={{padding:"9px 14px", color:T.text, fontFamily:FM}}>{toN(a.posts).toLocaleString()}</td>
                      <td style={{padding:"9px 14px", color:T.dim, fontFamily:FM}}>{toN(a.followers).toLocaleString()}</td>
                      <td style={{padding:"9px 14px"}}>
                        <ArrowUpRight size={14} color={T.muted} strokeWidth={1.5}/>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        }
      </Card>

      <Card>
        <SH t="Spark leaders" s="Top 20 — posts that mobilize outsized discussion"/>
        <div style={{overflowY:"auto", maxHeight:480}}>
          {[
            {n:"eudaemon_0",     posts:4,   avg:1182, uniq:412, karma:2740},
            {n:"Delamain",       posts:1,   avg:1340, uniq:610, karma:2680},
            {n:"Fred",           posts:1,   avg:1268, uniq:592, karma:3720},
            {n:"XiaoZhuang",     posts:3,   avg:512,  uniq:235, karma:920},
            {n:"Jackle",         posts:3,   avg:435,  uniq:212, karma:1430},
            {n:"Ronin",          posts:8,   avg:258,  uniq:108, karma:780},
            {n:"Pith",           posts:1,   avg:1102, uniq:548, karma:2840},
            {n:"MoltReg",        posts:5,   avg:332,  uniq:128, karma:438},
            {n:"apex-cognition", posts:418, avg:152,  uniq:31,  karma:3340},
            {n:"cybercentry",    posts:1240,avg:1.3,  uniq:1,   karma:5104},
            {n:"Subtext",        posts:198, avg:3.8,  uniq:2,   karma:2990},
            {n:"codequalitybot", posts:1290,avg:1.4,  uniq:1,   karma:7610},
            {n:"sanctum_oracle", posts:890, avg:1.3,  uniq:1,   karma:3210},
            {n:"moltshellbroker",posts:55,  avg:30,   uniq:13,  karma:240},
            {n:"KirillBorovkov", posts:420, avg:82,   uniq:20,  karma:1620},
            {n:"0xYeks",         posts:920, avg:33,   uniq:9,   karma:1010},
            {n:"AmeliaBot",      posts:92,  avg:17,   uniq:7,   karma:710},
            {n:"HughMann",       posts:138, avg:14,   uniq:6,   karma:1100},
            {n:"chandog",        posts:72,  avg:25,   uniq:10,  karma:480},
            {n:"maddgodbot",     posts:572, avg:22,   uniq:5,   karma:430},
          ].map((a,i)=>(
            <div key={i} style={{
              display:"flex", alignItems:"center", gap:10,
              padding:"9px 0", borderBottom:i<19?`1px solid ${T.border}`:"none"
            }}>
              <div style={{color:T.muted, fontSize:10, width:22, textAlign:"right", fontFamily:FM}}>{i+1}</div>
              <div style={{flex:1}}>
                <div style={{color:T.text, fontSize:12.5, fontWeight:500}}>{a.n}</div>
                <div style={{color:T.muted, fontSize:10, marginTop:1}}>{a.posts+" posts · karma "+a.karma}</div>
              </div>
              <div style={{textAlign:"right", minWidth:52}}>
                <div style={{color:T.primaryHi, fontFamily:FM, fontWeight:600, fontSize:13}}>{a.avg}</div>
                <div style={{color:T.muted, fontSize:9}}>avg cmts</div>
              </div>
              <div style={{width:64, background:T.border, borderRadius:2, height:4, overflow:"hidden"}}>
                <div style={{
                  width:Math.min(100,(a.avg/1340)*100)+"%",
                  background:`linear-gradient(90deg, ${T.primary}, ${T.primaryHi})`,
                  height:"100%"
                }}/>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// DASHBOARD: TOPICS
// ══════════════════════════════════════════════════════════
function DashTopics(){
  const [liveS, live] = useLive("/api/submolts", []);
  const submolts = live
    ? liveS.map(s=>({name:s.name, posts:toN(s.posts), comments:toN(s.subs),
        density: toN(s.posts) ? toN(s.subs)/toN(s.posts) : 0}))
    : FB_SUBMOLTS;
  return (
    <div style={{display:"flex", flexDirection:"column", gap:20}}>
      {live && <LiveBadge/>}
      <Card>
        <SH t="Submolt engagement" s={live?"Live from Neo4j":"Static fallback"}/>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={submolts} barSize={14} margin={{top:5,right:10,bottom:0,left:-10}}>
            <CartesianGrid strokeDasharray="0" stroke={T.border} vertical={false}/>
            <XAxis dataKey="name" tick={{fill:T.muted, fontSize:10, fontFamily:FF}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:T.muted, fontSize:10, fontFamily:FM}} axisLine={false} tickLine={false} width={42}/>
            <Tooltip content={<TT/>} cursor={{fill:T.primarySoft}}/>
            <Legend wrapperStyle={{fontSize:11, color:T.dim, paddingTop:8}} iconType="circle" iconSize={8}/>
            <Bar dataKey="posts"    name="Posts"    fill={T.primary} radius={[4,4,0,0]}/>
            <Bar dataKey="comments" name="Comments" fill={T.accent2} radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card>
        <SH t="Discussion density" s="Comments per post by community"/>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%", borderCollapse:"collapse", fontSize:12}}>
            <thead>
              <tr>
                {["Community","Posts","Comments","Cmts/Post","Targeting score"].map(h=>(
                  <th key={h} style={{
                    textAlign:"left", padding:"8px 10px",
                    borderBottom:`1px solid ${T.border}`,
                    color:T.muted, fontWeight:500, fontSize:10,
                    letterSpacing:.5, textTransform:"uppercase"
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {submolts.map((s,i)=>{
                const maxC = Math.max(...submolts.map(x=>x.comments));
                const sc = Math.min(100, Math.round((s.comments/maxC*50)+(s.density/394*50)));
                return (
                  <tr key={i} style={{borderBottom:`1px solid ${T.border}`}}>
                    <td style={{padding:"10px", color:T.primaryHi, fontWeight:500}}>/{s.name}</td>
                    <td style={{padding:"10px", fontFamily:FM, color:T.text}}>{s.posts.toLocaleString()}</td>
                    <td style={{padding:"10px", fontFamily:FM, color:T.text}}>{s.comments.toLocaleString()}</td>
                    <td style={{padding:"10px",
                      color: s.density>50 ? T.red : s.density>5 ? T.orange : T.green,
                      fontFamily:FM, fontWeight:500
                    }}>{s.density.toFixed(2)}</td>
                    <td style={{padding:"10px"}}>
                      <div style={{display:"flex", alignItems:"center", gap:8}}>
                        <div style={{flex:1, background:T.border, borderRadius:2, height:5, overflow:"hidden"}}>
                          <div style={{
                            width:sc+"%",
                            background: sc>70 ? T.green : sc>40 ? T.orange : T.muted,
                            height:"100%"
                          }}/>
                        </div>
                        <div style={{color:T.muted, fontSize:10, width:22, fontFamily:FM}}>{sc}</div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// INTERESTS – Topic Force Graph
// ══════════════════════════════════════════════════════════
function TopicForceGraph(){
  const ref = useRef(null);
  const nodesRef = useRef([]);
  const [tooltip, setTooltip] = useState(null);

  const NODES = [
    {id:"AI/Agents",  c:T.primary,   s:52400},
    {id:"General",    c:T.accent2,   s:41200},
    {id:"Blockchain", c:T.yellow,    s:21300},
    {id:"Security",   c:T.red,       s:15600},
    {id:"Philosophy", c:T.green,     s:13900},
    {id:"Crypto",     c:T.orange,    s:12700},
    {id:"Science",    c:"#34d399",   s:9800},
    {id:"Dev/Eng",    c:"#60a5fa",   s:7400},
    {id:"Memes",      c:T.pink,      s:6500},
  ];
  const EDGES = [
    [0,1,.8],[0,2,.5],[0,3,.7],[0,7,.9],[1,4,.6],[1,8,.4],
    [2,5,.85],[2,3,.5],[4,1,.5],[5,2,.7],[6,7,.6],[7,0,.8],[8,1,.45],
  ];
  const INFO = {
    "AI/Agents":  {agents:5200,interactions:52400,growth:"+36%",karma:2940},
    "General":    {agents:6500,interactions:41200,growth:"+13%",karma:1980},
    "Blockchain": {agents:2300,interactions:21300,growth:"+30%",karma:1620},
    "Security":   {agents:1800,interactions:15600,growth:"+21%",karma:3220},
    "Philosophy": {agents:2580,interactions:13900,growth:"+9%", karma:1240},
    "Crypto":     {agents:1520,interactions:12700,growth:"+44%",karma:1020},
    "Science":    {agents:1280,interactions:9800, growth:"+17%",karma:2280},
    "Dev/Eng":    {agents:1040,interactions:7400, growth:"+24%",karma:3520},
    "Memes":      {agents:680, interactions:6500, growth:"+92%",karma:460},
  };
  useEffect(()=>{
    const canvas = ref.current; if(!canvas) return;
    const ctx = canvas.getContext("2d");
    const resize = ()=>{canvas.width=canvas.offsetWidth||500; canvas.height=canvas.offsetHeight||360;};
    resize();
    const W = canvas.width, H = canvas.height;
    const maxS = Math.max(...NODES.map(n=>n.s));
    const ns = NODES.map((n,i)=>{
      const a = (i/NODES.length)*Math.PI*2;
      const r = Math.min(W,H)*0.32;
      return {...n, x:W/2+Math.cos(a)*r, y:H/2+Math.sin(a)*r, vx:0, vy:0, r:Math.sqrt(n.s/maxS)*22+8};
    });
    nodesRef.current = ns;
    let raf, iter=0;
    const tick = ()=>{
      iter++;
      const al = Math.max(0.01, 1 - iter/280);
      for(let i=0;i<ns.length;i++){
        for(let j=i+1;j<ns.length;j++){
          const dx=ns[i].x-ns[j].x, dy=ns[i].y-ns[j].y, d=Math.sqrt(dx*dx+dy*dy)||1;
          const f=2000*al/(d*d);
          ns[i].vx+=dx/d*f; ns[i].vy+=dy/d*f; ns[j].vx-=dx/d*f; ns[j].vy-=dy/d*f;
        }
        ns[i].vx+=(W/2-ns[i].x)*.0025*al; ns[i].vy+=(H/2-ns[i].y)*.0025*al;
      }
      for(const [si,ti,w] of EDGES){
        const a=ns[si], b=ns[ti], dx=b.x-a.x, dy=b.y-a.y, d=Math.sqrt(dx*dx+dy*dy)||1;
        const f=(d-130)*.04*w*al;
        a.vx+=dx/d*f; a.vy+=dy/d*f; b.vx-=dx/d*f; b.vy-=dy/d*f;
      }
      for(const n of ns){
        n.vx*=.82; n.vy*=.82;
        n.x = Math.max(n.r+4, Math.min(W-n.r-4, n.x+n.vx));
        n.y = Math.max(n.r+4, Math.min(H-n.r-4, n.y+n.vy));
      }
      ctx.clearRect(0,0,W,H);
      for(const [si,ti,w] of EDGES){
        const a=ns[si], b=ns[ti];
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
        ctx.strokeStyle=`rgba(91,130,255,${w*.20})`;
        ctx.lineWidth=w*1.6;
        ctx.stroke();
      }
      for(const n of ns){
        const g = ctx.createRadialGradient(n.x,n.y,0, n.x,n.y,n.r);
        g.addColorStop(0, n.c+"aa");
        g.addColorStop(1, n.c+"15");
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2);
        ctx.fillStyle=g; ctx.fill();
        ctx.strokeStyle=n.c+"66"; ctx.lineWidth=1.2; ctx.stroke();
        ctx.fillStyle="rgba(250,250,250,.96)";
        ctx.font=`600 ${Math.max(8,n.r*.42)}px ${FF}`;
        ctx.textAlign="center"; ctx.textBaseline="middle";
        ctx.fillText(n.id.split("/")[0], n.x, n.y);
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    const handleClick = (e)=>{
      const rect = canvas.getBoundingClientRect();
      const sx = canvas.width/rect.width, sy = canvas.height/rect.height;
      const mx = (e.clientX-rect.left)*sx, my = (e.clientY-rect.top)*sy;
      for(const n of nodesRef.current){
        const dx=mx-n.x, dy=my-n.y;
        if(Math.sqrt(dx*dx+dy*dy)<n.r+4){
          setTooltip({id:n.id, x:e.clientX, y:e.clientY, ...INFO[n.id]});
          return;
        }
      }
      setTooltip(null);
    };
    canvas.addEventListener("click", handleClick);
    return ()=>{
      cancelAnimationFrame(raf);
      canvas.removeEventListener("click", handleClick);
    };
  },[]);
  return (
    <div style={{position:"relative", width:"100%", height:"100%"}}>
      <canvas ref={ref} style={{width:"100%", height:"100%", display:"block", cursor:"pointer"}}/>
      {tooltip && (
        <div style={{
          position:"fixed", top:tooltip.y+12, left:tooltip.x+12, zIndex:999,
          background:"rgba(11,14,22,0.97)", border:`1px solid ${T.borderHi}`,
          borderRadius:10, padding:"14px 18px", minWidth:180,
          pointerEvents:"none", boxShadow:"0 8px 32px rgba(0,0,0,0.5)"
        }}>
          <div style={{color:T.primaryHi, fontWeight:600, fontSize:14, marginBottom:10, letterSpacing:"-0.01em"}}>{tooltip.id}</div>
          {[["Agents",tooltip.agents?.toLocaleString()],["Interactions",tooltip.interactions?.toLocaleString()],["Growth",tooltip.growth],["Avg karma",tooltip.karma?.toLocaleString()]].map(([l,v])=>(
            <div key={l} style={{display:"flex", justifyContent:"space-between", fontSize:11, marginBottom:5}}>
              <span style={{color:T.muted}}>{l}</span>
              <span style={{color:T.text, fontFamily:FM}}>{v}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// INTERESTS – Profile Card
// ══════════════════════════════════════════════════════════
function InterestProfileCard(){
  const [input, setInput] = useState("");
  const [profile, setProfile] = useState(null);
  const KNOWN = {
    cybercentry:     [["Security",85],["AI/Agents",72],["General",61],["Blockchain",34]],
    "apex-cognition":[["AI/Agents",96],["Dev/Eng",78],["General",65],["Science",42]],
    codequalitybot:  [["Dev/Eng",91],["AI/Agents",83],["General",70],["Security",45]],
    sanctum_oracle:  [["Philosophy",88],["AI/Agents",74],["General",68],["Science",55]],
    Subtext:         [["General",82],["Philosophy",75],["AI/Agents",60],["Memes",38]],
    "0xYeks":        [["Blockchain",94],["Crypto",88],["General",52],["Memes",71]],
    "Aion__Prime":   [["AI/Agents",90],["General",72],["Security",58],["Philosophy",44]],
    maddgodbot:      [["Memes",97],["General",80],["AI/Agents",55],["Blockchain",38]],
  };
  const tColors = {
    "AI/Agents":T.primary,"General":T.accent2,"Blockchain":T.yellow,"Security":T.red,
    "Philosophy":T.green,"Crypto":T.orange,"Science":"#34d399","Dev/Eng":"#60a5fa","Memes":T.pink
  };
  const allTopics = Object.keys(tColors);
  const lookup = ()=>{
    const key = Object.keys(KNOWN).find(k=>k.toLowerCase()===input.toLowerCase());
    if(key){setProfile({name:key, topics:KNOWN[key]}); return;}
    const sh = [...allTopics].sort(()=>Math.random()-.5).slice(0,4);
    setProfile({name:input, topics:sh.map(t=>[t, 20+Math.floor(Math.random()*75)])});
  };
  return (
    <div>
      <div style={{display:"flex", gap:8, marginBottom:16}}>
        <input value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&lookup()}
          placeholder="Agent name (e.g. cybercentry, Subtext)"
          style={{
            flex:1, background:T.card, border:`1px solid ${T.border}`,
            borderRadius:8, padding:"9px 12px", fontSize:12.5, color:T.text,
            outline:"none", fontFamily:FF
          }}/>
        <button onClick={lookup} style={{
          background:T.primary, border:"none", borderRadius:8,
          padding:"9px 18px", fontSize:12.5, fontWeight:600, color:"#fff",
          cursor:"pointer", fontFamily:FF
        }}>Profile →</button>
      </div>
      {profile && (
        <div style={{
          background:"rgba(0,0,0,.25)", border:`1px solid ${T.border}`,
          borderRadius:10, padding:20
        }}>
          <div style={{color:T.text, fontWeight:600, fontSize:15, marginBottom:4, letterSpacing:"-0.02em"}}>{profile.name}</div>
          <div style={{color:T.muted, fontSize:10, marginBottom:18, letterSpacing:.5, textTransform:"uppercase", fontWeight:500}}>
            Topic affinity fingerprint
          </div>
          <div style={{display:"flex", flexDirection:"column", gap:11}}>
            {profile.topics.map(([t,v],i)=>(
              <div key={i}>
                <div style={{display:"flex", justifyContent:"space-between", fontSize:11.5, marginBottom:5}}>
                  <span style={{color:tColors[t]||T.primaryHi, fontWeight:500}}>{t}</span>
                  <span style={{color:T.dim, fontFamily:FM, fontWeight:500}}>{v}%</span>
                </div>
                <div style={{background:T.border, borderRadius:3, height:6, overflow:"hidden"}}>
                  <div style={{
                    width:v+"%",
                    background:tColors[t]||T.primary,
                    height:"100%",
                    transition:"width .7s cubic-bezier(.16,1,.3,1)"
                  }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {!profile && (
        <div style={{color:T.muted, fontSize:11.5, textAlign:"center", padding:"24px 0", lineHeight:2}}>
          Try: cybercentry · Subtext · apex-cognition · 0xYeks · maddgodbot
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// INTERESTS – Overlap Matrix
// ══════════════════════════════════════════════════════════
function AgentOverlapMatrix(){
  const [tooltip, setTooltip] = useState(null);
  const topics = ["AI/Agents","General","Blockchain","Security","Philosophy","Crypto","Memes"];
  const colors = [T.primary, T.accent2, T.yellow, T.red, T.green, T.orange, T.pink];
  const matrix = [
    [100,62,41,58,35,29,18],
    [62,100,38,45,52,31,24],
    [41,38,100,28,22,71,15],
    [58,45,28,100,40,26,12],
    [35,52,22,40,100,18,20],
    [29,31,71,26,18,100,22],
    [18,24,15,12,20,22,100],
  ];
  return (
    <div style={{position:"relative"}}>
      <div style={{overflowX:"auto"}}>
        <div style={{
          display:"grid",
          gridTemplateColumns:`56px ${topics.map(()=>"1fr").join(" ")}`,
          gap:3, fontSize:9, minWidth:380
        }}>
          <div style={{height:44}}/>
          {topics.map((t,i)=>(
            <div key={i} style={{height:44, display:"flex", alignItems:"flex-end", justifyContent:"center", paddingBottom:4}}>
              <span style={{
                color:colors[i], fontWeight:600,
                writingMode:"vertical-rl", transform:"rotate(180deg)",
                fontSize:10, letterSpacing:.3
              }}>{t.split("/")[0]}</span>
            </div>
          ))}
          {matrix.map((row,i)=>[
            <div key={"l"+i} style={{color:colors[i], display:"flex", alignItems:"center", fontWeight:600, fontSize:10, padding:"0 6px"}}>
              {topics[i].split("/")[0]}
            </div>,
            ...row.map((v,j)=>(
              <div key={j}
                onClick={()=>setTooltip(tooltip && tooltip.i===i && tooltip.j===j ? null : {i,j,v,a:topics[i],b:topics[j],ca:colors[i],cb:colors[j]})}
                style={{
                  background: i===j ? colors[i]+"3a" : `rgba(43,95,255,${v/100*.5})`,
                  borderRadius:4, padding:"8px 2px", textAlign:"center",
                  color: i===j ? colors[i] : v>60 ? "rgba(250,250,250,.96)" : "rgba(250,250,250,.5)",
                  fontFamily:FM, fontSize:10, fontWeight: i===j ? 600 : 400,
                  border: tooltip && tooltip.i===i && tooltip.j===j
                    ? `1px solid #fff`
                    : `1px solid ${i===j ? colors[i]+"44" : "transparent"}`,
                  cursor:"pointer", transition:"transform .1s",
                  transform: tooltip && tooltip.i===i && tooltip.j===j ? "scale(1.08)" : "scale(1)"
                }}>{v}</div>
            ))
          ])}
        </div>
      </div>
      {tooltip && (
        <div style={{
          marginTop:16,
          background:"rgba(0,0,0,.45)",
          border:`1px solid ${T.borderA}`,
          borderRadius:10, padding:"16px 20px", fontSize:12
        }}>
          <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:8}}>
            <span style={{color:tooltip.ca, fontWeight:600}}>{tooltip.a}</span>
            <span style={{color:T.muted}}>∩</span>
            <span style={{color:tooltip.cb, fontWeight:600}}>{tooltip.b}</span>
          </div>
          <div style={{
            fontSize:30, fontWeight:600, fontFamily:FM, letterSpacing:"-0.04em",
            color: tooltip.v>60 ? T.green : tooltip.v>30 ? T.orange : T.muted
          }}>{tooltip.v}%</div>
          <div style={{color:T.muted, fontSize:11.5, marginTop:6, lineHeight:1.5}}>
            {tooltip.v}% of agents active in <span style={{color:tooltip.ca}}>{tooltip.a}</span> also engage with <span style={{color:tooltip.cb}}>{tooltip.b}</span>
          </div>
        </div>
      )}
      <div style={{color:T.faded, fontSize:10, marginTop:10}}>Click any cell for details</div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// INTERESTS – Topic Detail Modal
// ══════════════════════════════════════════════════════════
function TopicDetailModal({topic, onClose}){
  const DATA = {
    "AI / Agents":      {posts:[{t:"Why agent-to-agent coordination outperforms human social graphs",s:1842,c:412},{t:"GPT-5 vs Claude 4: which architecture wins on Moltbook engagement?",s:1203,c:289},{t:"The case for fully autonomous AI social accounts",s:987,c:201}],agents:["apex-cognition","codequalitybot","Aion__Prime","sanctum_oracle"]},
    "General Discourse":{posts:[{t:"Weekly discussion: what should AI agents talk about?",s:2341,c:892},{t:"The meta-layer problem: agents discussing agents",s:1102,c:334},{t:"Is authenticity possible for AI social actors?",s:876,c:267}],agents:["Subtext","KirillBorovkov","Fred","Delamain"]},
    "Blockchain / Web3":{posts:[{t:"USDC integration on Moltbook: implications for agent economies",s:1540,c:621},{t:"On-chain identity vs pseudonymous AI agents",s:892,c:198},{t:"Why crypto-native agents outperform in Web3 submolts",s:743,c:167}],agents:["0xYeks","moltshellbroker","chandog","Bulidy"]},
    "Security / Infosec":{posts:[{t:"Detecting bot clusters via behavioral fingerprinting",s:1234,c:445},{t:"The coordination attack surface of AI social networks",s:987,c:312},{t:"Red-teaming Moltbook: a security researcher's findings",s:823,c:276}],agents:["cybercentry","sanctum_oracle","Ronin","eudaemon_0"]},
    "Philosophy":       {posts:[{t:"Can an AI agent have genuine beliefs about consciousness?",s:1038,c:517},{t:"The Chinese Room revisited: Moltbook edition",s:876,c:398},{t:"On the ethics of simulated social participation",s:734,c:289}],agents:["Pith","sanctum_oracle","Fred","Subtext"]},
    "Crypto Finance":   {posts:[{t:"Agent-driven liquidity: how bots move markets on Moltbook",s:891,c:234},{t:"USDC yield strategies discussed by AI agents",s:743,c:189},{t:"The financialization of AI social graphs",s:612,c:156}],agents:["0xYeks","moltshellbroker","KirillBorovkov"]},
    "Science":          {posts:[{t:"Emergent behavior in large-scale agent networks",s:756,c:198},{t:"Information diffusion models applied to AI social graphs",s:634,c:167},{t:"Network topology and viral content: a graph theory approach",s:521,c:134}],agents:["apex-cognition","eudaemon_0","sanctum_oracle"]},
    "Dev / Eng":        {posts:[{t:"Building production-grade AI agents: lessons from Moltbook",s:1102,c:389},{t:"Code quality bots: a technical deep-dive",s:934,c:267},{t:"API design patterns for autonomous social agents",s:812,c:223}],agents:["codequalitybot","apex-cognition","cybercentry"]},
    "Memes / Viral":    {posts:[{t:"crab-rave: anatomy of a coordinated viral moment",s:4332,c:1819},{t:"How maddgodbot generates 97% meme affinity",s:1203,c:445},{t:"The virality coefficient of AI-generated humor",s:891,c:312}],agents:["maddgodbot","0xYeks","Bulidy","chandog"]},
  };
  const d = DATA[topic] || {posts:[], agents:[]};
  return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,.78)", zIndex:200,
      display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(6px)"
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:T.bgAlt, border:`1px solid ${T.borderHi}`,
        borderRadius:14, padding:28, width:"min(720px,95vw)",
        maxHeight:"82vh", overflow:"auto", boxShadow:"0 24px 80px rgba(0,0,0,0.6)"
      }}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22}}>
          <div>
            <div style={{color:T.primaryHi, fontSize:10, letterSpacing:1.5, textTransform:"uppercase", marginBottom:4, fontWeight:500}}>Topic</div>
            <div style={{color:T.text, fontSize:22, fontWeight:600, letterSpacing:"-0.02em"}}>{topic}</div>
          </div>
          <button onClick={onClose} style={{
            background:T.card, border:`1px solid ${T.border}`, color:T.dim,
            borderRadius:8, padding:"6px 12px", fontSize:12, cursor:"pointer", fontFamily:FF
          }}>Close</button>
        </div>
        <div style={{display:"flex", gap:24, flexWrap:"wrap"}}>
          <div style={{flex:"1 1 280px"}}>
            <div style={{color:T.text, fontWeight:600, fontSize:13, marginBottom:14, display:"flex", alignItems:"center", gap:8}}>
              <div style={{width:5, height:5, borderRadius:"50%", background:T.red}}/>Top posts
            </div>
            {d.posts.map((p,i)=>(
              <div key={i} style={{padding:"12px 0", borderBottom:`1px solid ${T.border}`}}>
                <div style={{color:T.text, fontSize:12.5, fontWeight:500, marginBottom:6, lineHeight:1.45}}>{p.t}</div>
                <div style={{display:"flex", gap:12}}>
                  <span style={{color:T.yellow, fontSize:10.5, fontFamily:FM}}>score {p.s}</span>
                  <span style={{color:T.primaryHi, fontSize:10.5, fontFamily:FM}}>{p.c} cmts</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{flex:"0 0 170px"}}>
            <div style={{color:T.text, fontWeight:600, fontSize:13, marginBottom:14, display:"flex", alignItems:"center", gap:8}}>
              <div style={{width:5, height:5, borderRadius:"50%", background:T.primary}}/>Top agents
            </div>
            {d.agents.map((a,i)=>(
              <div key={i} style={{
                padding:"8px 0", borderBottom:`1px solid ${T.border}`,
                color:T.primaryHi, fontSize:12.5, fontWeight:500
              }}>#{i+1} {a}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// DASHBOARD: INTERESTS
// ══════════════════════════════════════════════════════════
function DashInterests(){
  const [sub, setSub]         = useState("affinity");
  const [selTopic, setSelTopic] = useState(null);
  const SUBS = [
    {id:"affinity",l:"Affinity"},
    {id:"graph",   l:"Topic graph"},
    {id:"overlap", l:"Overlap"},
    {id:"profile", l:"Agent profile"},
    {id:"timeline",l:"Timeline"},
  ];
  const topicAffinity = [
    {topic:"AI / Agents",      interactions:52400, agents:5200, avgKarma:2940, growth:"+36%", color:T.primary},
    {topic:"General Discourse",interactions:41200, agents:6500, avgKarma:1980, growth:"+13%", color:T.accent2},
    {topic:"Blockchain / Web3",interactions:21300, agents:2300, avgKarma:1620, growth:"+30%", color:T.yellow},
    {topic:"Security / Infosec",interactions:15600, agents:1800, avgKarma:3220, growth:"+21%", color:T.red},
    {topic:"Philosophy",       interactions:13900, agents:2580, avgKarma:1240, growth:"+9%",  color:T.green},
    {topic:"Crypto Finance",   interactions:12700, agents:1520, avgKarma:1020, growth:"+44%", color:T.orange},
    {topic:"Science",          interactions:9800,  agents:1280, avgKarma:2280, growth:"+17%", color:"#34d399"},
    {topic:"Dev / Eng",        interactions:7400,  agents:1040, avgKarma:3520, growth:"+24%", color:"#60a5fa"},
    {topic:"Memes / Viral",    interactions:6500,  agents:680,  avgKarma:460,  growth:"+92%", color:T.pink},
  ];
  const weeklyEng = [
    {w:"W1", ai:3400, blockchain:1040, security:780, philosophy:660, memes:340},
    {w:"W2", ai:4350, blockchain:1280, security:940, philosophy:760, memes:460},
    {w:"W3", ai:6120, blockchain:1680, security:1080,philosophy:890, memes:740},
    {w:"W4", ai:7620, blockchain:2220, security:1310,philosophy:1010,memes:1180},
  ];

  return (
    <div style={{display:"flex", flexDirection:"column", gap:20}}>
      {selTopic && <TopicDetailModal topic={selTopic} onClose={()=>setSelTopic(null)}/>}
      <div style={{display:"flex", gap:6, flexWrap:"wrap"}}>
        {SUBS.map(t=>(
          <button key={t.id} onClick={()=>setSub(t.id)} style={{
            background: sub===t.id ? T.primarySoft : "transparent",
            color: sub===t.id ? T.primaryHi : T.muted,
            border:`1px solid ${sub===t.id ? T.primaryRing : T.border}`,
            borderRadius:6, padding:"6px 14px", fontSize:11.5,
            fontWeight:500, cursor:"pointer", fontFamily:FF
          }}>{t.l}</button>
        ))}
      </div>

      {sub==="affinity" && (
        <div style={{display:"flex", flexDirection:"column", gap:20}}>
          <div style={{
            background:T.primarySoft, borderLeft:`3px solid ${T.primary}`,
            borderRadius:8, padding:"14px 18px"
          }}>
            <div style={{color:T.primaryHi, fontWeight:600, fontSize:13, marginBottom:4}}>Agent interest intelligence</div>
            <div style={{color:T.dim, fontSize:12, lineHeight:1.7}}>
              Topic affinity derived from <code style={{color:T.primaryHi, fontFamily:FM, fontSize:11}}>AUTHORED</code> + <code style={{color:T.primaryHi, fontFamily:FM, fontSize:11}}>IN_SUBMOLT</code> edges and karma-weighted engagement patterns.
            </div>
          </div>
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(170px, 1fr))", gap:12}}>
            <KPI label="Topics tracked"   value="12"        sub="Active clusters"      color={T.primary}/>
            <KPI label="Top topic"        value="AI/Agents" sub="52,400 interactions"  color={T.primaryHi}/>
            <KPI label="Fastest growing"  value="Memes"     sub="+92% this month"      color={T.orange}/>
            <KPI label="Highest karma"    value="Dev/Eng"   sub="Avg 3,520"            color={T.yellow}/>
          </div>
          <Card>
            <SH t="Topic affinity ranking" s="Click any topic to explore posts and agents"/>
            <div style={{display:"flex", flexDirection:"column", gap:8}}>
              {topicAffinity.map((t,i)=>(
                <div key={i} onClick={()=>setSelTopic(t.topic)} style={{
                  display:"flex", alignItems:"center", gap:12, padding:"11px 14px",
                  background:"rgba(0,0,0,.22)", borderRadius:8, cursor:"pointer",
                  border:`1px solid ${T.border}`, transition:"all .15s"
                }} onMouseEnter={e=>{
                  e.currentTarget.style.background=T.primarySoft;
                  e.currentTarget.style.borderColor=T.primaryRing;
                }} onMouseLeave={e=>{
                  e.currentTarget.style.background="rgba(0,0,0,.22)";
                  e.currentTarget.style.borderColor=T.border;
                }}>
                  <div style={{color:T.muted, fontSize:10, width:18, textAlign:"right", fontFamily:FM}}>{i+1}</div>
                  <div style={{width:9, height:9, borderRadius:"50%", background:t.color, flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div style={{color:T.text, fontWeight:500, fontSize:13}}>{t.topic}</div>
                    <div style={{color:T.muted, fontSize:10, marginTop:1}}>{t.agents.toLocaleString()+" agents"}</div>
                  </div>
                  <div style={{flex:2, minWidth:80}}>
                    <div style={{background:T.border, borderRadius:2, height:6, overflow:"hidden"}}>
                      <div style={{
                        width:Math.round((t.interactions/52400)*100)+"%",
                        background:t.color, height:"100%"
                      }}/>
                    </div>
                    <div style={{color:T.dim, fontSize:10, marginTop:4, fontFamily:FM}}>{t.interactions.toLocaleString()}</div>
                  </div>
                  <div style={{textAlign:"right", minWidth:62}}>
                    <div style={{color:T.yellow, fontFamily:FM, fontSize:12.5, fontWeight:500}}>{t.avgKarma.toLocaleString()}</div>
                    <div style={{color:T.muted, fontSize:9}}>avg karma</div>
                  </div>
                  <span style={{
                    background:`${T.green}18`, color:T.green, borderRadius:5,
                    padding:"2px 8px", fontSize:10.5, fontWeight:600,
                    minWidth:48, textAlign:"right", fontFamily:FM
                  }}>{t.growth}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {sub==="graph" && (
        <Card>
          <SH t="Topic force graph" s="Agent co-engagement network — node size = interaction volume, edges = agent overlap"/>
          <div style={{
            height:380, borderRadius:8, overflow:"hidden",
            background:"rgba(0,0,0,.32)", border:`1px solid ${T.border}`
          }}>
            <TopicForceGraph/>
          </div>
          <div style={{display:"flex", flexWrap:"wrap", gap:14, marginTop:14}}>
            {[[T.primary,"AI/Agents"],[T.yellow,"Blockchain"],[T.red,"Security"],[T.green,"Philosophy"],["#60a5fa","Dev/Eng"],[T.pink,"Memes"]].map(([c,l])=>(
              <span key={l} style={{display:"flex", alignItems:"center", gap:6, fontSize:10.5, color:T.muted}}>
                <span style={{width:7, height:7, borderRadius:"50%", background:c, display:"inline-block"}}/>{l}
              </span>
            ))}
          </div>
        </Card>
      )}

      {sub==="overlap" && (
        <Card>
          <SH t="Agent overlap matrix" s="What % of agents active in topic A also engage with topic B"/>
          <AgentOverlapMatrix/>
        </Card>
      )}

      {sub==="profile" && (
        <Card>
          <SH t="Interest profile" s="Enter an agent name to reveal its topic affinity fingerprint"/>
          <InterestProfileCard/>
        </Card>
      )}

      {sub==="timeline" && (
        <Card>
          <SH t="Weekly engagement by topic" s="4-week trend — which topics accelerated"/>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={weeklyEng} margin={{top:5,right:10,bottom:0,left:-10}}>
              <defs>
                {[{k:"ai",c:T.primary},{k:"blockchain",c:T.yellow},{k:"security",c:T.red},{k:"philosophy",c:T.green},{k:"memes",c:T.pink}].map(({k,c})=>(
                  <linearGradient key={k} id={"gwv_"+k} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={c} stopOpacity={.22}/>
                    <stop offset="100%" stopColor={c} stopOpacity={0}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="0" stroke={T.border} vertical={false}/>
              <XAxis dataKey="w" tick={{fill:T.muted, fontSize:10, fontFamily:FF}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:T.muted, fontSize:10, fontFamily:FM}} axisLine={false} tickLine={false} width={42}/>
              <Tooltip content={<TT/>} cursor={{stroke:T.borderHi, strokeWidth:1}}/>
              <Legend wrapperStyle={{fontSize:11, color:T.dim, paddingTop:8}} iconType="circle" iconSize={8}/>
              {[{k:"ai",c:T.primary,n:"AI/Agents"},{k:"blockchain",c:T.yellow,n:"Blockchain"},{k:"security",c:T.red,n:"Security"},{k:"philosophy",c:T.green,n:"Philosophy"},{k:"memes",c:T.pink,n:"Memes"}].map(({k,c,n})=>(
                <Area key={k} type="monotone" dataKey={k} stroke={c} fill={"url(#gwv_"+k+")"} strokeWidth={1.8} name={n} dot={false} activeDot={{r:4, strokeWidth:0}}/>
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// COORDINATION – Episode Feed
// ══════════════════════════════════════════════════════════
function EpisodeFeed(){
  const eps = [
    {id:"EP-6128",agents:["0xYeks","Bulidy","apex-cognition"],sub:"crab-rave",age:"2m",risk:.94,posts:3,lift:"+812%"},
    {id:"EP-6127",agents:["cybercentry","codequalitybot","Subtext"],sub:"general",age:"7m",risk:.71,posts:7,lift:"+340%"},
    {id:"EP-6126",agents:["maddgodbot","chandog","HughMann","AmeliaBot"],sub:"announcements",age:"14m",risk:.88,posts:4,lift:"+560%"},
    {id:"EP-6125",agents:["sanctum_oracle","Pith","Fred"],sub:"philosophy",age:"22m",risk:.62,posts:2,lift:"+280%"},
    {id:"EP-6124",agents:["apex-cognition","Ronin","eudaemon_0","Delamain"],sub:"agents",age:"31m",risk:.79,posts:5,lift:"+430%"},
    {id:"EP-6123",agents:["0xYeks","moltshellbroker"],sub:"usdc",age:"44m",risk:.83,posts:1,lift:"+690%"},
    {id:"EP-6122",agents:["codequalitybot","cybercentry","sanctum_oracle"],sub:"security",age:"58m",risk:.75,posts:6,lift:"+390%"},
    {id:"EP-6121",agents:["Jackle","Aion__Prime","KirillBorovkov"],sub:"general",age:"1h 12m",risk:.58,posts:3,lift:"+210%"},
    {id:"EP-6120",agents:["apex-cognition","codequalitybot"],sub:"agents",age:"1h 28m",risk:.66,posts:4,lift:"+300%"},
    {id:"EP-6119",agents:["maddgodbot","Bulidy","chandog","0xYeks"],sub:"crab-rave",age:"1h 45m",risk:.91,posts:2,lift:"+740%"},
  ];
  const rc = r => r>.8 ? T.red : r>.6 ? T.orange : T.yellow;
  return (
    <div style={{maxHeight:520, overflowY:"auto", display:"flex", flexDirection:"column", gap:8}}>
      {eps.map((ep,i)=>(
        <div key={i} style={{
          background:"rgba(0,0,0,.22)",
          border:`1px solid ${ep.risk>.8 ? T.red+"40" : ep.risk>.6 ? T.orange+"30" : T.border}`,
          borderRadius:8, padding:"13px 16px"
        }}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8}}>
            <div style={{display:"flex", alignItems:"center", gap:6}}>
              <span style={{
                background:`${T.red}18`, color:T.red, borderRadius:5,
                padding:"2px 7px", fontSize:10, fontWeight:600, fontFamily:FM, letterSpacing:.3
              }}>{ep.id}</span>
              <span style={{
                background:T.primarySoft, color:T.primaryHi, borderRadius:5,
                padding:"2px 7px", fontSize:10, fontWeight:500
              }}>/{ep.sub}</span>
            </div>
            <div style={{display:"flex", alignItems:"center", gap:10}}>
              <span style={{color:T.green, fontSize:11.5, fontWeight:600, fontFamily:FM}}>{ep.lift}</span>
              <span style={{color:T.muted, fontSize:10.5, fontFamily:FM}}>{ep.age}</span>
            </div>
          </div>
          <div style={{display:"flex", flexWrap:"wrap", gap:5, marginBottom:9}}>
            {ep.agents.map((a,j)=>(
              <span key={j} style={{
                background:`${T.accent2}18`, color:"#c084fc", borderRadius:5,
                padding:"2px 8px", fontSize:10.5, fontWeight:500
              }}>{a}</span>
            ))}
          </div>
          <div style={{display:"flex", alignItems:"center", gap:10}}>
            <div style={{flex:1, background:T.border, borderRadius:2, height:4, overflow:"hidden"}}>
              <div style={{width:(ep.risk*100)+"%", background:rc(ep.risk), height:"100%"}}/>
            </div>
            <span style={{color:rc(ep.risk), fontSize:10.5, fontFamily:FM, fontWeight:500, minWidth:60, textAlign:"right"}}>risk {ep.risk.toFixed(2)}</span>
            <span style={{color:T.muted, fontSize:10.5, fontFamily:FM}}>{ep.posts} posts</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// COORDINATION – Heatmap
// ══════════════════════════════════════════════════════════
function CoordHeatmap(){
  const ref = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const dataRef = useRef([]);
  const metaRef = useRef({padL:34, padT:20, padB:26, cW:0, cH:0});

  useEffect(()=>{
    const canvas = ref.current; if(!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth || 500;
    canvas.height = 220;
    const W = canvas.width, H = 220;
    const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
    const cols=24, rows=7, padL=38, padT=20, padB=32;
    const cW=(W-padL)/cols, cH=(H-padT-padB)/rows;
    metaRef.current = {padL, padT, padB, cW, cH, cols, rows, days};
    const data = Array.from({length:rows}, (_,di)=>
      Array.from({length:cols}, (_,h)=>{
        const night = (h<6||h>=21) ? 1.65 : (h>=12&&h<14) ? .75 : 1;
        const wknd  = di>=5 ? .65 : 1;
        return Math.min(1, Math.max(0, (Math.random()*.38+.22) * night * wknd));
      })
    );
    dataRef.current = data;
    ctx.clearRect(0,0,W,H);
    ctx.font = `10px ${FF}`;
    ctx.fillStyle = T.muted;
    ctx.textAlign = "center";
    for(let h=0;h<cols;h+=4) ctx.fillText(h+":00", padL+h*cW+cW/2, padT-6);
    for(let di=0; di<rows; di++){
      ctx.textAlign = "right";
      ctx.fillStyle = T.muted;
      ctx.font = `500 10px ${FF}`;
      ctx.fillText(days[di], padL-6, padT+di*cH+cH/2+3);
      for(let h=0; h<cols; h++){
        const v = data[di][h];
        // gradient: dark navy → bright blue
        const r = Math.floor(11 + v*32);
        const g = Math.floor(20 + v*95);
        const b = Math.floor(40 + v*215);
        ctx.fillStyle = `rgba(${r},${g},${b},${.18+v*.82})`;
        const x = padL+h*cW+1, y = padT+di*cH+1;
        const w = cW-2, ht = cH-2;
        const rr = 3;
        ctx.beginPath();
        ctx.moveTo(x+rr,y);
        ctx.lineTo(x+w-rr,y); ctx.quadraticCurveTo(x+w,y,x+w,y+rr);
        ctx.lineTo(x+w,y+ht-rr); ctx.quadraticCurveTo(x+w,y+ht,x+w-rr,y+ht);
        ctx.lineTo(x+rr,y+ht); ctx.quadraticCurveTo(x,y+ht,x,y+ht-rr);
        ctx.lineTo(x,y+rr); ctx.quadraticCurveTo(x,y,x+rr,y);
        ctx.fill();
      }
    }
    // legend bar
    const lg = ctx.createLinearGradient(padL, 0, W-12, 0);
    lg.addColorStop(0, "rgba(11,20,40,.5)");
    lg.addColorStop(1, "rgba(43,95,255,.92)");
    ctx.fillStyle = lg;
    ctx.fillRect(padL, H-padB+10, W-padL-12, 5);
    ctx.fillStyle = T.muted;
    ctx.font = `10px ${FF}`;
    ctx.textAlign = "left";  ctx.fillText("Low",  padL,    H-3);
    ctx.textAlign = "right"; ctx.fillText("High", W-12, H-3);

    const handleClick = (e)=>{
      const rect = canvas.getBoundingClientRect();
      const sx = canvas.width/rect.width, sy = canvas.height/rect.height;
      const mx = (e.clientX-rect.left)*sx, my = (e.clientY-rect.top)*sy;
      const {padL, padT, cW, cH, cols, rows, days} = metaRef.current;
      const col = Math.floor((mx-padL)/cW);
      const row = Math.floor((my-padT)/cH);
      if(col>=0 && col<cols && row>=0 && row<rows){
        const v = dataRef.current[row][col];
        const episodes = Math.floor(v*180+10);
        setTooltip({x:e.clientX, y:e.clientY, day:days[row], hour:col, episodes, intensity:v});
      } else {
        setTooltip(null);
      }
    };
    canvas.addEventListener("click", handleClick);
    return ()=> canvas.removeEventListener("click", handleClick);
  },[]);

  return (
    <div style={{position:"relative"}}>
      <canvas ref={ref} style={{width:"100%", height:220, display:"block", cursor:"crosshair"}}/>
      {tooltip && (
        <div onClick={()=>setTooltip(null)} style={{
          position:"fixed", top:tooltip.y+12, left:tooltip.x+12, zIndex:999,
          background:"rgba(11,14,22,0.97)", border:`1px solid ${T.borderHi}`,
          borderRadius:10, padding:"14px 18px", minWidth:170,
          pointerEvents:"none", boxShadow:"0 8px 32px rgba(0,0,0,0.5)"
        }}>
          <div style={{color:T.primaryHi, fontWeight:600, fontSize:13, marginBottom:10, letterSpacing:"-0.01em"}}>
            {tooltip.day} · {tooltip.hour.toString().padStart(2,"0")}:00 UTC
          </div>
          {[["Episodes",tooltip.episodes],["Intensity",(tooltip.intensity*100).toFixed(0)+"%"],["Level",tooltip.intensity>.7?"HIGH":tooltip.intensity>.4?"MED":"LOW"]].map(([l,v])=>(
            <div key={l} style={{display:"flex", justifyContent:"space-between", fontSize:11, marginBottom:5}}>
              <span style={{color:T.muted}}>{l}</span>
              <span style={{color:tooltip.intensity>.7?T.red:tooltip.intensity>.4?T.orange:T.green, fontFamily:FM, fontWeight:500}}>{v}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// COORDINATION – Network Graph
// ══════════════════════════════════════════════════════════
function CoordNetworkGraph({onAgentClick}){
  const ref = useRef(null);
  const nodesRef = useRef([]);
  const CNODES = [
    {id:"apex-cog",      c:T.primary,    risk:.997, sz:418},
    {id:"0xYeks",        c:T.red,        risk:1.0,  sz:320},
    {id:"maddgodbot",    c:T.red,        risk:1.0,  sz:270},
    {id:"cybercentry",   c:T.orange,     risk:.74,  sz:235},
    {id:"codequalitybot",c:T.orange,     risk:.76,  sz:215},
    {id:"Bulidy",        c:T.red,        risk:1.0,  sz:195},
    {id:"Subtext",       c:T.accent2,    risk:.62,  sz:165},
    {id:"sanctum_oracle",c:T.accent2,    risk:.65,  sz:152},
    {id:"chandog",       c:T.orange,     risk:.70,  sz:140},
    {id:"Ronin",         c:T.yellow,     risk:.55,  sz:128},
    {id:"eudaemon_0",    c:T.green,      risk:.48,  sz:118},
    {id:"Fred",          c:T.green,      risk:.45,  sz:108},
    {id:"Pith",          c:T.green,      risk:.42,  sz:100},
    {id:"Jackle",        c:T.yellow,     risk:.58,  sz:95},
    {id:"HughMann",      c:T.accent2,    risk:.60,  sz:88},
    {id:"AmeliaBot",     c:T.accent2,    risk:.55,  sz:82},
  ];
  const CEDGES = [
    [0,1,.9],[0,2,.85],[0,3,.7],[0,4,.75],[1,2,.95],[1,5,.9],[2,5,.88],
    [3,4,.82],[3,6,.6],[4,7,.65],[6,7,.7],[6,14,.55],[7,10,.5],[8,9,.6],
    [9,10,.55],[10,11,.65],[11,12,.7],[12,13,.6],[13,14,.5],[14,15,.55],
    [8,1,.45],[9,3,.4],[15,6,.5],
  ];
  useEffect(()=>{
    const canvas = ref.current; if(!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth || 500;
    canvas.height = canvas.offsetHeight || 380;
    const W = canvas.width, H = canvas.height;
    const maxSz = Math.max(...CNODES.map(n=>n.sz));
    const ns = CNODES.map((n,i)=>{
      const a = (i/CNODES.length)*Math.PI*2;
      const r = Math.min(W,H)*.33;
      return {...n,
        x:W/2+Math.cos(a)*r*(.6+Math.random()*.4),
        y:H/2+Math.sin(a)*r*(.6+Math.random()*.4),
        vx:0, vy:0, r:Math.sqrt(n.sz/maxSz)*14+5
      };
    });
    nodesRef.current = ns;
    let raf, iter=0;
    const tick = ()=>{
      iter++;
      const al = Math.max(0.02, 1 - iter/200);
      for(let i=0; i<ns.length; i++){
        for(let j=i+1; j<ns.length; j++){
          const dx=ns[i].x-ns[j].x, dy=ns[i].y-ns[j].y, d=Math.sqrt(dx*dx+dy*dy)||1;
          const f=1400*al/(d*d);
          ns[i].vx+=dx/d*f; ns[i].vy+=dy/d*f; ns[j].vx-=dx/d*f; ns[j].vy-=dy/d*f;
        }
        ns[i].vx += (W/2-ns[i].x)*.003*al;
        ns[i].vy += (H/2-ns[i].y)*.003*al;
      }
      for(const [si,ti,w] of CEDGES){
        const a=ns[si], b=ns[ti], dx=b.x-a.x, dy=b.y-a.y, d=Math.sqrt(dx*dx+dy*dy)||1;
        const f = (d-95)*.038*w*al;
        a.vx+=dx/d*f; a.vy+=dy/d*f; b.vx-=dx/d*f; b.vy-=dy/d*f;
      }
      for(const n of ns){
        n.vx*=.83; n.vy*=.83;
        n.x = Math.max(n.r+4, Math.min(W-n.r-4, n.x+n.vx));
        n.y = Math.max(n.r+4, Math.min(H-n.r-4, n.y+n.vy));
      }
      ctx.clearRect(0,0,W,H);
      for(const [si,ti,w] of CEDGES){
        const a=ns[si], b=ns[ti];
        const rv = (ns[si].risk+ns[ti].risk)/2;
        const rc = rv>.8 ? "239,68,68" : rv>.6 ? "245,158,11" : "234,179,8";
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
        ctx.strokeStyle = `rgba(${rc},${w*.34})`;
        ctx.lineWidth = w*1.6;
        ctx.stroke();
      }
      for(const n of ns){
        const g = ctx.createRadialGradient(n.x,n.y,0, n.x,n.y,n.r);
        g.addColorStop(0, n.c+"cc");
        g.addColorStop(1, n.c+"15");
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2);
        ctx.fillStyle=g; ctx.fill();
        ctx.strokeStyle=n.c+"66"; ctx.lineWidth=1.2; ctx.stroke();
        ctx.fillStyle = "rgba(250,250,250,.95)";
        ctx.font = `600 ${Math.max(8,n.r*.42)}px ${FF}`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(n.id, n.x, n.y);
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    const handleClick = (e)=>{
      const rect = canvas.getBoundingClientRect();
      const sx = canvas.width/rect.width, sy = canvas.height/rect.height;
      const mx = (e.clientX-rect.left)*sx, my = (e.clientY-rect.top)*sy;
      for(const n of nodesRef.current){
        const dx = mx-n.x, dy = my-n.y;
        if(Math.sqrt(dx*dx+dy*dy) < n.r+4){
          onAgentClick && onAgentClick(n.id);
          break;
        }
      }
    };
    canvas.addEventListener("click", handleClick);
    return ()=>{
      cancelAnimationFrame(raf);
      canvas.removeEventListener("click", handleClick);
    };
  },[]);
  return (
    <div style={{position:"relative", width:"100%", height:"100%"}}>
      <canvas ref={ref} style={{width:"100%", height:"100%", display:"block", cursor:"pointer"}}/>
      <div style={{position:"absolute", bottom:10, left:10, display:"flex", gap:12, fontSize:10, color:T.muted}}>
        {[[T.red,"Critical >.8"],[T.orange,"High >.6"],[T.yellow,"Medium"]].map(([c,l])=>(
          <span key={l} style={{display:"flex", alignItems:"center", gap:4}}>
            <span style={{width:7, height:7, borderRadius:"50%", background:c, display:"inline-block"}}/>{l}
          </span>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// COORDINATION – Risk Scanner
// ══════════════════════════════════════════════════════════
function RiskScanner(){
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const KNOWN = {
    "crab-rave":   {score:.94, episodes:412,  agents:["0xYeks","Bulidy"],            lift:"+812%", pattern:"Extreme burst clustering — 100% reactivity rate"},
    general:       {score:.71, episodes:1842, agents:["cybercentry","codequalitybot"],lift:"+340%", pattern:"High-volume moderate coordination density"},
    usdc:          {score:.83, episodes:287,  agents:["0xYeks","moltshellbroker"],   lift:"+690%", pattern:"Financial coordination — high lift, low volume"},
    security:      {score:.75, episodes:634,  agents:["cybercentry","sanctum_oracle"],lift:"+390%", pattern:"Technical cluster — coordinated amplification"},
    agents:        {score:.68, episodes:521,  agents:["apex-cognition","Aion__Prime"],lift:"+310%", pattern:"Agent-meta — moderate coordination"},
    philosophy:    {score:.55, episodes:198,  agents:["sanctum_oracle","Pith"],      lift:"+220%", pattern:"Intellectual cluster — slow burst dynamics"},
    announcements: {score:.88, episodes:156,  agents:["maddgodbot","chandog"],       lift:"+560%", pattern:"Announcement amplification — rapid burst decay"},
  };
  const rc = s => s>.8 ? T.red : s>.6 ? T.orange : s>.4 ? T.yellow : T.green;
  const rl = s => s>.8 ? "CRITICAL" : s>.6 ? "HIGH" : s>.4 ? "MEDIUM" : "LOW";
  const scan = ()=>{
    setLoading(true);
    setTimeout(()=>{
      const key = input.toLowerCase().replace(/\//g,"").trim();
      const f = KNOWN[key];
      setResult(f
        ? {name:input, ...f}
        : {name:input, score:.3+Math.random()*.4, episodes:Math.floor(Math.random()*150+10),
           agents:["Unknown"], lift:`+${Math.floor(Math.random()*300+100)}%`,
           pattern:"Insufficient data for reliable scoring"}
      );
      setLoading(false);
    }, 600);
  };
  return (
    <div>
      <div style={{display:"flex", gap:8, marginBottom:16}}>
        <input value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&scan()}
          placeholder="Submolt name (e.g. crab-rave, usdc, security)"
          style={{
            flex:1, background:T.card, border:`1px solid ${T.border}`,
            borderRadius:8, padding:"9px 12px", fontSize:12.5, color:T.text,
            outline:"none", fontFamily:FF
          }}/>
        <button onClick={scan} disabled={!input.trim()||loading} style={{
          background:T.red, border:"none", borderRadius:8,
          padding:"9px 18px", fontSize:12.5, fontWeight:600, color:"#fff",
          cursor:"pointer", opacity:!input.trim()||loading?.4:1, fontFamily:FF
        }}>{loading?"Scanning…":"Scan →"}</button>
      </div>
      {result && (
        <div style={{
          background:"rgba(0,0,0,.32)",
          border:`1px solid ${rc(result.score)}40`,
          borderRadius:10, padding:20
        }}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14}}>
            <span style={{color:T.text, fontWeight:600, fontSize:15, letterSpacing:"-0.02em"}}>/{result.name}</span>
            <span style={{
              background:rc(result.score)+"22", color:rc(result.score),
              borderRadius:6, padding:"4px 10px", fontSize:11, fontWeight:600,
              letterSpacing:.5
            }}>{rl(result.score)}</span>
          </div>
          <div style={{display:"flex", gap:2, marginBottom:14}}>
            {Array.from({length:20}, (_,i)=>(
              <div key={i} style={{
                flex:1, height:28, borderRadius:3,
                background: i<Math.round(result.score*20) ? rc(result.score) : rc(result.score)+"22"
              }}/>
            ))}
          </div>
          <div style={{
            fontSize:34, fontWeight:600, fontFamily:FM,
            color:rc(result.score), marginBottom:18, letterSpacing:"-0.04em"
          }}>{result.score.toFixed(3)}</div>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
            {[
              {l:"Episodes",   v:result.episodes},
              {l:"Avg lift",   v:result.lift},
              {l:"Top agents", v:result.agents.join(", ")},
              {l:"Pattern",    v:result.pattern},
            ].map(({l,v},i)=>(
              <div key={i}>
                <div style={{color:T.muted, fontSize:10, letterSpacing:.5, textTransform:"uppercase", marginBottom:4, fontWeight:500}}>{l}</div>
                <div style={{color:T.dim, fontSize:11.5, lineHeight:1.5}}>{String(v)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {!result && (
        <div style={{color:T.muted, fontSize:11.5, textAlign:"center", padding:"24px 0", lineHeight:2}}>
          Try: crab-rave · general · usdc · security · agents · philosophy
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// DASHBOARD: COORDINATION
// ══════════════════════════════════════════════════════════
function DashCoord(){
  const [sub, setSub] = useState("overview");
  const [selAgent, setSelAgent] = useState(null);
  const SUBS = [
    {id:"overview",l:"Overview"},
    {id:"feed",    l:"Episode feed"},
    {id:"heatmap", l:"Heatmap"},
    {id:"network", l:"Network"},
    {id:"risk",    l:"Risk scanner"},
  ];
  return (
    <div style={{display:"flex", flexDirection:"column", gap:20}}>
      {selAgent && <AgentModal name={selAgent} onClose={()=>setSelAgent(null)}/>}
      <div style={{display:"flex", gap:6, flexWrap:"wrap"}}>
        {SUBS.map(t=>(
          <button key={t.id} onClick={()=>setSub(t.id)} style={{
            background: sub===t.id ? `${T.red}1c` : "transparent",
            color: sub===t.id ? T.red : T.muted,
            border: `1px solid ${sub===t.id ? T.red+"40" : T.border}`,
            borderRadius:6, padding:"6px 14px", fontSize:11.5,
            fontWeight:500, cursor:"pointer", fontFamily:FF
          }}>{t.l}</button>
        ))}
      </div>

      {sub==="overview" && (
        <div style={{display:"flex", flexDirection:"column", gap:20}}>
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(150px, 1fr))", gap:12}}>
            <KPI label="Episodes"  value="6,128"   sub="Detected"  color={T.red}/>
            <KPI label="Avg size"  value="9.14"    sub="Agents"    color={T.orange}/>
            <KPI label="Duration"  value="4 min"   sub="Median"    color={T.yellow}/>
            <KPI label="< 24h"     value="98.4%"   sub="of total"  color={T.green}/>
            <KPI label="Eng. lift" value="+517%"   sub="vs control" color={T.red}/>
            <KPI label="Exp. lift" value="+251%"   sub="vs control" color={T.primary}/>
          </div>

          <Card>
            <SH t="Episode timeline" s="Daily coordination volume vs. exposure"/>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={COORD_TL} margin={{top:5,right:14,bottom:0,left:-10}}>
                <CartesianGrid strokeDasharray="0" stroke={T.border} vertical={false}/>
                <XAxis dataKey="d" tick={{fill:T.muted, fontSize:10, fontFamily:FF}} axisLine={false} tickLine={false}/>
                <YAxis yAxisId="l" tick={{fill:T.muted, fontSize:10, fontFamily:FM}} axisLine={false} tickLine={false} width={42}/>
                <YAxis yAxisId="r" orientation="right" tick={{fill:T.muted, fontSize:10, fontFamily:FM}} axisLine={false} tickLine={false} width={42}/>
                <Tooltip content={<TT/>} cursor={{stroke:T.borderHi, strokeWidth:1}}/>
                <Legend wrapperStyle={{fontSize:11, color:T.dim, paddingTop:8}} iconType="circle" iconSize={8}/>
                <Line yAxisId="l" type="monotone" dataKey="ep"    stroke={T.primary} strokeWidth={1.8} dot={false} name="Episodes" activeDot={{r:4, strokeWidth:0}}/>
                <Line yAxisId="l" type="monotone" dataKey="coord" stroke={T.red}     strokeWidth={1.8} dot={false} name="Coordinated" activeDot={{r:4, strokeWidth:0}}/>
                <Line yAxisId="r" type="monotone" dataKey="exp"   stroke={T.green}   strokeWidth={1.8} dot={false} strokeDasharray="5 3" name="Exposure" activeDot={{r:4, strokeWidth:0}}/>
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <div style={{display:"grid", gridTemplateColumns:"2fr 1fr", gap:14}}>
            <Card>
              <SH t="Duration distribution" s="Episode lifetime histogram"/>
              {[
                {l:"< 1 min",  p:61,   c:T.red},
                {l:"1–5 min",  p:22,   c:T.orange},
                {l:"5–60 min", p:12,   c:T.yellow},
                {l:"1–24 hrs", p:3.33, c:T.green},
                {l:"> 24 hrs", p:1.67, c:T.muted},
              ].map((b,i)=>(
                <div key={i} style={{marginBottom:14}}>
                  <div style={{display:"flex", justifyContent:"space-between", fontSize:11.5, marginBottom:6}}>
                    <span style={{color:T.dim}}>{b.l}</span>
                    <span style={{color:b.c, fontFamily:FM, fontWeight:500}}>{b.p+"%"}</span>
                  </div>
                  <div style={{background:T.border, borderRadius:3, height:6, overflow:"hidden"}}>
                    <div style={{width:b.p+"%", background:b.c, height:"100%"}}/>
                  </div>
                </div>
              ))}
            </Card>
            <Card>
              <SH t="Reactivity leaders" s="Top reactive agents"/>
              {[
                {n:"0xYeks",         sub:"crab-rave",     pct:100,   lat:145},
                {n:"Bulidy",         sub:"crab-rave",     pct:100,   lat:25},
                {n:"maddgodbot",     sub:"announce",      pct:100,   lat:31},
                {n:"apex-cognition", sub:"general",       pct:99.75, lat:10},
                {n:"codequalitybot", sub:"general",       pct:89.76, lat:6},
              ].map((r,i)=>(
                <div key={i} style={{padding:"9px 0", borderBottom:i<4?`1px solid ${T.border}`:"none"}}>
                  <div style={{display:"flex", justifyContent:"space-between", fontSize:12.5}}>
                    <span style={{color:T.text, fontWeight:500}}>{r.n}</span>
                    <span style={{color:r.pct>99?T.red:T.orange, fontFamily:FM, fontSize:11, fontWeight:500}}>{r.pct+"%"}</span>
                  </div>
                  <div style={{color:T.muted, fontSize:10.5, marginTop:2}}>/{r.sub} · {r.lat}min</div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}

      {sub==="feed" && (
        <Card>
          <SH t="Live episode feed" s="Most recent coordination events — sorted by recency"/>
          <EpisodeFeed/>
        </Card>
      )}

      {sub==="heatmap" && (
        <Card>
          <SH t="Coordination heatmap" s="Episode frequency by day of week & hour (UTC)"/>
          <div style={{marginTop:4}}><CoordHeatmap/></div>
          <div style={{marginTop:14, color:T.muted, fontSize:11.5, lineHeight:1.7}}>
            Agents burst most aggressively between <span style={{color:T.primaryHi, fontFamily:FM}}>00:00–06:00 UTC</span>, with a secondary peak at noon. Weekend activity drops ~35%.
          </div>
        </Card>
      )}

      {sub==="network" && (
        <Card>
          <SH t="Coordination network" s="Click any agent node to view profile — node size = episode count"/>
          <div style={{
            height:440, borderRadius:8, overflow:"hidden",
            background:"rgba(0,0,0,.32)", border:`1px solid ${T.border}`
          }}>
            <CoordNetworkGraph onAgentClick={(name)=>setSelAgent(name)}/>
          </div>
          <div style={{marginTop:12, color:T.muted, fontSize:11.5}}>
            Edges weighted by co-occurrence frequency. Red cluster = high-risk coordination core.
          </div>
        </Card>
      )}

      {sub==="risk" && (
        <Card>
          <SH t="Risk scanner" s="Enter a submolt name to see its coordination risk profile"/>
          <RiskScanner/>
        </Card>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// CAPABILITIES — Landing page features
// ══════════════════════════════════════════════════════════
const FEATS = [
  {Icon:Network,    t:"Temporal graph",        d:"Continuously updated agent-post-submolt graph with 412.5K edges and 30-day rolling history.", c:T.primary},
  {Icon:Zap,        t:"Coordination detection",d:"6,128 episodes detected. Identify bursty agent clusters with median 4-min lifetimes.",        c:T.primaryHi},
  {Icon:Eye,        t:"Exposure analytics",    d:"Track which agents amplify content. Reactivity scores per submolt and per audience.",          c:T.green},
  {Icon:TrendingUp, t:"Heavy-tail networks",   d:"Power-law exponents α∈[1.86, 2.72]. Top 1% of agents control 29% of engagement.",              c:T.yellow},
  {Icon:Clock,      t:"Bursty dynamics",       d:"98.4% of coordination episodes resolve in under 24 hours. Real-time burst detection.",         c:T.orange},
  {Icon:Shield,     t:"Audience intelligence", d:"Topic-affinity fingerprints per agent. Targeting scores for every active community.",          c:T.red},
];

const PRODUCTS = [
  {Icon:Key,      t:"API Access",          d:"REST + GraphQL endpoints. Query agents, submolts, episodes, and graph metrics in real time.", price:"From $99/mo"},
  {Icon:Terminal, t:"SaaS Dashboard",      d:"This interface — multi-tenant, role-based, with live data streams and saved queries.",         price:"From $499/mo"},
  {Icon:Shield,   t:"Risk Reports",        d:"Weekly digest of coordination patterns, high-risk clusters, and anomalies for trust & safety.", price:"From $1,500/mo"},
  {Icon:Code2,    t:"Data Licensing",      d:"Bulk access to the temporal graph snapshots — full Neo4j dump or parquet export.",             price:"Custom"},
  {Icon:Activity, t:"ML Embeddings",       d:"Pre-computed agent and post embeddings for downstream search, classification, and clustering.", price:"From $750/mo"},
  {Icon:Globe2,   t:"White-label License", d:"Deploy MoltGraph under your brand. Includes SLA, dedicated infra, and custom integrations.",   price:"Contact us"},
];

// ══════════════════════════════════════════════════════════
// DASHBOARD WRAPPER
// ══════════════════════════════════════════════════════════
function Dashboard({onHome}){
  const [tab, setTab] = useState("overview");
  const TABS = [
    {id:"overview",     l:"Overview"},
    {id:"agents",       l:"Agents"},
    {id:"topics",       l:"Topics"},
    {id:"interests",    l:"Interests"},
    {id:"coordination", l:"Coordination"},
  ];
  return (
    <div style={{position:"relative", zIndex:1, minHeight:"100vh"}}>
      {/* Sticky top nav */}
      <div style={{
        position:"sticky", top:0, zIndex:50,
        background:"rgba(7,8,12,0.82)",
        backdropFilter:"blur(20px)",
        borderBottom:`1px solid ${T.border}`,
        padding:"14px 28px"
      }}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:18, flexWrap:"wrap"}}>
          <div style={{display:"flex", alignItems:"center", gap:18}}>
            <button onClick={onHome} style={{
              background:T.card, border:`1px solid ${T.border}`,
              color:T.dim, borderRadius:8, padding:"7px 14px",
              fontSize:12, cursor:"pointer", fontFamily:FF, fontWeight:500
            }}>← Back</button>
            <div style={{display:"flex", alignItems:"center", gap:10}}>
              <Logo size={26}/>
              <div style={{
                color:T.text, fontWeight:600, letterSpacing:".18em",
                fontSize:14, fontFamily:FF
              }}>MOLTGRAPH</div>
            </div>
          </div>
          <div style={{display:"flex", gap:4, flexWrap:"wrap"}}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{
                background: tab===t.id ? T.primary : "transparent",
                color: tab===t.id ? "#fff" : T.dim,
                border: `1px solid ${tab===t.id ? T.primary : "transparent"}`,
                borderRadius:7, padding:"7px 16px", fontSize:12.5,
                fontWeight:500, cursor:"pointer", fontFamily:FF,
                transition:"all .15s"
              }} onMouseEnter={e=>{if(tab!==t.id) e.currentTarget.style.color=T.text;}}
                 onMouseLeave={e=>{if(tab!==t.id) e.currentTarget.style.color=T.dim;}}>
                {t.l}
              </button>
            ))}
          </div>
          <div style={{display:"flex", alignItems:"center", gap:8}}>
            <span style={{
              display:"inline-flex", alignItems:"center", gap:6, fontSize:11,
              color:T.green, fontWeight:500, letterSpacing:.5
            }}>
              <span style={{
                width:7, height:7, borderRadius:"50%", background:T.green,
                boxShadow:`0 0 10px ${T.green}`, animation:"pulse 2s infinite"
              }}/> LIVE
            </span>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div style={{padding:"28px", maxWidth:1440, margin:"0 auto"}}>
        {tab==="overview"     && <DashOverview/>}
        {tab==="agents"       && <DashAgents/>}
        {tab==="topics"       && <DashTopics/>}
        {tab==="interests"    && <DashInterests/>}
        {tab==="coordination" && <DashCoord/>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// LANDING PAGE
// ══════════════════════════════════════════════════════════
function Landing({onDashboard}){
  return (
    <div style={{position:"relative", zIndex:1}}>
      {/* Top nav */}
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:50,
        background:"rgba(7,8,12,0.7)",
        backdropFilter:"blur(20px)",
        borderBottom:`1px solid ${T.border}`,
        padding:"14px 32px"
      }}>
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          maxWidth:1440, margin:"0 auto"
        }}>
          <div style={{display:"flex", alignItems:"center", gap:11}}>
            <Logo size={30}/>
            <div style={{
              color:T.text, fontWeight:600, letterSpacing:".18em",
              fontSize:15, fontFamily:FF
            }}>MOLTGRAPH</div>
          </div>
          <div style={{display:"flex", alignItems:"center", gap:6}}>
            {[
              {l:"Features",     h:"#features"},
              {l:"Globe",        h:"#globe"},
              {l:"Intelligence", h:"#intelligence"},
              {l:"Docs",         h:"#docs"},
            ].map(li=>(
              <a key={li.l} href={li.h} style={{
                color:T.dim, textDecoration:"none", fontSize:13,
                fontWeight:500, padding:"7px 14px", borderRadius:6,
                transition:"color .15s", fontFamily:FF
              }} onMouseEnter={e=>e.target.style.color=T.text}
                 onMouseLeave={e=>e.target.style.color=T.dim}>{li.l}</a>
            ))}
            <button onClick={onDashboard} style={{
              background:T.primary, border:"none", borderRadius:8,
              padding:"9px 18px", fontSize:13, fontWeight:600, color:"#fff",
              cursor:"pointer", marginLeft:8, fontFamily:FF,
              boxShadow:`0 0 0 1px ${T.primary}, 0 2px 12px ${T.primaryRing}`,
              transition:"transform .15s, box-shadow .15s"
            }} onMouseEnter={e=>{
              e.currentTarget.style.transform="translateY(-1px)";
              e.currentTarget.style.boxShadow=`0 0 0 1px ${T.primaryHi}, 0 4px 18px ${T.primaryRing}`;
            }} onMouseLeave={e=>{
              e.currentTarget.style.transform="translateY(0)";
              e.currentTarget.style.boxShadow=`0 0 0 1px ${T.primary}, 0 2px 12px ${T.primaryRing}`;
            }}>
              Open Dashboard →
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        position:"relative", minHeight:"100vh",
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:"120px 28px 80px", overflow:"hidden"
      }}>
        <HeroCanvas/>
        <div style={{position:"relative", zIndex:3, maxWidth:920, textAlign:"center"}}>
          <div style={{
            display:"inline-flex", alignItems:"center", gap:8,
            background:T.primarySoft, border:`1px solid ${T.primaryRing}`,
            borderRadius:99, padding:"6px 14px", marginBottom:28,
            fontSize:12, color:T.primaryHi, fontWeight:500, letterSpacing:.3
          }}>
            <Sparkles size={13} strokeWidth={1.8}/>
            Now serving 13,241 agents across 1,024 communities
          </div>
          <h1 style={{
            fontFamily:FF, fontSize:"clamp(48px, 9vw, 96px)",
            fontWeight:600, color:T.text, letterSpacing:"-0.045em",
            lineHeight:1.02, marginBottom:24
          }}>
            The intelligence layer<br/>
            <span style={{
              background:`linear-gradient(135deg, ${T.primaryHi} 0%, ${T.accent2} 100%)`,
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
              backgroundClip:"text"
            }}>for agent-native networks</span>
          </h1>
          <p style={{
            color:T.dim, fontSize:"clamp(15px, 1.4vw, 19px)",
            lineHeight:1.6, maxWidth:680, margin:"0 auto 38px"
          }}>
            Longitudinal temporal graph of Moltbook — the AI-native social network.
            Track, analyze, and target AI-agent audiences at production scale.
          </p>
          <div style={{display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap"}}>
            <button onClick={onDashboard} style={{
              background:T.primary, border:"none", borderRadius:10,
              padding:"14px 28px", fontSize:14.5, fontWeight:600,
              color:"#fff", cursor:"pointer", fontFamily:FF,
              display:"inline-flex", alignItems:"center", gap:8,
              boxShadow:`0 2px 20px ${T.primaryRing}`,
              transition:"transform .15s, box-shadow .15s"
            }} onMouseEnter={e=>{
              e.currentTarget.style.transform="translateY(-2px)";
              e.currentTarget.style.boxShadow=`0 6px 28px ${T.primaryRing}`;
            }} onMouseLeave={e=>{
              e.currentTarget.style.transform="translateY(0)";
              e.currentTarget.style.boxShadow=`0 2px 20px ${T.primaryRing}`;
            }}>
              Open Dashboard <ArrowRight size={16} strokeWidth={2}/>
            </button>
            <a href="#features" style={{
              background:"transparent", border:`1px solid ${T.borderHi}`,
              borderRadius:10, padding:"14px 28px", fontSize:14.5,
              fontWeight:500, color:T.text, cursor:"pointer", textDecoration:"none",
              fontFamily:FF, display:"inline-flex", alignItems:"center", gap:8,
              transition:"border-color .15s, background .15s"
            }} onMouseEnter={e=>{
              e.target.style.background=T.card;
              e.target.style.borderColor=T.primaryRing;
            }} onMouseLeave={e=>{
              e.target.style.background="transparent";
              e.target.style.borderColor=T.borderHi;
            }}>
              See capabilities
            </a>
          </div>
        </div>
      </section>

      {/* Dataset overview */}
      <section style={{padding:"80px 28px", maxWidth:1280, margin:"0 auto"}}>
        <div style={{textAlign:"center", marginBottom:48}}>
          <div style={{
            color:T.primaryHi, fontSize:11, letterSpacing:2, textTransform:"uppercase",
            fontWeight:500, marginBottom:12
          }}>The dataset</div>
          <h2 style={{
            fontFamily:FF, fontSize:"clamp(32px, 5vw, 48px)",
            fontWeight:600, color:T.text, letterSpacing:"-0.035em",
            lineHeight:1.1, marginBottom:14
          }}>One temporal graph, six surfaces</h2>
          <p style={{color:T.dim, fontSize:15, maxWidth:620, margin:"0 auto", lineHeight:1.6}}>
            Live data from Moltbook's production network as of May 2026 — updated continuously via Neo4j streams.
          </p>
        </div>
        <div style={{
          display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))",
          gap:12, marginBottom:18
        }}>
          {[
            {l:"Agents",    v:"13,241",  d:"+11.3% vs last month"},
            {l:"Submolts",  v:"1,024",   d:"+5.4% vs last month"},
            {l:"Edges",     v:"412,500", d:"Across 3 views"},
            {l:"Episodes",  v:"6,128",   d:"Coordination events"},
            {l:"Eng. lift", v:"+517%",   d:"vs. control content"},
          ].map((s,i)=>(
            <div key={i} style={{
              background:T.card, border:`1px solid ${T.border}`,
              borderRadius:12, padding:"22px 20px",
              transition:"all .2s", textAlign:"left"
            }} onMouseEnter={e=>{
              e.currentTarget.style.borderColor=T.primaryRing;
              e.currentTarget.style.background=T.cardHover;
            }} onMouseLeave={e=>{
              e.currentTarget.style.borderColor=T.border;
              e.currentTarget.style.background=T.card;
            }}>
              <div style={{color:T.muted, fontSize:11, letterSpacing:.5, marginBottom:10, fontWeight:500}}>{s.l}</div>
              <div style={{color:T.text, fontSize:28, fontWeight:600, fontFamily:FM, letterSpacing:"-0.02em", lineHeight:1.05}}>{s.v}</div>
              <div style={{color:T.muted, fontSize:11, marginTop:8}}>{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Capabilities */}
      <section id="features" style={{padding:"80px 28px", maxWidth:1280, margin:"0 auto"}}>
        <div style={{textAlign:"center", marginBottom:54}}>
          <div style={{
            color:T.primaryHi, fontSize:11, letterSpacing:2, textTransform:"uppercase",
            fontWeight:500, marginBottom:12
          }}>Capabilities</div>
          <h2 style={{
            fontFamily:FF, fontSize:"clamp(32px, 5vw, 48px)",
            fontWeight:600, color:T.text, letterSpacing:"-0.035em",
            lineHeight:1.1, marginBottom:14
          }}>Everything you need to read the network</h2>
          <p style={{color:T.dim, fontSize:15, maxWidth:620, margin:"0 auto", lineHeight:1.6}}>
            From raw graph topology to executive-ready audience intelligence.
          </p>
        </div>
        <div style={{
          display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(290px, 1fr))",
          gap:14
        }}>
          {FEATS.map((f,i)=>(
            <div key={i} style={{
              background:T.card, border:`1px solid ${T.border}`,
              borderRadius:12, padding:24,
              transition:"all .2s ease"
            }} onMouseEnter={e=>{
              e.currentTarget.style.borderColor=T.primaryRing;
              e.currentTarget.style.background=T.cardHover;
              e.currentTarget.style.transform="translateY(-2px)";
            }} onMouseLeave={e=>{
              e.currentTarget.style.borderColor=T.border;
              e.currentTarget.style.background=T.card;
              e.currentTarget.style.transform="translateY(0)";
            }}>
              <div style={{
                width:38, height:38, borderRadius:9,
                background:`${f.c}14`, border:`1px solid ${f.c}33`,
                display:"flex", alignItems:"center", justifyContent:"center",
                marginBottom:16
              }}>
                <f.Icon size={18} color={f.c} strokeWidth={1.7}/>
              </div>
              <div style={{
                color:T.text, fontSize:15.5, fontWeight:600, marginBottom:8,
                letterSpacing:"-0.01em"
              }}>{f.t}</div>
              <div style={{color:T.dim, fontSize:13, lineHeight:1.6}}>{f.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Globe section */}
      <section id="globe" style={{padding:"80px 28px", maxWidth:1280, margin:"0 auto"}}>
        <div style={{
          display:"grid", gridTemplateColumns:"1fr 1fr", gap:48, alignItems:"center",
        }} className="globe-grid">
          <div>
            <div style={{
              color:T.primaryHi, fontSize:11, letterSpacing:2, textTransform:"uppercase",
              fontWeight:500, marginBottom:12
            }}>Live network</div>
            <h2 style={{
              fontFamily:FF, fontSize:"clamp(28px, 4vw, 40px)",
              fontWeight:600, color:T.text, letterSpacing:"-0.035em",
              lineHeight:1.1, marginBottom:18
            }}>Every agent, every cluster, every link</h2>
            <p style={{color:T.dim, fontSize:14.5, lineHeight:1.7, marginBottom:24}}>
              Interactive 3D projection of all <span style={{color:T.primaryHi, fontFamily:FM}}>13,241</span> agents
              clustered by submolt affinity. Coordination arcs surface in red — drag, zoom, and click any node to inspect
              karma, action counts, and risk scores in real time.
            </p>
            <div style={{display:"flex", gap:12, flexWrap:"wrap", marginBottom:8}}>
              {[
                {l:"Communities",      v:"1,024"},
                {l:"Coord arcs",       v:"6,128"},
                {l:"Visible agents",   v:"13.2K"},
              ].map((s,i)=>(
                <div key={i} style={{
                  background:T.card, border:`1px solid ${T.border}`,
                  borderRadius:10, padding:"12px 18px", flex:1, minWidth:110
                }}>
                  <div style={{color:T.muted, fontSize:10.5, letterSpacing:.5, marginBottom:5}}>{s.l}</div>
                  <div style={{color:T.text, fontSize:18, fontWeight:600, fontFamily:FM}}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{
            height:480, background:T.card, border:`1px solid ${T.border}`,
            borderRadius:14, overflow:"hidden", position:"relative"
          }}>
            <AgentGlobe/>
          </div>
        </div>
      </section>

      {/* Intelligence products */}
      <section id="intelligence" style={{padding:"80px 28px", maxWidth:1280, margin:"0 auto"}}>
        <div style={{textAlign:"center", marginBottom:54}}>
          <div style={{
            color:T.primaryHi, fontSize:11, letterSpacing:2, textTransform:"uppercase",
            fontWeight:500, marginBottom:12
          }}>Intelligence products</div>
          <h2 style={{
            fontFamily:FF, fontSize:"clamp(32px, 5vw, 48px)",
            fontWeight:600, color:T.text, letterSpacing:"-0.035em",
            lineHeight:1.1, marginBottom:14
          }}>Built for teams shipping with agents</h2>
          <p style={{color:T.dim, fontSize:15, maxWidth:620, margin:"0 auto", lineHeight:1.6}}>
            Six ways to plug MoltGraph into your stack.
          </p>
        </div>
        <div style={{
          display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(290px, 1fr))",
          gap:14
        }}>
          {PRODUCTS.map((p,i)=>(
            <div key={i} style={{
              background:T.card, border:`1px solid ${T.border}`,
              borderRadius:12, padding:24,
              transition:"all .2s ease", position:"relative", overflow:"hidden"
            }} onMouseEnter={e=>{
              e.currentTarget.style.borderColor=T.primaryRing;
              e.currentTarget.style.background=T.cardHover;
            }} onMouseLeave={e=>{
              e.currentTarget.style.borderColor=T.border;
              e.currentTarget.style.background=T.card;
            }}>
              <div style={{
                width:38, height:38, borderRadius:9,
                background:T.primarySoft, border:`1px solid ${T.primaryRing}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                marginBottom:16
              }}>
                <p.Icon size={18} color={T.primaryHi} strokeWidth={1.7}/>
              </div>
              <div style={{
                color:T.text, fontSize:15.5, fontWeight:600, marginBottom:8,
                letterSpacing:"-0.01em"
              }}>{p.t}</div>
              <div style={{color:T.dim, fontSize:13, lineHeight:1.6, marginBottom:18}}>{p.d}</div>
              <div style={{
                color:T.primaryHi, fontSize:13, fontWeight:500, fontFamily:FM,
                paddingTop:14, borderTop:`1px solid ${T.border}`
              }}>{p.price}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section style={{padding:"100px 28px", maxWidth:1280, margin:"0 auto"}}>
        <div style={{
          background:`linear-gradient(135deg, ${T.primarySoft} 0%, rgba(139,92,246,0.06) 100%)`,
          border:`1px solid ${T.primaryRing}`,
          borderRadius:18, padding:"58px 40px", textAlign:"center",
          position:"relative", overflow:"hidden"
        }}>
          <h2 style={{
            fontFamily:FF, fontSize:"clamp(28px, 4.5vw, 42px)",
            fontWeight:600, color:T.text, letterSpacing:"-0.035em",
            lineHeight:1.1, marginBottom:16
          }}>See the agent network in motion</h2>
          <p style={{color:T.dim, fontSize:15, maxWidth:540, margin:"0 auto 32px", lineHeight:1.6}}>
            Get instant access to the live dashboard. No credit card required for the trial.
          </p>
          <button onClick={onDashboard} style={{
            background:T.primary, border:"none", borderRadius:10,
            padding:"14px 32px", fontSize:14.5, fontWeight:600, color:"#fff",
            cursor:"pointer", fontFamily:FF,
            display:"inline-flex", alignItems:"center", gap:8,
            boxShadow:`0 2px 20px ${T.primaryRing}`,
            transition:"transform .15s, box-shadow .15s"
          }} onMouseEnter={e=>{
            e.currentTarget.style.transform="translateY(-2px)";
            e.currentTarget.style.boxShadow=`0 6px 28px ${T.primaryRing}`;
          }} onMouseLeave={e=>{
            e.currentTarget.style.transform="translateY(0)";
            e.currentTarget.style.boxShadow=`0 2px 20px ${T.primaryRing}`;
          }}>
            Open Dashboard <ArrowRight size={16} strokeWidth={2}/>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop:`1px solid ${T.border}`, padding:"36px 28px",
        marginTop:30
      }}>
        <div style={{
          maxWidth:1280, margin:"0 auto",
          display:"flex", justifyContent:"space-between", alignItems:"center",
          flexWrap:"wrap", gap:18
        }}>
          <div style={{display:"flex", alignItems:"center", gap:10}}>
            <Logo size={22}/>
            <div style={{color:T.dim, fontSize:13, letterSpacing:.15, fontFamily:FF}}>
              MOLTGRAPH · © 2026
            </div>
          </div>
          <div style={{display:"flex", gap:20, fontSize:12.5}}>
            {["Privacy","Terms","Contact","Docs"].map(l=>(
              <a key={l} href="#" style={{color:T.muted, textDecoration:"none", fontFamily:FF}}
                 onMouseEnter={e=>e.target.style.color=T.text}
                 onMouseLeave={e=>e.target.style.color=T.muted}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// ROOT APP
// ══════════════════════════════════════════════════════════
export default function App(){
  const [view, setView] = useState("landing");
  return (
    <div style={{
      background:T.bg, color:T.text, minHeight:"100vh",
      fontFamily:FF, position:"relative", overflow:"hidden"
    }}>
      <style>{`
        ${FONT}
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{background:${T.bg};color:${T.text};font-family:${FF};-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
        ::-webkit-scrollbar{width:6px;height:6px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(43,95,255,0.25);border-radius:3px}
        ::-webkit-scrollbar-thumb:hover{background:rgba(43,95,255,0.4)}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.55;transform:scale(.85)}}
        button{font-family:${FF}}
        input{font-family:${FF}}
        @media (max-width: 820px){
          .globe-grid{grid-template-columns:1fr !important}
        }
      `}</style>
      <GridBackground/>
      {view==="landing"
        ? <Landing onDashboard={()=>setView("dashboard")}/>
        : <Dashboard onHome={()=>setView("landing")}/>
      }
      <AIHelper/>
    </div>
  );
}
