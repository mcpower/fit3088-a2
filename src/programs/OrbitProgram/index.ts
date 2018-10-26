import Program from "../../classes/Program";
import initShaders from "../../lib/initShaders";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";
import { Matrix } from "../../lib/MV";
import Buffer from "../../classes/Buffer";
import * as MV from "../../lib/MV";
import Satellite from "../../classes/Satellite";
import { ORBIT_COLOR_SELECTED, ORBIT_COLOR } from "../../constants";
import { flatten } from "../../utils";

/**
 * The program to render ALL orbits.
 */
export default class OrbitProgram extends Program {
    // We want to change the colour of the currently selected satellite.
    // However, we don't want to push the same vertices to the GPU every time
    // we want to render.
    // The vertices of the satellite orbits won't change between renders.
    // All we need to do is change the COLOR of each orbit if it is selected.
    // Therefore, we can keep a global vertex buffer, and simply alter the
    // index buffer depending on which satellite is currently being rendered!
    vertexBuffer: Buffer;
    // and simply modify the indices when rendering.
    satellites: {
        sat: Satellite,
        indexBuffer: Buffer,
        indexCount: number
    }[];

    a_vertexPosition: number;
    u_modelViewProjectionMatrix: WebGLUniformLocation;

    u_color: WebGLUniformLocation;

    constructor(gl: WebGLRenderingContext, satellites: Satellite[]) {
        const prog = initShaders(gl, vertexShader, fragmentShader);
        super(gl, prog);

        let vertices: [number, number, number][] = [];
        // Note that we're using gl.LINES to draw,
        // so our indices must come in pairs.
        this.satellites = [];

        satellites.forEach(sat => {
            const satVertices = sat.getOrbit();
            const offset = vertices.length;
            vertices.push(...satVertices);

            let indices: number[] = [];
            for (let i = 0; i < satVertices.length - 1; i++) {
                indices.push(offset + i, offset + i+1);
            }
            indices.push(offset + satVertices.length - 1, offset + 0);

            const indexBuffer = new Buffer(gl, new Uint16Array(indices), gl.ELEMENT_ARRAY_BUFFER, gl.UNSIGNED_SHORT);
            const indexCount = indices.length;
            this.satellites.push({sat, indexBuffer, indexCount});
        })
        
        this.vertexBuffer = new Buffer(gl, new Float32Array(flatten(vertices)), gl.ARRAY_BUFFER, gl.FLOAT, 3);

        this.a_vertexPosition = gl.getAttribLocation(prog, "a_vertexPosition");
        this.u_modelViewProjectionMatrix = gl.getUniformLocation(prog, "u_modelViewProjectionMatrix")!;
        this.u_color = gl.getUniformLocation(prog, "u_color")!;
    }

    render(globalModel: Matrix, globalView: Matrix, globalProjection: Matrix) {
        const gl = this.gl;
        this.vertexBuffer.initAttrib(this.a_vertexPosition);

        // Calculate the full MVP matrix.
        // This won't change between satellites.
        const mvp = MV.mult(globalProjection, MV.mult(globalView, globalModel));
        gl.uniformMatrix4fv(
            this.u_modelViewProjectionMatrix,
            false,
            MV.flatten(mvp)
        );

        // We want to draw FOR EVERY SATELLITE.
        this.satellites.forEach(({sat, indexBuffer, indexCount}) => {
            indexBuffer.bind();
            gl.uniform3fv(this.u_color, sat.selected ? ORBIT_COLOR_SELECTED : ORBIT_COLOR);
            gl.drawElements(gl.LINES, indexCount, indexBuffer.type, 0);
        })

    }
}
