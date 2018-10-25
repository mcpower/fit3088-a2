import Program from "./Program";
import WebGLUtils from "../lib/webgl-utils";
import { Matrix } from "../lib/MV";

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
        this.programs = [];
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
