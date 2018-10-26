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
import { SATELLITE_SCALE } from "../../constants";
import { flatten } from "../../utils";

/**
 * Draws a single mesh one or more times.
 * Mesh is untextured.
 */
export default class OrbitProgram extends Program {
    vertexBuffer: Buffer;
    indexBuffer: Buffer;

    a_vertexPosition: number;
    u_modelViewProjectionMatrix: WebGLUniformLocation;

    indexCount: number;

    constructor(gl: WebGLRenderingContext, satellites: Satellite[]) {
        const prog = initShaders(gl, vertexShader, fragmentShader);
        super(gl, prog);

        let vertices: [number, number, number][] = [];
        // Note that we're using gl.LINES to draw,
        // so our indices must come in pairs.
        let indices: number[] = [];

        satellites.forEach(sat => {
            const satVertices = sat.getOrbit();
            const offset = vertices.length;
            vertices.push(...satVertices);
            for (let i = 0; i < satVertices.length - 1; i++) {
                indices.push(offset + i, offset + i+1);
            }
        })
        
        this.vertexBuffer = new Buffer(gl, new Float32Array(flatten(vertices)), gl.ARRAY_BUFFER, gl.FLOAT, 3);
        this.indexBuffer = new Buffer(gl, new Uint16Array(indices), gl.ELEMENT_ARRAY_BUFFER, gl.UNSIGNED_SHORT);
        this.indexCount = indices.length;

        this.a_vertexPosition = gl.getAttribLocation(prog, "a_vertexPosition");
        this.u_modelViewProjectionMatrix = gl.getUniformLocation(prog, "u_modelViewProjectionMatrix")!;
    }

    render(globalModel: Matrix, globalView: Matrix, globalProjection: Matrix) {
        const gl = this.gl;
        this.vertexBuffer.initAttrib(this.a_vertexPosition);
        this.indexBuffer.bind();

        // Calculate the full MVP matrix.
        const mvp = MV.mult(globalProjection, MV.mult(globalView, globalModel));
        gl.uniformMatrix4fv(
            this.u_modelViewProjectionMatrix,
            false,
            MV.flatten(mvp)
        );

        gl.drawElements(gl.LINES, this.indexCount, this.indexBuffer.type, 0);
    }
}
