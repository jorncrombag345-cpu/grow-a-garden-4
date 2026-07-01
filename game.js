// ======================
// 🌱 GAG3 FULL GAME + SHOP
// ======================

// SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfe9ff);
scene.fog = new THREE.Fog(0xbfe9ff, 30, 180);

// CAMERA
const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// LIGHT
const sun = new THREE.DirectionalLight(0xffffff, 2);
sun.position.set(50, 80, 20);
sun.castShadow = true;
scene.add(sun);

scene.add(new THREE.AmbientLight(0xffffff, 0.35));

// GROUND
const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 500),
    new THREE.MeshStandardMaterial({ color: 0x3fa34d })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// PLAYER
const player = new THREE.Object3D();
player.position.set(0, 2, 10);
scene.add(player);
player.add(camera);

// ======================
// INPUT
// ======================
const keys = {};
let yaw = 0;
let pitch = 0;
const speed = 0.25;

window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

document.body.addEventListener("click", () => {
    document.body.requestPointerLock();
});

window.addEventListener("mousemove", (e) => {
    if (document.pointerLockElement !== document.body) return;
    if (shopOpen) return;

    yaw -= e.movementX * 0.002;
    pitch -= e.movementY * 0.002;

    pitch = Math.max(-1.2, Math.min(1.2, pitch));

    player.rotation.y = yaw;
    camera.rotation.x = pitch;
});

// ======================
// 💰 COINS
// ======================
let coins = 50;

// ======================
// 🌱 INVENTORY
// ======================
const inventory = {
    basic: 0,
    rare: 0
};

// ======================
// 🏪 SHOP UI (CENTER)
// ======================
let shopOpen = false;

const shop = document.createElement("div");
shop.style.position = "absolute";
shop.style.top = "50%";
shop.style.left = "50%";
shop.style.transform = "translate(-50%, -50%)";
shop.style.width = "320px";
shop.style.padding = "20px";
shop.style.background = "rgba(0,0,0,0.85)";
shop.style.color = "white";
shop.style.borderRadius = "15px";
shop.style.textAlign = "center";
shop.style.display = "none";
shop.style.zIndex = "999";

shop.innerHTML = `
<h2>🌱 SHOP</h2>
<button id="buyBasic">Basic Seed - 10💰</button><br><br>
<button id="buyRare">Rare Seed - 25💰</button><br><br>
<p>Press E to close</p>
`;

document.body.appendChild(shop);

// BUY LOGIC
document.getElementById("buyBasic").onclick = () => {
    if (coins >= 10) {
        coins -= 10;
        inventory.basic++;
    }
};

document.getElementById("buyRare").onclick = () => {
    if (coins >= 25) {
        coins -= 25;
        inventory.rare++;
    }
};

// OPEN / CLOSE SHOP
window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "e") {
        shopOpen = !shopOpen;
        shop.style.display = shopOpen ? "block" : "none";

        if (shopOpen) {
            document.exitPointerLock?.();
        }
    }
});

// ======================
// 🌱 PLANTS
// ======================
const plants = [];

function createPlant(pos, type) {

    let color = 0x2ecc71;
    let value = 5;

    if (type === "rare") {
        color = 0xffd700;
        value = 15;
    }

    const plant = new THREE.Mesh(
        new THREE.ConeGeometry(0.5, 1, 12),
        new THREE.MeshStandardMaterial({ color })
    );

    plant.position.copy(pos);
    plant.position.y = 0.5;

    plant.userData = {
        growth: 0,
        grown: false,
        value: value
    };

    scene.add(plant);
    plants.push(plant);
}

// CLICK TO PLANT
window.addEventListener("mousedown", () => {
    if (shopOpen) return;
    if (document.pointerLockElement !== document.body) return;

    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);

    const pos = player.position.clone().add(dir.multiplyScalar(5));

    if (inventory.basic > 0) {
        inventory.basic--;
        createPlant(pos, "basic");
    }
    else if (inventory.rare > 0) {
        inventory.rare--;
        createPlant(pos, "rare");
    }
});

// ======================
// 🌳 TREES
// ======================
function spawnTrees() {
    for (let i = 0; i < 40; i++) {

        const tree = new THREE.Group();

        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.6, 0.8, 5),
            new THREE.MeshStandardMaterial({ color: 0x7a4a1e })
        );

        const leaves = new THREE.Mesh(
            new THREE.SphereGeometry(2.5, 16, 16),
            new THREE.MeshStandardMaterial({ color: 0x1f8f3a })
        );

        trunk.position.y = 2.5;
        leaves.position.y = 6;

        tree.add(trunk);
        tree.add(leaves);

        tree.position.set(
            (Math.random() - 0.5) * 400,
            0,
            (Math.random() - 0.5) * 400
        );

        scene.add(tree);
    }
}

spawnTrees();

// ======================
// MOVE
// ======================
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

// ======================
// 🌱 GROWTH + MONEY
// ======================
function updatePlants() {

    plants.forEach(p => {

        p.userData.growth += 0.002;

        const scale = 1 + p.userData.growth * 3;
        p.scale.set(scale, scale, scale);

        if (!p.userData.grown && p.userData.growth > 1) {
            p.userData.grown = true;
            coins += p.userData.value;
        }
    });
}

// ======================
// UI
// ======================
const ui = document.createElement("div");
ui.style.position = "absolute";
ui.style.top = "10px";
ui.style.left = "10px";
ui.style.color = "white";
ui.style.fontSize = "18px";
ui.style.fontFamily = "Arial";
ui.style.zIndex = "10";
document.body.appendChild(ui);

function updateUI() {
    ui.innerHTML = `
        💰 Coins: ${coins}<br>
        🌱 Basic seeds: ${inventory.basic}<br>
        🌟 Rare seeds: ${inventory.rare}<br>
        🌿 Plants: ${plants.length}<br>
        🎮 Press E for shop
    `;
}

// ======================
// RESIZE
// ======================
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ======================
// LOOP
// ======================
function animate() {

    requestAnimationFrame(animate);

    move();
    updatePlants();
    updateUI();

    renderer.render(scene, camera);
}

animate();
