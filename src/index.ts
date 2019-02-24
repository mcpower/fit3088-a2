import * as OBJ from "./lib/webgl-obj-loader";
import Mesh from "./classes/Mesh";
import Context from "./classes/Context";
import SatelliteProgram from "./programs/SatelliteProgram";
import EarthProgram from "./programs/EarthProgram";
import DateStore from "./classes/DateStore";
import { EARTH_RADIUS_GL, EARTH_RADIUS_KM } from "./constants";
import Satellite, { pickSatellite } from "./classes/Satellite";
import OrbitProgram from "./programs/OrbitProgram";

function isCanvas(canvas: HTMLElement): canvas is HTMLCanvasElement {
    return (<HTMLCanvasElement>canvas).getContext !== undefined;
}

window.addEventListener("load", () => {
    const canvas = document.getElementById("gl-canvas");
    if (canvas === null) return;
    if (!isCanvas(canvas)) return;
    
    const context = Context.fromCanvas(canvas);

    // Calculate the scale factor to match up the earth's radius
    // (in kilometer-space) to its radius in GL-space.
    const scaleFactor = EARTH_RADIUS_GL / EARTH_RADIUS_KM;
    context.scale = scaleFactor;
    
    // The date store, to store the current date for satellites.
    const ds = new DateStore();

    // The timestep for satellites.
    // Adjustable via HTML.
    let dt = 0;
    // Update the date store before every render.
    context.addRenderCallback(() => {
        ds.offset(dt);
    });
    // Creates the earth program and adds it to the context.
    // The earth program will the textures automatically.
    const ep = new EarthProgram(context.gl, ds, EARTH_RADIUS_KM);
    context.programs.push(ep);
    
    // Initiate a call to downloadMeshes.
    // We will first need the mesh, then the satellite positions.
    OBJ.downloadMeshes({"model": "satellite.obj"}, (mesh) => {
        // The mesh is loaded.
        const m = Mesh.fromObj(mesh.model);
        // Creates a SatelliteProgram from the mesh.
        const sp = new SatelliteProgram(context.gl, m, ds);
        context.programs.push(sp);

        // Initiate the request for the GPS positions.
        // Note that OBJ.downloadMeshes internally uses fetch(),
        // so we may as well use fetch() here.
        (async () => {
            const r = await fetch("gps-ops.txt");
            const text = await r.text();
            // Gets and parses all the satellites into Satellite[].
            const s = Satellite.fromTleStrings(text);
            sp.satellites = s;

            // Now that we have the satellites, we can get the orbits too.
            const op = new OrbitProgram(context.gl, s);
            context.programs.push(op);

            // Selecting satellites.
            let lastPicked: Satellite | undefined = undefined;

            const selectedSatEl = document.getElementById("selected-satellite")!;
            
            // When the canvas is clicked...
            canvas.addEventListener("click", function(ev) {
                // undefine the last picked satellite
                if (lastPicked !== undefined) {
                    lastPicked.selected = false;
                }
                // and get a new satellite.
                const ray = context.getRay(ev.offsetX, ev.offsetY);
                lastPicked = pickSatellite(ds.date, s, ray);
                // Select the satellite and update the HTML page.
                if (lastPicked !== undefined) {
                    lastPicked.selected = true;
                    selectedSatEl.innerText = lastPicked.name;
                } else {
                    selectedSatEl.innerText = "none";
                }
            });
        })();
    });

    // Initiate the main render loop.
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

    const resetRotEl = <HTMLButtonElement> document.getElementById("reset-rotation")!;
    resetRotEl.addEventListener("click", () => {
        context.rotateX = 0;
        context.rotateY = 0;
        context.rotateZ = 0;
        rotationXEl.value = "0";
        rotationYEl.value = "0";
    });
})
