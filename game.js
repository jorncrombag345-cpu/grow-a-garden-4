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
light.position.set(10, 20, 10);
scene.add(light);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));

// GROUND
const ground = new THREE.Mesh(
new THREE.PlaneGeometry(200, 200),
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

// MOVE
function move() {
const dir = new THREE.Vector3();
player.getWorldDirection(dir);
dir.y = 0;
dir.normalize();

const right = new THREE.Vector3();
right.crossVectors(dir, new THREE.Vector3(0,1,0));

if (keys["w"]) player.position.addScaledVector(dir, 0.2);
if (keys["s"]) player.position.addScaledVector(dir, -0.2);
if (keys["a"]) player.position.addScaledVector(right, 0.2);
if (keys["d"]) player.position.addScaledVector(right, -0.2);
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
