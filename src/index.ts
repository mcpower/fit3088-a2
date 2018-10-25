import * as satellite from "./lib/satellite";
import * as OBJ from "./lib/webgl-obj-loader";
import Mesh from "./classes/Mesh";
import Program from "./classes/Program";
import Context from "./classes/Context";

interface Sat {
    name: string;
    tle1: string;
    tle2: string;
};

var httpRequest: XMLHttpRequest | undefined;
var satellites: Sat[] = [];

// parses a series of TLE records describing the position and movement of satellites
function parseSatellites(tleStrings: string) {
    // need to make this a regex
    var lines = tleStrings.split(/\r?\n/);
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
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
}

// returns longitude, latitude and height for a satellite at a given time
function satellitePosition(sat: Sat, time: Date) {
    var satrec = satellite.twoline2satrec(sat.tle1, sat.tle2);
    var positionAndVelocity = satellite.propagate(satrec, time);
    if (positionAndVelocity instanceof Array || positionAndVelocity.position === false) {
        throw new Error("Propagation failed.");
    }
    var gmst = satellite.gstime(time);
    // ECI coordinates
    var positionEci = positionAndVelocity.position;
    // geodetic coordinates
    return satellite.eciToGeodetic(positionEci, gmst);
}

function makeRequest(url: string) {
    httpRequest = new XMLHttpRequest();

    if (!httpRequest) {
        alert('Cannot create an XMLHTTP instance');
        return false;
    }
    httpRequest.onreadystatechange = stateChange;
    httpRequest.open('GET', url);
    httpRequest.send();
}

function stateChange() {
    if (httpRequest === undefined) return;
    
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
            parseSatellites(httpRequest.responseText);
            printSample();
        } else {
            alert('There was a problem with the request. Status: ' + httpRequest.status);
        }
    }
}

function printSample() {
    var now = new Date();
    var dT = 10 * 1000; // time offset in milliseconds<br>
    var time = new Date(now.getTime() + dT);
    var pos = satellitePosition(satellites[0], time);
    console.log(pos);
}

window.addEventListener("load", () => makeRequest("gps-ops.txt"));

OBJ.downloadMeshes({"model": "satellite.obj"}, (mesh) => {
    console.log("satellite:", mesh.model);
});

console.log(Mesh.makeSphere(16));

window.addEventListener("load", () => {
    const canvas = <HTMLCanvasElement>document.getElementById("gl-canvas");
    
    const context = Context.fromCanvas(canvas);
    // const prog = Program.fromShaders(context.gl, "", "");
    console.log(context.gl);

    console.log(context);

    context.render();
})
