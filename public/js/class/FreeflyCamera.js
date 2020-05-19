import Input from "./Input.js";
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
            down: options.down || "ShiftLeft"
        };
        console.log(`${this.keys.forward} code: ${this.keys.forward.charCodeAt(0)}`);
        console.log(`${this.keys.backward} code: ${this.keys.backward.charCodeAt(0)}`);
        console.log(`${this.keys.left} code: ${this.keys.left.charCodeAt(0)}`);
        console.log(`${this.keys.right} code: ${this.keys.right.charCodeAt(0)}`);
        console.log(`${this.keys.up} code: ${this.keys.up.charCodeAt(0)}`);
        console.log(`${this.keys.down} code: ${this.keys.down.charCodeAt(0)}`);
        this.camera = camera;

        this.movementSpeed = 0.1;
        this.rollSpeed = 0.5;

        // this.rotationX = this.camera.rotation.x;
        // this.rotationY = this.camera.rotation.y;

        this.dragToLook = false;
        this.autoForward = false;

        this.mouseButtonDown = false;
    }

    move() {
        const vector = new THREE.Vector3(0);
        // console.log(this.input.isButtonDown(this.keys.forward));
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

        // const AngleY = this.camera.rotation.y;

        // console.log(vector);
        // console.log(vector.normalize());

        const translation = new THREE.Vector3(vector.x, 0, vector.z);
        this.camera.position.z += vector.y * this.movementSpeed;

        this.camera.translateOnAxis(translation.normalize(), this.movementSpeed);
    }

    rotate() {
        const mouseDelta = this.input.getMouseDelta();
        // console.log(mouseDelta);
        this.camera.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), -mouseDelta.x * this.rollSpeed * game.camera.aspect);
        this.camera.rotateX(mouseDelta.y * this.rollSpeed);
    }

    update() {
        this.move();
        if (this.input.isMouseButtonDown(1)) {
            this.input.lockMouse();
            this.rotate();
        }
        this.input.unlockMouse();
    }
}
