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

        // this.materials = [basicMaterial];

        this.infinitPlane = new Plane(new Vector3(0, 1, 0));
        // game.currentScene.add(this.infinitPlane);

        this.raycaster = new Raycaster();
        this.initialized = true;
    }

    initTerrainGeometry(terrainMeterial) {
        const geometry = new PlaneBufferGeometry(this.size, this.size, this.size, this.size);
        // console.log(geometry);
        geometry.rotateX(Math.PI / 2);

        this.wireframeMaterial = new MeshBasicMaterial(terrainMeterial);
        const basicMaterial = new MeshBasicMaterial({
            color: 0xffff00,
            side: THREE.DoubleSide
        });

        this.mesh = new Mesh(geometry, basicMaterial);
        const wireframeMesh = new Mesh(geometry, this.wireframeMaterial);
        game.currentScene.add(this.mesh);
        game.currentScene.add(wireframeMesh);

        this.planes = [];
        this.planes[0] = [];
        this.planes[0][0] = {
            plane: this.mesh
        };

        this.ghostPlanes = [];

        this.initGhostPlane(this.mesh);
        this.initPointsGeometry(geometry);
    }

    initGhostPlane(planeMesh) {
        console.log(planeMesh);
        const { position } = planeMesh;

        this.ghostPlaneMaterial = new MeshBasicMaterial({
            color: 0x00ff00,
            side: THREE.DoubleSide,
            visible: false
        });

        for (let x = position.x - this.size; x <= position.x + this.size; x += this.size * 2) {
            const ghostPlaneGeo = new PlaneBufferGeometry(this.size, this.size, this.size, this.size);
            ghostPlaneGeo.rotateX(Math.PI / 2);
            ghostPlaneGeo.translate(x, 0, 0);

            const ghostMesh = new Mesh(ghostPlaneGeo, this.ghostPlaneMaterial);
            game.currentScene.add(ghostMesh);
            this.ghostPlanes[x] = [];
            this.ghostPlanes[x][0] = ghostMesh;
            // this.ghostPlanes.push(ghostMesh);
        }
        for (let z = position.z - this.size; z <= position.z + this.size; z += this.size * 2) {
            const ghostPlaneGeo = new PlaneBufferGeometry(this.size, this.size, 1, 1);
            ghostPlaneGeo.rotateX(Math.PI / 2);
            ghostPlaneGeo.translate(0, 0, z);

            const ghostMesh = new Mesh(ghostPlaneGeo, this.ghostPlaneMaterial);
            game.currentScene.add(ghostMesh);
            this.ghostPlanes[0] = [];
            this.ghostPlanes[0][z] = ghostMesh;
            // this.ghostPlanes.push(ghostMesh);
        }
        console.log(this.ghostPlanes);
        console.log(this.ghostPlanes.length);
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
        const terrainModeElem = document.querySelector("#terrainMode > span");
        terrainModeElem.textContent = this.mode;
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
