import Program from "../../classes/Program";
import Mesh from "../../classes/Mesh";
import Context from "../../classes/Context";
import initShaders from "../../lib/initShaders";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";
import { Matrix } from "../../lib/MV";
import Buffer from "../../classes/Buffer";

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

    constructor(gl: WebGLRenderingContext, mesh: Mesh) {
        const prog = initShaders(gl, vertexShader, fragmentShader);
        super(gl, prog);

        this.mesh = mesh;
        this.transforms = [];

        // Write all mesh data to the WebGL buffer objects.
        this.vertexBuffer = mesh.getVertexBuffer(gl);
        this.normalBuffer = mesh.getNormalBuffer(gl);
        this.indexBuffer = mesh.getIndexBuffer(gl);
    }

    render(globalModel: Matrix, globalView: Matrix, globalProjection: Matrix) {
        const gl = this.gl;
        this.vertexBuffer.initAttrib(_);
        this.normalBuffer.initAttrib(_);
        this.indexBuffer.bind();


        this.transforms.forEach(model => {
            // calculate matrices
            // we'd rather calculate matrices in JS than on the GPU
            gl.drawElements(gl.TRIANGLES, this.mesh.indices.length, this.indexBuffer.type, 0);
        })
    }
}
