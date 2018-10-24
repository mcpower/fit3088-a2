import Program from "./Program";
import WebGLUtils from "../lib/webgl-utils";

export default class Context {
    gl: WebGLRenderingContext;
    programs: Program<any, any>[];

    constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
        this.programs = [];
    }

    static fromCanvas(canvas: HTMLCanvasElement) {
        const gl = WebGLUtils.setupWebGL(canvas);
        return new Context(gl);
    }
}
