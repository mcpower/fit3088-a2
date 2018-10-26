import DateStore from "./DateStore";
import { SatRec } from "../lib/satellite/types";
import * as satellite from "../lib/satellite";
import { EARTH_RADIUS_KM, EPS, SATELLITE_PICK_RADIUS } from "../constants";
import * as MV from "../lib/MV";

/**
 * Picks the first satellite hit by the given ray.
 * @param date The current date.
 * @param satellites The satellites to pick from.
 * @param ray The ray to base the pick from.
 */
export function pickSatellite(
    date: Date,
    satellites: Satellite[],
    ray: {fromPoint: MV.Vector, toPoint: MV.Vector}
): Satellite | undefined {
    let bestTime = Infinity;
    // We can hit the earth too!
    // See whether we do.
    const {dist: earthDist, t: earthT} = getClosestDistance(MV.vec3(0, 0, 0), ray);
    if (earthDist < EARTH_RADIUS_KM) {
        // We hit the earth!
        // Now, the earth will compete in the "best time" context :)
        bestTime = earthT;
    }
    let toReturn: Satellite | undefined = undefined;
    satellites.forEach(sat => {
        const {dist, t} = sat.getDistanceFromRay(date, ray);
        if (dist < SATELLITE_PICK_RADIUS && t < bestTime) {
            bestTime = t;
            toReturn = sat;
        }
    })
    return toReturn;
}

function getClosestDistance(point: MV.Vector, ray: {fromPoint: MV.Vector, toPoint: MV.Vector}) {
    const {fromPoint, toPoint} = ray;
    const aToB = MV.subtract(toPoint, fromPoint);
    const thisToStart = MV.subtract(fromPoint, point);
    const t = -MV.dot(thisToStart, aToB) / MV.dot(aToB, aToB);

    const closestPoint = MV.add(fromPoint, MV.scale(t, aToB));
    const dist = MV.length(MV.subtract(point, closestPoint));
    return {dist, t};
}

export default class Satellite {
    satrec: SatRec;
    name: string;
    selected: boolean;

    constructor(satrec: SatRec, name?: string) {
        this.satrec = satrec;
        this.name = name || "";
        this.selected = false;
    }

    getLatLonHeight(date: Date) {
        const positionAndVelocity = satellite.propagate(this.satrec, date);
        if (positionAndVelocity instanceof Array || positionAndVelocity.position === false) {
            throw new Error("Propagation failed.");
        }
        const gmst = satellite.gstime(date);
        // ECI coordinates
        const positionEci = positionAndVelocity.position;
        // geodetic coordinates
        return satellite.eciToGeodetic(positionEci, gmst);
    }
    
    /**
     * Get the (x, y, z) positions on the unit sphere and the "radius" of the
     * actual sphere it's on.
     * @param date The specific date to get the position of.
     */
    getPos(date: Date) {
        // NOTE: this shares a lot of code
        const {latitude, longitude, height} = this.getLatLonHeight(date);
        const radius = EARTH_RADIUS_KM + height;

        // then get x/y/z
        // use same logic from Mesh.ts
        const y = Math.sin(latitude);

        const planeCircleRadius = Math.cos(latitude);

        const z = planeCircleRadius * Math.cos(longitude);
        const x = planeCircleRadius * Math.sin(longitude);
        return {x, y, z, radius};
    }

    getTransform(date: Date): MV.Matrix {
        // get x/y/z/radius
        const {x, y, z, radius} = this.getPos(date);

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

    getOrbit() {
        const d = new Date();
        let out: [number, number, number][] = [];
        // sample once every 10 minutes
        for (let dt = 0; dt < 24 * 60 * 60 * 1000; dt += 10 * 60 * 1000) {
            const newD = new Date(d.getTime() + dt);
            const {x, y, z, radius} = this.getPos(newD);
            out.push([radius * x, radius * y, radius * z]);
        }
        return out;
    }

    getDistanceFromRay(date: Date, ray: {fromPoint: MV.Vector, toPoint: MV.Vector}) {
        // http://mathworld.wolfram.com/Point-LineDistance3-Dimensional.html
        const {x, y, z, radius} = this.getPos(date);
        const point = MV.vec3(radius * x, radius * y, radius * z);

        return getClosestDistance(point, ray);
    }

    static fromTLE(tle1: string, tle2: string, name?: string): Satellite {
        return new Satellite(satellite.twoline2satrec(tle1, tle2), name);
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
        return satellites.map(({tle1, tle2, name}) => Satellite.fromTLE(tle1, tle2, name));
    }
}
