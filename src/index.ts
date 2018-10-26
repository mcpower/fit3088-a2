import * as satellite from "./lib/satellite";
import * as OBJ from "./lib/webgl-obj-loader";
import Mesh from "./classes/Mesh";
import Program from "./classes/Program";
import Context from "./classes/Context";
import SatelliteProgram from "./programs/SatelliteProgram";
import { mat4, scalem } from "./lib/MV";
import * as MV from "./lib/MV";
import EarthProgram from "./programs/EarthProgram";
import DateStore from "./classes/DateStore";
import { EARTH_RADIUS_GL, EARTH_RADIUS_KM } from "./constants";
import Satellite from "./classes/Satellite";

window.addEventListener("load", () => {
    const canvas = <HTMLCanvasElement>document.getElementById("gl-canvas");
    
    const context = Context.fromCanvas(canvas);
    // const prog = Program.fromShaders(context.gl, "", "");

    const scaleFactor = EARTH_RADIUS_GL / EARTH_RADIUS_KM;
    context.model = scalem(scaleFactor, scaleFactor, scaleFactor);
    
    const ds = new DateStore();
    context.addRenderCallback(() => {
        ds.offset(1000 * 60);
    });
    const ep = new EarthProgram(context.gl, ds, EARTH_RADIUS_KM);
    context.programs.push(ep);
    
    OBJ.downloadMeshes({"model": "satellite.obj"}, (mesh) => {
        const m = Mesh.fromObj(mesh.model);
        // const m = Mesh.makeSphere(16);
        console.log("satellite:", m);
        const sp = new SatelliteProgram(context.gl, m, ds);
        context.programs.push(sp);
        const satRequest = (async () => {
            const r = await fetch("gps-ops.txt");
            const text = await r.text();
            const s = Satellite.fromTleStrings(ds, text);
            sp.satellites = s;
        })();
    });
    console.log(context.gl);

    console.log(context);



    context.render();
})
