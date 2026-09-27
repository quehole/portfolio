(function initCaseStudies() {
    const modal = document.getElementById("case-study-modal");
    if (!modal) return;
    const title = document.getElementById("case-study-title");
    const route = document.getElementById("case-study-route");
    const summary = document.getElementById("case-study-summary");
    const type = document.getElementById("case-study-type");
    const status = document.getElementById("case-study-status");
    const stack = document.getElementById("case-study-stack");
    const focus = document.getElementById("case-study-focus");
    const build = document.getElementById("case-study-build");
    const link = document.getElementById("case-study-link");
    const projects = {
        szh: { title:"SZH", route:"casefile://szh", summary:"An independent development organization focused on interactive digital projects, systems and experiments.", type:"Development organization", status:"Active", stack:"Web / Systems / Interaction", focus:"Experimental digital products", build:"A platform and project space for exploring interactive web work, systems and new ideas.", link:"https://quehole.github.io/szh-website/" },
        pretend: { title:"Pretend", route:"casefile://pretend", summary:"A multifunctional Discord bot built as a practical system for communities, automation and everyday server tools.", type:"Discord bot", status:"Active development", stack:"Discord / Bot Systems / Automation", focus:"Community tooling", build:"A multifunctional bot system designed around useful server tools, automation and extensible Discord workflows.", link:"https://quehole.github.io/pretend/" }
    };
    const close = () => { modal.classList.remove("open"); modal.setAttribute("aria-hidden","true"); document.body.classList.remove("modal-open"); };
    const open = (key) => {
        const data = projects[key]; if (!data) return;
        title.textContent=data.title; route.textContent=data.route; summary.textContent=data.summary; type.textContent=data.type; status.textContent=data.status; stack.textContent=data.stack; focus.textContent=data.focus; build.textContent=data.build; link.href=data.link;
        modal.classList.add("open"); modal.setAttribute("aria-hidden","false"); document.body.classList.add("modal-open");
        window.dispatchEvent(new CustomEvent("portfolio:log", { detail:{ code:"CASE", message:`opened ${data.title.toLowerCase()} case file` } }));
    };
    document.querySelectorAll(".project-terminal-link[data-project]").forEach(btn => btn.addEventListener("click", () => open(btn.dataset.project)));
    [document.getElementById("case-study-close"), document.getElementById("case-study-close-bottom")].forEach(btn => btn?.addEventListener("click", close));
    modal.querySelectorAll("[data-case-close]").forEach(el => el.addEventListener("click", close));
    window.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
})();

/* ------------------------------
   Lab inspector
------------------------------ */
(function initLabInspector() {
    const inspector = document.getElementById("lab-inspector");
    const title = document.getElementById("lab-inspector-title");
    const label = document.getElementById("lab-inspector-label");
    const copy = document.getElementById("lab-inspector-copy");
    const close = document.getElementById("lab-inspector-close");
    if (!inspector || !title || !copy) return;
    const data = {
        liquid: ["LAB / 001", "LIQUID INTERFACE", "The visual experiment behind the portfolio's organic glass object and motion language."],
        discord: ["LAB / 002", "DISCORD SYSTEMS", "Experiments around live presence, automation and event-driven interfaces."],
        terminal: ["LAB / 003", "TERMINAL UI", "The command interface connects project files, system actions, navigation and internal state."],
        audio: ["LAB / 004", "AUDIO REACTIVITY", "Web Audio analysis drives the visualizer and subtly changes the liquid orb while ambient sound is playing."],
        webgl: ["LAB / 005", "WEBGL / NEXT", "A reserved experiment space for future spatial graphics and interactive scenes."],
        unknown: ["LAB / ???", "UNKNOWN", "A hidden experiment. The interface is not ready to reveal what is inside." ]
    };
    document.querySelectorAll(".lab-expand").forEach((button) => button.addEventListener("click", () => {
        const item = data[button.dataset.lab];
        if (!item) return;
        [label.textContent, title.textContent, copy.textContent] = item;
        inspector.classList.add("open");
        inspector.setAttribute("aria-hidden", "false");
        inspector.scrollIntoView({ behavior:"smooth", block:"nearest" });
    }));
    close?.addEventListener("click", () => { inspector.classList.remove("open"); inspector.setAttribute("aria-hidden", "true"); });
})();

/* ------------------------------
   Boot sequence (once per session)
------------------------------ */
(function initBootSequence() {
    const screen = document.getElementById("boot-screen");
    const message = document.getElementById("boot-message");
    const progress = document.getElementById("boot-progress-bar");
    if (!screen || !message || !progress) return;
    if (sessionStorage.getItem("abdullah-boot-seen")) { screen.classList.add("done"); return; }
    sessionStorage.setItem("abdullah-boot-seen", "1");
    const messages = ["INITIALIZING INTERFACE", "MOUNTING PORTFOLIO", "CONNECTING SERVICES", "SYSTEM READY"];
    let index = 0;
    const tick = () => {
        message.textContent = messages[index];
        progress.style.width = `${Math.min(100, (index + 1) * 25)}%`;
        index += 1;
        if (index < messages.length) setTimeout(tick, 260);
        else setTimeout(() => screen.classList.add("done"), 420);
    };
    setTimeout(tick, 120);
})();

/* ------------------------------
   Project case file terminal
------------------------------ */
(function initProjectTerminal() {
    const modal = document.getElementById("project-terminal");
    const body = document.getElementById("project-terminal-body");
    const input = document.getElementById("project-terminal-input");
    const close = document.getElementById("project-terminal-close");
    if (!modal || !body || !input) return;

    const data = {
        overview: ["SZH", "Independent development studio focused on interactive digital projects, systems and experiments."],
        architecture: ["SYSTEM", "Web interface → application logic → supporting services. Architecture evolves with each project."],
        technology: ["STACK", "Web / Systems / Development / Interactive UI"],
        website: ["URL", "https://quehole.github.io/szh-website/"],
        help: ["COMMANDS", "overview · architecture · technology · website · help · clear"]
    };

    const open = () => {
        modal.classList.add("open");
        modal.setAttribute("aria-hidden","false");
        body.innerHTML = '<div>casefile loaded: <strong>SZH</strong></div><div class="terminal-muted">Type <strong>help</strong> to inspect the project.</div>';
        input.value = "";
        setTimeout(() => input.focus(), 50);
    };
    const shut = () => { modal.classList.remove("open"); modal.setAttribute("aria-hidden","true"); };
    document.querySelectorAll(".project-terminal-link[data-project='szh']").forEach((button) => button.addEventListener("click", open));
    close.addEventListener("click", shut);
    modal.addEventListener("click", (event) => { if (event.target === modal) shut(); });
    input.addEventListener("keydown", (event) => {
        if (event.key === "Escape") return shut();
        if (event.key !== "Enter") return;
        const command = input.value.trim().toLowerCase();
        if (command === "clear") body.innerHTML = "";
        else if (data[command]) body.innerHTML += `<div style="margin-top:12px"><strong>${data[command][0]}</strong>  /  ${data[command][1]}</div>`;
        else body.innerHTML += `<div style="margin-top:12px">Command not found. Type <strong>help</strong>.</div>`;
        input.value = "";
        body.scrollTop = body.scrollHeight;
    });
})();


