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
