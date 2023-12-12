import * as THREE from "three";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function getRandomIntInclusive(min, max) {
  const newMin = Math.ceil(min);
  const newMax = Math.floor(max);

  return Math.floor(Math.random() * (newMax - newMin + 1)) + newMin;
}


renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// const geometry = new THREE.PlaneGeometry(10, 10, 10, 10);
const geometry = new THREE.PlaneBufferGeometry(10, 10, 10, 10);
const material = new THREE.MeshBasicMaterial({ color: 0xff00ff, side: THREE.DoubleSide, wireframe: true });

// geometry.elementsNeedUpdate = true;
// geometry.verticesNeedUpdate = true;

// const randFace = getRandomIntInclusive(0, geometry.faces.length);
// console.log(`rand: ${rand}`);
// geometry.faces.splice(rand, 1);

const plane = new THREE.Mesh(geometry, material);
scene.add(plane);

// const randVer = getRandomIntInclusive(0, geometry.vertices.length - 1);
// console.log(`randVer: ${randVer}`);
// geometry.vertices.splice(randVer, 1);

// const nameVertFace = Object.freeze({
//     0: "a",
//     1: "b",
//     2: "c"
// });
// const faceToRemove = [];
// for (const [i, face] of geometry.faces.entries()) {
//     const { a, b, c } = face;
//     let faceRemoved = false;
//     for (const [j, point] of [a, b, c].entries()) {
//         if (point === randVer) {
//             faceToRemove.push(i);
//             faceRemoved = true;
//             // console.log(`remove face ${i} from ${nameVertFace[j].toUpperCase()} check`);
//             break;
//         }
//     }
//     if (faceRemoved === false) {
//         for (const [j, point] of [a, b, c].entries()) {
//             if (point > randVer) {
//                 face[nameVertFace[j]] = point - 1;
//                 // console.log(`change index face ${i} from ${nameVertFace[j].toUpperCase()} ${point}`);
//             }
//         }
//     }
// }

// for (const face of faceToRemove.reverse()) {
//     geometry.faces.splice(face, 1);
// }

// const vertex = new THREE.Vector3(6, -5, 0);
// geometry.vertices.push(vertex);


// const vertexInd0 = geometry.vertices.length - 13;
// const vertexInd1 = geometry.vertices.length - 2;
// const vertexInd2 = geometry.vertices.length - 1;
// const normal = new THREE.Vector3(0, 0, 1);
// const color = new THREE.Color(0xff0000);

// console.log(geometry.vertices[vertexInd0]);
// console.log(geometry.vertices[vertexInd1]);
// console.log(geometry.vertices[vertexInd2]);

// const face = new THREE.Face3(vertexInd0, vertexInd1, vertexInd2, normal, color);
// geometry.faces.push(face);

console.log(geometry);
console.log(geometry.toNonIndexed());


// var geometry = new THREE.BoxGeometry( 1, 1, 1 );
// var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// var cube = new THREE.Mesh( geometry, material );
// scene.add( cube );

camera.position.z = 5;
camera.position.y = -4.5;
camera.rotation.x = 0.5;

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
