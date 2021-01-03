import * as THREE from "three";

export default function terrainShader(uniforms = Object.create(null)) {
    const VERTEX_SHADER = `
        uniform float scale;
        // uniform vec3 normalMatrix;

        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 ws_normal;
        varying vec3 fragPos;

        void main() {
            vPosition = position;
            vNormal = normal;
            ws_normal = normalMatrix * normal;

            vec3 fragPos = vec3(modelMatrix * vec4(position, 1.));

            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;
    const FRAGMENT_SHADER = `
        uniform sampler2D map;
        uniform mat4 modelMatrix;
        // uniform vec3 cameraPosition;
        // uniform vec3 lightPos;
        // uniform float specularStrength;
        // uniform float shininess;

        uniform float scale;

        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec3 ws_normal;
        varying vec3 fragPos;

        struct PhongMaterial {
            vec3 position;  
          
            vec3 ambientColor;
            vec3 diffuseColor;
            vec3 specularColor;
            float ambientStrength;
            float specularStrength;
            float shininess;
            
            float constant;
            float linear;
            float quadratic;
        };

        uniform PhongMaterial phongMaterial;


        vec3 phongLight(PhongMaterial light) {
            vec3 norm = normalize(vNormal);
            vec3 lightDir = normalize(light.position - fragPos);

            // ambient
            vec3 ambient = light.ambientColor * light.ambientStrength;

            // diffuse
            float diff = max(dot(norm, lightDir), 0.0);
            vec3 diffuse = diff * light.diffuseColor;

            // specular
            vec3 viewDir = normalize(cameraPosition - fragPos);
            vec3 reflectDir = reflect(-lightDir, norm);
            float spec = pow(max(dot(viewDir, reflectDir), 0.0), light.shininess);
            vec3 specular = light.specularStrength * spec * light.specularColor;

            // return ambient;
            return ambient + diffuse + specular;
        }

        vec3 triplanarBlend(vec3 _wNorm) {
            // // in wNorm is the world-space normal of the fragment
            vec3 blending = abs( _wNorm );
            blending = normalize(max(blending, 0.00001)); // Force weights to sum to 1.0
            float b = (blending.x + blending.y + blending.z);
            blending /= vec3(b, b, b);

            return blending;
        }

        vec3 TriplanarPowBlending(vec3 _wNorm, float power) {
            vec3 blend = pow(_wNorm.xyz, vec3(power));
            blend /= dot(blend, vec3(1.));

            return blend;
        }

        vec3 triplanarAsymmetricBlending(vec3 _wNorm) {
            vec3 blend = vec3(0., 0., 0.);

            // Blend for sides only
            vec2 xzBlend = abs(normalize(_wNorm.xz));
            blend.xz = max(vec2(0), xzBlend - 0.67);
            blend.xz /= max(vec2(0.00001), dot(blend.xz, vec2(1., 1.)));

            // Blend for top
            blend.y = clamp((abs(_wNorm.y) - 0.675) * 80., 0., 1.);
            blend.xz *= (1. - blend.y);

            return blend;
        }

        void main() {
            // lightPos = vec3(0., 1., 0.);

            vec3 blending = TriplanarPowBlending(vNormal, 12.);
            // vec3 blending = triplanarAsymmetricBlending(vNormal);
            vec4 xaxis = texture2D(map, vPosition.yz / scale);
            vec4 yaxis = texture2D(map, vPosition.xz / scale);
            vec4 zaxis = texture2D(map, vPosition.xy / scale);

            vec4 normalTex = xaxis * blending.x + yaxis * blending.y + zaxis * blending.z;

            vec3 lightResult = phongLight(phongMaterial);
            gl_FragColor = normalTex * vec4(lightResult, 1);
        }
    `;

    return new THREE.ShaderMaterial({
        uniforms,
        // lights: true,
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER
    });
}

