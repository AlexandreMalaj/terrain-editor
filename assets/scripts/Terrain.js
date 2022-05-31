/* eslint-disable max-classes-per-file, no-empty-function, class-methods-use-this, max-depth */

import * as THREE from "three";
const {
    TransformControls,
    Uniform,
    Vector3,
    Raycaster,

    MeshBasicMaterial,
    MeshPhongMaterial,
    PointsMaterial,
    Mesh,
    VertexNormalsHelper,

    BufferGeometry,
    PlaneBufferGeometry,
    Plane
} = THREE;

// import rockURL from "../materials/rock.jpg";
import grass from "../materials/grass.jpg";
// import cobble from "../materials/cobble.png";
// import crackedDirt from "../materials/crackedDirt.jpg";
import TerrainModifier from "./TerrainModifier.js";
import terrainShader from "./TerrainShader.js";

import { join } from "path";
import fs from "fs";
const { readdir } = fs.promises;


export default class Terrain {
    constructor(size, camera) {
        this.initialized = false;

        this.input = game.input;
        this.size = size;
        if (size % 2 !== 0) {
            throw new Error("Size param must be a pair number");
        }

        this.minX = -this.size / 2;
        this.minZ = -this.size / 2;
        this.maxX = this.size / 2;
        this.maxZ = this.size / 2;

        // this.brush = new Brush(10);
        this.camera = camera;
        this.mode = [...Terrain.MODE][0];
        // this.mode = "terrainModifier";

        this.ghostPlaneMaterial = new MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            side: THREE.DoubleSide,
            visible: false
        });

        this.init().catch(console.error);

        // this.materials = [basicMaterial];

        game.on("update", () => {
            this.update();
        });
    }

    async init() {
        this.textures = [];
        await this.loadTerrainTexture("./assets/materials");

        this.points = [];
        this.initTerrainGeometry();

        this.terrainModifier = new TerrainModifier(this);

        this.infinitPlane = new Plane(new Vector3(0, 1, 0));
        // game.currentScene.add(this.infinitPlane);
        this.raycaster = new Raycaster();
        this.initialized = true;
    }

    async loadTerrainTexture(folder) {
        const files = await readdir(folder);

        for (const file of files) {
            // console.log(file);
            const texture = new THREE.TextureLoader().load(join("..", folder, file));
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            this.textures.push(texture);
        }

        console.log(this.textures);
    }

    initTerrainGeometry() {
        const geometry = new PlaneBufferGeometry(this.size, this.size, this.size, this.size);
        // console.log(geometry);
        geometry.rotateX(-Math.PI / 2);

        const pointLight = new THREE.PointLight(0xffffff, 1, 100);
        pointLight.position.set(0, 10, 0);
        game.currentScene.add(pointLight);

        // const sphereSize = 1;
        // const pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
        // game.currentScene.add(pointLightHelper);

        // soft white light
        // const ambientLight = new THREE.AmbientLight(0x00ff00);
        // game.currentScene.add(ambientLight);

        this.wireframeMaterial = new MeshBasicMaterial({
            color: 0x000000,
            wireframe: true
        });

        const blankCanvas = document.createElement("canvas").getContext("2d");
        blankCanvas.canvas.width = this.size * 16;
        blankCanvas.canvas.height = this.size * 16;
        blankCanvas.fillStyle = "#FFF";
        blankCanvas.fillRect(0, 0, blankCanvas.canvas.width, blankCanvas.canvas.height);

        const basicMaterial = new MeshBasicMaterial({
            // color: 0xffff00,
            side: THREE.DoubleSide,
            map: new THREE.CanvasTexture(blankCanvas.canvas)
        });

        // const uniforms = THREE.UniformsUtils.merge([
        //     THREE.UniformsLib.ambient,
        //     THREE.UniformsLib.lights,
        //     {
        //         map: { type: "t", value: rockTexture },
        //         scale: { type: "f", value: 10 }
        //     }
        // ]);
        // console.log(THREE.UniformsLib);
        // console.log(uniforms);

        const uniforms = {
            map: { type: "t", value: this.textures[3] },
            scale: { type: "f", value: 10 },
            phongMaterial: {
                value: {
                    position: new Vector3(0, 1, 0),

                    ambientColor: new Vector3(0.5, 0.5, 0.5),
                    diffuseColor: new Vector3(0.5, 0.5, 0.5),
                    specularColor: new Vector3(1, 1, 1),
                    ambientStrength: 0.3,
                    specularStrength: 0.5,
                    shininess: 256,

                    constant: 0.5,
                    linear: 0.5,
                    quadratic: 0.5
                }
            }
            // lightPos: new Uniform(new Vector3(0, 2, 0)),
            // specularStrength: { type: "f", value: 0.5 },
            // shininess: { type: "f", value: 32 }
        };
        const shaderMaterial = terrainShader(uniforms);

        this.mesh = new Mesh(geometry, basicMaterial);
        const wireframeMesh = new Mesh(geometry, this.wireframeMaterial);
        // this.helperNormal = new VertexNormalsHelper(this.mesh, 2, 0x00ff00, 1);
        // game.currentScene.add(this.helperNormal);
        game.currentScene.add(this.mesh);
        // game.currentScene.add(wireframeMesh);

        this.planes = [];
        this.planes[0] = [];
        this.planes[0][0] = {
            plane: this.mesh
        };

        this.ghostPlanes = [];

        this.initGhostPlane(this.mesh);
        this.initPointsGeometry(geometry);
    }

    createGhostPlane(translation) {
        const { x, z } = translation;
        const ghostPlaneGeo = new PlaneBufferGeometry(this.size, this.size, this.size, this.size);
        ghostPlaneGeo.rotateX(Math.PI / 2);
        ghostPlaneGeo.translate(x, 0, z);

        const ghostMesh = new Mesh(ghostPlaneGeo, this.ghostPlaneMaterial);
        game.currentScene.add(ghostMesh);
        this.ghostPlanes[x] = [];
        this.ghostPlanes[x][z] = ghostMesh;
        // this.ghostPlanes.push(ghostMesh);
    }

    initGhostPlane(planeMesh) {
        // console.log(planeMesh);
        const { position } = planeMesh;

        for (let x = position.x - this.size; x <= position.x + this.size; x += this.size * 2) {
            this.createGhostPlane(new Vector3(x, 0, 0));
        }
        for (let z = position.z - this.size; z <= position.z + this.size; z += this.size * 2) {
            this.createGhostPlane(new Vector3(0, 0, z));
        }
        // console.log(this.ghostPlanes);
        // console.log(this.ghostPlanes.length);
    }

    initPointsGeometry(geometry) {
        // const goePos = geometry.transform.position;
        const geoPoints = geometry.getAttribute("position").array;
        // console.log(goePos);

        for (let x = this.minX; x <= this.maxX; x++) {
            this.points[x] = [];
            for (let z = this.minZ; z <= this.maxZ; z++) {
                this.points[x][z] = {
                    x,
                    z,
                    y: 0,
                    index: -1,
                    textureIndex: 0,
                    object: null
                };
            }
        }
        for (let i = 0; i < geoPoints.length - 1 / 3; i += 3) {
            const pos = {
                x: geoPoints[i],
                y: geoPoints[i + 1],
                z: geoPoints[i + 2]
            };

            const obj = this.points[pos.x][pos.z];
            obj.index = i + 1;
            obj.object = geometry;
        }
    }

    switchMode(newMode) {
        if (this.mode === "plane") {
            this.ghostPlaneMaterial.visible = false;
        }
        if (this.mode === "vertex") {
            this.terrainModifier.clearPoints();
        }
        if (typeof newMode === "undefined") {
            // nextmode
            const currentMode = this.mode;
            const allModes = [...Terrain.MODE];
            const nextIndex = allModes.indexOf(currentMode) + 1;
            const newModeIndex = nextIndex >= allModes.length ? 0 : nextIndex;
            this.mode = allModes[newModeIndex];
        }
        if (typeof newMode === "string" && Terrain.MODE.has(newMode)) {
            this.mode = newMode;
        }
        // const terrainModeElem = document.querySelector("#terrainMode > span");
        // terrainModeElem.textContent = this.mode;
    }

    updatePlane() {
        this.ghostPlaneMaterial.visible = true;
        const mousePos = game.input.getMousePosition();
        this.raycaster.setFromCamera(mousePos, this.camera);

        const intersect = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(this.infinitPlane, intersect);
        const centerToPlane = new Vector3(0);
        centerToPlane.x = Math.floor((intersect.x + this.side / 2) / this.size);
        // console.log(intersect);
    }

    updateTerrainMaterial() {

    }

    updatePaint() {
        // console.log("updatePaint");
    }

    update() {
        // this.helperNormal.update();
        if (this.initialized === false) {
            return;
        }

        if (this.input.wasKeyJustPressed("Tab")) {
            this.switchMode();
        }
        // const mousePos = game.input.getMousePosition();
        // this.raycaster.setFromCamera(mousePos, this.camera);
        switch (this.mode) {
            case "terrainModifier": {
                // this.updateEditTerrain();
                this.terrainModifier.update();
                break;
            }
            case "paint": {
                this.updatePaint();
                break;
            }
            case "plane": {
                this.updatePlane();
                break;
            }
            default: {
                this.terrainModifier.update();
            }
        }
    }
}
Terrain.MODE = new Set(["terrainModifier", "paint", "plane"]);
