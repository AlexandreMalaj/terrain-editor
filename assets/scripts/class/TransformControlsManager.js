import * as THREE from "three";
import * as THREEControls from "three/examples/jsm/controls/TransformControls.js";
const {
    Raycaster
} = THREE;

console.log(THREEControls);


export default class TransformControlsManager {
    constructor(camera, renderer, objects = []) {
        this.camera = camera;
        this.renderer = renderer;
        this.objects = objects;
        console.log(objects);

        this.transformControls = new THREEControls.TransformControls(camera, renderer.domElement);
        // console.log(this.transformControls.dragging);
        // console.log(this.transformControls.enabled);
        // this.transformControls.dragging = true;
        this.raycaster = new Raycaster();

        game.currentScene.add(this.transformControls);
    }

    update() {
        if (game.input.wasMouseButtonJustPressed(0)) {
            const mousePos = game.input.getMousePosition();
            this.raycaster.setFromCamera(mousePos, this.camera);
            const intersects = this.raycaster.intersectObjects(this.objects);
            for (const intersect of intersects) {
                if (typeof this.transformControls.object !== "undefined") {
                    // console.log(this.transformControls.object);
                    if (intersect.object.light.uuid === this.transformControls.object.uuid) {
                        continue;
                    }
                }

                this.transformControls.attach(intersect.object.light);
                console.log("attach");
                break;
            }
        }
    }
}
