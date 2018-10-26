import initShaders from "../lib/initShaders";
import { Matrix } from "../lib/MV";

/**
 * A WebGLProgram associated with a WebGLRenderingContext.
 * This class is intended to be subclassed.
 */
export default class Program {
    gl: WebGLRenderingContext;
    program: WebGLProgram;

    /**
     * Constructor.
     */
    constructor(
        gl: WebGLRenderingContext,
        program: WebGLProgram,
    ) {
        this.gl = gl;
        this.program = program;
    }

    /**
     * Renders the program, assuming the WebGLRenderingContext has been
     * switched to use it.
     */
    render(globalModel: Matrix, globalView: Matrix, globalProjection: Matrix) {

    }

    /**
     * Creates a Program from shader strings.
     * Currently useless - subclass Program instead.
     */
    static fromShaders(
        gl: WebGLRenderingContext,
        vertexShader: string,
        fragmentShader: string,
    ) {
        const prog = initShaders(gl, vertexShader, fragmentShader);

        return new Program(gl, prog);
    }
}
