const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

// CAMERA
const camera = new THREE.PerspectiveCamera(
75,
window.innerWidth / window.innerHeight,
0.1,
1000
);

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// LIGHT
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

const sun = new THREE.DirectionalLight(0xffffff, 2);
sun.position.set(30, 50, 20);
scene.add(sun);

// GROUND
const ground = new THREE.Mesh(
new THREE.PlaneGeometry(500, 500),
new THREE.MeshStandardMaterial({ color: 0x4caf50 })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// PLAYER
const player = new THREE.Object3D();
player.position.set(0, 2, 5);
scene.add(player);
player.add(camera);

// INPUT
const keys = {};
let yaw = 0;
let pitch = 0;
const speed = 0.2;

window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

renderer.domElement.addEventListener("click", () => {
renderer.domElement.requestPointerLock();
});

window.addEventListener("mousemove", (e) => {
if (document.pointerLockElement !== renderer.domElement) return;

yaw -= e.movementX * 0.002;
pitch -= e.movementY * 0.002;

pitch = Math.max(-1.5, Math.min(1.5, pitch));

player.rotation.y = yaw;
camera.rotation.x = pitch;
});

// TREES
function spawnTrees() {
for (let i = 0; i < 30; i++) {

const tree = new THREE.Group();

const trunk = new THREE.Mesh(
new THREE.CylinderGeometry(0.5, 0.7, 4),
new THREE.MeshStandardMaterial({ color: 0x8b5a2b })
);

const leaves = new THREE.Mesh(
new THREE.SphereGeometry(2),
new THREE.MeshStandardMaterial({ color: 0x2e8b57 })
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

// PLANT SPOTS
const plantSpots = [];

function createPlantSpot(x, z) {

const spot = new THREE.Mesh(
new THREE.PlaneGeometry(3, 3),
new THREE.MeshStandardMaterial({ color: 0x3b2a1a })
);

spot.rotation.x = -Math.PI / 2;
spot.position.set(x, 0.01, z);

scene.add(spot);
plantSpots.push(spot);
}

// grid
for (let x = -20; x <= 20; x += 10) {
for (let z = -20; z <= 20; z += 10) {
createPlantSpot(x, z);
}
}

// COINS
let coins = 0;

// MOVE
function movePlayer() {

const dir = new THREE.Vector3();
player.getWorldDirection(dir);
dir.y = 0;
dir.normalize();

const right = new THREE.Vector3();
right.crossVectors(dir, new THREE.Vector3(0,1,0));

if (keys["w"]) player.position.addScaledVector(dir, speed);
if (keys["s"]) player.position.addScaledVector(dir, -speed);
if (keys["a"]) player.position.addScaledVector(right, speed);
if (keys["d"]) player.position.addScaledVector(right, -speed);
}

// RESIZE
window.addEventListener("resize", () => {
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();
renderer.setSize(window.innerWidth, window.innerHeight);
});

// LOOP
function animate() {
requestAnimationFrame(animate);

movePlayer();

renderer.render(scene, camera);
}

animate();
