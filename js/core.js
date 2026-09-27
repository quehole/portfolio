document.addEventListener("DOMContentLoaded", () => {
    const DISCORD_ID = "794143054117601310";

    /* ------------------------------
       Theme system
    ------------------------------ */
    const themeButton = document.getElementById("theme-toggle");
    const mobileThemeButton = document.getElementById("mobile-theme-toggle");
    const root = document.documentElement;

    const getTheme = () => root.classList.contains("light-theme");

    const syncThemeUI = () => {
        const light = getTheme();
        root.classList.remove("light-theme-preload");
        document.body.classList.toggle("light-theme", light);
        if (themeButton) {
            themeButton.setAttribute("aria-pressed", String(light));
            themeButton.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
            themeButton.title = light ? "Switch to dark theme" : "Switch to light theme";
        }
        if (mobileThemeButton) mobileThemeButton.textContent = light ? "DARK THEME" : "LIGHT THEME";
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute("content", light ? "#f3f3f0" : "#080808");
    };

    const applyTheme = (light, event) => {
        const x = event?.clientX ?? window.innerWidth / 2;
        const y = event?.clientY ?? 28;
        root.style.setProperty("--theme-x", `${x}px`);
        root.style.setProperty("--theme-y", `${y}px`);
        document.body.classList.remove("theme-transition");
        void document.body.offsetWidth;
        document.body.classList.add("theme-transition");
        root.classList.toggle("light-theme", light);
        try { localStorage.setItem("portfolio-theme", light ? "light" : "dark"); } catch {}
        syncThemeUI();

        [themeButton, mobileThemeButton].forEach((button) => {
            if (!button) return;
            button.classList.remove("is-animating");
            void button.offsetWidth;
            button.classList.add("is-animating");
            setTimeout(() => button.classList.remove("is-animating"), 600);
        });
        setTimeout(() => document.body.classList.remove("theme-transition"), 750);
        window.dispatchEvent(new CustomEvent("portfolio:log", { detail: { code:"THEME", message: `${light ? "light" : "dark"} theme enabled` } }));
    };

    syncThemeUI();
    themeButton?.addEventListener("click", (event) => applyTheme(!getTheme(), event));
    mobileThemeButton?.addEventListener("click", (event) => applyTheme(!getTheme(), event));

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
    let scrollY = window.scrollY || 0;
    let orbScroll = 0;

    window.addEventListener("scroll", () => {
        scrollY = window.scrollY || 0;
    }, { passive: true });

    window.addEventListener("mousemove", (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;
    }, { passive: true });

    const animateOrb = () => {
        if (orb && window.innerWidth > 850) {
            const targetX = (mouseX / window.innerWidth - 0.5) * 22;
            const targetY = (mouseY / window.innerHeight - 0.5) * 18;
            const targetScroll = Math.max(-170, Math.min(22, -scrollY * 0.22));
            orbX += (targetX - orbX) * 0.035;
            orbY += (targetY - orbY) * 0.035;
            orbScroll += (targetScroll - orbScroll) * 0.045;
            orb.style.setProperty("--orb-x", `${orbX}px`);
            orb.style.setProperty("--orb-y", `${orbY}px`);
            orb.style.setProperty("--orb-scroll-y", `${orbScroll}px`);
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
