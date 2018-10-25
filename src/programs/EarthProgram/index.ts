import Program from "../../classes/Program";
import Mesh from "../../classes/Mesh";
import Context from "../../classes/Context";
import initShaders from "../../lib/initShaders";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";
import { Matrix } from "../../lib/MV";
import Buffer from "../../classes/Buffer";
import * as MV from "../../lib/MV";
import Texture from "../../classes/Texture";
import DateStore from "../../classes/DateStore";
import SunCalc from "../../lib/suncalc";

/**
 * Gets the position of number relative to "left" and "right".
 * If num == left, returns 0.
 * If num == right, returns 1.
 * If num is in the middle of left and right, returns 0.5.
 * and so on.
 * @param left The left side of the range.
 * @param right The right side of the range.
 * @param num The number
 */
function getPos(left: number, right: number, num: number) {
    return (num - left) / (right - left);
}

/**
 * Draws a single mesh one or more times.
 * Mesh is untextured.
 */
export default class EarthProgram extends Program {
    radius: number;
    scaleMatrix: Matrix;

    vertexBuffer: Buffer;
    texCoordBuffer: Buffer;
    indexBuffer: Buffer;

    a_vertexPosition: number;
    a_texCoord: number;

    u_modelViewMatrix: WebGLUniformLocation;
    u_projectionMatrix: WebGLUniformLocation;

    dayTexture: Texture;
    nightTexture: Texture;
    blendTexture: Texture;

    // These won't change.
    u_samplerDay: WebGLUniformLocation;
    u_samplerNight: WebGLUniformLocation;
    u_samplerBlend: WebGLUniformLocation;

    indexCount: number;

    dateStore: DateStore;

    /**
     * Constructor.
     * @param gl The rendering context.
     * @param earthRadius The radius of the earth in GL units.
     */
    constructor(gl: WebGLRenderingContext, dateStore: DateStore, radius: number) {
        const prog = initShaders(gl, vertexShader, fragmentShader);
        super(gl, prog);

        this.dateStore = dateStore;

        this.radius = radius;
        this.scaleMatrix = MV.scalem(radius, radius, radius);

        const mesh = Mesh.makeSphere(16);
        // const mesh = Mesh.makeCube();
        this.indexCount = mesh.indices.length;

        // Write all mesh data to the WebGL buffer objects.
        this.vertexBuffer = mesh.getVertexBuffer(gl);
        this.texCoordBuffer = mesh.getTexCoordBuffer(gl);
        this.indexBuffer = mesh.getIndexBuffer(gl);


        this.a_vertexPosition = gl.getAttribLocation(prog, "a_vertexPosition");
        this.a_texCoord = gl.getAttribLocation(prog, "a_texCoord");
        this.u_modelViewMatrix = gl.getUniformLocation(prog, "u_modelViewMatrix")!;
        this.u_projectionMatrix = gl.getUniformLocation(prog, "u_projectionMatrix")!;

        this.dayTexture = new Texture(gl, 0);
        this.nightTexture = new Texture(gl, 1);
        this.blendTexture = new Texture(gl, 2);

        this.u_samplerDay = gl.getUniformLocation(prog, "u_samplerDay")!;
        this.u_samplerNight = gl.getUniformLocation(prog, "u_samplerNight")!;
        this.u_samplerBlend = gl.getUniformLocation(prog, "u_samplerBlend")!;

        gl.useProgram(prog);
        this.blendTexture.setUniform(this.u_samplerBlend);

        // Initialise requests for day / night.
        this.dayTexture.updateTextureUrl("day.jpg", () => {
            this.gl.useProgram(prog);
            this.dayTexture.setUniform(this.u_samplerDay);
        });
        this.nightTexture.updateTextureUrl("night.jpg", () => {
            this.gl.useProgram(prog);
            this.nightTexture.setUniform(this.u_samplerNight);
        });
    }

    updateBlend(height: number = 64) {
        const width = height * 2;
        let arr = new Uint8Array(width * height);
        const now = this.dateStore.date;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // plus 0.5 to x and y here
                // due to needing the CENTERS of the "grid cell"
                // lon in [-180, 180]
                const lonDeg = ((x) / width) * 360 - 180;
                // lat in [-90, 90]
                const latDeg = ((y) / height) * 180 - 90;

                const {
                    dawn, sunrise, sunset, dusk
                } = SunCalc.getTimes(now, latDeg, lonDeg);
                // it goes like:
                // dawn (0-255) sunrise (255) sunset (255-0) dusk (0) dawn
                let val = 0;
                if (now < sunrise || now > sunset) {
                    val = 0;
                    // check for dusk / dawn
                    if (dawn < now && now < sunrise) {
                        // lerp between dawn and sunrise
                        val = Math.round(getPos(
                            dawn.getTime(),
                            sunrise.getTime(),
                            now.getTime()
                        ) * 255);
                    }
                    else
                    if (sunset < now && now < dusk) {
                        // lerp between sunset and dusk
                        val = 255 - Math.round(getPos(
                            sunset.getTime(),
                            dusk.getTime(),
                            now.getTime()
                        ) * 255);
                    }
                } else {
                    val = 255;
                }
                
                // if (now < dawn) {
                //     val = 0;
                // } else if (now < sunrise) {
                    // // lerp between dawn and sunrise
                    // val = Math.round(getPos(
                    //     dawn.getTime(),
                    //     sunrise.getTime(),
                    //     now.getTime()
                    // ) * 255);
                // } else if (now < sunset) {
                //     val = 255;
                // } else if (now < dusk) {
                    // // lerp between sunset and dusk
                    // val = 255 - Math.round(getPos(
                    //     sunset.getTime(),
                    //     dusk.getTime(),
                    //     now.getTime()
                    // ) * 255);
                // } else {
                //     // after dusk
                //     val = 0;
                // }

                arr[y * width + x] = now < sunrise || now > sunset ? 0 : 255;
                arr[y * width + x] = val;
            }
        }

        this.blendTexture.updateTexture(arr, width, height);
        // this.blendTexture.updateTexture(new Uint8Array(
        //     [0, 255, 0, 0,
        //     0, 0, 0, 255,
        //     0, 0, 0, 255,
        //     0, 0, 255, 255]
        // ), 4, 4);
    }

    render(globalModel: Matrix, globalView: Matrix, globalProjection: Matrix) {
        const gl = this.gl;
        this.vertexBuffer.initAttrib(this.a_vertexPosition);
        this.texCoordBuffer.initAttrib(this.a_texCoord);
        this.indexBuffer.bind();

        gl.uniformMatrix4fv(this.u_projectionMatrix, false, MV.flatten(globalProjection));

        const combinedModel = MV.mult(globalModel, this.scaleMatrix);
        const modelView = MV.mult(globalView, combinedModel);

        gl.uniformMatrix4fv(this.u_modelViewMatrix, false, MV.flatten(modelView));

        // The samplers may need to be bound here.
        // Update our blend.
        this.updateBlend();

        this.dayTexture.bind();
        this.nightTexture.bind();
        this.blendTexture.bind();

        gl.drawElements(gl.TRIANGLES, this.indexCount, this.indexBuffer.type, 0);
    }
}
