import Context from "./Context";
import initShaders from "../lib/initShaders";

export default class Program {
    parentContext: Context;
    program: WebGLProgram;

    /**
     * Automatically adds itself to the parent context's programs.
     */
    constructor(
        parentContext: Context,
        program: WebGLProgram,
    ) {
        this.parentContext = parentContext;
        this.program = program;

        parentContext.programs.push(this);
    }

    render() {

    }

    static fromShaders(
        parentContext: Context,
        vertexShader: string,
        fragmentShader: string,
    ) {
        const prog = initShaders(parentContext.gl, vertexShader, fragmentShader);

        return new Program(parentContext, prog);
    }
}
