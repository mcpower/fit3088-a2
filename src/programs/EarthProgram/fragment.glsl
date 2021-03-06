precision mediump float;

uniform vec3 u_ambient;
uniform vec3 u_diffuse;
uniform sampler2D u_samplerDay;
uniform sampler2D u_samplerNight;
uniform sampler2D u_samplerBlend;

// IMO we should normalise this as well?
varying vec3 v_normal;
varying vec3 v_lightVector;
varying vec3 v_eyeVector;

varying vec2 v_texCoord;


void main() {
    float diffuseFactor = dot((v_normal), (v_lightVector));
    diffuseFactor = clamp(diffuseFactor, 0.0, 1.0);

    vec3 dayColor = texture2D(u_samplerDay, v_texCoord).rgb;
    vec3 nightColor = texture2D(u_samplerNight, v_texCoord).rgb;
    float blend = texture2D(u_samplerBlend, v_texCoord).r;

    // white = 0xff = sunlit
    // black = 0x00 = night
    vec3 displayColor = mix(nightColor, dayColor, blend);

    // note that no specular is needed
    // let's tone down diffuseFactor by a bit
    // this is equivalent to having an ambient color of 0.1 * displayColor
    // and having a diffuse color of 0.9 * displayColor
    gl_FragColor = vec4((0.1 + 0.9 * diffuseFactor) * displayColor, 1.0);
}
