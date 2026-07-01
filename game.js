// ==========================
// GAG3 - Game Engine
// game.js
// ==========================

let scene;
let camera;
let renderer;

let player;

const keys = {};

const speed = 0.15;

init();
animate();

function init(){

scene = new THREE.Scene();

scene.background = new THREE.Color(0x87CEEB);

// Camera

camera = new THREE.PerspectiveCamera(
75,
window.innerWidth/window.innerHeight,
0.1,
1000
);

camera.position.set(0,2,5);

// Renderer

renderer = new THREE.WebGLRenderer({
antialias:true
});

renderer.setSize(
window.innerWidth,
window.innerHeight
);

renderer.shadowMap.enabled = true;

document.body.appendChild(renderer.domElement);

// Licht

const sun = new THREE.DirectionalLight(
0xffffff,
2
);

sun.position.set(25,40,10);

sun.castShadow=true;

scene.add(sun);

scene.add(
new THREE.AmbientLight(
0xffffff,
0.6
)
);

// Gras

const ground = new THREE.Mesh(

new THREE.PlaneGeometry(
300,
300
),

new THREE.MeshStandardMaterial({

color:0x4CAF50

})

);

ground.rotation.x = -Math.PI/2;

ground.receiveShadow=true;

scene.add(ground);

// Speler

player = new THREE.Object3D();

player.position.y=1.8;

scene.add(player);

player.add(camera);

document.addEventListener(
"keydown",
e=>{

keys[e.key.toLowerCase()]=true;

});

document.addEventListener(
"keyup",
e=>{

keys[e.key.toLowerCase()]=false;

});

renderer.domElement.addEventListener("click",()=>{

renderer.domElement.requestPointerLock();

});

document.addEventListener(
"mousemove",
mouseLook
);

window.addEventListener(
"resize",
resize
);

}

let yaw=0;
let pitch=0;

function mouseLook(e){

if(document.pointerLockElement!==renderer.domElement)
return;

yaw-=e.movementX*0.002;

pitch-=e.movementY*0.002;

pitch=Math.max(
-Math.PI/2,
Math.min(Math.PI/2,pitch)
);

player.rotation.y=yaw;

camera.rotation.x=pitch;

}

function movement(){

const forward = new THREE.Vector3();

player.getWorldDirection(forward);

forward.y=0;

forward.normalize();

const right = new THREE.Vector3();

right.crossVectors(
forward,
new THREE.Vector3(0,1,0)
);

if(keys["w"])
player.position.addScaledVector(
forward,
speed
);

if(keys["s"])
player.position.addScaledVector(
forward,
-speed
);

if(keys["a"])
player.position.addScaledVector(
right,
speed
);

if(keys["d"])
player.position.addScaledVector(
right,
-speed
);

}

function animate(){

requestAnimationFrame(
animate
);

movement();

renderer.render(
scene,
camera
);

}

function resize(){

camera.aspect=
window.innerWidth/
window.innerHeight;

camera.updateProjectionMatrix();

renderer.setSize(
window.innerWidth,
window.innerHeight
);

}
// ====================================
// GAG3
// game.js
// Deel 1/5
// ====================================

// ---------- SCENE ----------

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x87CEEB);

// ---------- CAMERA ----------

const camera = new THREE.PerspectiveCamera(

75,

window.innerWidth / window.innerHeight,

0.1,

1000

);

// ---------- RENDERER ----------

const renderer = new THREE.WebGLRenderer({

    antialias: true

});

renderer.setSize(

window.innerWidth,

window.innerHeight

);

renderer.shadowMap.enabled = true;

document.body.appendChild(renderer.domElement);

// ---------- LICHT ----------

const sun = new THREE.DirectionalLight(

0xffffff,

2

);

sun.position.set(

40,

60,

20

);

sun.castShadow = true;

scene.add(sun);

const ambient = new THREE.AmbientLight(

0xffffff,

0.7

);

scene.add(ambient);

// ---------- GRAS ----------

const grassMaterial = new THREE.MeshLambertMaterial({

    color: 0x55bb55

});

const ground = new THREE.Mesh(

new THREE.PlaneGeometry(

500,

500

),

grassMaterial

);

ground.rotation.x = -Math.PI / 2;

ground.receiveShadow = true;

scene.add(ground);

// ---------- SPELER ----------

const player = new THREE.Object3D();

player.position.set(

0,

2,

10

);

scene.add(player);

player.add(camera);

// ---------- BESTURING ----------

const keys = {};

const walkSpeed = 0.18;

let yaw = 0;

let pitch = 0;

// ---------- EVENTS ----------

window.addEventListener("keydown",(e)=>{

keys[e.key.toLowerCase()] = true;

});

window.addEventListener("keyup",(e)=>{

keys[e.key.toLowerCase()] = false;

});

renderer.domElement.addEventListener("click",()=>{

renderer.domElement.requestPointerLock();

});

window.addEventListener("mousemove",(event)=>{

if(document.pointerLockElement !== renderer.domElement) return;

yaw -= event.movementX * 0.002;

pitch -= event.movementY * 0.002;

pitch = Math.max(

-Math.PI/2,

Math.min(Math.PI/2,pitch)

);

player.rotation.y = yaw;

camera.rotation.x = pitch;

});

// ---------- RESIZE ----------

window.addEventListener("resize",()=>{

camera.aspect =

window.innerWidth /

window.innerHeight;

camera.updateProjectionMatrix();

renderer.setSize(

window.innerWidth,

window.innerHeight

);

});

// ====================================
// EINDE DEEL 1
// PLAK HIERONDER DEEL 2
// ====================================
// ====================================
// GAG3
// game.js
// Deel 2/5
// ====================================

// ---------- SPELER BEWEGING ----------

// snelheid
const walkSpeed = 0.18;

// speler object (bestaat al uit deel 1)
player.position.set(0, 2, 10);

// richting helpers
const forward = new THREE.Vector3();
const right = new THREE.Vector3();

// ---------- CAMERA START POS ----------
camera.position.set(0, 1.6, 0);

// ---------- MOUSE LOOK VARS ----------
let yaw = 0;
let pitch = 0;

// ---------- UPDATE FUNCTIE ----------
function updatePlayer() {

    // kijkrichting ophalen
    player.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    right.crossVectors(forward, new THREE.Vector3(0,1,0));

    // WASD beweging
    if (keys["w"]) {
        player.position.addScaledVector(forward, walkSpeed);
    }

    if (keys["s"]) {
        player.position.addScaledVector(forward, -walkSpeed);
    }

    if (keys["a"]) {
        player.position.addScaledVector(right, walkSpeed);
    }

    if (keys["d"]) {
        player.position.addScaledVector(right, -walkSpeed);
    }
}

// ---------- MOUSE LOOK UPDATE ----------
function updateLook(event) {

    if (document.pointerLockElement !== renderer.domElement) return;

    yaw -= event.movementX * 0.002;
    pitch -= event.movementY * 0.002;

    pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, pitch));

    player.rotation.y = yaw;
    camera.rotation.x = pitch;
}

// mouse event (extra koppeling veilig)
window.addEventListener("mousemove", updateLook);

// ====================================
// EINDE DEEL 2
// PLAK HIERONDER DEEL 3
// ====================================
// ====================================
// GAG3
// game.js
// Deel 3/5
// ====================================

// ---------- RANDOM HELPER ----------
function rand(min, max) {
    return Math.random() * (max - min) + min;
}

// ---------- BOMEN MAKEN ----------
function createTree(x, z) {

    const group = new THREE.Group();

    // stam
    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.7, 4),
        new THREE.MeshLambertMaterial({ color: 0x8b5a2b })
    );

    trunk.position.y = 2;

    // bladeren
    const leaves = new THREE.Mesh(
        new THREE.SphereGeometry(2),
        new THREE.MeshLambertMaterial({ color: 0x2e8b57 })
    );

    leaves.position.y = 5;

    group.add(trunk);
    group.add(leaves);

    group.position.set(x, 0, z);

    scene.add(group);

    return group;
}

// ---------- PLANTVAKKEN ----------
function createPlot(x, z) {

    const plot = new THREE.Mesh(
        new THREE.PlaneGeometry(3, 3),
        new THREE.MeshLambertMaterial({ color: 0x3d2b1f })
    );

    plot.rotation.x = -Math.PI / 2;
    plot.position.set(x, 0.01, z);

    scene.add(plot);

    return plot;
}

// ---------- WERELD GENERATIE ----------

// bomen
for (let i = 0; i < 25; i++) {
    createTree(
        rand(-80, 80),
        rand(-80, 80)
    );
}

// plantvakken
for (let i = -20; i <= 20; i += 10) {
    for (let j = -20; j <= 20; j += 10) {
        createPlot(i, j);
    }
}

// kleine stenen
for (let i = 0; i < 30; i++) {

    const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.6),
        new THREE.MeshLambertMaterial({ color: 0x888888 })
    );

    rock.position.set(
        rand(-90, 90),
        0.3,
        rand(-90, 90)
    );

    scene.add(rock);
}

// ====================================
// EINDE DEEL 3
// PLAK HIERONDER DEEL 4
// ====================================
// ====================================
// GAG3
// game.js
// Deel 4/5
// ====================================

// ---------- CAMERA SMOOTH FOLLOW ----------
function updateCamera() {
    // camera blijft netjes in speler zitten
    camera.position.set(0, 1.6, 0);
}

// ---------- RESIZE FIX ----------
function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", handleResize);

// ---------- GAME LOOP ----------
function animate() {

    requestAnimationFrame(animate);

    // speler movement updaten
    updatePlayer();

    // camera updaten
    updateCamera();

    // renderen
    renderer.render(scene, camera);
}

// start game loop
animate();

// ---------- POINTER LOCK TIP ----------
document.addEventListener("click", () => {
    if (document.pointerLockElement !== renderer.domElement) {
        renderer.domElement.requestPointerLock();
    }
});

// ====================================
// EINDE DEEL 4
// PLAK HIERONDER DEEL 5
// ====================================
// ====================================
// GAG3
// game.js
// Deel 5/5 (FINAL)
// ====================================

// ---------- MINI UI INFO ----------
const info = document.createElement("div");

info.style.position = "absolute";
info.style.top = "10px";
info.style.left = "10px";
info.style.color = "white";
info.style.fontFamily = "Arial";
info.style.padding = "10px";
info.style.background = "rgba(0,0,0,0.4)";
info.style.borderRadius = "8px";

info.innerHTML = "🌱 GAG3 | WASD = lopen | muis = kijken | klik = starten";

document.body.appendChild(info);

// ---------- BASIC DEBUG ----------
console.log("GAG3 geladen ✔");

// ---------- FUTURE HOOKS (voor later uitbreiden) ----------

// hier gaan we later toevoegen:
// 🌱 planten systeem
// 💰 geld systeem
// 🛒 winkel
// 🎒 inventory
// ⏳ groei systeem

// placeholder functie zodat uitbreiden makkelijk is
function gameUpdate() {
    // later: plant growth, money, etc
}

// ---------- PATCH IN GAME LOOP ----------
const oldAnimate = animate;

animate = function() {
    requestAnimationFrame(animate);

    updatePlayer();
    updateCamera();

    gameUpdate();

    renderer.render(scene, camera);
};

// restart loop met patch
animate();

// ====================================
// GAME IS NU BASIS SPEELBAAR 🎮
// ====================================
