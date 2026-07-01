// ======================
// 🌱 GAG3 - FULL GAME CORE
// ======================

// ---------- SCENE ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

// ---------- CAMERA ----------
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

// ---------- RENDERER ----------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ---------- LIGHT ----------
const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(20, 40, 20);
scene.add(light);

scene.add(new THREE.AmbientLight(0xffffff, 0.4));

// ---------- GROUND ----------
const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(300, 300),
    new THREE.MeshStandardMaterial({ color: 0x3fa34d })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// ---------- PLAYER ----------
const player = new THREE.Object3D();
player.position.set(0, 2, 5);
scene.add(player);
player.add(camera);

// ---------- INPUT ----------
const keys = {};
let yaw = 0;
let pitch = 0;
const speed = 0.25;

window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// pointer lock
document.body.addEventListener("click", () => {
    document.body.requestPointerLock();
});

// mouse look
window.addEventListener("mousemove", (e) => {
    if (document.pointerLockElement !== document.body) return;

    yaw -= e.movementX * 0.002;
    pitch -= e.movementY * 0.002;

    pitch = Math.max(-1.5, Math.min(1.5, pitch));

    player.rotation.y = yaw;
    camera.rotation.x = pitch;
});

// ---------- COINS ----------
let coins = 0;

function addCoins(amount) {
    coins += amount;
}

// ---------- PLANTS ----------
const plants = [];

function createPlant(position) {
    const plant = new THREE.Mesh(
        new THREE.ConeGeometry(0.5, 1, 8),
        new THREE.MeshStandardMaterial({ color: 0x2ecc71 })
    );

    plant.position.copy(position);
    plant.position.y = 0.5;

    plant.userData = {
        growth: 0,
        grown: false,
        value: 5
    };

    scene.add(plant);
    plants.push(plant);
}

// ---------- CLICK TO PLANT ----------
window.addEventListener("mousedown", () => {
    if (document.pointerLockElement !== document.body) return;

    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);

    const pos = player.position.clone().add(dir.multiplyScalar(5));

    createPlant(pos);
});

// ---------- TREES ----------
function spawnTrees() {
    for (let i = 0; i < 25; i++) {

        const tree = new THREE.Group();

        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.5, 0.7, 4),
            new THREE.MeshStandardMaterial({ color: 0x8b5a2b })
        );

        const leaves = new THREE.Mesh(
            new THREE.SphereGeometry(2),
            new THREE.MeshStandardMaterial({ color: 0x1f7a3a })
        );

        trunk.position.y = 2;
        leaves.position.y = 5;

        tree.add(trunk);
        tree.add(leaves);

        tree.position.set(
            (Math.random() - 0.5) * 200,
            0,
            (Math.random() - 0.5) * 200
        );

        scene.add(tree);
    }
}

spawnTrees();

// ---------- MOVEMENT ----------
function move() {

    const dir = new THREE.Vector3();
    player.getWorldDirection(dir);
    dir.y = 0;
    dir.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(dir, new THREE.Vector3(0, 1, 0));

    if (keys["w"]) player.position.addScaledVector(dir, speed);
    if (keys["s"]) player.position.addScaledVector(dir, -speed);
    if (keys["a"]) player.position.addScaledVector(right, speed);
    if (keys["d"]) player.position.addScaledVector(right, -speed);
}

// ---------- PLANT GROWTH ----------
function updatePlants() {

    plants.forEach(p => {

        p.userData.growth += 0.002;

        const scale = 1 + p.userData.growth * 3;
        p.scale.set(scale, scale, scale);

        if (!p.userData.grown && p.userData.growth >= 1) {
            p.userData.grown = true;
            p.material.color.set(0x1e8449);

            addCoins(p.userData.value);
        }
    });
}

// ---------- UI ----------
const ui = document.createElement("div");
ui.style.position = "absolute";
ui.style.top = "10px";
ui.style.left = "10px";
ui.style.color = "white";
ui.style.fontFamily = "Arial";
ui.style.fontSize = "18px";
ui.style.zIndex = "10";
document.body.appendChild(ui);

function updateUI() {
    ui.innerHTML = `
        🌱 GAG3<br>
        💰 Coins: ${coins}<br>
        🌿 Plants: ${plants.length}
    `;
}

// ---------- RESIZE ----------
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---------- LOOP ----------
function animate() {
    requestAnimationFrame(animate);

    move();
    updatePlants();
    updateUI();

    renderer.render(scene, camera);
}

animate();
