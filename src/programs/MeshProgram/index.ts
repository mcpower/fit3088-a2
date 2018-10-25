import Program from "../../classes/Program";
import Mesh from "../../classes/Mesh";
import Context from "../../classes/Context";
import initShaders from "../../lib/initShaders";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";
import { Matrix } from "../../lib/MV";
import Buffer from "../../classes/Buffer";
import * as MV from "../../lib/MV";

/**
 * Draws a single mesh one or more times.
 * Mesh is untextured.
 */
export default class MeshProgram extends Program {
    mesh: Mesh;
    // A list of transforms to apply on matrices.
    // Would recommend using ModelTransform.
    transforms: Matrix[];

    vertexBuffer: Buffer;
    normalBuffer: Buffer;
    indexBuffer: Buffer;

    a_vertexPosition: number;
    a_normal: number;
    u_modelViewMatrix: WebGLUniformLocation;
    u_projectionMatrix: WebGLUniformLocation;

    constructor(gl: WebGLRenderingContext, mesh: Mesh) {
        const prog = initShaders(gl, vertexShader, fragmentShader);
        super(gl, prog);

        this.mesh = mesh;
        this.transforms = [];

        // Write all mesh data to the WebGL buffer objects.
        this.vertexBuffer = mesh.getVertexBuffer(gl);
        this.normalBuffer = mesh.getNormalBuffer(gl);
        this.indexBuffer = mesh.getIndexBuffer(gl);

        this.a_vertexPosition = gl.getAttribLocation(prog, "a_vertexPosition");
        this.a_normal = gl.getAttribLocation(prog, "a_normal");
        this.u_modelViewMatrix = gl.getUniformLocation(prog, "u_modelViewMatrix")!;
        this.u_projectionMatrix = gl.getUniformLocation(prog, "u_projectionMatrix")!;
    }

    render(globalModel: Matrix, globalView: Matrix, globalProjection: Matrix) {
        const gl = this.gl;
        this.vertexBuffer.initAttrib(this.a_vertexPosition);
        this.normalBuffer.initAttrib(this.a_normal);
        this.indexBuffer.bind();

        // We're always going to have the same projection matrix.
        gl.uniformMatrix4fv(this.u_projectionMatrix, false, MV.flatten(globalProjection));
        // const modelView = MV.mult(globalView, globalModel);
        // gl.uniformMatrix4fv(this.u_modelViewMatrix, false, MV.flatten(modelView));
        // gl.drawElements(gl.TRIANGLES, this.mesh.indices.length, this.indexBuffer.type, 0);


        this.transforms.forEach(model => {
            // calculate matrices
            // we'd rather calculate matrices in JS than on the GPU

            // TODO: should this be flipped?
            const combinedModel = MV.mult(globalModel, model);
            const modelView = MV.mult(globalView, combinedModel);

            gl.uniformMatrix4fv(this.u_modelViewMatrix, false, MV.flatten(modelView));

            gl.drawElements(gl.TRIANGLES, this.mesh.indices.length, this.indexBuffer.type, 0);
        });
    }
}
