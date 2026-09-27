/* ------------------------------
   Skill constellation
------------------------------ */
(function initConstellation() {
    const info = document.getElementById("constellation-info");
    const nodes = [...document.querySelectorAll(".constellation-node")];
    const details = {
        "JavaScript":"Core language for interactive web work and runtime tooling.",
        "TypeScript":"Typed JavaScript for larger, safer application code.",
        "Node.js":"Server-side runtime used for tooling, automation and applications.",
        "Python":"Used for scripting, automation and experimental utilities.",
        "Discord.js":"Discord application and bot development.",
        "Web":"HTML, CSS and interface engineering across the portfolio stack."
    };
    nodes.forEach(node => node.addEventListener("click", () => {
        nodes.forEach(n => n.classList.remove("active"));
        node.classList.add("active");
        if (info) info.textContent = `${node.dataset.skill.toUpperCase()} / ${details[node.dataset.skill]}`;
        window.dispatchEvent(new CustomEvent("portfolio:log", { detail:{ code:"STACK", message:`inspected ${node.dataset.skill}` } }));
    }));
})();

/* ------------------------------
   GitHub repository filtering
------------------------------ */
(function initRepoSearch() {
    const input = document.getElementById("repo-search");
    const list = document.getElementById("github-repo-list");
    if (!input || !list) return;
    input.addEventListener("input", () => {
        const query = input.value.trim().toLowerCase();
        [...list.querySelectorAll(".repo-item")].forEach(item => {
            item.style.display = !query || item.textContent.toLowerCase().includes(query) ? "" : "none";
        });
    });
})();

/* ------------------------------
   Build mode + shortcut overlay
------------------------------ */
(function initModes() {
    const overlay = document.getElementById("shortcut-overlay");
    const close = document.getElementById("shortcut-close");
    const toggleBuild = () => {
        const enabled = document.body.classList.toggle("build-mode");
        window.dispatchEvent(new CustomEvent("portfolio:log", { detail:{ code:"BUILD", message:enabled ? "build mode enabled" : "build mode disabled" } }));
    };
    window.addEventListener("portfolio:build-toggle", toggleBuild);
    close?.addEventListener("click", () => overlay?.classList.remove("open"));
    window.addEventListener("keydown", (event) => {
        if (event.key === "?") { overlay?.classList.toggle("open"); return; }
        if (event.key === "Escape") overlay?.classList.remove("open");
        if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "d") { event.preventDefault(); toggleBuild(); }
    });
})();


/* ------------------------------
   Mobile navigation
------------------------------ */
(function initMobileMenu() {
    const menu = document.getElementById("mobile-menu");
    const openButton = document.getElementById("mobile-menu-trigger");
    const closeButton = document.getElementById("mobile-menu-close");
    if (!menu || !openButton) return;
    const close = () => { menu.classList.remove("open"); menu.setAttribute("aria-hidden","true"); openButton.setAttribute("aria-expanded","false"); document.body.classList.remove("modal-open"); };
    const open = () => { menu.classList.add("open"); menu.setAttribute("aria-hidden","false"); openButton.setAttribute("aria-expanded","true"); };
    openButton.addEventListener("click", open);
    closeButton?.addEventListener("click", close);
    menu.querySelectorAll("[data-mobile-menu-close], .mobile-menu-links a").forEach(el => el.addEventListener("click", close));
    window.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
})();


/* ------------------------------
   v21 architecture graph
------------------------------ */
