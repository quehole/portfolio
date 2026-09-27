(function initCommandPalette() {
    const palette = document.getElementById("command-palette");
    const search = document.getElementById("palette-search");
    const list = document.getElementById("palette-list");
    const closeButton = document.getElementById("palette-close");
    const trigger = document.getElementById("command-trigger");
    const terminalTrigger = document.getElementById("open-palette-from-terminal");

    if (!palette || !search || !list) return;

    const items = [
        { title: "About", description: "View profile and background", key: "G A", action: () => location.href = "about.html" },
        { title: "Selected Work", description: "Jump to projects and SZH", key: "G P", action: () => location.href = "work.html" },
        { title: "Command Line", description: "Open the interactive terminal", key: "G T", action: () => { location.href = "contact.html#terminal"; } },
        { title: "GitHub Activity", description: "View live public repository data", key: "G H", action: () => location.href = "system.html#github" },
        { title: "Lab / Experiments", description: "Open the experimental workbench", key: "G L", action: () => location.href = "lab.html" },
        { title: "System Logs", description: "View live interface events", key: "G S", action: () => location.href = "system.html#logs" },
        { title: "Now Building", description: "See the current active project", key: "G B", action: () => location.href = "index.html#building" },
        { title: "Diagnostics", description: "Run portfolio system checks", key: "↗", action: () => document.getElementById("diagnostics-trigger")?.click() },
        { title: "Focus Mode", description: "Reduce the interface to essentials", key: "F", action: () => window.dispatchEvent(new CustomEvent("portfolio:focus-toggle")) },
        { title: "Ambient Sound", description: "Toggle the optional background sound", key: "↗", action: () => window.dispatchEvent(new CustomEvent("portfolio:sound-toggle")) },
        { title: "Private Terminal Route", description: "Open the hidden standalone terminal", key: "↗", action: () => { window.location.href = "terminal/"; } },
        { title: "JavaScript", description: "Find JavaScript in the technical stack", key: "↗", action: () => location.href = "about.html" },
        { title: "TypeScript", description: "Find TypeScript in the technical stack", key: "↗", action: () => location.href = "about.html" },
        { title: "SZH", description: "Open the active project case file", key: "↗", action: () => location.href = "projects/szh/" },
        { title: "Pretend", description: "Open the multifunctional Discord bot case file", key: "↗", action: () => location.href = "projects/pretend/" },
        { title: "Development Feed", description: "View current project activity", key: "↗", action: () => location.href = "system.html#activity" },
        { title: "Architecture", description: "Explore project system graphs", key: "↗", action: () => location.href = "work.html#architecture" },
        { title: "Build History", description: "See how the portfolio evolved", key: "↗", action: () => location.href = "system.html#history" },
        { title: "Code Playground", description: "Run a local JavaScript experiment", key: "↗", action: () => location.href = "lab.html#playground" },
        { title: "Unknown System", description: "Open the hidden route", key: "↗", action: () => document.getElementById("unknown-overlay")?.classList.add("open") },
        { title: "Contact", description: "Send an email", key: "G C", action: () => location.href = "contact.html" },
        { title: "Open SZH", description: "Visit the active project", key: "↗", action: () => window.open("https://quehole.github.io/szh-website/", "_blank", "noopener,noreferrer") },
        { title: "GitHub", description: "Open github.com/quehole", key: "↗", action: () => window.open("https://github.com/quehole", "_blank", "noopener,noreferrer") },
        { title: "Discord", description: "Open Discord profile", key: "↗", action: () => window.open("https://discord.com/users/794143054117601310", "_blank", "noopener,noreferrer") },
        { title: "Email", description: "quehole13@gmail.com", key: "↗", action: () => window.location.href = "mailto:quehole13@gmail.com" }
    ];

    let filtered = [...items];
    let selected = 0;
    let lastFocused = null;

    const render = () => {
        list.innerHTML = "";
        if (!filtered.length) {
            list.innerHTML = '<div class="palette-empty">No commands found.</div>';
            return;
        }

        filtered.forEach((item, index) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = `palette-item${index === selected ? " selected" : ""}`;
            button.setAttribute("role", "option");
            button.setAttribute("aria-selected", index === selected ? "true" : "false");
            button.innerHTML = `<span class="palette-icon">${index === selected ? "→" : "·"}</span><span><strong>${item.title}</strong><small>${item.description}</small></span><kbd>${item.key}</kbd>`;
            button.addEventListener("mouseenter", () => { selected = index; render(); });
            button.addEventListener("click", () => execute());
            list.appendChild(button);
        });
    };

    const open = () => {
        lastFocused = document.activeElement;
        palette.classList.add("open");
        palette.setAttribute("aria-hidden", "false");
        document.body.classList.add("palette-open");
        search.value = "";
        filtered = [...items];
        selected = 0;
        render();
        requestAnimationFrame(() => search.focus());
    };

    const close = () => {
        palette.classList.remove("open");
        palette.setAttribute("aria-hidden", "true");
        document.body.classList.remove("palette-open");
        lastFocused?.focus?.();
    };

    const execute = () => {
        const item = filtered[selected];
        if (!item) return;
        close();
        item.action();
    };

    const update = () => {
        const query = search.value.trim().toLowerCase();
        filtered = items.filter((item) => `${item.title} ${item.description}`.toLowerCase().includes(query));
        selected = 0;
        render();
    };

    trigger?.addEventListener("click", open);
    terminalTrigger?.addEventListener("click", open);
    closeButton?.addEventListener("click", close);
    palette.querySelector("[data-palette-close]")?.addEventListener("click", close);
    search.addEventListener("input", update);

    document.addEventListener("keydown", (event) => {
        const modifier = event.ctrlKey || event.metaKey;

        if (modifier && event.key.toLowerCase() === "k") {
            event.preventDefault();
            palette.classList.contains("open") ? close() : open();
            return;
        }

        if (!palette.classList.contains("open")) return;

        if (event.key === "Escape") {
            event.preventDefault();
            close();
        } else if (event.key === "ArrowDown") {
            event.preventDefault();
            if (filtered.length) { selected = (selected + 1) % filtered.length; render(); }
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            if (filtered.length) { selected = (selected - 1 + filtered.length) % filtered.length; render(); }
        } else if (event.key === "Enter") {
            event.preventDefault();
            execute();
        }
    });
})();


/* ------------------------------
   Live GitHub data
------------------------------ */
