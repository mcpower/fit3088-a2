import { SatRec } from "./types";

interface Point {
  x: number;
  y: number;
  z: number;
}

declare function propagate(satrec: SatRec, date: Date): [false, false] | { position: Point; velocity: Point } | { position: false; velocity: false };
declare function propagate(satrec: SatRec, year: number, mon: number, day: number, hr: number, minute: number, sec: number, msec?: number): [false, false] | { position: Point; velocity: Point } | { position: false; velocity: false };

declare function twoline2satrec(longstr1: string, longstr2: string): SatRec;

declare function gstime(year: Date): number;
declare function gstime(year: number, mon: number, day: number, hr: number, minute: number, sec: number, msec?: number): number;
declare function gstime(jdut1: number): number;

declare function gstimeFromDate(year: Date): number;
declare function gstimeFromDate(year: number, mon: number, day: number, hr: number, minute: number, sec: number, msec?: number): number;
declare function gstimeFromDate(jdut1: number): number;

declare function eciToGeodetic(eci: Point, gmst: number): {
  longitude: number;
  latitude: number;
  height: number;
};

export {
  // constants,

  // Propagation
  propagate,
  // sgp4,
  twoline2satrec,

  gstime,
  // gstimeFromJday,
  gstimeFromDate,
  // jday,
  // invjday,

  // dopplerFactor,

  // Coordinate transforms
  // degreesLat,
  // degreesLong,
  // geodeticToEcf,
  eciToGeodetic,
  // eciToEcf,
  // ecfToEci,
  // ecfToLookAngles,
};
