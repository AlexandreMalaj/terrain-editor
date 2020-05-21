/* eslint-disable max-classes-per-file, no-empty-function, class-methods-use-this, max-depth */

import Brush from "./Brush.js";
import Easing from "./class/Easing.js";

const {
    Vector3,
    Raycaster,
    Points,

    MeshBasicMaterial,
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

        this.brush = new Brush(10);
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
        console.log(this.points);
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

        this.raycaster = new THREE.Raycaster();
        this.initialized = true;
    }

    initTerrainGeometry(terrainMeterial) {
        this.pointGeometry = new BufferGeometry();
        const pointMaterial = new PointsMaterial({ color: 0xff0000, size: 0.5 });
        const pointMesh = new Points(this.pointGeometry, pointMaterial);
        game.currentScene.add(pointMesh);


        const geometry = new PlaneBufferGeometry(this.size, this.size, this.size, this.size);
        console.log(geometry);

        this.wireframeMaterial = new MeshBasicMaterial(terrainMeterial);
        const basicMaterial = new MeshBasicMaterial({
            color: 0x00ff00,
            side: THREE.DoubleSide
        });

        this.mesh = new Mesh(geometry, basicMaterial);
        const wireframeMesh = new Mesh(geometry, this.wireframeMaterial);
        game.currentScene.add(this.mesh);
        game.currentScene.add(wireframeMesh);

        this.initPointsGeometry(geometry);
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
                z: geoPoints[i + 1],
                y: geoPoints[i + 2]
            };
            const obj = this.points[pos.x][pos.z];
            obj.index = i + 2;
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
            const newModeIndex = nextIndex >= allModes.lenght ? 0 : nextIndex;

            this.mode = allModes[newModeIndex];
        }

        if (typeof newMode === "string" && Terrain.MODE.has(newMode)) {
            this.mode = newMode;
        }
    }

    updatePlane() {
        // const newPlane = new PlaneBufferGeometry(this.size, this.size, this.size, this.size);
        // this.plane.push(newPlane);
        // console.log("updatePlane");
    }

    updateTerrainMaterial() {

    }

    changeBrushSize() {
        if (this.input.isKeyDown("ControlLeft")) {
            // console.log("left control down");
            const mouseDeltaX = this.input.getMouseDelta().x;
            const newSize = this.brush.size + mouseDeltaX * 10;
            this.brush.changeSize(newSize);
            console.log(this.brush.size);
        }
    }

    getPointsInBrush() {
        const [intersect] = this.raycaster.intersectObject(this.mesh, false);
        if (typeof intersect !== "undefined") {
            let { point } = intersect;
            if (this.input.wasKeyJustPressed("ControlLeft")) {
                this.keepPointEditTerrain = point;
            }
            if (this.input.isKeyDown("ControlLeft")) {
                point = this.keepPointEditTerrain;
            }
            // console.log(point);

            let minX = Math.ceil(point.x - this.brush.size);
            minX = minX < this.minX ? this.minX : minX;

            let minZ = Math.ceil(point.y - this.brush.size);
            minZ = minZ < this.minZ ? this.minZ : minZ;

            let maxX = Math.floor(point.x + this.brush.size);
            maxX = maxX > this.maxX ? this.maxX : maxX;

            let maxZ = Math.floor(point.y + this.brush.size);
            maxZ = maxZ > this.maxZ ? this.maxZ : maxZ;

            // new to improve later with multiple plane
            const pointsArray = [];
            const pointsInBrush = [];
            const radiusSq = Math.pow(this.brush.size, 2);
            for (let x = minX; x <= maxX; x++) {
                for (let z = minZ; z <= maxZ; z++) {
                    const distance = Math.pow(x - point.x, 2) + Math.pow(z - point.y, 2);
                    if (distance <= radiusSq) {
                        pointsArray.push(x, z, this.points[x][z].y + 0.05);
                        pointsInBrush.push(this.points[x][z]);
                    }
                }
            }
            const vertices = new Float32Array(pointsArray);
            this.pointGeometry.addAttribute("position", new THREE.BufferAttribute(vertices, 3));

            return {
                brushPoint: point,
                pointsInBrush
            };
        }

        return {
            brushPoint: null,
            pointsInBrush: []
        };
    }

    updateEditTerrain() {
        this.changeBrushSize();
        const { brushPoint, pointsInBrush } = this.getPointsInBrush();
        // console.log(pointsInBrush);
        let STRENGTH = 0.3;
        let down = false;
        if (this.input.isMouseButtonDown(2)) {
            down = true;
            STRENGTH = -STRENGTH;
        }
        if (this.input.isMouseButtonDown(0) || down === true) {
            if (this.input.isKeyDown("ControlLeft")) {
                return;
            }
            const brushSizeSq = this.brush.size * this.brush.size;
            for (const point of pointsInBrush) {
                const distance = Math.pow(brushPoint.x - point.x, 2) + Math.pow(brushPoint.y - point.z, 2);

                const factor = 1 - distance / brushSizeSq;
                const easedFactor = Easing.smoothstep(0, 1, factor);

                // reprendre la plan geometrique
                const { index, object: geometry } = this.points[point.x][point.z];
                geometry.attributes.position.array[index] += easedFactor * STRENGTH;
                this.points[point.x][point.z].y += easedFactor * STRENGTH;

                // try to see if we can update geometry if we switch for multiple plain
                geometry.attributes.position.needsUpdate = true;
            }
        }
    }

    updatePaint() {
        // console.log("updatePaint");
    }

    update() {
        if (this.initialized === false) {
            return;
        }

        const mousePos = game.input.getMousePosition();
        this.raycaster.setFromCamera(mousePos, this.camera);
        switch (this.mode) {
            case "vertex": {
                this.updateEditTerrain();
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
                this.updateMoveTerrain();
            }
        }
        if (this.input.wasKeyJustPressed("Tab")) {
            this.switchMode();
        }
    }
}


class Point extends Vector3 {
    constructor(x, y, z) {
        super(x, y, z);
        this.faces = [];
    }
}

class Face {
    constructor(p0, p1, p2) {
        this.p0 = p0;
        this.p1 = p1;
        this.p2 = p2;

        this.points = [];
    }
}

Terrain.MODE = new Set(["vertex", "paint", "plane"]);
