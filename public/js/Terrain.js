/* eslint-disable max-classes-per-file, no-empty-function, class-methods-use-this, max-depth */

import TerrainModifier from "./TerrainModifier.js";

const {
    Vector3,
    Raycaster,

    MeshBasicMaterial,
    MeshPhongMaterial,
    PointsMaterial,
    ShaderMaterial,
    Mesh,

    BufferGeometry,
    PlaneBufferGeometry,
    Plane
} = THREE;

const VERTEX_SHADER = ``;
const FRAGMENT_SHADER = ``;

export default class Terrain {
    constructor(size, camera, options = Object.create(null)) {
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
        const {
            material = {
                color: 0x000000,
                wireframe: true
            }
        } = options;


        this.points = [];
        this.initTerrainGeometry(material);
        this.terrainModifier = new TerrainModifier(this.camera, this.mesh, this.points);
        // console.log(this.points);
        // this.shaderMaterial = new ShaderMaterial({
        //     uniforms: {
        //         time: { value: 1.0 },
        //         resolution: { value: new THREE.Vector2() }
        //     },
        //     vertexShader: VERTEX_SHADER,
        //     fragmentShader: FRAGMENT_SHADER
        // });

        // console.log(this.points);


        // this.planes = [geometry];
        // this.materials = [basicMaterial];

        this.infinitPlane = new Plane(new Vector3(0, 1, 0));
        // game.currentScene.add(this.infinitPlane);

        // this.raycaster = new THREE.Raycaster();
        this.initialized = true;
    }

    initTerrainGeometry(terrainMeterial) {
        // this.pointGeometry = new BufferGeometry();
        // const pointMaterial = new PointsMaterial({ color: 0xff0000, size: 0.5 });
        // const pointMesh = new Points(this.pointGeometry, pointMaterial);
        // game.currentScene.add(pointMesh);


        const geometry = new PlaneBufferGeometry(this.size, this.size, this.size, this.size);
        // console.log(geometry);
        geometry.rotateX(Math.PI / 2);

        this.wireframeMaterial = new MeshBasicMaterial(terrainMeterial);
        const basicMaterial = new MeshBasicMaterial({
            color: 0xffff00,
            side: THREE.DoubleSide
        });

        this.mesh = new Mesh(geometry, basicMaterial);
        // this.mesh.rotation.x = Math.PI / 2;
        const wireframeMesh = new Mesh(geometry, this.wireframeMaterial);
        // wireframeMesh.rotation.x = Math.PI / 2;
        game.currentScene.add(this.mesh);
        game.currentScene.add(wireframeMesh);

        this.initPointsGeometry(geometry);
    }

    initPointsGeometry(geometry) {
        // const goePos = geometry.transform.position;
        const geoPoints = geometry.getAttribute("position").array;
        console.log(geometry);
        // console.log(goePos);

        for (let x = this.minX; x <= this.maxX; x++) {
            this.points[x] = [];
            for (let z = this.minZ; z <= this.maxZ; z++) {
                this.points[x][z] = {
                    x,
                    z,
                    y: 0,
                    index: -1,
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
            // console.log(pos);
            const obj = this.points[pos.x][pos.z];
            obj.index = i + 1;
            obj.object = geometry;
            // console.log(obj.index);
        }
    }

    switchMode(newMode) {
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
        const terrainModeElem = document.querySelector("#terrainMode > span");
        terrainModeElem.textContent = this.mode;
    }

    updatePlane() {
        // const newPlane = new PlaneBufferGeometry(this.size, this.size, this.size, this.size);
        // this.plane.push(newPlane);
        // console.log("updatePlane");
    }

    updateTerrainMaterial() {

    }

    updatePaint() {
        // console.log("updatePaint");
    }

    update() {
        if (this.initialized === false) {
            return;
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
        if (this.input.wasKeyJustPressed("Tab")) {
            this.switchMode();
        }
    }
}
Terrain.MODE = new Set(["terrainModifier", "paint", "plane"]);
