attribute vec3 a_vertexPosition;
attribute vec2 a_texCoord;

uniform mat4 u_modelViewMatrix;
uniform mat4 u_projectionMatrix;

varying vec3 v_normal;
varying vec3 v_lightVector;
varying vec3 v_eyeVector;

varying vec2 v_texCoord;
            
void main() {
    vec4 vPos = vec4(a_vertexPosition, 1.0);
    vec4 mvPos = u_modelViewMatrix * vPos; 
    gl_Position = u_projectionMatrix * mvPos;

    // light position is hard-coded
    v_lightVector = normalize(vec3(1.0, 1.0, 1.0) - mvPos.xyz);
    v_eyeVector = normalize(-mvPos.xyz);
    // we aren't doing any shearing / nonuniform scaling
    // so we can do this instead.
    // make sure to set a_normal's last component to be zero!
    // additionally, the normal vector IS the vertex position.
    v_normal = normalize((u_modelViewMatrix * vec4(a_vertexPosition, 0)).xyz);
    v_texCoord = a_texCoord;
}
