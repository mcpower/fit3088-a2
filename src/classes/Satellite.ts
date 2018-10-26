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
}
