precision mediump float;
uniform vec3 u_ambient;
uniform vec3 u_diffuse;

varying vec3 v_normal;
varying vec3 v_lightVector;
varying vec3 v_eyeVector;

void main() {
    float diffuseFactor = dot((v_normal), (v_lightVector));
    diffuseFactor = clamp(diffuseFactor, 0.0, 1.0);

    // note that no specular is needed, based on the assignment spec
    gl_FragColor = vec4(u_ambient + diffuseFactor * u_diffuse, 1.0);
}
