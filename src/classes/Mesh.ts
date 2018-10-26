import {flattenWithLookup, flatten} from "../utils";
import Buffer from "./Buffer";
import OBJ from "../lib/webgl-obj-loader";

type Vec2 = [number, number];
type Vec3 = [number, number, number];
type TriangleIndices = Vec3;

/**
 * A general mesh, not associated with any WebGLRenderingContext.
 * Stores the data needed to create the buffers if needed.
 */
export default class Mesh {
    constructor(
        public vertices: number[],
        public normals: number[],
        public indices: number[],
        public texCoords: number[]
    ) {

    }

    getVertexBuffer(gl: WebGLRenderingContext) {
        return new Buffer(gl, new Float32Array(this.vertices), gl.ARRAY_BUFFER, gl.FLOAT, 3);
    }

    getNormalBuffer(gl: WebGLRenderingContext) {
        return new Buffer(gl, new Float32Array(this.normals), gl.ARRAY_BUFFER, gl.FLOAT, 3);
    }

    getIndexBuffer(gl: WebGLRenderingContext) {
        // hopefully Uint16s are enough
        return new Buffer(gl, new Uint16Array(this.indices), gl.ELEMENT_ARRAY_BUFFER, gl.UNSIGNED_SHORT);        
    }

    getTexCoordBuffer(gl: WebGLRenderingContext) {
        return new Buffer(gl, new Float32Array(this.texCoords), gl.ARRAY_BUFFER, gl.FLOAT, 2);
    }

    static fromTyped(
        vertices: Vec3[],
        normals: Vec3[],
        indices: TriangleIndices[],
        texCoords: Vec2[]
    ): Mesh {
        return new Mesh(flatten(vertices), flatten(normals), flatten(indices), flatten(texCoords));
    }

    static fromObj(obj: OBJ.Mesh): Mesh {
        return new Mesh(obj.vertices, obj.vertexNormals, obj.indices, obj.textures);
    }

    /**
     * Creates a sphere mesh.
     * @param rows Number of "rows" of rectangles in the generated mesh.
     */
    static makeSphere(rows: number): Mesh {
        const columns = rows * 2;

        // These are of size [rows+1][columns+1].
        // As we're making a sphere of radius 1, the normals ARE the vertices.
        // Very neat!
        let vertices: Vec3[][] = [];
        // let normals: Vec3[][] = [];
        let texCoords: Vec2[][] = [];

        // We start off "from the back" into the front.
        // "the back" is -z
        // "the left" is -x
        // "the front" is +z
        // "the right" is +x
        // "up" is +y
        // "down" is -y
        // Rows will have the same y axis and same radius in the y plane.

        // Remember that columns will wrap around!
        // But if we want texturing to work, we NEED to create two vertices
        // for each vertex on the "back seam" of the sphere.

        // Rows obviously can't wrap around...
        // If we get columns wrapping around, we can offset every second
        // row by half of a "notch" to make smoother "triangulated faces"
        // instead of "rectangular faces"!

        for (let row = 0; row <= rows; row++) {
            const vertexRow: Vec3[] = [];
            const texRow: Vec2[] = [];

            // We begin at the top row and go down.
            // From pi/2 to -pi/2.
            const lat = (Math.PI / 2) - (Math.PI * row / rows);

            // The plane should go from 1 down to -1.
            const y = Math.sin(lat);

            // How big is our circle on this plane?
            // That should go from 0 to 1 to 0.
            const planeCircleRadius = Math.cos(lat);
            for (let colLoop = 0; colLoop <= columns; colLoop++) {
                // If we instead create a "rhombus" where every column is offset
                // by 0.5 * row, the faces of the sphere will be TRIANGULAR
                // instead of RECTANGULAR! This will give a much smoother
                // appearance, especially for low values of "rows".
                const col = colLoop + row * 0.5;
                // We start off "from the back".
                const lon = (2 * Math.PI * col / columns) - (Math.PI);

                // If lon = 0, z should be 1 and x = 0.
                // Therefore, z is cos, and x is sin!
                const z = planeCircleRadius * Math.cos(lon);
                const x = planeCircleRadius * Math.sin(lon);

                vertexRow.push([x, y, z]);

                // Now, what are the texture coordinates?
                // Remember that the BOTTOM LEFT is (0, 0)!
                // Note that texU may be bigger than 1. That is okay, as the
                // texture should "wrap around".
                const texU = col / columns;
                const texV = 1 - (row / rows);
                texRow.push([texU, texV]);
            }
            vertices.push(vertexRow);
            texCoords.push(texRow);
        }

        // We need to flatten the 2D vertex / texCoords array.
        const {flattened: flattenedVertices, lookup} = flattenWithLookup(vertices);
        const flattenedTexCoords = flatten(texCoords);


        // Now, let's iterate through the triangles.
        // Every "square" should have a pair of triangles,
        // and there's exactly rows * columns of them.
        let indices: TriangleIndices[] = [];

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < columns; col++) {
                // I believe these should be CCW.
                /**
                 * (0, 0)  <  (0, 1)
                 *   \/   --^
                 * (1, 0)     (1, 1)
                 */
                const triangle1: TriangleIndices = [
                    lookup[row][col],
                    lookup[row+1][col],
                    lookup[row][col+1],
                ];
                /**
                 * (0, 0)     (0, 1)
                 *        v--   /\
                 * (1, 0)  >  (1, 1)
                 */
                const triangle2: TriangleIndices = [
                    lookup[row][col+1],
                    lookup[row+1][col],
                    lookup[row+1][col+1],
                ];
                indices.push(triangle1);
                indices.push(triangle2);
            }
        }
         
        return Mesh.fromTyped(flattenedVertices, flattenedVertices, indices, flattenedTexCoords);
    }

    static makeCube(): Mesh {
        // Create a cube
        //    v6----- v5
        //   /|      /|
        //  v1------v0|
        //  | |     | |
        //  | |v7---|-|v4
        //  |/      |/
        //  v2------v3
        var vertices = ([// Vertex coordinates
            1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, // v0-v1-v2-v3 front
            1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, // v0-v3-v4-v5 right
            1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
            -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, // v1-v6-v7-v2 left
            -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, // v7-v4-v3-v2 down
            1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0     // v4-v7-v6-v5 back
        ]);
    
        var normals = ([// Normal
            0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, // v0-v1-v2-v3 front
            1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, // v0-v3-v4-v5 right
            0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, // v0-v5-v6-v1 up
            -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // v1-v6-v7-v2 left
            0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, // v7-v4-v3-v2 down
            0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0      // v4-v7-v6-v5 back
        ]);
    
        var texCoords = ([// Texture coordinates
            1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, // v0-v1-v2-v3 front
            0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, // v0-v3-v4-v5 right
            1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, // v0-v5-v6-v1 up
            1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, // v1-v6-v7-v2 left
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, // v7-v4-v3-v2 down
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0     // v4-v7-v6-v5 back
        ]);
    
        var indices = ([// Indices of the vertices
            0, 1, 2, 0, 2, 3, // front
            4, 5, 6, 4, 6, 7, // right
            8, 9, 10, 8, 10, 11, // up
            12, 13, 14, 12, 14, 15, // left
            16, 17, 18, 16, 18, 19, // down
            20, 21, 22, 20, 22, 23     // back
        ]);
        return new Mesh(vertices, normals, indices, texCoords);
    }
}
