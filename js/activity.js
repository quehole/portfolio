(function initPublicActivityFeed(){
    const feed=document.getElementById('activity-feed');
    if(!feed)return;
    const label = type => ({PushEvent:'PUSH',CreateEvent:'CREATE',ReleaseEvent:'RELEASE',IssuesEvent:'ISSUE',PullRequestEvent:'PR',WatchEvent:'WATCH',ForkEvent:'FORK'}[type]||String(type||'EVENT').replace('Event','').toUpperCase());
    const describe = event => {
      const repo=(event.repo?.name||'unknown').replace('quehole/','');
      if(event.type==='PushEvent') return `${repo} received a public push event.`;
      if(event.type==='CreateEvent') return `${repo} received a public creation event.`;
      if(event.type==='ReleaseEvent') return `${repo} published a public release event.`;
      if(event.type==='WatchEvent') return `${repo} received a public watch event.`;
      if(event.type==='ForkEvent') return `${repo} received a public fork event.`;
      return `${repo} received a public ${label(event.type).toLowerCase()} event.`;
    };
    fetch('https://api.github.com/users/quehole/events/public?per_page=12',{headers:{Accept:'application/vnd.github+json'}})
      .then(r=>{if(!r.ok)throw new Error('activity unavailable');return r.json();})
      .then(events=>{
        const usable=events.filter(e=>e.repo?.name);
        if(!usable.length)return;
        feed.innerHTML=usable.slice(0,8).map((event,index)=>`<article class="activity-item"><span>${index===0?'LATEST':formatAge(event.created_at).toUpperCase()}</span><div><strong>${escapeHTML(event.repo.name.split('/').pop()).toUpperCase()}</strong><p>${escapeHTML(describe(event))}</p></div><b>${label(event.type)}</b></article>`).join('');
        window.dispatchEvent(new CustomEvent('portfolio:log',{detail:{code:'GITHUB',message:'public activity feed synced'}}));
      }).catch(()=>{});
    function escapeHTML(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
    function formatAge(value){const diff=Math.max(0,Date.now()-new Date(value).getTime());const mins=Math.floor(diff/60000);if(mins<60)return `${mins}M AGO`;const hours=Math.floor(mins/60);if(hours<24)return `${hours}H AGO`;return `${Math.floor(hours/24)}D AGO`;}
})();
