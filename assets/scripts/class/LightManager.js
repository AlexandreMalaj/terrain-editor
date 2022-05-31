import * as THREE from "three";
const {
    DirectionalLightHelper,
    HemisphereLightHelper,
    PointLightHelper,
    SpotLightHelper
} = THREE;

export default class LightManager {
    constructor(scene) {
        this.allLights = new Map();
        this.helpers = [];
        this.scene = scene;
    }


    addLight(light) {
        if (!(light instanceof THREE.Light)) {
            throw new TypeError("light param must be an instance of THREE.Light");
        }

        const lightType = light.constructor.name;
        console.log(lightType);
        LightManager.lightName.add(lightType);
        this.scene.add(light);

        let helper;
        switch (light.constructor.name) {
            case "DirectionalLight":
                helper = new DirectionalLightHelper(light, 5);
                break;
            case "HemisphereLight":
                helper = new HemisphereLightHelper(light, 5);
                break;
            case "SpotLight":
                helper = new SpotLightHelper(light);
                break;
            default:
                helper = new PointLightHelper(light, 5);
                break;
        }

        this.helpers.push(helper);
        this.scene.add(helper);

        if (this.allLights.has(lightType)) {
            const lights = this.allLights.get(lightType);
            console.log(lights);
            lights.push(light);
            this.allLights.set(lightType, lights);
        }
        else {
            this.allLights.set(lightType, [light]);
        }
    }


    getAllLights() {
        return [...this.allLights.values()].flat();
    }

    update() {
        for (const helper of this.helpers) {
            // console.log(helper);
            helper.update();
        }
    }
}
LightManager.lightName = new Set([]);
