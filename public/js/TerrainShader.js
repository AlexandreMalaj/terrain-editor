class TerrainShader {
    constructor() {
        const VERTEX_SHADER = `
            main() {
                gl_Position = gl_ModelViewProjectionMatrix * vec4(position, 1.0);
            }`;
        const FRAGMENT_SHADER = `
            main() {
                gl_fragColor = vec4(fragCoord.xy, 0.0, 1.0);
            }`;

        new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 1.0 }
            },
            vertexShader: VERTEX_SHADER,
            fragmentShader: FRAGMENT_SHADER
        });
    }
}
