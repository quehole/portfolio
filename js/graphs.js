(function initArchitecture() {
    const graph=document.getElementById("architecture-graph"); if(!graph) return;
    const data={
      pretend:{center:"PRETEND",nodes:["DISCORD API","COMMANDS","EVENTS","AUTOMATION","SERVICES","DATABASE"],desc:"Multifunctional Discord bot system"},
      szh:{center:"SZH",nodes:["WEBSITE","PROJECTS","SYSTEMS","EXPERIMENTS","CONTENT","DEPLOY"],desc:"Independent development organization"}
    };
    const render=(key)=>{const d=data[key]; graph.innerHTML=`<div class="arch-center"><b>${d.center}</b><span>${d.desc}</span></div>`+d.nodes.map((n,i)=>`<button class="arch-node n${i}" data-node="${n}"><b>${n}</b><span>VIEW</span></button>`).join("")+`<div class="arch-lines" aria-hidden="true"></div>`;};
    render("pretend");
    document.querySelectorAll(".arch-tab").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".arch-tab").forEach(x=>x.classList.remove("active"));b.classList.add("active");render(b.dataset.arch);window.dispatchEvent(new CustomEvent("portfolio:log",{detail:{code:"ARCH",message:`graph opened: ${b.dataset.arch}`}}));}));
    graph.addEventListener("click",e=>{const n=e.target.closest(".arch-node");if(!n)return; n.classList.toggle("selected");});
})();

/* ------------------------------
   v21 build history
------------------------------ */
(function initHistory(){
 const grid=document.getElementById("history-grid"); if(!grid)return;
 const items=(window.PORTFOLIO_DATA?.timeline||[]).map(([version,name,copy])=>[version,name,copy]);
 grid.innerHTML=items.map(x=>`<article class="history-item"><span>${x[0]}</span><div><b>${x[1]}</b><p>${x[2]}</p></div></article>`).join("");
})();

/* ------------------------------
   v21 local playground
------------------------------ */
(function initPlayground(){
 const run=document.getElementById("playground-run"), code=document.getElementById("playground-code"), out=document.getElementById("playground-output"); if(!run||!code||!out)return;
 run.addEventListener("click",()=>{
   const logs=[]; const original=console.log; try{console.log=(...a)=>logs.push(a.map(v=>typeof v==='object'?JSON.stringify(v):String(v)).join(' ')); const fn=new Function(code.value); fn(); out.textContent=logs.length?logs.join("\n"):"Executed successfully. No console output.";}catch(e){out.textContent=`Error: ${e.message}`;}finally{console.log=original;} window.dispatchEvent(new CustomEvent("portfolio:log",{detail:{code:"LAB",message:"playground executed"}}));
 });
})();

/* ------------------------------
   v21 unknown route
------------------------------ */
(function initUnknown(){
 const overlay=document.getElementById("unknown-overlay"), close=document.getElementById("unknown-close"); if(!overlay)return;
 const shut=()=>{overlay.classList.remove("open");overlay.setAttribute("aria-hidden","true")}; close?.addEventListener("click",shut); overlay.addEventListener("click",e=>{if(e.target===overlay)shut()});
 if(location.pathname.endsWith("/unknown")||location.hash==="#unknown") overlay.classList.add("open");
})();

/* =========================================================
   V27 / DEVELOPER OS DATA LAYER
========================================================= */
