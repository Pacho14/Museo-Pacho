/**
 * hub.js — Cinematic Hub World Interaction System
 * Museo de Pacho — Fully 3D immersive interaction (no flat UI panels)
 */

(function () {
    "use strict";

    // ─── Estado ──────────────────────────────────────────────────────
    let activeStation = null;
    let isAnimating = false;
    let hintHidden = false;

    // Posición de cámara inicial
    const HOME_POS = { x: 0, y: 3.5, z: 8 };
    const HOME_ROT = { x: -12, y: 0, z: 0 };

    // ─── Refs DOM ────────────────────────────────────────────────────
    const stationLabel = document.getElementById("station-label");
    const hintBar = document.getElementById("hint-bar");
    const stationNav = document.getElementById("station-nav");
    const loadingScreen = document.getElementById("loading-screen");
    const backBtn = document.getElementById("back-to-hub");
    const portalOverlay = document.getElementById("portal-overlay");

    // ─── Init ────────────────────────────────────────────────────────
    function init() {
        buildStationNav();
        bindEvents();
        hideLoadingScreen();
        setTimeout(() => { hintBar.classList.add("hide"); hintHidden = true; }, 8000);
    }

    function buildStationNav() {
        STATIONS.forEach(s => {
            const dot = document.createElement("div");
            dot.className = "station-dot";
            dot.id = `dot-${s.id}`;
            stationNav.appendChild(dot);
        });
    }

    function hideLoadingScreen() {
        const scene = document.querySelector("a-scene");
        const hide = () => setTimeout(() => loadingScreen.classList.add("hidden"), 600);
        if (scene && scene.hasLoaded) hide();
        else if (scene) scene.addEventListener("loaded", hide);
        else setTimeout(hide, 2000);
    }

    function bindEvents() {
        backBtn.addEventListener("click", returnToHub);
        document.addEventListener("keydown", e => { if (e.key === "Escape") returnToHub(); });
    }

    // ─── HOVER: Glow + Label ─────────────────────────────────────────
    window.onStationHover = function (stationId) {
        if (activeStation) return;
        const station = STATIONS.find(s => s.id === stationId);
        if (!station) return;

        const el = document.getElementById(`glb-${stationId}`);
        if (!el) return;

        // Scale up proportionally
        const baseScale = parseFloat(el.getAttribute('data-initial-scale')) || 1.0;
        const targetScale = baseScale * 1.25;
        const targetScaleStr = `${targetScale} ${targetScale} ${targetScale}`;

        el.setAttribute("animation__hover", {
            property: "scale",
            to: targetScaleStr,
            dur: 300,
            easing: "easeOutBack"
        });

        // Glow ring
        const ring = document.getElementById(`glow-ring-${stationId}`);
        if (ring) {
            ring.setAttribute("material", `color: ${station.glowColor}; emissive: ${station.glowColor}; emissiveIntensity: 0.8; opacity: 0.9; transparent: true`);
            ring.setAttribute("animation__glow", {
                property: "scale",
                to: "1.1 1.1 1.1",
                dur: 600,
                easing: "easeOutCubic"
            });
        }

        // Label
        stationLabel.textContent = station.name;
        stationLabel.classList.add("visible");
    };

    window.onStationLeave = function (stationId) {
        if (activeStation) return;
        const el = document.getElementById(`glb-${stationId}`);
        if (!el) return;

        const baseScale = parseFloat(el.getAttribute('data-initial-scale')) || 1.0;
        const baseScaleStr = `${baseScale} ${baseScale} ${baseScale}`;

        el.setAttribute("animation__hover", {
            property: "scale",
            to: baseScaleStr,
            dur: 300,
            easing: "easeOutCubic"
        });

        const ring = document.getElementById(`glow-ring-${stationId}`);
        if (ring) {
            ring.setAttribute("material", `color: ${STATIONS.find(s => s.id === stationId)?.accentColor || '#4F46E5'}; emissive: #000; emissiveIntensity: 0; opacity: 0.6; transparent: true`);
            ring.setAttribute("animation__glow", {
                property: "scale",
                to: "1 1 1",
                dur: 400,
                easing: "easeOutCubic"
            });
        }

        stationLabel.classList.remove("visible");
    };

    // ─── CLICK: Cinematic Focus ──────────────────────────────────────
    window.focusStation = function (stationId) {
        if (isAnimating || activeStation) return;
        const station = STATIONS.find(s => s.id === stationId);
        if (!station) return;

        isAnimating = true;
        activeStation = station;
        document.body.classList.add("cinematic");

        // Hide hint
        if (!hintHidden) { hintBar.classList.add("hide"); hintHidden = true; }
        stationLabel.classList.remove("visible");

        // Update dots
        document.querySelectorAll(".station-dot").forEach(d => d.classList.remove("active"));
        const dot = document.getElementById(`dot-${station.id}`);
        if (dot) dot.classList.add("active");

        // 1. Disable camera controls
        const camera = document.getElementById("main-camera");
        camera.setAttribute("look-controls", "enabled", false);
        camera.setAttribute("wasd-controls", "enabled", false);

        // 2. Compute camera target position (offset from station)
        const rad = (station.angle * Math.PI) / 180;
        const cameraDistance = 3.5;
        const targetPos = {
            x: station.posX + Math.sin(rad) * cameraDistance,
            y: 2.2,
            z: station.posZ + (-Math.cos(rad)) * cameraDistance
        };

        // Compute lookAt rotation
        const lookRot = computeLookAtRotation(targetPos, { x: station.posX, y: 1.2, z: station.posZ });

        // 3. Animate camera rig
        const rig = document.getElementById("camera-rig");
        rig.setAttribute("animation__pos", {
            property: "position",
            to: `${targetPos.x} ${targetPos.y} ${targetPos.z}`,
            dur: 1400,
            easing: "easeInOutCubic"
        });
        rig.setAttribute("animation__rot", {
            property: "rotation",
            to: `${lookRot.x} ${lookRot.y} ${lookRot.z}`,
            dur: 1400,
            easing: "easeInOutCubic"
        });

        // 4. Dim ambient, brighten spot
        const ambient = document.getElementById("ambient-light");
        const dir1 = document.getElementById("dir-light-1");
        const dir2 = document.getElementById("dir-light-2");
        const sky = document.getElementById("sky");
        const spot = document.getElementById("spotlight");

        ambient.setAttribute("animation__dim", { property: "light.intensity", to: 0.15, dur: 1000, easing: "easeInOutCubic" });
        dir1.setAttribute("animation__dim", { property: "light.intensity", to: 0.2, dur: 1000, easing: "easeInOutCubic" });
        dir2.setAttribute("animation__dim", { property: "light.intensity", to: 0.05, dur: 1000, easing: "easeInOutCubic" });
        sky.setAttribute("animation__dim", { property: "material.color", to: "#1a1820", dur: 1200, easing: "easeInOutCubic" });

        // Position and activate spotlight
        spot.setAttribute("position", `${station.posX} 6 ${station.posZ}`);
        spot.setAttribute("light", `type: spot; color: #fff; intensity: 2.5; angle: 35; penumbra: 0.6; decay: 1.5; target: #station-${station.id}`);
        spot.setAttribute("animation__on", { property: "light.intensity", from: 0, to: 2.5, dur: 1000, easing: "easeInOutCubic" });

        // 5. After camera settles, spawn 3D text + button
        setTimeout(() => {
            spawn3DCuratorial(station);
            backBtn.classList.add("visible");
            isAnimating = false;
        }, 1500);
    };

    // ─── SPAWN 3D Curatorial Text ────────────────────────────────────
    function spawn3DCuratorial(station) {
        const scene = document.querySelector("a-scene");
        const rad = (station.angle * Math.PI) / 180;

        // Position text to the right of the model
        const perpAngle = rad + Math.PI / 2;
        const textDist = 2.2;
        const textX = station.posX + Math.sin(perpAngle) * textDist;
        const textZ = station.posZ - Math.cos(perpAngle) * textDist;

        // Container entity for all curatorial elements
        const container = document.createElement("a-entity");
        container.id = "curatorial-3d";
        container.setAttribute("position", `${textX} 1.6 ${textZ}`);
        container.setAttribute("billboard", "");

        // Background panel (semi-transparent dark plane)
        const panel = document.createElement("a-plane");
        panel.setAttribute("width", "3.2");
        panel.setAttribute("height", "2.8");
        panel.setAttribute("color", "#0a0a0a");
        panel.setAttribute("material", "opacity: 0.75; transparent: true; side: double");
        panel.setAttribute("position", "0 0 -0.02");
        container.appendChild(panel);

        // Station number badge
        const badge = document.createElement("a-text");
        badge.setAttribute("value", `ESTACIÓN ${station.id}`);
        badge.setAttribute("align", "left");
        badge.setAttribute("color", station.accentColor);
        badge.setAttribute("width", "2.5");
        badge.setAttribute("position", "-1.3 1.05 0");
        badge.setAttribute("font", "roboto");
        badge.setAttribute("letter-spacing", "6");
        container.appendChild(badge);

        // Title
        const title = document.createElement("a-text");
        title.setAttribute("value", station.name);
        title.setAttribute("align", "left");
        title.setAttribute("color", "#FFFFFF");
        title.setAttribute("width", "4.5");
        title.setAttribute("position", "-1.3 0.7 0");
        title.setAttribute("font", "roboto");
        container.appendChild(title);

        // Subtitle
        const subtitle = document.createElement("a-text");
        subtitle.setAttribute("value", station.subtitle);
        subtitle.setAttribute("align", "left");
        subtitle.setAttribute("color", station.glowColor);
        subtitle.setAttribute("width", "2.8");
        subtitle.setAttribute("position", "-1.3 0.4 0");
        subtitle.setAttribute("font", "roboto");
        container.appendChild(subtitle);

        // Divider
        const divider = document.createElement("a-plane");
        divider.setAttribute("width", "2.6");
        divider.setAttribute("height", "0.005");
        divider.setAttribute("color", station.accentColor);
        divider.setAttribute("material", "opacity: 0.5; transparent: true");
        divider.setAttribute("position", "0 0.2 0");
        container.appendChild(divider);

        // Description (multiline)
        const desc = document.createElement("a-text");
        desc.setAttribute("value", station.description);
        desc.setAttribute("align", "left");
        desc.setAttribute("color", "#B0ADA8");
        desc.setAttribute("width", "2.8");
        desc.setAttribute("position", "-1.3 -0.05 0");
        desc.setAttribute("font", "roboto");
        desc.setAttribute("line-height", "60");
        container.appendChild(desc);

        // ─── 3D Floating CTA Button ────────────────────────────────────
        const btnGroup = document.createElement("a-entity");
        btnGroup.setAttribute("position", "0 -0.8 0");
        btnGroup.id = "cta-3d";

        // Button background
        const btnBg = document.createElement("a-plane");
        btnBg.setAttribute("width", "2.8");
        btnBg.setAttribute("height", "0.5");
        btnBg.setAttribute("color", station.accentColor);
        btnBg.setAttribute("material", `emissive: ${station.accentColor}; emissiveIntensity: 0.3; opacity: 0.95; transparent: true; side: double`);
        btnBg.setAttribute("class", "interactive cta-button");
        btnBg.setAttribute("cursor-listener", `stationId: ${station.id}`);
        btnBg.id = "cta-bg";
        btnGroup.appendChild(btnBg);

        // Button text
        const btnText = document.createElement("a-text");
        btnText.setAttribute("value", "✦  Explorar en Inmersión 3D");
        btnText.setAttribute("align", "center");
        btnText.setAttribute("color", "#FFFFFF");
        btnText.setAttribute("width", "2.8");
        btnText.setAttribute("position", "0 0 0.01");
        btnText.setAttribute("font", "roboto");
        btnGroup.appendChild(btnText);

        // Glow behind button
        const btnGlow = document.createElement("a-plane");
        btnGlow.setAttribute("width", "3.0");
        btnGlow.setAttribute("height", "0.7");
        btnGlow.setAttribute("color", station.accentColor);
        btnGlow.setAttribute("material", `emissive: ${station.accentColor}; emissiveIntensity: 0.5; opacity: 0.15; transparent: true; side: double`);
        btnGlow.setAttribute("position", "0 0 -0.03");
        btnGlow.setAttribute("animation", "property: material.emissiveIntensity; from: 0.3; to: 0.8; dur: 1500; dir: alternate; loop: true; easing: easeInOutSine");
        btnGroup.appendChild(btnGlow);

        container.appendChild(btnGroup);

        // Entrance animation
        container.setAttribute("scale", "0.01 0.01 0.01");
        container.setAttribute("animation__enter", {
            property: "scale",
            to: "1 1 1",
            dur: 600,
            easing: "easeOutBack",
            delay: 100
        });

        scene.appendChild(container);
    }

    // ─── PORTAL TRANSITION ───────────────────────────────────────────
    window.triggerPortal = function (stationId) {
        const station = STATIONS.find(s => s.id === stationId);
        if (!station) return;

        // Set portal color
        const ring = portalOverlay.querySelector(".portal-ring");
        if (ring) {
            ring.style.borderColor = station.accentColor;
            ring.style.boxShadow = `0 0 60px ${station.accentColor}, 0 0 120px ${station.accentColor}, inset 0 0 60px ${station.accentColor}`;
        }

        // CSS animation override for color
        document.documentElement.style.setProperty("--color-accent", station.accentColor);

        // Activate portal
        portalOverlay.classList.add("active");

        // Reset animation by cloning
        const newRing = ring.cloneNode(true);
        ring.parentNode.replaceChild(newRing, ring);

        const flash = portalOverlay.querySelector(".portal-flash");
        const newFlash = flash.cloneNode(true);
        flash.parentNode.replaceChild(newFlash, flash);

        // Zoom camera into model
        const rig = document.getElementById("camera-rig");
        rig.setAttribute("animation__zoom", {
            property: "position",
            to: `${station.posX} 1.5 ${station.posZ}`,
            dur: 1200,
            easing: "easeInCubic"
        });

        // After portal completes, launch activity
        setTimeout(() => {
            portalOverlay.classList.remove("active");
            launchActivity(station);

            // Reset camera back to focus position
            const rad = (station.angle * Math.PI) / 180;
            const cameraDistance = 3.5;
            rig.setAttribute("position", `${station.posX + Math.sin(rad) * cameraDistance} 2.2 ${station.posZ + (-Math.cos(rad)) * cameraDistance}`);
        }, 1800);
    };

    function launchActivity(station) {
        console.log(`[HubWorld] Launching AR Level for: ${station.name}`);
        const modelUrl = station.glb || 'arduino 2.glb';

        // Redirigir al nuevo nivel AR con el parámetro del modelo
        setTimeout(() => {
            window.location.href = `ar-level.html?model=${encodeURIComponent(modelUrl)}`;
        }, 500);
    }

    // ─── RETURN TO HUB ──────────────────────────────────────────────
    function returnToHub() {
        if (!activeStation || isAnimating) return;
        isAnimating = true;

        // Remove 3D curatorial
        const curatorial = document.getElementById("curatorial-3d");
        if (curatorial) {
            curatorial.setAttribute("animation__exit", {
                property: "scale",
                to: "0.01 0.01 0.01",
                dur: 400,
                easing: "easeInBack"
            });
            setTimeout(() => { if (curatorial.parentNode) curatorial.remove(); }, 450);
        }

        // Hide back button
        backBtn.classList.remove("visible");

        // Restore lights
        const ambient = document.getElementById("ambient-light");
        const dir1 = document.getElementById("dir-light-1");
        const dir2 = document.getElementById("dir-light-2");
        const sky = document.getElementById("sky");
        const spot = document.getElementById("spotlight");

        ambient.setAttribute("animation__restore", { property: "light.intensity", to: 0.6, dur: 900, easing: "easeInOutCubic" });
        dir1.setAttribute("animation__restore", { property: "light.intensity", to: 1.0, dur: 900, easing: "easeInOutCubic" });
        dir2.setAttribute("animation__restore", { property: "light.intensity", to: 0.35, dur: 900, easing: "easeInOutCubic" });
        sky.setAttribute("animation__restore", { property: "material.color", to: "#1e1c28", dur: 900, easing: "easeInOutCubic" });
        spot.setAttribute("animation__off", { property: "light.intensity", to: 0, dur: 600, easing: "easeInOutCubic" });

        // Animate camera to home
        const rig = document.getElementById("camera-rig");
        rig.setAttribute("animation__pos", {
            property: "position",
            to: `${HOME_POS.x} ${HOME_POS.y} ${HOME_POS.z}`,
            dur: 1200,
            easing: "easeInOutCubic"
        });
        rig.setAttribute("animation__rot", {
            property: "rotation",
            to: `${HOME_ROT.x} ${HOME_ROT.y} ${HOME_ROT.z}`,
            dur: 1200,
            easing: "easeInOutCubic"
        });

        // Re-enable controls after animation
        setTimeout(() => {
            const camera = document.getElementById("main-camera");
            camera.setAttribute("look-controls", "enabled", true);
            camera.setAttribute("wasd-controls", "enabled", true);

            document.body.classList.remove("cinematic");
            document.querySelectorAll(".station-dot").forEach(d => d.classList.remove("active"));
            activeStation = null;
            isAnimating = false;
        }, 1300);
    }

    // ─── UTILS ───────────────────────────────────────────────────────
    function computeLookAtRotation(from, to) {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dz = to.z - from.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        const yaw = Math.atan2(dx, dz) * (180 / Math.PI);
        const pitch = Math.atan2(dy, dist) * (180 / Math.PI);
        return { x: pitch, y: yaw + 180, z: 0 };
    }

    // ─── Arranque ────────────────────────────────────────────────────
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
