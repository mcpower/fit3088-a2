import Program from "./Program";
import WebGLUtils from "../lib/webgl-utils";

/**
 * The WebGLRenderingContext and all related rendering.
 * Contains a list of Programs which can be rendered.
 */
export default class Context {
    gl: WebGLRenderingContext;
    programs: Program[];

    constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
        this.programs = [];
    }

    static fromCanvas(canvas: HTMLCanvasElement) {
        const gl = WebGLUtils.setupWebGL(canvas);
        return new Context(gl);
    }
}
