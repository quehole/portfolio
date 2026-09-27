(function initSystemLogs() {
    const log = document.getElementById("system-log");
    if (!log) return;
    const started = Date.now();
    const entries = [
        ["BOOT", "interface initialized"],
        ["UI", "interaction system ready"],
        ["UI", "liquid environment ready"],
        ["TERM", "command line mounted"],
        ["CMD", "command palette ready"],
        ["NET", "external services checking"],
        ["READY", "portfolio accepting connections"]
    ];
    const stamp = () => new Date().toLocaleTimeString([], { hour12:false });
    log.innerHTML = entries.map(([code,message], index) => `<div class="log-row"><span class="log-time">${stamp()}</span><span class="log-code">${code}</span><span class="log-message">${message}</span></div>`).join("");
    window.addEventListener("portfolio:log", (event) => {
        const code = event.detail?.code || "UI";
        const message = event.detail?.message || "interaction registered";
        const row = document.createElement("div");
        row.className = "log-row";
        row.innerHTML = `<span class="log-time">${stamp()}</span><span class="log-code">${code}</span><span class="log-message">${message}</span>`;
        log.appendChild(row);
        while (log.children.length > 12) log.firstElementChild.remove();
    });
    window.dispatchEvent(new CustomEvent("portfolio:log", { detail:{ code:"BOOT", message:`ready in ${Date.now()-started}ms` } }));
})();

/* ------------------------------
   Developer mode / keyboard navigation
------------------------------ */
(function initKeyboardAndDevMode() {
    const indicator = document.getElementById("developer-mode-indicator");
    let sequence = [];
    const konami = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];

    const showDev = () => {
        const enabled = document.body.classList.toggle("developer-mode");
        document.getElementById("developer-panel")?.classList.toggle("open", enabled);
        document.getElementById("developer-panel")?.setAttribute("aria-hidden", String(!enabled));
        indicator?.classList.add("show");
        clearTimeout(showDev.timer);
        showDev.timer = setTimeout(() => indicator?.classList.remove("show"), 1800);
        window.dispatchEvent(new CustomEvent("portfolio:log", { detail:{ code:"MODE", message:document.body.classList.contains("developer-mode") ? "developer mode enabled" : "developer mode disabled" } }));
    };

    document.addEventListener("keydown", (event) => {
        const tag = document.activeElement?.tagName;
        const typing = tag === "INPUT" || tag === "TEXTAREA";
        const key = event.key;
        sequence.push(key);
        if (sequence.length > konami.length) sequence.shift();
        if (sequence.every((value, index) => value.toLowerCase?.() === konami[index].toLowerCase?.())) showDev(), sequence=[];

        if (!typing && event.ctrlKey && event.key === "/") {
            event.preventDefault();
            const input = document.getElementById("terminal-input");
            location.href = "contact.html#terminal";
            setTimeout(() => input?.focus(), 100);
            return;
        }

        if (!typing && !event.ctrlKey && !event.metaKey && !event.altKey) {
            if (key === "j") window.scrollBy({ top: window.innerHeight * .8, behavior:"smooth" });
            if (key === "k") window.scrollBy({ top: -window.innerHeight * .8, behavior:"smooth" });
            if (key.toLowerCase() === "f") window.dispatchEvent(new CustomEvent("portfolio:focus-toggle"));
        }
    });

    window.addEventListener("keydown", (event) => {
        if (event.key.toLowerCase() === "g") {
            const next = (e) => {
                const map = { a:"about.html", p:"work.html", h:"system.html#github", l:"lab.html", t:"contact.html#terminal", c:"contact.html", s:"system.html#logs", b:"index.html#building" };
                const target = map[e.key.toLowerCase()];
                if (target) location.href = target;
                window.removeEventListener("keydown", next);
            };
            window.addEventListener("keydown", next, { once:true });
            setTimeout(() => window.removeEventListener("keydown", next), 1200);
        }
    });
})();


/* ------------------------------
   Developer controls
------------------------------ */
(function initDeveloperPanel() {
    const panel = document.getElementById("developer-panel");
    const close = document.getElementById("developer-panel-close");
    const output = document.getElementById("developer-output");
    if (!panel || !output) return;
    const shut = () => { panel.classList.remove("open"); panel.setAttribute("aria-hidden","true"); };
    close?.addEventListener("click", shut);
    panel.addEventListener("click", (event) => { if (event.target === panel) shut(); });
    document.querySelectorAll("[data-dev-action]").forEach((button) => button.addEventListener("click", () => {
        const action = button.dataset.devAction;
        if (action === "inspect") document.body.classList.toggle("debug-grid");
        if (action === "orbit") document.body.classList.toggle("orbit-shift");
        if (action === "matrix") document.body.classList.toggle("matrix-mode");
        if (action === "debug") output.textContent = `$ debug\nviewport: ${window.innerWidth}x${window.innerHeight}\nscroll: ${Math.round(window.scrollY)}px\nfocus: ${document.body.classList.contains("focus-mode")}\nbuild: ${document.body.classList.contains("build-mode")}`;
        window.dispatchEvent(new CustomEvent("portfolio:log", { detail:{ code:"DEV", message:`${action} control executed` } }));
    }));
})();

/* ------------------------------
   About terminal
------------------------------ */
(function initAboutTerminal() {
    const form = document.getElementById("about-terminal-form");
    const input = document.getElementById("about-terminal-command");
    const output = document.getElementById("about-terminal-output");
    if (!form || !input || !output) return;
    const responses = {
        whoami: "Mohammad Abdullah  /  Full-Stack Developer",
        focus: "Web applications · Discord systems · automation · custom tools",
        experience: "Practical projects, independent systems and continuous experimentation.",
        stack: "JavaScript · TypeScript · Python · Java · Node.js · Discord.js · HTML · CSS",
        about: "A developer who likes turning small ideas into useful things that actually work."
    };
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const command = input.value.trim().toLowerCase();
        output.innerHTML = responses[command] ? `<strong>${command}</strong>  /  ${responses[command]}` : `Command not found. Try <strong>whoami</strong>, <strong>focus</strong>, <strong>experience</strong>, <strong>stack</strong> or <strong>about</strong>.`;
        input.value = "";
        window.dispatchEvent(new CustomEvent("portfolio:log", { detail:{ code:"ABOUT", message:`command: ${command || "empty"}` } }));
    });
})();

/* ------------------------------
   Ambient sound / BGM selector + visualizer
------------------------------ */
