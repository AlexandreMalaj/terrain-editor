/* eslint-disable max-classes-per-file, no-empty-function, class-methods-use-this, max-depth */

import * as THREE from "three";
import rockURL from "../materials/rock.jpg";
import grass from "../materials/grass.jpg";
import cobble from "../materials/cobble.png";
import crackedDirt from "../materials/crackedDirt.jpg";
import TerrainModifier from "./TerrainModifier.js";

const {
    Vector3,
    Raycaster,

    MeshBasicMaterial,
    MeshPhongMaterial,
    PointsMaterial,
    ShaderMaterial,
    Mesh,
    VertexNormalsHelper,

    BufferGeometry,
    PlaneBufferGeometry,
    Plane
} = THREE;

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
        // this.mode = [...Terrain.MODE][0];
        this.mode = "terrainModifier";
        const {
            material = {
                color: 0x000000,
                wireframe: true
            }
        } = options;


        this.points = [];
        this.initTerrainGeometry(material);
        console.log("this.mesh:");
        console.log(this.mesh);
        this.terrainModifier = new TerrainModifier(this);
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
        geometry.rotateX(-Math.PI / 2);

        this.wireframeMaterial = new MeshBasicMaterial(terrainMeterial);
        const basicMaterial = new MeshBasicMaterial({
            // color: 0xffff00,
            side: THREE.DoubleSide
        });

        const rockTexture = new THREE.TextureLoader().load(crackedDirt);
        console.log(rockTexture);

        rockTexture.wrapS = THREE.RepeatWrapping;
        rockTexture.wrapT = THREE.RepeatWrapping;

        const vShader = `
            uniform float scale;

            varying vec2 vertexUv;
            varying vec3 vNormal;
            varying vec3 vPos;
            varying float vScale;

            void main() {
                vertexUv = uv * scale;
                vScale = scale;
                vPos = position;
                vNormal = normal;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
        const fShader = `
            uniform sampler2D map;
            uniform mat4 modelMatrix;

            varying vec2 vertexUv;
            varying vec3 vPos;
            varying vec3 vNormal;
            varying float vScale;

            float clampAbs(float a, float min, float max) {
                if(min > max) {
                    return 0.;
                }
                float diff = min - max;
                return (clamp(a, min, max) + min) / diff;
            }

            vec3 getTriPlanarBlend(vec3 _wNorm){
                // in wNorm is the world-space normal of the fragment
                vec3 blending = abs( _wNorm );
                blending = normalize(max(blending, 0.00001)); // Force weights to sum to 1.0
                float b = (blending.x + blending.y + blending.z);
                blending /= vec3(b, b, b);
                return blending;
            }

            void main() {
                vec3 worldPosition = (modelMatrix * vec4(vPos, 1)).xyz;
                // vec3 worldSpaceNormal = (modelMatrix * vec4(vNormal, 0.0)).xyz

                vec3 blending = getTriPlanarBlend(vNormal);
                vec3 xaxis = texture2D(map, worldPosition.yz / vScale).rgb;
                vec3 yaxis = texture2D(map, worldPosition.xz / vScale).rgb;
                vec3 zaxis = texture2D(map, worldPosition.xy / vScale).rgb;

                // vec3 weights = abs(worldSpaceNormal.xyz);
                // weights = weights / (weights.x + weights.y + weights.z);

                // vec4 normalTex = xaxis * weights.x + yaxis * weights.y + zaxis * weights.z;
                vec3 normalTex = xaxis * blending.x + yaxis * blending.y + zaxis * blending.z;

                // gl_FragColor = xaxis;
                // gl_FragColor = normalTex;
                gl_FragColor = vec4(normalTex, 1.);
                // gl_FragColor = texture2D(map, vertexUv.xy);
                // gl_FragColor = vec4(vertexUv, clampAbs(vPos.y, -5., 10.) , 0.);
            }
        `;

        const shaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                map: { type: "t", value: rockTexture },
                scale: { type: "f", value: 10 }
            },
            vertexShader: vShader,
            fragmentShader: fShader
        });

        this.mesh = new Mesh(geometry, shaderMaterial);
        const wireframeMesh = new Mesh(geometry, this.wireframeMaterial);
        // this.helperNormal = new VertexNormalsHelper(this.mesh, 2, 0x00ff00, 1);
        // game.currentScene.add(this.helperNormal);
        game.currentScene.add(this.mesh);
        // game.currentScene.add(wireframeMesh);


        const pointLight = new THREE.PointLight(0xff0000, 1, 100);
        pointLight.position.set(-1, 2, -1);
        game.currentScene.add(pointLight);

        // // soft white light
        // const ambientLight = new THREE.AmbientLight(0x404040);
        // game.currentScene.add(ambientLight);

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
        // this.helperNormal.update();
        if (this.initialized === false) {
            return;
        }

        if (this.input.wasKeyJustPressed("Tab")) {
            // this.switchMode();
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
