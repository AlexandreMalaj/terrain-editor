/* eslint-disable max-classes-per-file, no-empty-function, class-methods-use-this, max-depth */

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
        this.size = size;
        if (size % 2 !== 0) {
            throw new Error("Size param must be a pair number");
        }

        const {
            material = {
                color: 0x000000,
                wireframe: true
            }
        } = options;
        this.camera = camera;
        this.input = game.input;
        console.log(this.input);
        this.mode = [...Terrain.MODE][0];
        // this.shaderMaterial = new ShaderMaterial({
        //     uniforms: {
        //         time: { value: 1.0 },
        //         resolution: { value: new THREE.Vector2() }
        //     },
        //     vertexShader: VERTEX_SHADER,
        //     fragmentShader: FRAGMENT_SHADER
        // });
        const geometry = new PlaneBufferGeometry(size, size, size, size);
        this.pointGeometry = new BufferGeometry();
        const pointMaterial = new PointsMaterial({ color: 0xff0000, size: 0.5 });
        const pointMesh = new Points(this.pointGeometry, pointMaterial);
        game.currentScene.add(pointMesh);
        // console.log(geometry);
        this.wireframeMaterial = new MeshBasicMaterial(material);
        const basicMaterial = new MeshBasicMaterial({
            color: 0x0000ff,
            side: THREE.DoubleSide
        });

        this.mesh = new Mesh(geometry, basicMaterial);
        const wireframeMesh = new Mesh(geometry, this.wireframeMaterial);
        game.currentScene.add(this.mesh);
        game.currentScene.add(wireframeMesh);

        this.minX = -this.size / 2;
        this.minZ = -this.size / 2;
        this.maxX = this.size / 2;
        this.maxZ = this.size / 2;

        this.points = [];
        this.initPointsGeometry(geometry);
        // console.log(this.points);


        // this.planes = [geometry];
        // this.materials = [basicMaterial];

        this.infinitPlane = new Plane(new Vector3(0, 1, 0));
        // game.currentScene.add(this.infinitPlane);

        this.raycaster = new THREE.Raycaster();
    }

    initPointsGeometry(geometry) {
        // const goePos = geometry.object3D.position;
        const geoPoints = geometry.getAttribute("position").array;
        // console.log(goePos);

        for (let x = this.minX; x <= this.maxX; x++) {
            this.points[x] = [];
            for (let z = this.minZ; z <= this.maxZ; z++) {
                this.points[x][z] = {
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
            obj.index = i * 3 + 2;
            obj.object = geometry;
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

    updateEditTerrain() {
        // console.log("updateMoveTerrain");

        if (this.input.isMouseButtonDown(0)) {
            this.brushRadius = 2;
            const [intersect] = this.raycaster.intersectObject(this.mesh, false);
            if (typeof intersect !== "undefined") {
                const { distance, point, face, faceIndex, object } = intersect;
                // console.log(point);

                let minX = Math.ceil(point.x - this.brushRadius);
                minX = minX < this.minX ? this.minX : minX;

                let minZ = Math.ceil(point.y - this.brushRadius);
                minZ = minZ < this.minZ ? this.minZ : minZ;

                let maxX = Math.floor(point.x + this.brushRadius);
                maxX = maxX > this.maxX ? this.maxX : maxX;

                let maxZ = Math.floor(point.y + this.brushRadius);
                maxZ = maxZ > this.maxZ ? this.maxZ : maxZ;
                // console.log(`minX: ${minX}`);
                // console.log(`minZ: ${minZ}`);
                // console.log(`maxX: ${maxX}`);
                // console.log(`maxZ: ${maxZ}`);

                const pointsArray = [];
                const radiusSq = Math.pow(this.brushRadius, 2);
                let count = 0;
                let catched = 0;
                for (let x = minX; x <= maxX; x++) {
                    for (let z = minZ; z <= maxZ; z++) {
                        // check la distance
                        const distance = Math.pow(x - point.x, 2) + Math.pow(z - point.y, 2);
                        // console.log(distance);
                        if (distance <= radiusSq) {
                            pointsArray.push(x, z, this.points[x][z].y);
                            catched++;
                        }
                        count++;
                    }
                }
                // console.log(`count: ${count}`);
                // console.log(`catched: ${catched}`);
                const vertices = new Float32Array(pointsArray);
                this.pointGeometry.addAttribute("position", new THREE.BufferAttribute(vertices, 3));
            }
        }
    }

    updatePaint() {
        // console.log("updatePaint");
    }

    update() {
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
