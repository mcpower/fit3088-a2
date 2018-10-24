import Context from "./Context";
import initShaders from "../lib/initShaders";

export default class Program<
    // hack
    Attribs = { [key: string]: number },
    Uniforms = { [key: string]: WebGLUniformLocation }
> {
    parentContext: Context;
    program: WebGLProgram;

    attribs: Attribs;
    uniforms: Uniforms;

    /**
     * Automatically adds itself to the parent context's programs.
     */
    constructor(
        parentContext: Context,
        program: WebGLProgram,
        attribs: (keyof Attribs & string)[],
        uniforms: (keyof Uniforms & string)[]
    ) {
        this.parentContext = parentContext;
        this.program = program;


        let attribObj: { [K in keyof Attribs]?: number } = {};
        attribs.forEach(attrib => {
            attribObj[attrib] = parentContext.gl.getAttribLocation(program, attrib);
        });
        // absolute hack
        this.attribs = <any>attribObj;

        let uniformObj: { [K in keyof Uniforms]?: WebGLUniformLocation } = {};
        uniforms.forEach(uniform => {
            const location = parentContext.gl.getUniformLocation(program, uniform);
            if (location === null) {
                throw new Error("Cannot find location for " + uniform);
            }
            uniformObj[uniform] = location;
        });
        this.uniforms = <any>uniformObj;

        parentContext.programs.push(this);
    }

    static fromShaders<
        Attribs = { [key: string]: undefined },
        Uniforms = { [key: string]: undefined }
    >(
        parentContext: Context,
        vertexShader: string,
        fragmentShader: string,
        attribs: (keyof Attribs & string)[],
        uniforms: (keyof Uniforms & string)[]
    ) {
        const prog = initShaders(parentContext.gl, vertexShader, fragmentShader);
        if (prog === undefined) {
            throw new Error("Got error when initialising shaders");
        }

        return new Program(parentContext, prog, attribs, uniforms);
    }
}
