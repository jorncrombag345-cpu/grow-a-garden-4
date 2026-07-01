// ======================
// 🌱 GAG3 - GRAPHICS UPGRADE
// ======================

// SCENE
const scene = new THREE.Scene();

// 🌫 fog = diepte (belangrijk voor “AAA look”)
scene.fog = new THREE.Fog(0xbfe9ff, 30, 180);

// SKY COLOR
scene.background = new THREE.Color(0xbfe9ff);

// CAMERA
const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

// RENDERER (SHADOWS AAN!)
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// ======================
// LIGHTING (NICE SUN)
// ======================
const sun = new THREE.DirectionalLight(0xffffff, 2.2);
sun.position.set(50, 80, 20);
sun.castShadow = true;

sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;

scene.add(sun);

// zachte ambient light
scene.add(new THREE.AmbientLight(0xffffff, 0.35));

// ======================
// GROUND (BETERE LOOK)
// ======================
const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 500),
    new THREE.MeshStandardMaterial({
        color: 0x3fa34d,
        roughness: 1,
        metalness: 0
    })
);

ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
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
// TREES (BETERE GRAPHICS)
// ======================
function spawnTrees() {

    for (let i = 0; i < 50; i++) {

        const tree = new THREE.Group();

        // trunk (iets realistischer kleur)
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.6, 0.8, 5),
            new THREE.MeshStandardMaterial({ color: 0x7a4a1e })
        );

        trunk.castShadow = true;

        // leaves (meer natuurlijke kleur)
        const leaves = new THREE.Mesh(
            new THREE.SphereGeometry(2.5, 16, 16),
            new THREE.MeshStandardMaterial({ color: 0x1f8f3a })
        );

        leaves.castShadow = true;

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
// PLANTS
// ======================
const plants = [];

function createPlant(pos) {

    const plant = new THREE.Mesh(
        new THREE.ConeGeometry(0.5, 1, 12),
        new THREE.MeshStandardMaterial({ color: 0x2ecc71 })
    );

    plant.position.copy(pos);
    plant.position.y = 0.5;

    plant.castShadow = true;

    plant.userData = {
        growth: 0,
        grown: false
    };

    scene.add(plant);
    plants.push(plant);
}

// click plant
window.addEventListener("mousedown", () => {
    if (document.pointerLockElement !== document.body) return;

    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);

    const pos = player.position.clone().add(dir.multiplyScalar(5));

    createPlant(pos);
});

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
// PLANT GROWTH (VISUAL BETTER)
// ======================
function updatePlants() {

    plants.forEach(p => {

        p.userData.growth += 0.002;

        const scale = 1 + p.userData.growth * 3;
        p.scale.set(scale, scale, scale);

        // kleur overgang (mooier gevoel)
        if (p.userData.growth < 0.5) {
            p.material.color.set(0x2ecc71);
        } else {
            p.material.color.set(0x1e8449);
        }

        p.userData.grown = p.userData.growth > 1;
    });
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

    renderer.render(scene, camera);
}

animate();
