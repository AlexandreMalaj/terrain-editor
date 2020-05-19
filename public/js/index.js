import FreeFlyCamera from "./class/FreeflyCamera.js";
import GameRenderer from "./class/GameRenderer.js";

// import THREE from "three";


const game = new GameRenderer();
// const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
game.init(camera);
window.game = game;
// renderer.setSize(window.innerWidth, window.innerHeight);
// document.body.appendChild(renderer.domElement);

const freefly = new FreeFlyCamera(camera);

// class Point {
//     constructor(vector) {
//         this.x = vector.x;
//         this.y = vector.y;
//         this.z = vector.z;

//         this.trangle = [];
//     }

//     addTriangle(triangle) {
//         this.trangle.push(triangle);
//         // add triangle but check if already exist
//     }
// }

// class Triangle {
//     constructor(a, b, c) {
//         this.a = a;
//         this.b = b;
//         this.c = c;
//     }
// }


const geometry = new THREE.PlaneBufferGeometry(10, 10, 10, 10);

const material = new THREE.MeshBasicMaterial({ color: 0xff00ff, side: THREE.DoubleSide, wireframe: true });

console.log(geometry);

// const geometry = new THREE.PlaneBufferGeometry(10, 10, 10, 10);
// const material = new THREE.MeshBasicMaterial({ color: 0xff00ff, side: THREE.DoubleSide, wireframe: true });

// console.log(geometry);
// console.log(geometry.toNonIndexed());

const plane = new THREE.Mesh(geometry, material);
game.currentScene.add(plane);


camera.position.z = 5;
camera.position.y = -4.5;
camera.rotation.x = 0.5;

game.on("update", () => {
    freefly.update();
});
// function animate() {
//     requestAnimationFrame(animate);
//     // freefly.update();
//     renderer.render(scene, camera);
// }
// animate();
