const TZ = 7 * 60;
const DB = "AION2_PRO_V1";

const state = JSON.parse(localStorage.getItem(DB)) || {
  chars: [],
  tasks: [
    {id:"nightmare",name:"Nightmare",type:"daily",hour:4},
    {id:"dungeon",name:"Daily Dungeon",type:"daily",hour:4},
    {id:"duty",name:"Duty",type:"daily",hour:4},
    {id:"shop",name:"Buy Odyle Energy",type:"weekly",day:0,hour:23},
    {id:"craft",name:"Craft Odyle Energy",type:"weekly",day:3,hour:4},
    {id:"raid",name:"Raid",type:"weekly",day:3,hour:4}
  ],
  alarms: []
};

/* TIME */
function now7(){
  const d=new Date();
  return new Date(d.getTime()+(TZ+d.getTimezoneOffset())*60000);
}

/* RESET CALC */
function nextReset(t){
  const n=now7(); let r=new Date(n);
  if(t.type==="daily"){
    r.setHours(t.hour,0,0,0);
    if(n>=r) r.setDate(r.getDate()+1);
  }else{
    r.setHours(t.hour,0,0,0);
    r.setDate(r.getDate()+((7-r.getDay()+t.day)%7||7));
  }
  return r;
}

function diff(r){
  let s=(r-now7())/1000;
  const d=Math.floor(s/86400); s%=86400;
  const h=Math.floor(s/3600); s%=3600;
  const m=Math.floor(s/60);
  return d>0?`${d}d ${h}h`:`${h}h ${m}m`;
}

/* ENGINE */
function engine(){
  const now=now7().getTime();

  state.chars.forEach(c=>{
    state.tasks.forEach(t=>{
      const r=nextReset(t).getTime();
      if((c.done?.[t.id]||0)<r-1000){
        c.done[t.id]=0;
      }
      if(now>r-3600000 && !c.warned?.[t.id]){
        notify("Reset Soon",`${t.name} (${c.name})`);
        c.warned[t.id]=true;
      }
    });
  });

  state.alarms.forEach(a=>{
    const d=now7();
    if(d.getHours()==a.h && d.getMinutes()==a.m && !a.hit){
      notify("Alarm",a.label);
      a.hit=true;
    }
    if(d.getMinutes()!=a.m) a.hit=false;
  });

  save(); render();
}

/* NOTIFY */
function notify(t,b){
  new Audio("alarm.mp3").play();
  if(Notification.permission==="granted")
    new Notification(t,{body:b});
}

/* UI */
function render(){
  const app=document.getElementById("app");
  app.innerHTML="";
  state.chars.forEach((c,ci)=>{
    app.innerHTML+=`
    <div class="card">
      <h3>${c.name}</h3>
      ${state.tasks.map(t=>{
        const r=nextReset(t);
        const warn=r-now7()<3600000;
        return`
        <div class="task">
          <label>
            <input type="checkbox"
              ${c.done[t.id]?"checked":""}
              onchange="toggle(${ci},'${t.id}')">
            ${t.name}
          </label>
          <div class="timer ${warn?'warn':''}">
            Reset in ${diff(r)}
          </div>
        </div>`}).join("")}
      <button onclick="delChar(${ci})">Remove</button>
    </div>`;
  });

  document.getElementById("alarms").innerHTML=
    state.alarms.map((a,i)=>`${a.h}:${a.m} ${a.label}
    <button onclick="delAlarm(${i})">x</button>`).join("<br>");
}

/* ACTIONS */
function toggle(ci,id){
  state.chars[ci].done[id]=Date.now();
  save();
}
function addChar(){
  const n=prompt("Character name");
  if(!n)return;
  state.chars.push({name:n,done:{},warned:{}});
  save(); render();
}
function delChar(i){state.chars.splice(i,1);save();render();}
function addTask(){
  const n=prompt("Task name");
  const t=prompt("daily / weekly");
  const h=+prompt("Reset hour (0-23)");
  const d=t==="weekly"?+prompt("Day (0=Sun)"):null;
  state.tasks.push({id:Date.now(),name:n,type:t,hour:h,day:d});
  save(); render();
}
function addAlarm(){
  state.alarms.push({h:+ah.value,m:+am.value,label:al.value});
  save(); render();
}
function delAlarm(i){state.alarms.splice(i,1);save();render();}
function save(){localStorage.setItem(DB,JSON.stringify(state));}

setInterval(engine,60000);
engine();
