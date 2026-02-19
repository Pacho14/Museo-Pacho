import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const loadingElement = document.getElementById('loading');
const startScreen = document.getElementById('start-screen');
const startBtn = document.getElementById('start-btn');

// --- Three.js Setup ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
    canvas: canvasElement,
    alpha: true, // Transparent for mapping over hand
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
directionalLight.position.set(0, 5, 5);
scene.add(directionalLight);

// Ring Model Container
const ringContainer = new THREE.Group();
scene.add(ringContainer);
ringContainer.visible = false;

let ringModel = null;
let isModelLoaded = false;

// Load GLB Model (Directly using the existing file in the hub)
const loader = new GLTFLoader();
const modelUrl = './uploads_files_4601352_Diamond+ring.glb';

loader.load(modelUrl, (gltf) => {
    ringModel = gltf.scene;

    // Center the geometry
    const box = new THREE.Box3().setFromObject(ringModel);
    const center = box.getCenter(new THREE.Vector3());
    ringModel.position.sub(center);

    ringContainer.add(ringModel);
    isModelLoaded = true;
    console.log("Model loaded for Try-On");
}, undefined, (error) => {
    console.error('Error loading model:', error);
    loadingElement.textContent = "Error al cargar el modelo 3D.";
});

camera.position.z = 5;

// --- MediaPipe Setup ---
const hands = new Hands({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
});

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.6,
    minTrackingConfidence: 0.6
});

hands.onResults(onResults);

function onResults(results) {
    // If we have hand landmarks, process the ring position
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        updateRingPosition(landmarks);
    } else {
        ringContainer.visible = false;
    }
    renderer.render(scene, camera);
}

// --- Tracking Logic ---
const smoothPos = new THREE.Vector3();
const smoothQuat = new THREE.Quaternion();
const smoothScale = new THREE.Vector3(1, 1, 1);
const lerpFactor = 0.2;

function updateRingPosition(landmarks) {
    if (!ringModel) return;

    // MediaPipe Landmarks for Ring Finger: 13 (MCP), 14 (PIP)
    const mcp = landmarks[13];
    const pip = landmarks[14];
    const middleMcp = landmarks[9];

    // Stability: Hide if too close to edges
    const margin = 0.05;
    if (mcp.x < margin || mcp.x > 1 - margin || mcp.y < margin || mcp.y > 1 - margin) {
        ringContainer.visible = false;
        return;
    }

    // Mapping 2D to 3D Space
    const fixedDepth = 15;
    const vFOV = THREE.MathUtils.degToRad(camera.fov);
    const heightAtDepth = 2 * Math.tan(vFOV / 2) * fixedDepth;
    const widthAtDepth = heightAtDepth * camera.aspect;

    const mapTo3D = (lx, ly) => {
        const x = (lx - 0.5) * widthAtDepth;
        const y = -(ly - 0.5) * heightAtDepth;
        return new THREE.Vector3(x, y, -fixedDepth);
    };

    const mcpPos = mapTo3D(mcp.x, mcp.y);
    const pipPos = mapTo3D(pip.x, pip.y);
    const middleMcpPos = mapTo3D(middleMcp.x, middleMcp.y);

    // 1. Position: Between MCP and PIP
    const targetPos = new THREE.Vector3().copy(mcpPos).lerp(pipPos, 0.45);

    // 2. Rotation: Align Y with finger direction, Z with hand normal
    const fingerDir = new THREE.Vector3().subVectors(pipPos, mcpPos).normalize();
    const palmVec = new THREE.Vector3().subVectors(middleMcpPos, mcpPos).normalize();
    const handNormal = new THREE.Vector3().crossVectors(fingerDir, palmVec).normalize();

    const matrix = new THREE.Matrix4();
    const up = fingerDir.clone();
    const forward = handNormal.clone();
    const right = new THREE.Vector3().crossVectors(up, forward).normalize();
    forward.crossVectors(right, up).normalize();
    matrix.makeBasis(right, up, forward);
    const targetQuat = new THREE.Quaternion().setFromRotationMatrix(matrix);

    // 3. Scale: Based on distance between joints
    const fingerLength = mcpPos.distanceTo(pipPos);
    const baseScale = fingerLength * 5.2;
    const targetScale = new THREE.Vector3(baseScale, baseScale, baseScale);

    // Apply Smoothing
    if (ringContainer.visible === false) {
        smoothPos.copy(targetPos);
        smoothQuat.copy(targetQuat);
        smoothScale.copy(targetScale);
        ringContainer.visible = true;
    } else {
        smoothPos.lerp(targetPos, lerpFactor);
        smoothQuat.slerp(targetQuat, lerpFactor);
        smoothScale.lerp(targetScale, lerpFactor);
    }

    ringContainer.position.copy(smoothPos);
    ringContainer.setRotationFromQuaternion(smoothQuat);
    ringContainer.scale.copy(smoothScale);
}

// --- Start / Interaction ---
let cameraStarted = false;

const cameraUtils = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({ image: videoElement });
    },
    width: 1280,
    height: 720
});

startBtn.addEventListener('click', () => {
    startScreen.style.display = 'none';
    loadingElement.style.display = 'block';
    loadingElement.textContent = "Solicitando cámara...";

    if (!cameraStarted) {
        cameraUtils.start().then(() => {
            cameraStarted = true;
            loadingElement.style.display = 'none';
        }).catch(err => {
            console.error(err);
            loadingElement.textContent = "Error: Permite el acceso a la cámara.";
        });
    }
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
