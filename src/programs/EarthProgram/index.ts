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

    updateBlend() {

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

        gl.drawElements(gl.TRIANGLES, this.indexCount, this.indexBuffer.type, 0);
    }
}
