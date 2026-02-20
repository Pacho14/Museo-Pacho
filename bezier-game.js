/**
 * Bezier Game Engine — Expedición P-5
 * Manejo de curvas Bézier cúbicas interactivas para calcar siluetas SVG.
 */

(function () {
    "use strict";

    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const scoreValue = document.getElementById('score-value');
    const checkBtn = document.getElementById('check-btn');
    const resetBtn = document.getElementById('reset-btn');
    const exitBtn = document.getElementById('exit-btn');
    const msgOverlay = document.getElementById('message-overlay');
    const msgContinueBtn = document.getElementById('msg-continue-btn');

    // CONFIGURACIÓN
    const CANVAS_WIDTH = 800;
    const CANVAS_HEIGHT = 600;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // Estado de la curva (Bezier Cúbica)
    let points = {
        p0: { x: 100, y: 300 }, // Inicio
        c0: { x: 200, y: 100 }, // Control 1
        c1: { x: 600, y: 100 }, // Control 2
        p1: { x: 700, y: 300 }  // Fin
    };

    let draggingPoint = null;
    const POINT_RADIUS = 10;
    const CONTROL_RADIUS = 8;

    // Silueta objetivo (SVG Data de Dibujo1 (1).svg)
    // Extraemos algunos puntos clave o simulamos la forma principal para el reto
    // El SVG tiene formas complejas, para el juego usaremos una de las curvas prominentes
    const targetPath = [
        { x: 294, y: 257 },
        { x: 355, y: 280 },
        { x: 446, y: 257 },
        { x: 446, y: 287 }
    ];

    // Inicialización
    function init() {
        render();
        bindCanvasEvents();

        checkBtn.addEventListener('click', validateCurve);
        resetBtn.addEventListener('click', resetPoints);
        exitBtn.addEventListener('click', () => window.location.href = 'index.html');
        msgContinueBtn.addEventListener('click', () => window.location.href = 'index.html');
    }

    function resetPoints() {
        points = {
            p0: { x: 100, y: 450 },
            c0: { x: 150, y: 150 },
            c1: { x: 650, y: 150 },
            p1: { x: 700, y: 450 }
        };
        scoreValue.innerText = "0%";
        scoreValue.style.color = "#10B981";
        render();
    }

    function render() {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // 1. Dibujar Rejilla de Fondo (Sutil)
        drawGrid();

        // 2. Dibujar Silueta Objetivo (SVG path simplificado o cargado)
        drawTargetSilhouette();

        // 3. Dibujar Líneas de Control
        drawControlLines();

        // 4. Dibujar la Curva Bézier del Jugador
        drawBezierCurve();

        // 5. Dibujar los Puntos (Handles)
        drawHandles();
    }

    function drawGrid() {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i < CANVAS_WIDTH; i += 40) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, CANVAS_HEIGHT); ctx.stroke();
        }
        for (let j = 0; j < CANVAS_HEIGHT; j += 40) {
            ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(CANVAS_WIDTH, j); ctx.stroke();
        }
    }

    function drawTargetSilhouette() {
        ctx.save();
        ctx.strokeStyle = '#7F00FF'; // Color Púrpura del SVG
        ctx.lineWidth = 12;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.globalAlpha = 0.3;

        // Aquí simulamos el arco principal del SVG (Balancín)
        // Usamos una curva fija que el jugador debe imitar
        ctx.beginPath();
        ctx.moveTo(150, 400);
        ctx.bezierCurveTo(200, 100, 600, 100, 650, 400);
        ctx.stroke();

        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.8;
        ctx.stroke();
        ctx.restore();
    }

    function drawBezierCurve() {
        ctx.save();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 4;
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';

        ctx.beginPath();
        ctx.moveTo(points.p0.x, points.p0.y);
        ctx.bezierCurveTo(points.c0.x, points.c0.y, points.c1.x, points.c1.y, points.p1.x, points.p1.y);
        ctx.stroke();
        ctx.restore();
    }

    function drawControlLines() {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 1;

        // P0 -> C0
        ctx.beginPath(); ctx.moveTo(points.p0.x, points.p0.y); ctx.lineTo(points.c0.x, points.c0.y); ctx.stroke();
        // P1 -> C1
        ctx.beginPath(); ctx.moveTo(points.p1.x, points.p1.y); ctx.lineTo(points.c1.x, points.c1.y); ctx.stroke();

        ctx.setLineDash([]);
    }

    function drawHandles() {
        // Anclas (P0, P1) - Azules
        drawPoint(points.p0, '#3B82F6', POINT_RADIUS);
        drawPoint(points.p1, '#3B82F6', POINT_RADIUS);

        // Controles (C0, C1) - Verdes
        drawPoint(points.c0, '#10B981', CONTROL_RADIUS);
        drawPoint(points.c1, '#10B981', CONTROL_RADIUS);
    }

    function drawPoint(p, color, radius) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFF';
        ctx.stroke();
    }

    function validateCurve() {
        // Objetivo ideal: P0(150,400), C0(200,100), C1(600,100), P1(650,400)
        const target = {
            p0: { x: 150, y: 400 },
            c0: { x: 200, y: 100 },
            c1: { x: 600, y: 100 },
            p1: { x: 650, y: 400 }
        };

        let diff = 0;
        for (let key in points) {
            diff += Math.sqrt(Math.pow(points[key].x - target[key].x, 2) + Math.pow(points[key].y - target[key].y, 2));
        }

        // Normalizamos a un score 0-100
        const maxDiff = 800; // Tolerancia máxima
        let score = Math.max(0, 100 - (diff / 10));
        score = Math.round(score);

        scoreValue.innerText = score + "%";

        if (score > 85) {
            scoreValue.style.color = "#10B981";
            msgOverlay.classList.add("visible");
            // Mark progression
            localStorage.setItem(`station_3_completed`, "true");
        } else {
            scoreValue.style.color = "#EF4444";
            alert("¡Casi! Sigue ajustando los manejadores verdes para mejorar la precisión.");
        }
    }

    function bindCanvasEvents() {
        canvas.addEventListener('mousedown', startDrag);
        canvas.addEventListener('mousemove', drag);
        canvas.addEventListener('mouseup', stopDrag);

        // Touch events
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            startDrag({ clientX: touch.clientX, clientY: touch.clientY });
        });
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            drag({ clientX: touch.clientX, clientY: touch.clientY });
        });
        canvas.addEventListener('touchend', stopDrag);
    }

    function startDrag(e) {
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
        const y = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);

        for (let key in points) {
            const p = points[key];
            const dist = Math.sqrt(Math.pow(x - p.x, 2) + Math.pow(y - p.y, 2));
            if (dist < POINT_RADIUS + 5) {
                draggingPoint = key;
                return;
            }
        }
    }

    function drag(e) {
        if (!draggingPoint) return;
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
        const y = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);

        points[draggingPoint].x = x;
        points[draggingPoint].y = y;
        render();
    }

    function stopDrag() {
        draggingPoint = null;
    }

    init();

})();
