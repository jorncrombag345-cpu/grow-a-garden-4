// ======================
// 🌱 GAG3 - REBUILD v2
// DEEL 1/10 - CORE ENGINE
// ======================

// 🎮 SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfe9ff);
scene.fog = new THREE.Fog(0xbfe9ff, 30, 200);

// 📷 CAMERA
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

// 🖥️ RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// 💡 LIGHT
const sun = new THREE.DirectionalLight(0xffffff, 1.5);
sun.position.set(50, 80, 20);
sun.castShadow = true;
scene.add(sun);

scene.add(new THREE.AmbientLight(0xffffff, 0.4));

// 🌍 BASIC GROUND (tijdelijk)
const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 500),
    new THREE.MeshStandardMaterial({ color: 0x3fa34d })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// 👤 PLAYER (FPS CONTROLLER BASIS)
const player = new THREE.Object3D();
player.position.set(0, 2, 10);
scene.add(player);
player.add(camera);

// 🎮 INPUT SYSTEM
const keys = {};

window.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});

// 🖱️ MOUSE LOOK
let yaw = 0;
let pitch = 0;

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

// 🚶 MOVE SYSTEM
const speed = 0.25;

function movePlayer() {

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

// 🔁 GAME LOOP
function animate() {
    requestAnimationFrame(animate);

    movePlayer();

    renderer.render(scene, camera);
}

animate();
// ======================
// 🌍 DEEL 2/10 - WORLD + TREES
// ======================

// 🌱 GROTERE GROND (verbeterd)
scene.remove(ground);

const ground2 = new THREE.Mesh(
    new THREE.PlaneGeometry(1000, 1000),
    new THREE.MeshStandardMaterial({ color: 0x3fa34d })
);

ground2.rotation.x = -Math.PI / 2;
ground2.receiveShadow = true;
scene.add(ground2);

// 🌳 TREES
function spawnTree(x, z) {

    const tree = new THREE.Group();

    // trunk
    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.8, 5),
        new THREE.MeshStandardMaterial({ color: 0x7a4a1e })
    );

    // leaves
    const leaves = new THREE.Mesh(
        new THREE.SphereGeometry(2.5, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x1f8f3a })
    );

    trunk.position.y = 2.5;
    leaves.position.y = 6;

    tree.add(trunk);
    tree.add(leaves);

    tree.position.set(x, 0, z);

    tree.castShadow = true;

    scene.add(tree);
}

// 🌲 RANDOM FOREST GENERATION
function generateForest(count = 60) {

    for (let i = 0; i < count; i++) {

        const x = (Math.random() - 0.5) * 800;
        const z = (Math.random() - 0.5) * 800;

        spawnTree(x, z);
    }
}

generateForest();

// 🌄 SIMPLE TERRAIN VARIATION (extra gevoel van wereld)
const rocks = [];

function spawnRock() {

    const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(1 + Math.random() * 2),
        new THREE.MeshStandardMaterial({ color: 0x888888 })
    );

    rock.position.set(
        (Math.random() - 0.5) * 800,
        0.5,
        (Math.random() - 0.5) * 800
    );

    rock.rotation.y = Math.random() * Math.PI;

    scene.add(rock);
    rocks.push(rock);
}

for (let i = 0; i < 30; i++) {
    spawnRock();
}
// ======================
// 🌱 DEEL 3/10 - PLANTS + GROWTH + COINS
// ======================

// 💰 COINS
let coins = 50;

// 🌱 PLANTS DATA
const plants = [];

// 🌱 PLANT TYPES
const plantTypes = {
    basic: {
        color: 0x2ecc71,
        growTime: 8000,
        value: 10
    },
    rare: {
        color: 0xffd700,
        growTime: 12000,
        value: 25
    }
};

// 🌱 CREATE PLANT
function createPlant(position, type = "basic") {

    const data = plantTypes[type];

    const plant = new THREE.Mesh(
        new THREE.ConeGeometry(0.5, 1, 10),
        new THREE.MeshStandardMaterial({ color: data.color })
    );

    plant.position.copy(position);
    plant.position.y = 0.5;

    plant.scale.set(0.5, 0.5, 0.5);

    plant.userData = {
        type,
        growth: 0,
        grown: false,
        value: data.value,
        growTime: data.growTime,
        startTime: Date.now()
    };

    scene.add(plant);
    plants.push(plant);
}

// 🌱 UPDATE PLANTS (GROWTH LOOP)
function updatePlants() {

    const now = Date.now();

    plants.forEach(p => {

        const elapsed = now - p.userData.startTime;
        const progress = Math.min(elapsed / p.userData.growTime, 1);

        p.userData.growth = progress;

        const scale = 0.5 + progress * 2;
        p.scale.set(scale, scale, scale);

        if (!p.userData.grown && progress >= 1) {

            p.userData.grown = true;

            // 💰 REWARD
            coins += p.userData.value;
        }
    });
}

// 🔁 PATCH IN GAME LOOP (belangrijk!)
const oldAnimate = animate;

animate = function () {// ======================
// 🎒 DEEL 4/10 - INVENTORY + HOTBAR + PLANTING
// ======================

// 🌱 INVENTORY
const inventory = {
    basic: 5,
    rare: 2
};

// 🎮 HOTBAR
const hotbar = [
    { name: "basic" },
    { name: "rare" }
];

let selectedSlot = 0;

// ======================
// 🎮 HOTBAR UI
// ======================
const hotbarUI = document.createElement("div");

hotbarUI.style.position = "absolute";
hotbarUI.style.bottom = "20px";
hotbarUI.style.left = "50%";
hotbarUI.style.transform = "translateX(-50%)";
hotbarUI.style.display = "flex";
hotbarUI.style.gap = "10px";
hotbarUI.style.zIndex = "9999";

document.body.appendChild(hotbarUI);

function renderHotbar() {

    hotbarUI.innerHTML = "";

    hotbar.forEach((item, i) => {

        const slot = document.createElement("div");

        slot.style.width = "70px";
        slot.style.height = "70px";
        slot.style.borderRadius = "10px";
        slot.style.display = "flex";
        slot.style.alignItems = "center";
        slot.style.justifyContent = "center";
        slot.style.fontWeight = "bold";
        slot.style.cursor = "pointer";
        slot.style.userSelect = "none";

        if (i === selectedSlot) {
            slot.style.background = "#fff";
            slot.style.border = "3px solid #00ff88";
            slot.style.color = "black";
            slot.style.transform = "scale(1.1)";
        } else {
            slot.style.background = "rgba(0,0,0,0.5)";
            slot.style.border = "2px solid rgba(255,255,255,0.2)";
            slot.style.color = "white";
        }

        slot.innerText = (i + 1) + " " + item.name;

        slot.onclick = () => {
            selectedSlot = i;
            renderHotbar();
        };

        hotbarUI.appendChild(slot);
    });
}

renderHotbar();

// ======================
// ⌨️ SLOT SWITCH (1 / 2)
// ======================
window.addEventListener("keydown", (e) => {

    if (e.key === "1") selectedSlot = 0;
    if (e.key === "2") selectedSlot = 1;

    renderHotbar();
});

// ======================
// 🌱 PLANTING SYSTEM
// ======================
window.addEventListener("mousedown", () => {

    if (document.pointerLockElement !== document.body) return;

    const selected = hotbar[selectedSlot];

    if (inventory[selected.name] <= 0) return;

    // direction voor planten
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);

    const pos = player.position.clone().add(dir.multiplyScalar(5));

    createPlant(pos, selected.name);

    inventory[selected.name]--;
});

    requestAnimationFrame(animate);

    movePlayer();
    updatePlants();

    renderer.render(scene, camera);
    // ======================
// 🛒 DEEL 5/10 - SHOP + ECONOMY
// ======================

// 💰 COINS UI
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
        🎮 Controls: WASD + Mouse<br>
        🛒 Shop: E
    `;
}

// ======================
// 🛒 SHOP UI
// ======================
let shopOpen = false;

const shop = document.createElement("div");

shop.style.position = "absolute";
shop.style.top = "50%";
shop.style.left = "50%";
shop.style.transform = "translate(-50%, -50%)";
shop.style.width = "300px";
shop.style.padding = "20px";
shop.style.background = "rgba(0,0,0,0.85)";
shop.style.color = "white";
shop.style.borderRadius = "15px";
shop.style.textAlign = "center";
shop.style.display = "none";
shop.style.zIndex = "9999";

shop.innerHTML = `
<h2>🛒 SHOP</h2>
<button id="buyBasic">Buy Basic Seed - 10💰</button><br><br>
<button id="buyRare">Buy Rare Seed - 25💰</button><br><br>
<p>Press E to close</p>
`;

document.body.appendChild(shop);

// ======================
// 🛒 SHOP ACTIONS
// ======================
document.getElementById("buyBasic").onclick = () => {
    if (coins >= 10) {
        coins -= 10;
        inventory.basic += 1;
    }
};

document.getElementById("buyRare").onclick = () => {
    if (coins >= 25) {
        coins -= 25;
        inventory.rare += 1;
    }
};

// ======================
// ⌨️ TOGGLE SHOP
// ======================
window.addEventListener("keydown", (e) => {

    if (e.key.toLowerCase() === "e") {

        shopOpen = !shopOpen;
        shop.style.display = shopOpen ? "block" : "none";

        if (shopOpen) document.exitPointerLock?.();
    }
});

// ======================
// 🔁 PATCH GAME LOOP (UI FIX)
// ======================
const oldUpdatePlants = updatePlants;

updatePlants = function () {

    oldUpdatePlants();
    updateUI();
};// ======================
// 🌾 DEEL 6/10 - HARVEST SYSTEM
// ======================

// ❌ VERWIJDER AUTOMATISCHE COINS UIT GROEI
function updatePlants() {

    const now = Date.now();

    plants.forEach(p => {

        const elapsed = now - p.userData.startTime;
        const progress = Math.min(elapsed / p.userData.growTime, 1);

        p.userData.growth = progress;

        const scale = 0.5 + progress * 2;
        p.scale.set(scale, scale, scale);

        // 🌱 alleen markeren als grown
        if (progress >= 1) {
            p.userData.grown = true;
        }
    });
}

// ======================
// 🌾 HARVEST SYSTEM
// ======================
function harvestPlant(plant) {

    if (!plant.userData.grown) return;

    coins += plant.userData.value;

    // remove plant
    scene.remove(plant);

    const index = plants.indexOf(plant);
    if (index > -1) plants.splice(index, 1);
}

// ======================
// 🖱️ CLICK TO HARVEST
// ======================
window.addEventListener("mousedown", () => {

    if (shopOpen) return;
    if (document.pointerLockElement !== document.body) return;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(0, 0);

    raycaster.setFromCamera(mouse, camera);

    const hits = raycaster.intersectObjects(plants);

    if (hits.length > 0) {

        const plant = hits[0].object;

        harvestPlant(plant);

        return;
    }

    // 🌱 fallback = plant seeds
    const selected = hotbar[selectedSlot];

    if (inventory[selected.name] <= 0) return;

    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);

    const pos = player.position.clone().add(dir.multiplyScalar(5));

    createPlant(pos, selected.name);

    inventory[selected.name]--;
});// ======================
// 🌤️ DEEL 7/10 - DAY & NIGHT + WEATHER
// ======================

// 🌍 TIME SYSTEM
let time = 0; // 0 - 1 (dag -> nacht)
let timeSpeed = 0.0005;

// 🌞 LIGHT REFERENCE (maak nieuwe als backup)
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);

// 🌤️ SKY COLOR UPDATE
function updateSky() {

    time += timeSpeed;
    if (time > 1) time = 0;

    // dag → nacht kleuren
    const dayColor = new THREE.Color(0xbfe9ff);
    const nightColor = new THREE.Color(0x0b1a2a);

    const sky = dayColor.clone().lerp(nightColor, Math.sin(time * Math.PI));

    scene.background = sky;

    // licht intensiteit
    const lightIntensity = 1 - Math.sin(time * Math.PI) * 0.6;
    sun.intensity = lightIntensity;
    ambient.intensity = 0.2 + lightIntensity * 0.3;
}

// 🌦️ SIMPLE WEATHER
let weather = "clear"; // clear / rain / cloudy

function updateWeather() {

    // random switch (heel simpel)
    if (Math.random() < 0.0005) {

        const states = ["clear", "cloudy"];
        weather = states[Math.floor(Math.random() * states.length)];
    }

    if (weather === "cloudy") {
        scene.fog.density = 0.002;
        sun.intensity *= 0.8;
    } else {
        scene.fog.density = 0.001;
    }
}

// 🔁 PATCH ANIMATE LOOP
const oldAnimate2 = animate;

animate = function () {

    requestAnimationFrame(animate);

    movePlayer();
    updatePlants();
    updateSky();
    updateWeather();

    renderer.render(scene, camera);
};// ======================
// 🔊 DEEL 8/10 - EFFECTS + POLISH
// ======================

// 🎵 SIMPLE AUDIO SYSTEM (optioneel geluid)
const audioEnabled = false;

// 🔊 SOUND FUNCTION (placeholder)
function playSound(type) {
    if (!audioEnabled) return;

    // later kunnen we echte sounds toevoegen
    console.log("Play sound:", type);
}

// ✨ PLANT SPAWN EFFECT
function createPlant(position, type = "basic") {

    const data = plantTypes[type];

    const plant = new THREE.Mesh(
        new THREE.ConeGeometry(0.5, 1, 10),
        new THREE.MeshStandardMaterial({ color: data.color })
    );

    plant.position.copy(position);
    plant.position.y = 0.5;

    plant.scale.set(0.1, 0.1, 0.1); // spawn klein

    plant.userData = {
        type,
        growth: 0,
        grown: false,
        value: data.value,
        growTime: data.growTime,
        startTime: Date.now()
    };

    scene.add(plant);
    plants.push(plant);

    playSound("plant");

    // 🌱 grow animation pop-in
    let grow = 0;
    const interval = setInterval(() => {

        grow += 0.05;

        plant.scale.set(grow, grow, grow);

        if (grow >= 0.5) {
            clearInterval(interval);
        }

    }, 16);
}

// 🌾 HARVEST EFFECT
function harvestPlant(plant) {

    if (!plant.userData.grown) return;

    coins += plant.userData.value;

    playSound("harvest");

    // 💥 pop effect
    let scale = plant.scale.x;

    const pop = setInterval(() => {

        scale -= 0.05;

        if (scale <= 0) {
            clearInterval(pop);

            scene.remove(plant);

            const index = plants.indexOf(plant);
            if (index > -1) plants.splice(index, 1);
        }

        plant.scale.set(scale, scale, scale);

    }, 16);
}

// 🎥 CAMERA BOB
    // ======================
// 💾 DEEL 9/10 - SAVE / LOAD SYSTEM
// ======================

// 📦 LOAD GAME
function loadGame() {

    const data = localStorage.getItem("gag3_save");

    if (!data) return;

    try {
        const save = JSON.parse(data);

        coins = save.coins || 0;
        inventory.basic = save.basic || 0;
        inventory.rare = save.rare || 0;

        console.log("💾 Game loaded!");
    } catch (e) {
        console.log("❌ Load failed");
    }
}

// 💾 SAVE GAME
function saveGame() {

    const data = {
        coins,
        basic: inventory.basic,
        rare: inventory.rare
    };

    localStorage.setItem("gag3_save", JSON.stringify(data));
}

// 🔁 AUTO SAVE TIMER
setInterval(() => {
    saveGame();
}, 5000);

// 🟢 LOAD ON START
loadGame();

// ======================
// 🌱 PATCH UI SAVE FEEDBACK
// ======================
function updateUI() {

    ui.innerHTML = `
        💰 Coins: ${coins}<br>
        🌱 Basic seeds: ${inventory.basic}<br>
        🌟 Rare seeds: ${inventory.rare}<br>
        💾 Auto-save actief<br>
        🛒 Shop: E
    `;
}// ======================
// 🏁 DEEL 10/10 - FINAL FIXES + POLISH
// ======================

// ⚠️ FIX: ensure arrays exist (veiligheid)
if (!plants) console.error("Plants array ontbreekt!");
if (!inventory) console.error("Inventory ontbreekt!");

// ======================
// 🔁 SINGLE MASTER LOOP FIX
// ======================

// ❌ oude animate wrappers verwijderen effect (veilig herschrijven)
function gameLoop() {

    requestAnimationFrame(gameLoop);

    // 🎮 core movement
    movePlayer();

    // 🌱 plant growth
    updatePlants();

    // 🌤️ world systems
    updateSky();
    updateWeather();

    // 🎥 camera polish
    cameraBob();

    // 🎮 render
    renderer.render(scene, camera);
}

// 🚀 start clean loop (BELANGRIJK)
gameLoop();

// ======================
// 🧹 CLEAN POINTER LOCK FIX
// ======================
document.addEventListener("pointerlockchange", () => {

    if (document.pointerLockElement !== document.body) {
        console.log("🖱️ Pointer unlocked");
    }
});

// ======================
// ⚡ PERFORMANCE IMPROVEMENTS
// ======================

// reduce garbage creation (reuse vector)
const tempVec = new THREE.Vector3();

// override movePlayer (optimized version)
function movePlayer() {

    const dir = tempVec;
    player.getWorldDirection(dir);
    dir.y = 0;
    dir.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(dir, new THREE.Vector3(0, 1, 0));

    if (keys["w"]) player
    
};
