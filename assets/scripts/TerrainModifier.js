import * as THREE from "three";
import Easing from "./class/Easing.js";
import Brush from "./Brush.js";

const {
    Raycaster,
    Points,
    BufferAttribute,

    PointsMaterial,

    BufferGeometry
} = THREE;

export default class TerrainModifier {
    constructor(terrain) {
        const { camera, mesh, points } = terrain;
        this.terrain = terrain;

        this.camera = camera;
        this.meshs = mesh;
        console.log(mesh);
        this.points = points;
        this.context2D = mesh.material.map.image.getContext("2d");

        this.currentMode = [...TerrainModifier.BRUSH_EDIT_MODE][0];
        this.raycaster = new Raycaster();
        this.brush = new Brush(10);
        this.brushStrength = 0.3;
        this.brushSmoothness = 0.03;

        this.pointGeometry = new BufferGeometry();
        this.pointMaterial = new PointsMaterial({ color: 0xff0000, size: 0.5, side: THREE.DoubleSide });
        this.pointMesh = new Points(this.pointGeometry, this.pointMaterial);
        game.currentScene.add(this.pointMesh);
    }

    changePointColor(color) {
        this.pointMaterial.color.setHex(color);
    }

    changeBrushSize() {
        if (game.input.isKeyDown("ControlLeft")) {
            // console.log("left control down");
            const mouseDeltaX = game.input.getMouseDelta().x;
            const newSize = this.brush.size + mouseDeltaX * 20;
            this.brush.changeSize(newSize);
            // console.log(this.brush.size);
        }
    }

    draw2DCircleOnMouse(point) {
        // this.meshs.updateMatrixWorld();
        const localMeshPoint = this.meshs.worldToLocal(point);

        // take a lot of ressource
        // work with basicMaterial and canvas context2D as map
        this.context2D.fillStyle = "#FFF";
        this.context2D.fillRect(0, 0, this.context2D.canvas.width, this.context2D.canvas.height);
        this.context2D.beginPath();
        this.context2D.arc(
            (localMeshPoint.x + this.terrain.size / 2) * 16,
            (localMeshPoint.z + this.terrain.size / 2) * 16,
            10 * 16, 0, 2 * Math.PI
        );
        this.context2D.lineWidth = 5;
        this.context2D.strokeStyle = "#ff0000";
        this.context2D.stroke();
        this.meshs.material.map.needsUpdate = true;
    }

    getPointsInBrush() {
        if (game.input.isMouseButtonDown(1)) {
            this.clearPoints();

            return {};
        }
        const [intersect] = this.raycaster.intersectObject(this.meshs);
        if (typeof intersect !== "undefined") {
            let { point } = intersect;
            this.draw2DCircleOnMouse(point);

            if (game.input.wasKeyJustPressed("ControlLeft")) {
                this.keepPointEditTerrain = point;
            }
            if (game.input.isKeyDown("ControlLeft")) {
                point = this.keepPointEditTerrain;
            }
            // console.log(point);

            const minX = Math.ceil(point.x - this.brush.size);
            // minX = minX < this.minX ? this.minX : minX;

            const minZ = Math.ceil(point.z - this.brush.size);
            // minZ = minZ < this.minZ ? this.minZ : minZ;

            const maxX = Math.floor(point.x + this.brush.size);
            // maxX = maxX > this.maxX ? this.maxX : maxX;

            const maxZ = Math.floor(point.z + this.brush.size);
            // maxZ = maxZ > this.maxZ ? this.maxZ : maxZ;

            // new to improve later with multiple plane
            const pointsArray = [];
            const pointsInBrush = [];
            const radiusSq = Math.pow(this.brush.size, 2);
            for (let x = minX; x <= maxX; x++) {
                if (typeof this.points[x] === "undefined") {
                    continue;
                }
                for (let z = minZ; z <= maxZ; z++) {
                    if (typeof this.points[x][z] === "undefined") {
                        continue;
                    }
                    const distance = Math.pow(x - point.x, 2) + Math.pow(z - point.z, 2);
                    if (distance <= radiusSq) {
                        pointsArray.push(x, this.points[x][z].y + 0.1, z);
                        pointsInBrush.push(this.points[x][z]);
                    }
                }
            }
            const vertices = new Float32Array(pointsArray);
            this.pointGeometry.setAttribute("position", new BufferAttribute(vertices, 3));

            return {
                brushPoint: point,
                pointsInBrush
            };
        }

        const vertices = new Float32Array([]);
        this.pointGeometry.setAttribute("position", new BufferAttribute(vertices, 3));

        return {};
    }

    raiseLower() {
        const { brushPoint, pointsInBrush = [] } = this.getPointsInBrush();
        let down = false;
        let lower = false;
        if (game.input.isMouseButtonDown(2)) {
            down = true;
            lower = true;
        }
        if (game.input.isMouseButtonDown(0) || down === true) {
            if (game.input.isKeyDown("ControlLeft")) {
                return;
            }
            const brushSizeSq = this.brush.size * this.brush.size;

            const allGeometries = [];
            for (const point of pointsInBrush) {
                const distance = Math.pow(brushPoint.x - point.x, 2) + Math.pow(brushPoint.z - point.z, 2);

                const factor = 1 - distance / brushSizeSq;
                const easedFactor = Easing.smoothstep(0, 1, factor);

                // reprendre le plan geometrique
                const { index, object: geometry } = this.points[point.x][point.z];
                let newPosY = easedFactor * this.brushStrength;
                if (lower === true) {
                    newPosY = -newPosY;
                }
                geometry.attributes.position.array[index] += newPosY;
                this.points[point.x][point.z].y += newPosY;

                // try to see if we can update geometry if we switch for multiple plain
                // geometry.attributes.position.needsUpdate = true;
                // geometry.attributes.normal.needsUpdate = true;

                if (allGeometries.length === 0) {
                    allGeometries.push(geometry);
                    continue;
                }
                for (const { uuid } of allGeometries) {
                    if (geometry.uuid !== uuid) {
                        allGeometries.push(geometry);
                    }
                }
            }

            for (const geometry of allGeometries) {
                geometry.attributes.position.needsUpdate = true;
                geometry.computeVertexNormals();
            }

            // geometry.computeVertexNormals();
        }
    }

    flatten() {
        const { brushPoint, pointsInBrush = [] } = this.getPointsInBrush();
        if (game.input.isMouseButtonDown(0)) {
            if (game.input.isKeyDown("ControlLeft")) {
                return;
            }

            const allGeometries = [];
            for (const point of pointsInBrush) {
                const { index, object: geometry } = this.points[point.x][point.z];
                geometry.attributes.position.array[index] = brushPoint.y;
                this.points[point.x][point.z].y = brushPoint.y;

                // try to see if we can update geometry if we switch for multiple plain
                // geometry.attributes.position.needsUpdate = true;
                // geometry.attributes.normal.needsUpdate = true;

                if (allGeometries.length === 0) {
                    allGeometries.push(geometry);
                    continue;
                }
                for (const { uuid } of allGeometries) {
                    if (geometry.uuid !== uuid) {
                        allGeometries.push(geometry);
                    }
                }
            }

            for (const geometry of allGeometries) {
                geometry.attributes.position.needsUpdate = true;
                geometry.computeVertexNormals();
            }
            // geometry.computeVertexNormals();
        }
    }

    smooth() {
        const { brushPoint, pointsInBrush = [] } = this.getPointsInBrush();
        if (game.input.isMouseButtonDown(0)) {
            if (game.input.isKeyDown("ControlLeft")) {
                return;
            }

            // average of near points (8 points)
            const allGeometries = [];
            for (const point of pointsInBrush) {
                if (typeof this.points[point.x + 1] === "undefined" ||
                typeof this.points[point.x - 1] === "undefined" ||
                typeof this.points[point.x + 1][point.z - 1] === "undefined" ||
                typeof this.points[point.x + 1][point.z + 1] === "undefined" ||
                typeof this.points[point.x - 1][point.z - 1] === "undefined" ||
                typeof this.points[point.x - 1][point.z + 1] === "undefined") {
                    // console.log("outer of limite map -> skiped point !");
                    continue;
                }

                const { index, object: geometry, y: pointY } = this.points[point.x][point.z];
                const nearPoints = [
                    this.points[point.x + 1][point.z].y,
                    this.points[point.x - 1][point.z].y,
                    this.points[point.x][point.z + 1].y,
                    this.points[point.x][point.z - 1].y,
                    this.points[point.x + 1][point.z - 1].y,
                    this.points[point.x - 1][point.z + 1].y,
                    this.points[point.x + 1][point.z + 1].y,
                    this.points[point.x - 1][point.z - 1].y,
                    pointY
                ];

                const avg = nearPoints.reduce((prev, curr) => prev + curr, 0) / nearPoints.length;

                const diff = pointY - avg;
                const newPosY = this.brushSmoothness * -diff;
                geometry.attributes.position.array[index] += newPosY;
                this.points[point.x][point.z].y += newPosY;

                if (allGeometries.length === 0) {
                    allGeometries.push(geometry);
                    continue;
                }
                for (const { uuid } of allGeometries) {
                    if (geometry.uuid !== uuid) {
                        allGeometries.push(geometry);
                    }
                }
            }

            for (const geometry of allGeometries) {
                geometry.attributes.position.needsUpdate = true;
                geometry.computeVertexNormals();
            }
        }
    }

    flattenSmooth() {
        const { pointsInBrush = [] } = this.getPointsInBrush();
        if (game.input.isMouseButtonDown(0)) {
            if (game.input.isKeyDown("ControlLeft")) {
                return;
            }

            // average of all points
            let total = 0;
            for (const point of pointsInBrush) {
                total += this.points[point.x][point.z].y;
            }

            const average = total / pointsInBrush.length;
            for (const point of pointsInBrush) {
                const { index, object: geometry } = this.points[point.x][point.z];

                const diff = this.points[point.x][point.z].y - average;
                if (diff === 0) {
                    continue;
                }

                const newPosY = this.brushSmoothness * -diff;
                geometry.attributes.position.array[index] += newPosY;
                this.points[point.x][point.z].y += newPosY;

                geometry.attributes.position.needsUpdate = true;
                geometry.attributes.normal.needsUpdate = true;
                geometry.computeVertexNormals();
            }
        }
    }

    clearPoints() {
        const vertices = new Float32Array([]);
        const buffer = new BufferAttribute(vertices, 3);
        this.pointGeometry.setAttribute("position", buffer);
    }

    update() {
        const mousePos = game.input.getMousePosition();
        this.raycaster.setFromCamera(mousePos, this.camera);
        this.changeBrushSize();
        if (game.input.wasKeyJustPressed("Digit1")) {
            this.changePointColor(0xff0000);
            this.clearPoints();
            this.currentMode = "Raise/Lower";
        }
        if (game.input.wasKeyJustPressed("Digit2")) {
            this.changePointColor(0x0000ff);
            this.clearPoints();
            this.currentMode = "Flatten";
        }
        if (game.input.wasKeyJustPressed("Digit3")) {
            this.changePointColor(0xff00ff);
            this.clearPoints();
            this.currentMode = "Smooth";
        }

        switch (this.currentMode) {
            case "Raise/Lower": {
                this.raiseLower();
                break;
            }
            case "Flatten": {
                this.flatten();
                break;
            }
            case "Smooth": {
                this.smooth();
                break;
            }
        }
    }
}
TerrainModifier.BRUSH_EDIT_MODE = new Set(["Raise/Lower", "Flatten", "Smooth"]);
