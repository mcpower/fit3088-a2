precision mediump float;
uniform vec3 u_ambient;
uniform vec3 u_diffuse;

// IMO we should normalise this as well?
varying vec3 v_normal;
varying vec3 v_lightVector;
varying vec3 v_eyeVector;

void main() {
    // ambient light

    float diffuseFactor = dot((v_normal), (v_lightVector));
    diffuseFactor = clamp(diffuseFactor, 0.0, 1.0);

    gl_FragColor = vec4(u_ambient + diffuseFactor * u_diffuse, 1.0);
}
