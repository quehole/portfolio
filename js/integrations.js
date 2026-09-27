(function initGitHub() {
    const apiStatus = document.getElementById("github-api-status");
    const repos = document.getElementById("github-repos");
    const followers = document.getElementById("github-followers");
    const following = document.getElementById("github-following");
    const accountAge = document.getElementById("github-account-age");
    const repoList = document.getElementById("github-repo-list");
    if (!apiStatus || !repoList) return;

    fetch("https://api.github.com/users/quehole", { headers: { Accept: "application/vnd.github+json" } })
        .then((r) => { if (!r.ok) throw new Error("GitHub unavailable"); return r.json(); })
        .then((user) => {
            repos.textContent = user.public_repos ?? "0";
            followers.textContent = user.followers ?? "0";
            following.textContent = user.following ?? "0";
            const created = new Date(user.created_at);
            accountAge.textContent = created.getFullYear();
            apiStatus.innerHTML = '<i class="status-led online"></i> LIVE';

            return fetch("https://api.github.com/users/quehole/repos?sort=updated&per_page=5", { headers: { Accept: "application/vnd.github+json" } });
        })
        .then((r) => { if (!r.ok) throw new Error("Repositories unavailable"); return r.json(); })
        .then((data) => {
            repoList.innerHTML = data.length ? data.map((repo) => `<a class="repo-item" href="${repo.html_url}" target="_blank" rel="noopener"><strong>${escapeHTML(repo.name)}</strong><span>${escapeHTML(repo.language || "SOURCE")} · ${formatAge(repo.updated_at)}</span></a>`).join("") : '<span class="terminal-muted">No public repositories found.</span>';
            const feed = document.getElementById("activity-feed");
            if (feed && data.length) {
                const live = data.slice(0, 4).map((repo, index) => `<article class="activity-item"><span>${index === 0 ? "NOW" : formatAge(repo.updated_at).toUpperCase()}</span><div><strong>${escapeHTML(repo.name).toUpperCase()}</strong><p>Public repository updated on GitHub.</p></div><b>GITHUB</b></article>`).join("");
                feed.innerHTML = live + '<article class="activity-item"><span>ACTIVE</span><div><strong>PRETEND</strong><p>Multifunctional Discord bot development and system work.</p></div><b>BUILDING</b></article>';
            }
        })
        .catch(() => {
            apiStatus.innerHTML = '<i class="status-led"></i> PUBLIC PROFILE';
            repoList.innerHTML = '<div class="github-fallback"><span class="terminal-muted">Live repository data is temporarily unavailable.</span><a href="https://github.com/quehole" target="_blank" rel="noopener">OPEN GITHUB PROFILE ↗</a></div>';
            if (followers) followers.textContent = "--";
            if (following) following.textContent = "--";
            if (repos) repos.textContent = "--";
            if (accountAge) accountAge.textContent = "--";
        });

    function formatAge(value) {
        const diff = Math.max(0, Date.now() - new Date(value).getTime());
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    }

    function escapeHTML(value) {
        return String(value).replace(/[&<>'"]/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" }[char]));
    }
})();

/* ------------------------------
   System clock + Discord status bridge
------------------------------ */
(function initSystemClock() {
    const target = document.getElementById("system-time");
    const discordTarget = document.getElementById("system-discord-status");
    if (!target) return;
    const tick = () => {
        const now = new Date();
        target.textContent = now.toLocaleTimeString([], { hour12: false });
    };
    tick();
    setInterval(tick, 1000);
    window.addEventListener("portfolio:discord", (event) => {
        if (!discordTarget) return;
        const status = event.detail || "offline";
        discordTarget.innerHTML = `<i class="status-led ${status === "online" ? "online" : ""}"></i> ${String(status).toUpperCase()}`;
    });
})();

/* ------------------------------
   System logs
------------------------------ */
