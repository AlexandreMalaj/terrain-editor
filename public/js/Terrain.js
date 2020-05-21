/* eslint-disable max-classes-per-file, no-empty-function */

const {
    Vector3,
    MeshBasicMaterial,
    ShaderMaterial,
    Mesh,
    PlaneBufferGeometry,
    Plane
} = THREE;

const VERTEX_SHADER = ``;
const FRAGMENT_SHADER = ``;

export default class Terrain {
    constructor(size, options = Object.create(null)) {
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
        this.wireframeMaterial = new MeshBasicMaterial(material);
        const basicMaterial = new MeshBasicMaterial({ color: 0x0000ff });

        const mesh = new Mesh(geometry, basicMaterial);
        const wireframeMesh = new Mesh(geometry, this.wireframeMaterial);
        game.currentScene.add(mesh);
        game.currentScene.add(wireframeMesh);

        this.planes = [geometry];
        // this.materials = [basicMaterial];

        this.infinitPlane = new Plane(new Vector3(0, 1, 0));
        // game.currentScene.add(this.infinitPlane);
    }

    switchMode(newMode) {

    }

    updatePlane() {
        const newPlane = new PlaneBufferGeometry(this.size, this.size, this.size, this.size);
        this.plane.push(newPlane);
    }

    updateTerrainMaterial() {

    }

    updateMoveTerrain() {

    }

    updatePaint() {

    }

    update() {
        // console.log("update terrain !");
        // this.updateAddPlane();
        // this.updatePlaint();
        // this.updateMoveTerrain();
        if (this.input.wasKeyJustPressed("Tab")) {
            console.log("tab !");
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

Terrain.MODE = new Set(["vertex", "texture", "plane"]);
