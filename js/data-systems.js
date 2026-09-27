(function initDeveloperOS(){
    const data = window.PORTFOLIO_DATA;
    if (!data) return;

    const buildGrid = document.getElementById('build-plan-grid');
    if (buildGrid) buildGrid.innerHTML = data.buildPlan.map(([state,name,copy]) => `<article class="build-plan-item"><span>${state}</span><b>${name}</b><p>${copy}</p></article>`).join('');

    const tracks = document.getElementById('experiment-tracks');
    if (tracks) tracks.innerHTML = data.experimentTracks.map(([name,copy,id]) => `<article class="track-card"><span>${id}</span><strong>${name}</strong><p>${copy}</p></article>`).join('');

    const explorer = document.getElementById('project-explorer-grid');
    if (explorer) {
        explorer.innerHTML = data.projects.map(project => {
            const action = project.id === 'szh' || project.id === 'pretend'
                ? `<div><button type="button" data-project-open="${project.id}">OPEN CASE FILE →</button><a href="${project.casePage}">OPEN MINI-SITE ↗</a></div>`
                : `<a href="#work">VIEW IN WORK →</a>`;
            return `<article class="project-os-card"><span class="project-os-status">${project.status}</span><h3>${project.name}</h3><p>${project.description}</p><div class="project-os-stack">${project.stack.map(item => `<span>${item}</span>`).join('')}</div>${action}</article>`;
        }).join('');
        explorer.querySelectorAll('[data-project-open]').forEach(button => button.addEventListener('click', () => {
            document.querySelector(`.project-terminal-link[data-project="${button.dataset.projectOpen}"]`)?.click();
        }));
    }

    const vault = document.getElementById('vault-grid');
    if (vault) vault.innerHTML = data.codeVault.map(item => `<article class="vault-card"><div class="vault-head"><span>${item.label}</span><span>${item.language}</span></div><p>${item.description}</p><pre>${escapeHTML(item.code)}</pre><div class="vault-copy">SOURCE / LOCAL PORTFOLIO IMPLEMENTATION</div></article>`).join('');

    const projectCount = document.getElementById('os-project-count');
    const activeCount = document.getElementById('os-active-count');
    if (projectCount) projectCount.textContent = String(data.projects.length).padStart(2,'0');
    if (activeCount) activeCount.textContent = String(data.projects.filter(p => p.status.includes('ACTIVE')).length).padStart(2,'0');

    function escapeHTML(value){return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));}

    document.querySelectorAll('[data-os-target]').forEach(button => button.addEventListener('click', () => {
        const id = button.dataset.osTarget;
        document.getElementById(id)?.scrollIntoView({behavior:'smooth', block:'start'});
        window.dispatchEvent(new CustomEvent('portfolio:log',{detail:{code:'OS',message:`opened ${id}`}}));
    }));

    const syncTime = document.getElementById('os-sync-time');
    const tick = () => { if (syncTime) syncTime.textContent = new Date().toLocaleTimeString('en-GB',{hour12:false}); };
    tick(); setInterval(tick,1000);
})();

/* ------------------------------
   Public GitHub event matrix
------------------------------ */
(function initContributionMatrix(){
    const grid = document.getElementById('contribution-grid');
    const summary = document.getElementById('contribution-summary');
    if (!grid) return;
    const days = 91;
    const cells = Array.from({length:days},(_,i)=>({date:new Date(Date.now()-(days-1-i)*86400000),level:0,count:0}));
    const render = () => {
        grid.innerHTML = cells.map(cell => `<span class="contribution-cell" data-level="${cell.level}" title="${cell.date.toLocaleDateString()} / ${cell.count} public events"></span>`).join('');
        const total = cells.reduce((sum,c)=>sum+c.count,0);
        if (summary) summary.textContent = `${total} PUBLIC EVENTS / ${days} DAYS`;
    };
    render();
    fetch('https://api.github.com/users/quehole/events/public?per_page=100',{headers:{Accept:'application/vnd.github+json'}})
      .then(response => { if (!response.ok) throw new Error('GitHub events unavailable'); return response.json(); })
      .then(events => {
          events.forEach(event => {
              const d = new Date(event.created_at); d.setHours(0,0,0,0);
              const match = cells.find(cell => { const x = new Date(cell.date); x.setHours(0,0,0,0); return x.getTime()===d.getTime(); });
              if (match) match.count += 1;
          });
          const max = Math.max(1,...cells.map(c=>c.count));
          cells.forEach(c => c.level = c.count ? Math.min(4,Math.ceil((c.count/max)*4)) : 0);
          render();
          window.dispatchEvent(new CustomEvent('portfolio:log',{detail:{code:'GITHUB',message:'public event matrix synced'}}));
      })
      .catch(() => { if(summary) summary.textContent='LIVE FEED PAUSED / OPEN GITHUB'; });
})();

/* ------------------------------
   Public deployment status
------------------------------ */
(function initDeploymentStatus(){
    const state = document.getElementById('deployment-state');
    const github = document.getElementById('deployment-github');
    const publicTarget = document.getElementById('deployment-public');
    const note = document.getElementById('deployment-note');
    if (!state) return;
    Promise.all(['szh-website','pretend'].map(repo => fetch(`https://api.github.com/repos/quehole/${repo}/deployments?per_page=1`,{headers:{Accept:'application/vnd.github+json'}}).then(r=>r.ok?r.json():[]).catch(()=>[])))
      .then(results => {
          const deployments = results.flat();
          state.textContent='CHECKED';
          github.textContent='CONNECTED';
          publicTarget.textContent=deployments.length ? 'FOUND' : 'NO PUBLIC RECORD';
          note.textContent = deployments.length ? `${deployments.length} public deployment record${deployments.length===1?'':'s'} returned for tracked project repositories.` : 'No public deployment record was returned for the tracked repositories.';
      }).catch(() => { state.textContent='CHECKED'; github.textContent='PUBLIC PROFILE'; publicTarget.textContent='OPEN GITHUB'; note.textContent='Live deployment metadata is temporarily unavailable. Public project links remain available.'; });
})();

/* ------------------------------
   Project network
------------------------------ */
(function initProjectNetwork(){
    const canvas = document.getElementById('network-canvas');
    if (!canvas) return;
    const nodes = [
      ['core','PORTFOLIO','developer environment',50,50],
      ['projects','PROJECTS','SZH / Pretend / legacy work',18,25],
      ['github','GITHUB','public repository activity',78,22],
      ['lab','LAB','experiments and prototypes',16,75],
      ['terminal','TERMINAL','commands and system access',80,75],
      ['live','LIVE DATA','Discord / GitHub / local state',50,82]
    ];
    const positions = new Map();
    canvas.innerHTML = `<svg class="network-svg" viewBox="0 0 1000 500" preserveAspectRatio="none"></svg>` + nodes.map(([id,label,copy,x,y]) => `<button class="network-node ${id==='core'?'core':''}" data-network-node="${id}" style="left:${x}%;top:${y}%;transform:translate(-50%,-50%)"><b>${label}</b><span>${copy}</span></button>`).join('');
    const svg = canvas.querySelector('svg');
    const connections = [['core','projects'],['core','github'],['core','lab'],['core','terminal'],['core','live'],['projects','live'],['github','live'],['lab','terminal']];
    const draw = () => {
      svg.innerHTML='';
      connections.forEach(([a,b])=>{
        const A=canvas.querySelector(`[data-network-node="${a}"]`), B=canvas.querySelector(`[data-network-node="${b}"]`); if(!A||!B)return;
        const ar=A.getBoundingClientRect(), br=B.getBoundingClientRect(), cr=canvas.getBoundingClientRect();
        const x1=(ar.left+ar.width/2-cr.left)/cr.width*1000, y1=(ar.top+ar.height/2-cr.top)/cr.height*500;
        const x2=(br.left+br.width/2-cr.left)/cr.width*1000, y2=(br.top+br.height/2-cr.top)/cr.height*500;
        const line=document.createElementNS('http://www.w3.org/2000/svg','line'); line.setAttribute('x1',x1);line.setAttribute('y1',y1);line.setAttribute('x2',x2);line.setAttribute('y2',y2);line.setAttribute('class','network-line');svg.appendChild(line);
      });
    };
    const nodeElements=[...canvas.querySelectorAll('.network-node')];
    nodeElements.forEach(node=>{
      const drag={active:false,x:0,y:0};
      node.addEventListener('pointerdown',e=>{drag.active=true;drag.x=e.clientX;drag.y=e.clientY;node.setPointerCapture(e.pointerId);node.style.cursor='grabbing';});
      node.addEventListener('pointermove',e=>{if(!drag.active)return; const rect=canvas.getBoundingClientRect(); const left=Math.min(96,Math.max(4,(parseFloat(node.style.left)||50)+(e.clientX-drag.x)/rect.width*100)); const top=Math.min(94,Math.max(6,(parseFloat(node.style.top)||50)+(e.clientY-drag.y)/rect.height*100)); node.style.left=left+'%';node.style.top=top+'%';drag.x=e.clientX;drag.y=e.clientY;draw();});
      node.addEventListener('pointerup',()=>{drag.active=false;node.style.cursor='grab';});
      node.addEventListener('click',()=>{if(Math.abs(drag.x) < 3) window.dispatchEvent(new CustomEvent('portfolio:log',{detail:{code:'NETWORK',message:`selected ${node.dataset.networkNode}`}}));});
    });
    window.addEventListener('resize',draw); setTimeout(draw,50);
})();

/* ------------------------------
   Evolving unknown system
------------------------------ */
(function evolveUnknown(){
    const body=document.querySelector('#unknown-overlay .unknown-body'); if(!body)return;
    const key='portfolio-unknown-visits';
    const visits=Number(localStorage.getItem(key)||0)+1; localStorage.setItem(key,String(Math.min(visits,9)));
    if(visits>=3){
      const pre=body.querySelector('pre');
      if(pre) pre.textContent = '$ whoami\nvisitor\n\n$ status\nACTIVE\n\n$ layer\n'+(visits>=6?'DEEP ACCESS':'PARTIAL ACCESS')+'\n\n$ exit\nRoute remains open.';
    }
})();

/* ------------------------------
   GitHub public activity feed
------------------------------ */
