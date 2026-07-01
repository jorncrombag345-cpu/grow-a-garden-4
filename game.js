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
