import * as THREE from "three";

export default function terrainShader(uniforms = Object.create(null)) {
    const VERTEX_SHADER = `
        uniform float scale;

        varying vec2 vertexUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying float vScale;

        void main() {
            vertexUv = uv * scale;
            vScale = scale;
            vPosition = position;
            vNormal = normal;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;
    const FRAGMENT_SHADER = `
        uniform sampler2D map;
        uniform mat4 modelMatrix;

        varying vec2 vertexUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying float vScale;

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
            vec3 blending = TriplanarPowBlending(vNormal, 12.);
            // vec3 blending = triplanarAsymmetricBlending(vNormal);
            vec4 xaxis = texture2D(map, vPosition.yz / vScale);
            vec4 yaxis = texture2D(map, vPosition.xz / vScale);
            vec4 zaxis = texture2D(map, vPosition.xy / vScale);

            vec4 normalTex = xaxis * blending.x + yaxis * blending.y + zaxis * blending.z;

            gl_FragColor = normalTex;
        }
    `;

    return new THREE.ShaderMaterial({
        uniforms,
        // lights: true,
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER
    });
}

