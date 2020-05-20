import FreeFlyCamera from "./class/FreeflyCamera.js";
import GameRenderer from "./class/GameRenderer.js";

const { Vector3, Plane } = THREE;

const raycaster = new THREE.Raycaster();
const game = new GameRenderer();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
game.init(camera);
window.game = game;

const freefly = new FreeFlyCamera(camera);


const geometry = new THREE.PlaneBufferGeometry(10, 10, 10, 10);
console.log(geometry);


const material = new THREE.MeshBasicMaterial({ color: 0x0000ff, side: THREE.DoubleSide, wireframe: true });

const infinitPlane = new Plane(new Vector3(0, 1, 0));


// const geometry = new THREE.PlaneBufferGeometry(10, 10, 10, 10);
// const material = new THREE.MeshBasicMaterial({ color: 0xff00ff, side: THREE.DoubleSide, wireframe: true });

// console.log(geometry);
// console.log(geometry.toNonIndexed());

const plane = new THREE.Mesh(geometry, material);
game.currentScene.add(plane);
// game.currentScene.add(infinitPlane);


camera.position.z = 5;
camera.position.y = -4.5;
camera.rotation.x = 0.5;

game.on("update", () => {
    const mousePos = game.input.getMousePosition();
    raycaster.setFromCamera(mousePos, camera);

    const intersects = new THREE.Vector3();
    raycaster.ray.intersectPlane(infinitPlane, intersects);

    freefly.update();
});
// function animate() {
//     requestAnimationFrame(animate);
//     // freefly.update();
//     renderer.render(scene, camera);
// }
// animate();
