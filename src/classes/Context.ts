import Program from "./Program";
import WebGLUtils from "../lib/webgl-utils";
import * as MV from "../lib/MV";
import { vec3, Matrix } from "../lib/MV";

/**
 * The WebGLRenderingContext and all related rendering.
 * Contains a list of Programs which can be rendered.
 */
export default class Context {
    gl: WebGLRenderingContext;
    programs: Program[];

    model: Matrix;
    view: Matrix;
    projection: Matrix;

    constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.clearColor(0.6, 0.6, 0.6, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        this.programs = [];

        const fov = 70;

        this.model = MV.scalem(1, 1, 1);
        this.view = MV.lookAt(
            vec3(0, 0, 1 / Math.tan(fov / 180 * Math.PI / 2)),
            vec3(0, 0, 0),
            vec3(0, 1, 0)
        );
        this.projection = MV.perspective(
            fov,
            gl.drawingBufferWidth / gl.drawingBufferHeight,
            0.1,
            50
        );
    }

    render = () => {
        const gl = this.gl;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Clear color and depth buffers

        this.programs.forEach(prog => {
            gl.useProgram(prog.program);
            prog.render(this.model, this.view, this.projection);
        });

        window.requestAnimationFrame(this.render);
    }

    static fromCanvas(canvas: HTMLCanvasElement) {
        const gl = WebGLUtils.setupWebGL(canvas);
        return new Context(gl);
    }
}
