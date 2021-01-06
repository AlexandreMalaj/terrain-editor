import * as THREE from "three";
const {
    TransformControls,
    Raycaster
} = THREE;


export default class TransformControlsManager {
    constructor(camera, renderer, objects = []) {
        this.transformControls = new TransformControl(camera, renderer);
        // ray intersect all objects
        // if one found attach the object to Transform control
    }

    update() {

    }
}
