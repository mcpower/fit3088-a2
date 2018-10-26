attribute vec3 a_vertexPosition;

// As we aren't doing anything fancy with the MVP matrix (no normals etc.),
// simply give this shader the full MVP matrix.
uniform mat4 u_modelViewProjectionMatrix;

void main() {
    gl_Position = u_modelViewProjectionMatrix * vec4(a_vertexPosition, 1.0);    
}
