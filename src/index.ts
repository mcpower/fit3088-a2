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
import Satellite, { pickSatellite } from "./classes/Satellite";
import OrbitProgram from "./programs/OrbitProgram";

window.addEventListener("load", () => {
    const canvas = <HTMLCanvasElement>document.getElementById("gl-canvas");
    
    const context = Context.fromCanvas(canvas);
    // const prog = Program.fromShaders(context.gl, "", "");

    const scaleFactor = EARTH_RADIUS_GL / EARTH_RADIUS_KM;
    context.scale = scaleFactor;
    
    const ds = new DateStore();

    // The timestep for satellites.
    // Adjustable via HTML.
    let dt = 0;
    context.addRenderCallback(() => {
        ds.offset(dt);
    });
    const ep = new EarthProgram(context.gl, ds, EARTH_RADIUS_KM);
    context.programs.push(ep);
    
    OBJ.downloadMeshes({"model": "satellite.obj"}, (mesh) => {
        const m = Mesh.fromObj(mesh.model);
        const sp = new SatelliteProgram(context.gl, m, ds);
        context.programs.push(sp);
        const satRequest = (async () => {
            const r = await fetch("gps-ops.txt");
            const text = await r.text();
            const s = Satellite.fromTleStrings(ds, text);
            sp.satellites = s;

            const op = new OrbitProgram(context.gl, s);
            context.programs.push(op);

            let lastPicked: Satellite | undefined = undefined;

            const selectedSatEl = document.getElementById("selected-satellite")!;
            
            canvas.addEventListener("click", function(ev) {
                if (lastPicked !== undefined) {
                    lastPicked.selected = false;
                }

                const ray = context.getRay(ev.offsetX, ev.offsetY);
                lastPicked = pickSatellite(ds.date, s, ray);
                if (lastPicked !== undefined) {
                    lastPicked.selected = true;
                    selectedSatEl.innerText = lastPicked.name;
                } else {
                    selectedSatEl.innerText = "none";
                }
            });
        })();
    });


    context.render();

    // Set up HTML controls
    const rotationXEl = <HTMLInputElement> document.getElementById("rotation-x")!;
    rotationXEl.addEventListener("input", () => {
        const val = +rotationXEl.value;
        context.rotateX = val;
    });

    const rotationYEl = <HTMLInputElement> document.getElementById("rotation-y")!;
    rotationYEl.addEventListener("input", () => {
        const val = +rotationYEl.value;
        context.rotateY = val;
    });

    const satSpeedEl = <HTMLInputElement> document.getElementById("satellite-speed")!;
    satSpeedEl.addEventListener("input", () => {
        const val = +satSpeedEl.value;
        dt = val;
    });
})
