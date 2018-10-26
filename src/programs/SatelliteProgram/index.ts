import Program from "../../classes/Program";
import Mesh from "../../classes/Mesh";
import Context from "../../classes/Context";
import initShaders from "../../lib/initShaders";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";
import { Matrix } from "../../lib/MV";
import Buffer from "../../classes/Buffer";
import * as MV from "../../lib/MV";
import Satellite from "../../classes/Satellite";
import DateStore from "../../classes/DateStore";
import { SATELLITE_SCALE, SATELLITE_DIFFUSE, SATELLITE_AMBIENT, SATELLITE_AMBIENT_SELECTED } from "../../constants";

/**
 * Draws a single mesh one or more times.
 * Mesh is untextured.
 */
export default class MeshProgram extends Program {
    mesh: Mesh;
    allTransform: Matrix;

    ds: DateStore;
    satellites: Satellite[];

    vertexBuffer: Buffer;
    normalBuffer: Buffer;
    indexBuffer: Buffer;

    a_vertexPosition: number;
    a_normal: number;
    u_modelViewMatrix: WebGLUniformLocation;
    u_projectionMatrix: WebGLUniformLocation;

    u_ambient: WebGLUniformLocation;
    u_diffuse: WebGLUniformLocation;

    constructor(gl: WebGLRenderingContext, mesh: Mesh, ds: DateStore) {
        const prog = initShaders(gl, vertexShader, fragmentShader);
        super(gl, prog);

        this.ds = ds;
        this.allTransform = MV.scalem(SATELLITE_SCALE, SATELLITE_SCALE, SATELLITE_SCALE);

        this.mesh = mesh;
        this.satellites = [];

        // Write all mesh data to the WebGL buffer objects.
        this.vertexBuffer = mesh.getVertexBuffer(gl);
        this.normalBuffer = mesh.getNormalBuffer(gl);
        this.indexBuffer = mesh.getIndexBuffer(gl);

        this.a_vertexPosition = gl.getAttribLocation(prog, "a_vertexPosition");
        this.a_normal = gl.getAttribLocation(prog, "a_normal");
        this.u_modelViewMatrix = gl.getUniformLocation(prog, "u_modelViewMatrix")!;
        this.u_projectionMatrix = gl.getUniformLocation(prog, "u_projectionMatrix")!;

        this.u_ambient = gl.getUniformLocation(prog, "u_ambient")!;
        this.u_diffuse = gl.getUniformLocation(prog, "u_diffuse")!;
    }

    render(globalModel: Matrix, globalView: Matrix, globalProjection: Matrix) {
        const gl = this.gl;
        this.vertexBuffer.initAttrib(this.a_vertexPosition);
        this.normalBuffer.initAttrib(this.a_normal);
        this.indexBuffer.bind();

        // We're always going to have the same projection matrix.
        gl.uniformMatrix4fv(this.u_projectionMatrix, false, MV.flatten(globalProjection));

        // Diffuse is always the same.
        gl.uniform3fv(this.u_diffuse, SATELLITE_DIFFUSE);


        this.satellites.forEach(sat => {
            // calculate matrices
            // we'd rather calculate matrices in JS than on the GPU
            // We want to first to the all transform, then the local model,
            // then the global transform.

            // TODO: should this be flipped?
            const combinedModel = MV.mult(globalModel, MV.mult(sat.getTransform(this.ds.date), this.allTransform));
            const modelView = MV.mult(globalView, combinedModel);

            gl.uniformMatrix4fv(this.u_modelViewMatrix, false, MV.flatten(modelView));

            // Ambient will be different.
            gl.uniform3fv(this.u_ambient, sat.selected ? SATELLITE_AMBIENT_SELECTED : SATELLITE_AMBIENT);

            gl.drawElements(gl.TRIANGLES, this.mesh.indices.length, this.indexBuffer.type, 0);
        });
    }
}
