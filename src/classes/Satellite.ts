import DateStore from "./DateStore";
import { SatRec } from "../lib/satellite/types";
import * as satellite from "../lib/satellite";
import { EARTH_RADIUS_KM, EPS } from "../constants";
import * as MV from "../lib/MV";

export default class Satellite {
    ds: DateStore;
    satrec: SatRec;

    constructor(ds: DateStore, satrec: SatRec) {
        this.ds = ds;
        this.satrec = satrec;
    }

    getPos() {
        const positionAndVelocity = satellite.propagate(this.satrec, this.ds.date);
        if (positionAndVelocity instanceof Array || positionAndVelocity.position === false) {
            throw new Error("Propagation failed.");
        }
        const gmst = satellite.gstime(this.ds.date);
        // ECI coordinates
        const positionEci = positionAndVelocity.position;
        // geodetic coordinates
        return satellite.eciToGeodetic(positionEci, gmst);
    }

    getTransform(): MV.Matrix {
        // first, get position lat/long/radius
        // this lat/long is already in radians
        const {latitude, longitude, height} = this.getPos();
        const radius = EARTH_RADIUS_KM + height;

        // then get x/y/z
        // use same logic from Mesh.ts
        const y = Math.sin(latitude);

        const planeCircleRadius = Math.cos(latitude);

        const z = planeCircleRadius * Math.cos(longitude);
        const x = planeCircleRadius * Math.sin(longitude);

        // so we now have a vector corresponding to where it is.
        // TODO: do this Vector & [...] in MV.ts
        type V3 = MV.Vector & [number, number, number];
        const displacement: V3 = [radius * x, radius * y, radius * z];
        // this should be normalised already, as it's on a unit sphere
        const vectorToEarth: V3 = [-x, -y, -z];
        const origin: V3 = [0, 0, 0];
        // the 3D model for the satellite is pointing in the positive X direction
        // this is also normalised
        const modelPointing: V3 = [1, 0, 0];

        // get translate matrix
        const translation = MV.translate(displacement);

        // get ROTATION matrix
        // this is hard.
        // we want to intutively align modelPointing to vectorToEarth
        // this Maths StackExchange answer has a formula:
        // https://math.stackexchange.com/q/180418
        const v = MV.cross(modelPointing, vectorToEarth);
        const sine = MV.length(v);
        if (sine < EPS) {
            // The two are close enough.
            // We may need to flip the satellite though, i.e. "flip" x.
            const flipNeeded = vectorToEarth[0] < 0;
            if (flipNeeded) {
                return MV.mult(translation, MV.rotateY(180));
            } else {
                return translation;
            }
        } else {
            // We have a good normal vector.
            const I = MV.mat3();
            const cosine = MV.dot(modelPointing, vectorToEarth);
            const coeff = 1 / (1 + cosine);
            const vMatrix = MV.mat3(
                0, -v[2], v[1],
                v[2], 0, -v[0],
                -v[1], v[0], 0
            );
            const rotation = MV.add(
                MV.add(MV.mat3(), vMatrix),
                MV.mult(MV.mat3(coeff), MV.mult(vMatrix, vMatrix))
            );
            return MV.mult(translation, MV.mat4(
                rotation[0], 0,
                rotation[1], 0,
                rotation[2], 0,
                0, 0, 0, 1
            ));
        }
    }

    static fromTLE(ds: DateStore, tle1: string, tle2: string): Satellite {
        return new Satellite(ds, satellite.twoline2satrec(tle1, tle2));
    }

    static fromTleStrings(ds: DateStore, tleStrings: string): Satellite[] {
        let satellites: {
            name: string;
            tle1: string;
            tle2: string;
        }[] = [];
        let lines = tleStrings.split(/\r?\n/);
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.length === 0) {
                break;
            }
            if (line.charAt(0) === "1") {
                satellites[satellites.length - 1].tle1 = line;
            } else if (line.charAt(0) === "2") {
                satellites[satellites.length - 1].tle2 = line;
            } else {
                satellites.push({
                    name: line,
                    tle1: "",
                    tle2: ""
                });
            }
        }
        return satellites.map(({tle1, tle2}) => Satellite.fromTLE(ds, tle1, tle2));
    }
}
