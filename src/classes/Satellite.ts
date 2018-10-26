import DateStore from "./DateStore";
import { SatRec } from "../lib/satellite/types";
import satellite from "../lib/satellite";

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

    getTransform(): Matrix {
        // first, get position lat/long/height
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
