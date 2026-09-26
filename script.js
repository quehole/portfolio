document.addEventListener("DOMContentLoaded", () => {
    const DISCORD_ID = "794143054117601310";

    /* ------------------------------
       Cursor + liquid interaction
    ------------------------------ */
    const orb = document.querySelector(".liquid-orb");
    window.addEventListener("portfolio:audio-level", (event) => {
        if (orb) orb.style.setProperty("--audio-level", String(event.detail?.level || 0));
    });
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let orbX = 0;
    let orbY = 0;

    window.addEventListener("mousemove", (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;
    }, { passive: true });

    const animateOrb = () => {
        if (orb && window.innerWidth > 850) {
            const targetX = (mouseX / window.innerWidth - 0.5) * 22;
            const targetY = (mouseY / window.innerHeight - 0.5) * 18;
            orbX += (targetX - orbX) * 0.035;
            orbY += (targetY - orbY) * 0.035;
            orb.style.setProperty("--orb-x", `${orbX}px`);
            orb.style.setProperty("--orb-y", `${orbY}px`);
        }
        requestAnimationFrame(animateOrb);
    };
    animateOrb();

    /* ------------------------------
       Scroll reveal
    ------------------------------ */
    const reveals = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    reveals.forEach((element) => observer.observe(element));

    /* ------------------------------
       Local clock
    ------------------------------ */
    const clock = document.getElementById("clock");

    const updateClock = () => {
        if (!clock) return;

        const now = new Date();
        clock.textContent = now.toLocaleTimeString("en-GB", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    };

    updateClock();
    setInterval(updateClock, 1000);

    /* ------------------------------
       Discord / Lanyard presence
    ------------------------------ */
    const updatePresence = (data) => {
        if (!data?.discord_user) return;

        const {
            discord_user,
            discord_status,
            activities = [],
            spotify,
            listening_to_spotify
        } = data;

        const name = document.getElementById("discord-name");
        const avatar = document.getElementById("discord-avatar");
        const status = document.getElementById("discord-status");
        const statusDot = document.getElementById("status-indicator");
        const spotifySong = document.getElementById("spotify-song");
        const spotifyArtist = document.getElementById("spotify-artist");
        const spotifyContainer = document.getElementById("spotify-container");

        if (name) {
            name.textContent = discord_user.global_name || discord_user.username;
        }

        if (avatar) {
            if (discord_user.avatar) {
                avatar.src = `https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.png?size=128`;
            } else {
                const index = Number(discord_user.discriminator || 0) % 5;
                avatar.src = `https://cdn.discordapp.com/embed/avatars/${index}.png`;
            }
        }

        const statusColors = {
            online: "#79f2a4",
            idle: "#e7c75a",
            dnd: "#ef6d6d",
            offline: "#555"
        };

        if (statusDot) {
            statusDot.style.backgroundColor = statusColors[discord_status] || statusColors.offline;
        }

        window.dispatchEvent(new CustomEvent("portfolio:discord", { detail: discord_status || "offline" }));

        const customActivity = activities.find((activity) => activity.type === 4);

        if (status) {
            status.textContent = customActivity?.state ||
                (discord_status ? discord_status.charAt(0).toUpperCase() + discord_status.slice(1) : "Offline");
        }

        if (listening_to_spotify && spotify) {
            if (spotifySong) spotifySong.textContent = spotify.song || spotify.track || "Unknown track";
            if (spotifyArtist) spotifyArtist.textContent = spotify.artist ? `by ${spotify.artist}` : "";
            if (spotifyContainer) spotifyContainer.style.opacity = "1";
        } else {
            if (spotifySong) spotifySong.textContent = "Nothing playing";
            if (spotifyArtist) spotifyArtist.textContent = "";
            if (spotifyContainer) spotifyContainer.style.opacity = ".58";
        }
    };

    const connectLanyard = () => {
        const socket = new WebSocket("wss://api.lanyard.rest/socket");

        socket.addEventListener("open", () => {
            // Connection established; Lanyard will send HELLO.
        });

        socket.addEventListener("message", (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.op === 1) {
                    socket.send(JSON.stringify({
                        op: 2,
                        d: { subscribe_to_id: DISCORD_ID }
                    }));

                    setInterval(() => {
                        if (socket.readyState === WebSocket.OPEN) {
                            socket.send(JSON.stringify({ op: 3 }));
                        }
                    }, data.d.heartbeat_interval);
                }

                if (data.t === "INIT_STATE" || data.t === "PRESENCE_UPDATE") {
                    updatePresence(data.d);
                }
            } catch (error) {
                console.warn("Unable to parse presence update.", error);
            }
        });

        socket.addEventListener("error", () => {
            const status = document.getElementById("discord-status");
            if (status) status.textContent = "Presence unavailable";
        });

        socket.addEventListener("close", () => {
            setTimeout(connectLanyard, 5000);
        });
    };

    connectLanyard();
});

/* ------------------------------
   Interactive terminal
------------------------------ */
(function initTerminal() {
    const form = document.getElementById("terminal-form");
    const input = document.getElementById("terminal-input");
    const output = document.getElementById("terminal-output");
    const clearButton = document.getElementById("terminal-clear");

    if (!form || !input || !output) return;

    const commands = {
        help: () => [
            "Available commands:",
            "  whoami       /  identity + role",
            "  about        /  what I build",
            "  skills       /  technical stack",
            "  projects     /  selected work",
            "  status       /  current state",
            "  socials      /  external links",
            "  contact      /  email endpoint",
            "  szh          /  open SZH",
            "  github       /  open GitHub",
            "  discord      /  open Discord",
            "  clear        /  clear terminal",
            "  sudo mode    /  toggle developer mode",
            "  logs         /  jump to system logs",
            "  lab          /  open experiments",
            "  diagnostics  /  run system checks",
            "  focus        /  toggle focus mode",
            "  sound        /  toggle ambient sound"
        ],
        whoami: () => ["Mohammad Abdullah  /  Full-Stack Developer"],
        about: () => ["Web applications, Discord systems, automation and custom tools."],
        skills: () => ["JavaScript · TypeScript · Python · Java · Node.js · Discord.js · HTML · CSS"],
        projects: () => ["SZH  /  independent development studio", "Pretend  /  multifunctional Discord bot", "More experiments are in development."],
        status: () => ["ONLINE / BUILDING / AVAILABLE FOR INTERESTING PROJECTS"],
        socials: () => ["GitHub   github.com/quehole", "Discord  discord.com/users/794143054117601310", "Instagram instagram.com/queholes", "YouTube  youtube.com/@quehole", "Twitch   twitch.tv/quehole"],
        contact: () => ["quehole13@gmail.com"],
        clear: () => [],
        logs: () => ["Opening system logs..."],
        lab: () => ["Opening lab..."],
        diagnostics: () => { document.getElementById("diagnostics-trigger")?.click(); return ["Running diagnostics..."]; },
        focus: () => { window.dispatchEvent(new CustomEvent("portfolio:focus-toggle")); return [document.body.classList.contains("focus-mode") ? "Focus mode enabled." : "Focus mode disabled."]; },
        sound: () => { window.dispatchEvent(new CustomEvent("portfolio:sound-toggle")); return ["Ambient sound toggled."]; },
        ls: () => ["about/", "projects/", "stack/", "github/", "lab/", "music/", "contact/"],
        cd: (args) => { const dir = args[0] || "~"; const map = { about:["profile", "experience", "stack"], projects:["szh/", "pretend/", "navithingy/", "tidal-subsonic/", "peekless/"], stack:["javascript", "typescript", "python", "nodejs", "discordjs"], github:["activity", "repositories"], lab:["liquid-interface", "discord-systems", "unknown"], music:["brown-noise", "rain", "deep-space", "night-drive", "low-frequency"], contact:["email"] }; return map[dir] ? [`/${dir}`, ...map[dir]] : [`cd: no such directory: ${dir}`]; },
        cat: (args) => { const file = (args[0] || "").toLowerCase(); const docs = { "szh/info":["SZH  /  independent development organization.","Focus: interactive web, systems, experimentation."], "pretend/info":["Pretend  /  multifunctional Discord bot.","Focus: Discord systems, automation and community tooling."], "about/profile":["Mohammad Abdullah  /  Full-Stack Developer.","Web applications, Discord systems, automation and custom tools."], "stack/javascript":["JavaScript  /  language / web runtime."], "contact/email":["quehole13@gmail.com"] }; return docs[file] || ["cat: file not found. Try cat szh/info, cat pretend/info or cat about/profile"]; },
        build: () => { window.dispatchEvent(new CustomEvent("portfolio:build-toggle")); return [document.body.classList.contains("build-mode") ? "Build mode enabled." : "Build mode disabled."]; },
        "sudo": (args) => { if (args[0] === "mode") { document.body.classList.toggle("developer-mode"); return [document.body.classList.contains("developer-mode") ? "Developer mode enabled." : "Developer mode disabled."]; } return ["Usage: sudo mode"]; }
    };

    const links = {
        szh: "https://quehole.github.io/szh-website/",
        pretend: "https://quehole.github.io/pretend/",
        github: "https://github.com/quehole",
        discord: "https://discord.com/users/794143054117601310"
    };

    const appendLine = (text, className = "terminal-result") => {
        const line = document.createElement("div");
        line.className = `terminal-line ${className}`;
        line.textContent = text;
        output.appendChild(line);
    };

    const runCommand = (raw) => {
        const value = raw.trim();
        if (!value) return;

        appendLine(`$ ${value}`, "terminal-prompt-line");
        const normalized = value.toLowerCase();
        const [command, ...args] = normalized.split(/\s+/);

        if (command === "clear") {
            output.innerHTML = "";
            return;
        }

        if (links[command]) {
            appendLine(`Opening ${command}...`);
            window.open(links[command], "_blank", "noopener,noreferrer");
            return;
        }

        if (command === "open" && args[0] && links[args[0]]) {
            appendLine(`Opening ${args[0]}...`);
            window.open(links[args[0]], "_blank", "noopener,noreferrer");
            return;
        }

        if (commands[command]) {
            const result = commands[command](args);
            result.forEach((line) => appendLine(line));
            if (command === "logs") location.hash = "logs";
            if (command === "lab") location.hash = "lab";
        } else {
            appendLine(`Command not found: ${command}. Type "help" for available commands.`);
        }

        output.scrollTop = output.scrollHeight;
    };

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        runCommand(input.value);
        input.value = "";
    });

    clearButton?.addEventListener("click", () => {
        output.innerHTML = "";
        input.focus();
    });

    output.addEventListener("click", () => input.focus());

    const completions = ["help","whoami","about","skills","projects","status","socials","contact","szh","github","discord","clear","sudo mode","logs","lab","diagnostics","focus","sound","ls","cd","cat","build"];
    input.addEventListener("keydown", (event) => {
        if (event.key !== "Tab") return;
        event.preventDefault();
        const value = input.value.toLowerCase();
        const match = completions.find(item => item.startsWith(value) && item !== value);
        if (match) input.value = match;
    });
})();

/* ------------------------------
   Command palette
------------------------------ */
(function initCommandPalette() {
    const palette = document.getElementById("command-palette");
    const search = document.getElementById("palette-search");
    const list = document.getElementById("palette-list");
    const closeButton = document.getElementById("palette-close");
    const trigger = document.getElementById("command-trigger");
    const terminalTrigger = document.getElementById("open-palette-from-terminal");

    if (!palette || !search || !list) return;

    const items = [
        { title: "About", description: "View profile and background", key: "G A", action: () => location.hash = "about" },
        { title: "Selected Work", description: "Jump to projects and SZH", key: "G P", action: () => location.hash = "work" },
        { title: "Command Line", description: "Open the interactive terminal", key: "G T", action: () => { location.hash = "terminal"; setTimeout(() => document.getElementById("terminal-input")?.focus(), 300); } },
        { title: "GitHub Activity", description: "View live public repository data", key: "G H", action: () => location.hash = "github" },
        { title: "Lab / Experiments", description: "Open the experimental workbench", key: "G L", action: () => location.hash = "lab" },
        { title: "System Logs", description: "View live interface events", key: "G S", action: () => location.hash = "logs" },
        { title: "Now Building", description: "See the current active project", key: "G B", action: () => location.hash = "building" },
        { title: "Diagnostics", description: "Run portfolio system checks", key: "↗", action: () => document.getElementById("diagnostics-trigger")?.click() },
        { title: "Focus Mode", description: "Reduce the interface to essentials", key: "F", action: () => window.dispatchEvent(new CustomEvent("portfolio:focus-toggle")) },
        { title: "Ambient Sound", description: "Toggle the optional background sound", key: "↗", action: () => window.dispatchEvent(new CustomEvent("portfolio:sound-toggle")) },
        { title: "Private Terminal Route", description: "Open the hidden standalone terminal", key: "↗", action: () => { window.location.href = "terminal/"; } },
        { title: "JavaScript", description: "Find JavaScript in the technical stack", key: "↗", action: () => location.hash = "about" },
        { title: "TypeScript", description: "Find TypeScript in the technical stack", key: "↗", action: () => location.hash = "about" },
        { title: "SZH", description: "Open the active project case file", key: "↗", action: () => document.querySelector(".project-terminal-link[data-project='szh']")?.click() },
        { title: "Contact", description: "Send an email", key: "G C", action: () => location.hash = "contact" },
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
            repoList.innerHTML = data.length ? data.map((repo) => `<a class="repo-item" href="${repo.html_url}" target="_blank" rel="noopener"><strong>${escapeHTML(repo.name)}</strong><span>${escapeHTML(repo.language || "SOURCE")}</span></a>`).join("") : '<span class="terminal-muted">No public repositories found.</span>';
        })
        .catch(() => {
            apiStatus.innerHTML = '<i class="status-led"></i> UNAVAILABLE';
            repoList.innerHTML = '<span class="terminal-muted">GitHub data is unavailable right now.</span>';
        });

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
        document.body.classList.toggle("developer-mode");
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
            location.hash = "terminal";
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
                const map = { a:"about", p:"work", h:"github", l:"lab", t:"terminal", c:"contact", s:"logs", b:"building" };
                const target = map[e.key.toLowerCase()];
                if (target) location.hash = target;
                window.removeEventListener("keydown", next);
            };
            window.addEventListener("keydown", next, { once:true });
            setTimeout(() => window.removeEventListener("keydown", next), 1200);
        }
    });
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
(function initAmbientSound() {
    const button = document.getElementById("sound-toggle");
    const select = document.getElementById("sound-track");
    const volume = document.getElementById("sound-volume");
    const volumeValue = document.getElementById("sound-volume-value");
    const volumeSlider = document.getElementById("volume-slider");
    const nowPlaying = document.getElementById("audio-now-playing");
    const trackNameElement = document.getElementById("audio-track-name");
    const bars = [...document.querySelectorAll("#audio-visualizer i")];
    if (!button || !select || !volume || !volumeValue) return;

    const syncVolumeVisual = (value) => {
        if (volumeSlider) volumeSlider.style.setProperty("--volume-percent", `${value}%`);
    };

    const audio = new Audio();
    audio.loop = true;
    audio.preload = "none";

    let audioContext = null;
    let analyser = null;
    let sourceNode = null;
    let dataArray = null;
    let visualizerFrame = null;
    let enabled = false;
    let selectedTrack = localStorage.getItem("portfolio-bgm") || select.value;
    if (selectedTrack === "white-noise.mp3") {
        selectedTrack = "brown-noise.mp3";
        localStorage.setItem("portfolio-bgm", selectedTrack);
    }

    const savedVolume = Number(localStorage.getItem("portfolio-volume"));
    const initialVolume = Number.isFinite(savedVolume) ? Math.min(100, Math.max(0, savedVolume)) : 18;
    audio.volume = initialVolume / 100;
    volume.value = String(initialVolume);
    volumeValue.textContent = `${initialVolume}%`;
    syncVolumeVisual(initialVolume);

    if ([...select.options].some(option => option.value === selectedTrack)) {
        select.value = selectedTrack;
    }

    const trackName = () => select.options[select.selectedIndex]?.textContent || "AMBIENT";

    const updateNowPlaying = () => {
        if (trackNameElement) trackNameElement.textContent = trackName();
        if (nowPlaying) nowPlaying.classList.toggle("is-playing", enabled);
    };

    const ensureAnalyser = () => {
        if (audioContext) return;
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 64;
            analyser.smoothingTimeConstant = 0.82;
            sourceNode = audioContext.createMediaElementSource(audio);
            sourceNode.connect(analyser);
            analyser.connect(audioContext.destination);
            dataArray = new Uint8Array(analyser.frequencyBinCount);
        } catch (error) {
            audioContext = null;
            analyser = null;
            dataArray = null;
        }
    };

    const stopVisualizer = () => {
        if (visualizerFrame) cancelAnimationFrame(visualizerFrame);
        visualizerFrame = null;
        bars.forEach((bar, index) => {
            bar.style.transform = `scaleY(${0.28 + ((index % 3) * 0.06)})`;
        });
    };

    const animateVisualizer = () => {
        if (!enabled) {
            stopVisualizer();
            return;
        }

        if (analyser && dataArray) {
            analyser.getByteFrequencyData(dataArray);
            const length = bars.length;
            bars.forEach((bar, index) => {
                const sourceIndex = Math.min(dataArray.length - 1, Math.floor((index / length) * dataArray.length * 0.72));
                const level = dataArray[sourceIndex] / 255;
                const scale = 0.2 + level * 1.05;
                bar.style.transform = `scaleY(${Math.min(1.25, scale)})`;
                if (index === Math.floor(length / 2)) window.dispatchEvent(new CustomEvent("portfolio:audio-level", { detail:{ level } }));
            });
        } else {
            let peak = 0;
            bars.forEach((bar, index) => {
                const pulse = 0.28 + Math.abs(Math.sin((performance.now() / 430) + index * 0.7)) * 0.55;
                peak = Math.max(peak, pulse);
                bar.style.transform = `scaleY(${pulse})`;
            });
            window.dispatchEvent(new CustomEvent("portfolio:audio-level", { detail:{ level: Math.max(0, (peak - .28) / .55) } }));
        }

        visualizerFrame = requestAnimationFrame(animateVisualizer);
    };

    const loadTrack = () => {
        audio.src = `assets/audio/${select.value}`;
        audio.load();
        updateNowPlaying();
    };

    const updateButton = () => {
        button.setAttribute("aria-pressed", String(enabled));
        const label = enabled ? "Deafen ambient sound" : "Undeafen ambient sound";
        button.setAttribute("aria-label", label);
        button.setAttribute("title", label);
        button.innerHTML = enabled
            ? '<svg class="sound-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13v-1a8 8 0 0 1 16 0v1M4 13v3a2 2 0 0 0 2 2h1v-5H4Zm16 0v3a2 2 0 0 1-2 2h-1v-5h3Z"/></svg>'
            : '<svg class="sound-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13v-1a8 8 0 0 1 16 0v1M4 13v3a2 2 0 0 0 2 2h1v-5H4Zm16 0v3a2 2 0 0 1-2 2h-1v-5h3Z"/><path d="M4 4l16 16"/></svg>';
        updateNowPlaying();
    };

    const stop = () => {
        audio.pause();
        enabled = false;
        updateButton();
        stopVisualizer();
        window.dispatchEvent(new CustomEvent("portfolio:audio-level", { detail:{ level:0 } }));
    };

    const start = async () => {
        loadTrack();
        ensureAnalyser();
        try {
            if (audioContext?.state === "suspended") await audioContext.resume();
            await audio.play();
            enabled = true;
            updateButton();
            animateVisualizer();
            window.dispatchEvent(new CustomEvent("portfolio:log", { detail:{ code:"AUDIO", message:`playing ${trackName().toLowerCase()}` } }));
        } catch (error) {
            enabled = false;
            updateButton();
            window.dispatchEvent(new CustomEvent("portfolio:log", { detail:{ code:"AUDIO", message:"audio unavailable  /  add the selected file to assets/audio" } }));
        }
    };

    const toggle = async () => {
        if (enabled) {
            stop();
            window.dispatchEvent(new CustomEvent("portfolio:log", { detail:{ code:"AUDIO", message:"ambient sound muted" } }));
            return;
        }
        await start();
    };

    button.addEventListener("click", toggle);

    volume.addEventListener("input", () => {
        const value = Number(volume.value);
        audio.volume = value / 100;
        volumeValue.textContent = `${value}%`;
        syncVolumeVisual(value);
        localStorage.setItem("portfolio-volume", String(value));
        window.dispatchEvent(new CustomEvent("portfolio:log", { detail:{ code:"AUDIO", message:`volume set to ${value}%` } }));
    });

    select.addEventListener("change", async () => {
        selectedTrack = select.value;
        localStorage.setItem("portfolio-bgm", selectedTrack);
        if (enabled) {
            await start();
        } else {
            loadTrack();
            window.dispatchEvent(new CustomEvent("portfolio:log", { detail:{ code:"AUDIO", message:`selected ${trackName().toLowerCase()}` } }));
        }
    });

    audio.addEventListener("error", () => {
        enabled = false;
        updateButton();
        stopVisualizer();
        window.dispatchEvent(new CustomEvent("portfolio:log", { detail:{ code:"AUDIO", message:`missing audio file: ${select.value}` } }));
    });

    audio.addEventListener("ended", stop);
    loadTrack();
    updateButton();
    window.addEventListener("portfolio:sound-toggle", toggle);
})();

/* ------------------------------
   Focus mode
------------------------------ */
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
        window.setTimeout(() => transition.remove(), 950);
    };

    const toggle = () => {
        const enabled = document.body.classList.toggle("focus-mode");
        button?.setAttribute("aria-pressed", String(enabled));
        if (button) button.textContent = enabled ? "FOCUS ON" : "FOCUS";
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
        unknown: ["LAB / 003", "UNKNOWN", "Reserved for the next experiment worth keeping." ]
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
