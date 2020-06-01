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
        this.rollSpeed = 0.5;

        this.dragToLook = false;
        this.autoForward = false;

        this.mouseButtonDown = false;

        this.lockMouse = false;
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
        this.camera.position.y += vector.y * this.movementSpeed;

        this.camera.translateOnAxis(translation.normalize(), this.movementSpeed);
    }

    rotate() {
        const mouseDelta = this.input.getMouseDelta();
        this.camera.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), -mouseDelta.x * this.rollSpeed * game.camera.aspect);

        this.camera.rotateX(mouseDelta.y * this.rollSpeed);

        // improve this part
        // const MAX_ROTATION = 0.98;
        // const rotationX = this.camera.getWorldDirection(new THREE.Vector3()).z;
        // console.log(rotationX);
        // if (rotationX <= -MAX_ROTATION || rotationX >= MAX_ROTATION) {
        //     this.camera.rotateX(-mouseDelta.y * this.rollSpeed);
        // }
    }

    update() {
        this.move();
        if (this.input.isMouseButtonDown(1)) {
            this.input.lockMouse();
            this.rotate();
        }
        if (this.input.wasMouseButtonJustReleased(1)) {
            this.lockMouse = false;
            this.input.unlockMouse();
        }
    }
}
