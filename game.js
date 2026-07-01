
// ======================
// GAG3 CLEAN BASE GAME
// ======================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
75,
window.innerWidth / window.innerHeight,
0.1,
1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// LIGHT
const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(20, 40, 20);
scene.add(light);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));

// GROUND
const ground = new THREE.Mesh(
new THREE.PlaneGeometry(300, 300),
new THREE.MeshStandardMaterial({ color: 0x4caf50 })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// PLAYER
const player = new THREE.Object3D();
player.position.set(0, 2, 5);
scene.add(player);
player.add(camera);

// CONTROLS
const keys = {};
let yaw = 0;
let pitch = 0;
const speed = 0.2;

window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

document.body.addEventListener("click", () => {
document.body.requestPointerLock();
});

window.addEventListener("mousemove", (e) => {
if (document.pointerLockElement !== document.body) return;

yaw -= e.movementX * 0.002;
pitch -= e.movementY * 0.002;

pitch = Math.max(-1.5, Math.min(1.5, pitch));

player.rotation.y = yaw;
camera.rotation.x = pitch;
});

// TREES
function spawnTrees() {
for (let i = 0; i < 25; i++) {

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

// MOVE
function move() {

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
move();
renderer.render(scene, camera);
}

animate();
