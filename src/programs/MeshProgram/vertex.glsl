attribute vec3 a_vertexPosition;
attribute vec3 a_normal;
uniform mat4 u_modelViewMatrix;
uniform mat4 u_projectionMatrix;

varying vec3 v_normal;
varying vec3 v_lightVector;
varying vec3 v_eyeVector;
            
void main() {
    vec4 vPos = vec4(a_vertexPosition, 1.0);
    vec4 mvPos = u_modelViewMatrix * vPos; 
    gl_Position = u_projectionMatrix * mvPos;

    v_lightVector = normalize(vec3(1.0, 1.0, 1.0) - mvPos.xyz);
    v_eyeVector = normalize(-mvPos.xyz);
    v_normal = normalize((u_modelViewMatrix * vec4(a_normal, 0)).xyz);
}
