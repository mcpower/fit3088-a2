import { Matrix, scalem, mult, rotateX, rotateY, rotateZ, translate } from "../lib/MV";

/**
 * A general class for model transforms.
 * Currently not used.
 */
export default class ModelTransform {
    // apply scaling, then rotations, then translations
    // translation MUST be applied last,
    // i.e. be the "left-most" matrix in the product
    constructor(
        public scale: number = 0,
        public rotation: [number, number, number] = [0, 0, 0],
        public translation: [number, number, number] = [0, 0, 0],
    ) {

    }

    getMatrix(): Matrix {
        let modelMatrix = scalem(this.scale, this.scale, this.scale);
        modelMatrix = mult(rotateX(this.rotation[0]), modelMatrix);
        modelMatrix = mult(rotateY(this.rotation[1]), modelMatrix);
        modelMatrix = mult(rotateZ(this.rotation[2]), modelMatrix);
        modelMatrix = mult(translate(this.translation), modelMatrix);
        return modelMatrix;
    }
}
