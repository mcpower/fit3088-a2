/**
 * A class wrapping a WebGLBuffer.
 * Contains many useful helper methods.
 */
export default class Buffer {
    gl: WebGLRenderingContext
    buffer: WebGLBuffer;
    // gl.ARRAY_BUFFER, gl.ELEMENT_ARRAY_BUFFER, etc.
    target: GLenum;
    // gl.FLOAT, etc.
    type: GLenum;
    size?: 1 | 2 | 3 | 4;

    /**
     * Constructor.
     * @param gl The current rendering context.
     * @param data The data to put in the buffer.
     * @param target The binding point (like gl.ARRAY_BUFFER, gl.ELEMENT_ARRAY_BUFFER)
     * @param type What the type of the buffer is (gl.FLOAT, gl.UNSIGNED_SHORT, etc.)
     * @param size Number of components per vertex attribute (if using as vertex buffer).
     */
    constructor(gl: WebGLRenderingContext, data: ArrayBuffer | ArrayBufferView, target: GLenum, type: GLenum, size?: 1 | 2 | 3 | 4) {
        this.gl = gl;
        const buffer = gl.createBuffer();
        if (buffer === null) {
            throw new Error("Failed to create buffer object");
        }
        this.buffer = buffer;

        gl.bindBuffer(target, buffer);
        gl.bufferData(target, data, gl.STATIC_DRAW);

        this.target = target;
        this.type = type;
        this.size = size;
    }

    bind() {
        this.gl.bindBuffer(this.target, this.buffer);
    }

    initAttrib(attrib: GLuint) {
        if (this.size === undefined) {
            throw new Error("need to define size");
        }
        if (this.type === undefined) {
            throw new Error("need to define type");
        }
        this.bind();
        this.gl.vertexAttribPointer(attrib, this.size, this.type, false, 0, 0);
        this.gl.enableVertexAttribArray(attrib);
    }
}
