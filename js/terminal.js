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
            "  sound        /  toggle ambient sound",
            "  case pretend /  open Pretend case file",
            "  cat <file>   /  read project and system files",
            "  tree         /  inspect the portfolio filesystem",
            "  dev          /  open developer controls",
            "  architecture /  open project architecture",
            "  history      /  portfolio build history",
            "  playground   /  open code playground",
            "  unknown      /  open unknown system"
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
        lab: () => { location.hash = "lab"; return ["Opening lab..."]; },
        architecture: () => { location.hash = "architecture"; return ["Opening architecture graph..."]; },
        network: () => { location.hash = "network"; return ["Opening project network..."]; },
        history: () => { location.hash = "history"; return ["Opening portfolio history..."]; },
        contributions: () => { location.hash = "contributions"; return ["Opening GitHub activity matrix..."]; },
        vault: () => { location.hash = "vault"; return ["Opening code vault..."]; },
        buildplan: () => { location.hash = "build-plan"; return ["Opening build plan..."]; },
        os: () => { location.hash = "command-center"; return ["Opening developer OS..."]; },
        playground: () => { location.hash = "playground"; return ["Opening code playground..."]; },
        unknown: () => { document.getElementById("unknown-overlay")?.classList.add("open"); document.getElementById("unknown-overlay")?.setAttribute("aria-hidden","false"); return ["Unknown route opened."]; },
        diagnostics: () => { document.getElementById("diagnostics-trigger")?.click(); return ["Running diagnostics..."]; },
        focus: () => { window.dispatchEvent(new CustomEvent("portfolio:focus-toggle")); return [document.body.classList.contains("focus-mode") ? "Focus mode enabled." : "Focus mode disabled."]; },
        sound: () => { window.dispatchEvent(new CustomEvent("portfolio:sound-toggle")); return ["Ambient sound toggled."]; },
        "case": (args) => { const name = (args[0] || "").toLowerCase(); if (name === "pretend" || name === "szh") { document.querySelector(`.project-terminal-link[data-project="${name}"]`)?.click(); return [`Opening ${name} case file...`]; } return ["Usage: case pretend or case szh"]; },
        ls: () => ["about/", "projects/", "stack/", "github/", "lab/", "music/", "system/", "contact/"],
        tree: () => [".", "├── about/", "├── projects/", "│   ├── szh/", "│   ├── pretend/", "│   ├── navithingy/", "│   ├── tidal-subsonic/", "│   └── peekless/", "├── stack/", "├── github/", "├── lab/", "├── music/", "├── system/", "└── contact/"],
        dev: () => { document.getElementById("developer-panel")?.classList.add("open"); document.getElementById("developer-panel")?.setAttribute("aria-hidden","false"); return ["Developer controls exposed."]; },
        cd: (args) => { const dir = args[0] || "~"; const map = { about:["profile", "experience", "stack"], projects:["szh/", "pretend/", "navithingy/", "tidal-subsonic/", "peekless/"], stack:["javascript", "typescript", "python", "nodejs", "discordjs"], github:["activity", "repositories"], lab:["liquid-interface", "discord-systems", "unknown"], music:["brown-noise", "rain", "deep-space", "night-drive", "low-frequency"], contact:["email"] }; return map[dir] ? [`/${dir}`, ...map[dir]] : [`cd: no such directory: ${dir}`]; },
        cat: (args) => { const file = (args[0] || "").toLowerCase(); const docs = { "szh/info":["SZH  /  independent development organization.","Focus: interactive web, systems, experimentation."], "pretend/info":["Pretend  /  multifunctional Discord bot.","Focus: Discord systems, automation and community tooling."], "system/status":["Portfolio systems  /  online.","GitHub API, Discord presence, audio and interface modules are available."], "about/profile":["Mohammad Abdullah  /  Full-Stack Developer.","Web applications, Discord systems, automation and custom tools."], "stack/javascript":["JavaScript  /  language / web runtime."], "contact/email":["quehole13@gmail.com"] }; return docs[file] || ["cat: file not found. Try cat szh/info, cat pretend/info or cat about/profile"]; },
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

    const completions = ["help","whoami","about","skills","projects","status","socials","contact","szh","pretend","github","discord","clear","sudo mode","logs","lab","diagnostics","focus","sound","ls","cd","cat","build","case pretend","case szh","architecture","network","history","contributions","vault","buildplan","os","playground","unknown"];
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
