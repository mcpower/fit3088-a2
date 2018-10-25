export default class Texture {
    gl: WebGLRenderingContext;
    texture: WebGLTexture;
    unit: number;

    constructor(
        gl: WebGLRenderingContext,
        unit: number = 0
    ) {
        this.gl = gl;
        const texture = gl.createTexture();
        if (texture === null) {
            throw new Error("Cannot create texture?");
        }
        this.texture = texture;
        this.unit = unit;
    }

    updateTexture(
        image: Uint8Array,
        width: number,
        height: number
    ): void;
    updateTexture(
        image: TexImageSource
    ): void;
    updateTexture(
        image: TexImageSource | Uint8Array,
        width?: number,
        height?: number
    ): void {
        // Assume image is a power of two.
        // See
        // https://www.khronos.org/webgl/wiki/WebGL_and_OpenGL_Differences#Non-Power_of_Two_Texture_Support
        // for more details.
        const gl = this.gl;

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        this.bind();
        // TODO: enable mipmaps and aniso... filtering
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        if (image instanceof Uint8Array) {
            if (width === undefined || height === undefined) {
                throw new Error("width/height undefined");
            }
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, width, height, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, image);
        } else {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        }

        gl.bindTexture(gl.TEXTURE_2D, null); // Unbind texture
    }

    updateTextureUrl(url: string, callback?: (image: HTMLImageElement) => void) {
        let image = new Image();
        if (!image) {
            throw new Error('Failed to create the image object');
        }

        image.addEventListener("load", () => {
            this.updateTexture(image);
            if (callback !== undefined) {
                callback(image);
            }
        });
    
        image.src = url;
    }

    bind() {
        this.gl.activeTexture(this.gl.TEXTURE0 + this.unit);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    }

    /**
     * Be sure to use the associated program's uniform first!
     * @param uniform The uniform to set.
     */
    setUniform(uniform: WebGLUniformLocation) {
        this.gl.uniform1i(uniform, this.unit);
    }
}
