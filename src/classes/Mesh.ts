import {flattenWithLookup, flatten} from "../utils";
import Buffer from "./Buffer";

type Vec2 = [number, number];
type Vec3 = [number, number, number];
type TriangleIndices = Vec3;

/**
 * A general mesh, not associated with any program.
 */
export default class Mesh {
    vertices: Vec3[];
    normals: Vec3[];
    indices: TriangleIndices[];
    texCoords: Vec2[];

    constructor(
        vertices: Vec3[],
        normals: Vec3[],
        indices: TriangleIndices[],
        texCoords: Vec2[]
    ) {
        this.vertices = vertices;
        this.normals = normals;
        this.indices = indices;
        this.texCoords = texCoords;
    }

    getVertexBuffer(gl: WebGLRenderingContext) {
        return new Buffer(gl, new Float32Array(flatten(this.vertices)), gl.ARRAY_BUFFER, gl.FLOAT, 3);
    }

    getNormalBuffer(gl: WebGLRenderingContext) {
        return new Buffer(gl, new Float32Array(flatten(this.normals)), gl.ARRAY_BUFFER, gl.FLOAT, 3);
    }

    getIndexBuffer(gl: WebGLRenderingContext) {
        // hopefully Uint16s are enough
        return new Buffer(gl, new Uint16Array(flatten(this.vertices)), gl.ELEMENT_ARRAY_BUFFER, gl.UNSIGNED_SHORT);        
    }

    getTexCoordBuffer(gl: WebGLRenderingContext) {
        return new Buffer(gl, new Float32Array(flatten(this.texCoords)), gl.ARRAY_BUFFER, gl.FLOAT, 2);
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
            const lat = Math.PI * row / rows;

            // The plane should go from 1 down to -1.
            // So that's cos from 0 to pi.
            const y = Math.cos(lat);

            // How big is our circle on this plane?
            // That should go from 0 to 1 to 0.
            // That's sin!
            const planeCircleRadius = Math.sin(lat);
            
            for (let col = 0; col <= columns; col++) {
                // We start off "from the back".
                // TODO: offset this by 1/2 a "notch"
                const lon = (Math.PI * col / columns) - (Math.PI / 2);

                // If lon = 0, z should be 1 and x = 0.
                // Therefore, z is cos, and x is sin!
                const z = planeCircleRadius * Math.cos(lon);
                const x = planeCircleRadius * Math.sin(lon);

                vertexRow.push([x, y, z]);

                // Now, what are the texture coordinates?
                const texU = row / rows;
                const texV = col / columns;
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
         
        return new Mesh(flattenedVertices, flattenedVertices, indices, flattenedTexCoords);
    }
}
