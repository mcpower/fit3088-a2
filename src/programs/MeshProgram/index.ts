import Program from "../../classes/Program";
import Mesh from "../../classes/Mesh";
import Context from "../../classes/Context";
import initShaders from "../../lib/initShaders";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";

export default class MeshProgram extends Program {
    mesh: Mesh;

    constructor(gl: WebGLRenderingContext, mesh: Mesh) {
        const prog = initShaders(gl, vertexShader, fragmentShader);
        super(gl, prog);

        this.mesh = mesh;
    }

    render() {
    }
}
