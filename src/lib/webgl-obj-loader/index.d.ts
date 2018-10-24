type M<T> = { [key: string]: T };
declare class Mesh {
    indices: number[];
    materialIndices: M<number>;
    materialNames: string[];
    // ???
    materialsByIndex: M<any>;
    name: string;
    textureStride: number;
    textures: number[];
    vertexMaterialIndices: number[];
    vertices: number[];
    vertexNormals: number[];
}
declare function downloadMeshes<T extends M<string>>(
    nameAndURLs: T,
    completionCallback: (_: { [P in keyof T]: Mesh }) => void
): void;
declare function downloadMeshes<T extends M<string>, U extends M<Mesh>>(
    nameAndURLs: T,
    completionCallback: (_: U & { [P in keyof T]: Mesh }) => void,
    meshes: U
): void;

export {
    Mesh,
    downloadMeshes
};
