export default class Buffer<T extends ArrayBuffer | ArrayBufferView> {
    gl: WebGLRenderingContext
    buffer: WebGLBuffer;
    // gl.ARRAY_BUFFER, gl.ELEMENT_ARRAY_BUFFER, etc.
    target: GLenum;
    // gl.FLOAT, gl.UNSIGNED_INT, etc.
    type: GLenum;
    size?: GLint;

    constructor(gl: WebGLRenderingContext, data: T, target: GLenum, type: GLenum, size?: GLint) {
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
        this.bind();
        this.gl.vertexAttribPointer(attrib, this.size, this.type, false, 0, 0);
        this.gl.enableVertexAttribArray(attrib);
    }
}
