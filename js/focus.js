(function initFocusMode() {
    const button = document.getElementById("focus-toggle");

    const playTransition = (enabled) => {
        const existing = document.querySelector(".focus-transition");
        existing?.remove();

        const transition = document.createElement("div");
        transition.className = `focus-transition ${enabled ? "is-entering" : "is-exiting"}`;
        transition.innerHTML = `
            <span class="focus-transition-line"></span>
            <span class="focus-transition-label">${enabled ? "FOCUS MODE / ON" : "FOCUS MODE / OFF"}</span>
        `;
        document.body.appendChild(transition);
        window.setTimeout(() => transition.remove(), 1100);
        transition.addEventListener("animationend", () => transition.remove(), { once: true });
    };

    const toggle = () => {
        const enabled = document.body.classList.toggle("focus-mode");
        button?.setAttribute("aria-pressed", String(enabled));
        button?.setAttribute("aria-label", enabled ? "Disable focus mode" : "Enable focus mode");
        if (button) {
            button.title = enabled ? "Disable focus mode" : "Enable focus mode";
            button.classList.remove("is-animating");
            void button.offsetWidth;
            button.classList.add("is-animating");
            window.setTimeout(() => button.classList.remove("is-animating"), 650);
        }
        playTransition(enabled);
        window.dispatchEvent(new CustomEvent("portfolio:log", { detail:{ code:"MODE", message:enabled ? "focus mode enabled" : "focus mode disabled" } }));
    };
    button?.addEventListener("click", toggle);
    window.addEventListener("portfolio:focus-toggle", toggle);
})();

/* ------------------------------
   Diagnostics
------------------------------ */
(function initDiagnostics() {
    const trigger = document.getElementById("diagnostics-trigger");
    const modal = document.getElementById("diagnostics-modal");
    const close = document.getElementById("diagnostics-close");
    const body = document.getElementById("diagnostics-body");
    if (!trigger || !modal || !body) return;
    const run = () => {
        const started = performance.now();
        const checks = [
            ["INTERFACE", "READY", "PASS"],
            ["CSS SYSTEM", "LOADED", "PASS"],
            ["JAVASCRIPT", "RUNNING", "PASS"],
            ["GITHUB API", document.getElementById("github-api-status")?.textContent?.trim() || "CHECKING", "PASS"],
            ["DISCORD", document.getElementById("system-discord-status")?.textContent?.trim() || "CONNECTING", "PASS"],
            ["LOCAL STORAGE", typeof Storage !== "undefined" ? "AVAILABLE" : "UNAVAILABLE", typeof Storage !== "undefined" ? "PASS" : "WARN"],
            ["RENDER", `${Math.round(performance.now() - started)}ms`, "PASS"]
        ];
        body.innerHTML = checks.map(([label,value,state]) => `<div class="diagnostic-row"><span>${label}</span><strong>${value}</strong><em>${state}</em></div>`).join("");
        modal.classList.add("open");
        modal.setAttribute("aria-hidden", "false");
        window.dispatchEvent(new CustomEvent("portfolio:log", { detail:{ code:"DIAG", message:"diagnostics completed" } }));
    };
    trigger.addEventListener("click", run);
    close?.addEventListener("click", () => { modal.classList.remove("open"); modal.setAttribute("aria-hidden", "true"); });
    modal.addEventListener("click", (event) => { if (event.target === modal) { modal.classList.remove("open"); modal.setAttribute("aria-hidden", "true"); } });
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") { modal.classList.remove("open"); modal.setAttribute("aria-hidden", "true"); } });
})();

/* ------------------------------
   Project case studies
------------------------------ */
