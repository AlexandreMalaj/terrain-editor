import * as THREE from "three";
import EventEmitter from "./EventEmitter.js";

export default class FreeFlyCamera extends EventEmitter {
    constructor(camera, options = Object.create(null)) {
        super();

        this.input = game.input;

        this.keys = {
            forward: options.forward || "KeyW",
            backward: options.backward || "KeyS",
            left: options.left || "KeyA",
            right: options.right || "KeyD",
            up: options.up || "Space",
            down: options.down || "ShiftLeft",
            lookAround: options.lookAround || 1,

            maxRollUp: options.maxRollUp || Math.PI / 2,
            maxRollDown: options.maxRollUp || -Math.PI / 2,

            rollSpeed: options.rollSpeed || 1,
            speed: options.speed || 0.1
        };
        // console.log(`${this.keys.forward} code: ${this.keys.forward.charCodeAt(0)}`);
        // console.log(`${this.keys.backward} code: ${this.keys.backward.charCodeAt(0)}`);
        // console.log(`${this.keys.left} code: ${this.keys.left.charCodeAt(0)}`);
        // console.log(`${this.keys.right} code: ${this.keys.right.charCodeAt(0)}`);
        // console.log(`${this.keys.up} code: ${this.keys.up.charCodeAt(0)}`);
        // console.log(`${this.keys.down} code: ${this.keys.down.charCodeAt(0)}`);
        this.camera = camera;

        this.movementSpeed = this.keys.speed;
        this.rollSpeed = 1;

        this.lockMouse = false;

        game.on("update", () => {
            this.update();
        });
    }

    changeSpeed(speed) {
        this.keys.speed = speed > 0.1 ? speed : 0.1;
    }

    changeRollSpeed(speed) {
        this.keys.rollSpeed = speed > 0.1 ? speed : 0.1;
    }

    move() {
        const vector = new THREE.Vector3(0);
        if (this.input.isKeyDown(this.keys.forward)) {
            vector.z -= 1;
        }
        if (this.input.isKeyDown(this.keys.backward)) {
            vector.z += 1;
        }

        if (this.input.isKeyDown(this.keys.up)) {
            vector.y += 1;
        }
        if (this.input.isKeyDown(this.keys.down)) {
            vector.y -= 1;
        }

        if (this.input.isKeyDown(this.keys.right)) {
            vector.x += 1;
        }
        if (this.input.isKeyDown(this.keys.left)) {
            vector.x -= 1;
        }

        const translation = new THREE.Vector3(vector.x, 0, vector.z);
        this.camera.translateOnAxis(translation.normalize(), this.movementSpeed);

        this.camera.position.y += vector.y * this.movementSpeed;
    }

    rotate() {
        const mouseDelta = this.input.getMouseDelta();
        const euler = new THREE.Euler(0, 0, 0, "YXZ");

        euler.setFromQuaternion(this.camera.quaternion);
        euler.y -= mouseDelta.x * this.rollSpeed;
        euler.x += mouseDelta.y * this.rollSpeed;
        euler.x = Math.max(this.keys.maxRollDown, Math.min(this.keys.maxRollUp, euler.x));

        this.camera.quaternion.setFromEuler(euler);
    }

    update() {
        this.move();
        if (this.input.isMouseButtonDown(this.keys.lookAround)) {
            this.input.lockMouse();
            this.rotate();
        }
        if (this.input.wasMouseButtonJustReleased(this.keys.lookAround)) {
            this.lockMouse = false;
            this.input.unlockMouse();
        }
    }
}
