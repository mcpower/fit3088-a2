//
//  initShaders.js
//

export default function initShaders( gl: WebGLRenderingContext, vertexShaderSource: string, fragmentShaderSource: string ): WebGLProgram | undefined
{
    const vertShdr = gl.createShader( gl.VERTEX_SHADER )!;
    gl.shaderSource( vertShdr, vertexShaderSource );
    gl.compileShader( vertShdr );
    if ( !gl.getShaderParameter(vertShdr, gl.COMPILE_STATUS) ) {
        var msg = "Vertex shader failed to compile.  The error log is:"
        + "<pre>" + gl.getShaderInfoLog( vertShdr ) + "</pre>";
        alert( msg );
        return;
    }

    const fragShdr = gl.createShader( gl.FRAGMENT_SHADER )!;
    gl.shaderSource( fragShdr, fragmentShaderSource );
    gl.compileShader( fragShdr );
    if ( !gl.getShaderParameter(fragShdr, gl.COMPILE_STATUS) ) {
        var msg = "Fragment shader failed to compile.  The error log is:"
        + "<pre>" + gl.getShaderInfoLog( fragShdr ) + "</pre>";
        alert( msg );
        return;
    }

    var program = gl.createProgram()!;
    gl.attachShader( program, vertShdr );
    gl.attachShader( program, fragShdr );
    gl.linkProgram( program );
    
    if ( !gl.getProgramParameter(program, gl.LINK_STATUS) ) {
        var msg = "Shader program failed to link.  The error log is:"
            + "<pre>" + gl.getProgramInfoLog( program ) + "</pre>";
        alert( msg );
        return;
    }

    return program;
}
