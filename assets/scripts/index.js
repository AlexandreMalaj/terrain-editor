import * as THREE from "three";
// const THREE = require("three");

import FreeFlyCamera from "./class/FreeflyCamera.js";
import GameRenderer from "./class/GameRenderer.js";
import TransformControlsManager from "./class/TransformControlsManager.js";
import LightManager from "./class/LightManager.js";
import Terrain from "./Terrain.js";

document.addEventListener("DOMContentLoaded", () => {
    const raycaster = new THREE.Raycaster();
    const gameDOM = document.getElementById("game");
    const game = new GameRenderer(gameDOM);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    // camera.far = 100;
    game.init(camera);
    window.game = game;
    // camera.up.set(0, 1, 0);
    // const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0));
    // const helper = new THREE.PlaneHelper(plane, 1, 0xffff00);
    // game.currentScene.add(helper);

    const axesHelper = new THREE.AxesHelper(5);
    game.currentScene.add(axesHelper);

    const freefly = new FreeFlyCamera(camera, { speed: 0.5 });
    const terrain = new Terrain(128, camera);

    const lightManager = new LightManager(game.currentScene);
    const light = new THREE.PointLight();
    const light2 = new THREE.PointLight();
    const dirLight = new THREE.DirectionalLight();
    lightManager.addLight(light);
    lightManager.addLight(light2);
    lightManager.addLight(dirLight);

    console.log(lightManager.allLights);
    console.log(LightManager.lightName);

    camera.position.z = 50;
    camera.position.y = 45;
    camera.rotation.x = -0.5;

    game.on("update", () => {
        // const mousePos = game.input.getMousePosition();
        // raycaster.setFromCamera(mousePos, camera);

        // const intersects = new THREE.Vector3();
        // raycaster.ray.intersectPlane(infinitPlane, intersects);
        terrain.update();
        freefly.update();
    });
});
