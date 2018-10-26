import Program from "./Program";
import WebGLUtils from "../lib/webgl-utils";
import * as MV from "../lib/MV";
import { vec3, vec4, Matrix } from "../lib/MV";

/**
 * The WebGLRenderingContext and all related rendering.
 * Contains a list of Programs which can be rendered.
 */
export default class Context {
    gl: WebGLRenderingContext;
    programs: Program[];

    // Model will be calculated based on the values given.
    view: Matrix;
    projection: Matrix;

    renderCallbacks: (() => void)[];

    eye: MV.Vector;

    scale: number;
    rotateX: number;
    rotateY: number;
    rotateZ: number;


    constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.clearColor(0.05, 0.05, 0.05, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        this.programs = [];
        this.renderCallbacks = [];

        const fov = 70;

        this.eye = vec3(0, 0, 1 / Math.tan(fov / 180 * Math.PI / 2));
        this.view = MV.lookAt(
            this.eye,
            vec3(0, 0, 0),
            vec3(0, 1, 0)
        );
        this.projection = MV.perspective(
            fov,
            gl.drawingBufferWidth / gl.drawingBufferHeight,
            0.1,
            50
        );

        this.scale = 1;
        this.rotateX = 0;
        this.rotateY = 0;
        this.rotateZ = 0;
    }

    getModel() {
        let model = MV.scalem(this.scale, this.scale, this.scale);
        model = MV.mult(model, MV.rotateX(this.rotateX));
        model = MV.mult(model, MV.rotateY(this.rotateY));
        model = MV.mult(model, MV.rotateZ(this.rotateZ));
        return model;
    }

    /**
     * Gets a ray in "kilometer space", given the (x, y) coordinates
     * (from the top-left corner).
     * @param x The x co-ord from 0 to width.
     * @param y The y co-ord from 0 to height.
     */
    getRay(x: number, y: number) {
        const {drawingBufferWidth: width, drawingBufferHeight: height} = this.gl;

        // Taken from
        // http://antongerdelan.net/opengl/raycasting.html

        const rayNds = vec3(
            (2 * x) / width - 1,
            1 - (2 * y) / height,
            1
        );

        const rayClip = vec4(rayNds[0], rayNds[1], -1, 1);

        let rayEye = MV.mult(MV.inverse(this.projection), rayClip);
        rayEye = vec4(rayEye[0], rayEye[1], -1, 0);

        const rayWorld = MV.mult(MV.inverse(this.view), rayEye);
        
        const eye = vec4(this.eye, 1);
        const toPoint = MV.add(eye, rayWorld);

        const modelInv = MV.inverse(this.getModel());

        return {fromPoint: vec3(MV.mult(modelInv, eye)), toPoint: vec3(MV.mult(modelInv, toPoint))};
    }

    addRenderCallback(f: () => void) {
        this.renderCallbacks.push(f);
    }

    render = () => {
        const gl = this.gl;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Clear color and depth buffers

        this.renderCallbacks.forEach(f => f());

        this.programs.forEach(prog => {
            gl.useProgram(prog.program);
            prog.render(this.getModel(), this.view, this.projection);
        });

        window.requestAnimationFrame(this.render);
    }

    static fromCanvas(canvas: HTMLCanvasElement) {
        const gl = WebGLUtils.setupWebGL(canvas);
        return new Context(gl);
    }
}
