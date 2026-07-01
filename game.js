// ======================
// 🌱 GAG3 - CLEAN VERSION v1
// ======================

// ======================
// SCENE
// ======================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfe9ff);
scene.fog = new THREE.Fog(0xbfe9ff, 30, 200);

// ======================
// CAMERA
// ======================
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

// ======================
// RENDERER
// ======================
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// ======================
// LIGHT
// ======================
const sun = new THREE.DirectionalLight(0xffffff, 1.5);
sun.position.set(50, 80, 20);
scene.add(sun);

scene.add(new THREE.AmbientLight(0xffffff, 0.4));

// ======================
// WORLD
// ======================
const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(1000, 1000),
    new THREE.MeshStandardMaterial({ color: 0x3fa34d })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// ======================
// PLAYER
// ======================
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

    yaw -= e.movementX * 0.002;
    pitch -= e.movementY * 0.002;

    pitch = Math.max(-1.2, Math.min(1.2, pitch));

    player.rotation.y = yaw;
    camera.rotation.x = pitch;
});

// ======================
// COINS + INVENTORY
// ======================
let coins = 50;

const inventory = {
    basic: 3,
    rare: 1
};

// ======================
// HOTBAR
// ======================
const hotbar = [
    { name: "basic" },
    { name: "rare" }
];

let selectedSlot = 0;

// ======================
// UI
// ======================
const ui = document.createElement("div");
ui.style.position = "absolute";
ui.style.top = "10px";
ui.style.left = "10px";
ui.style.color = "white";
document.body.appendChild(ui);

function updateUI() {
    ui.innerHTML = `
    💰 Coins: ${coins}<br>
    🌱 Basic: ${inventory.basic}<br>
    🌟 Rare: ${inventory.rare}
    `;
}

// ======================
// SHOP
// ======================
let shopOpen = false;

const shop = document.createElement("div");
shop.style.position = "absolute";
shop.style.display = "none";
shop.style.top = "50%";
shop.style.left = "50%";
shop.style.transform = "translate(-50%,-50%)";
shop.style.background = "black";
shop.style.color = "white";
shop.style.padding = "20px";
document.body.appendChild(shop);

shop.innerHTML = `
<h2>SHOP</h2>
<button id="b1">Basic 10</button><br><br>
<button id="b2">Rare 25</button>
`;

document.getElementById("b1").onclick = () => {
    if (coins >= 10) {
        coins -= 10;
        inventory.basic++;
    }
};

document.getElementById("b2").onclick = () => {
    if (coins >= 25) {
        coins -= 25;
        inventory.rare++;
    }
};

window.addEventListener("keydown", e => {
    if (e.key.toLowerCase() === "e") {
        shopOpen = !shopOpen;
        shop.style.display = shopOpen ? "block" : "none";
        if (shopOpen) document.exitPointerLock?.();
    }
});

// ======================
// PLANTS
// ======================
const plants = [];

function createPlant(pos, type) {

    const color = type === "rare" ? 0xffd700 : 0x2ecc71;

    const plant = new THREE.Mesh(
        new THREE.ConeGeometry(0.5, 1, 10),
        new THREE.MeshStandardMaterial({ color })
    );

    plant.position.copy(pos);
    plant.position.y = 0.5;

    plant.userData = {
        type,
        growth: 0,
        grown: false,
        value: type === "rare" ? 15 : 5
    };

    scene.add(plant);
    plants.push(plant);
}

// ======================
// GROWTH
// ======================
function updatePlants() {

    plants.forEach(p => {

        p.userData.growth += 0.002;

        const s = 1 + p.userData.growth * 3;
        p.scale.set(s, s, s);

        if (p.userData.growth > 1) {
            p.userData.grown = true;
        }
    });
}

// ======================
// HARVEST
// ======================
window.addEventListener("mousedown", () => {

    if (shopOpen) return;
    if (document.pointerLockElement !== document.body) return;

    const raycaster = new THREE.Raycaster();
    const hits = raycaster.intersectObjects(plants);

    if (hits.length > 0) {
        const plant = hits[0].object;

        if (plant.userData.grown) {
            coins += plant.userData.value;

            scene.remove(plant);
            plants.splice(plants.indexOf(plant), 1);
        }

        return;
    }

    const selected = hotbar[selectedSlot];

    if (inventory[selected.name] <= 0) return;

    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);

    const pos = player.position.clone().add(dir.multiplyScalar(5));

    createPlant(pos, selected.name);
    inventory[selected.name]--;
});

// ======================
// TREES
// ======================
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
        (Math.random() - 0.5) * 800,
        0,
        (Math.random() - 0.5) * 800
    );

    scene.add(tree);
}

// ======================
// MOVE
// ======================
function move() {

    const dir = new THREE.Vector3();
    player.getWorldDirection(dir);
    dir.y = 0;

    const right = new THREE.Vector3();
    right.crossVectors(dir, new THREE.Vector3(0, 1, 0));

    if (keys["w"]) player.position.addScaledVector(dir, speed);
    if (keys["s"]) player.position.addScaledVector(dir, -speed);
    if (keys["a"]) player.position.addScaledVector(right, speed);
    if (keys["d"]) player.position.addScaledVector(right, -speed);
}

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
