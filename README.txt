To see the compiled version of the assignment, please go into the "dist" folder
and check out "index.html". You will need to run a web server, as requests
will be made to get various things. The assignment submission should have
an already-compiled version of the assignment - the "dist" folder should have
a "bundle.js" file.

This entire assignment has been written in TypeScript, a very strict variant
of JavaScript. As a result, everything is type checked to ensure that there
are no type errors, and "use strict" is enabled by default due to the strictness
of the checking.

If you would like to strictly review JavaScript code, a compiled version of the
source code to ES2016 JavaScript is available in "dist/js". Note that this code
IS NOT RUNNABLE, as it requires the use of imports. Please use "bundle.js" to
run the code.
There is also the webpacked bundle, but it is much harder to review. I would
highly recommend reviewing the TypeScript code in "src" if possible.
It is recommend to use the text editor "VS Code". VS Code will allow for very
good TypeScript exploration, including the inspection of variable types and
jumping to definitions / uses of variables.

All libraries used are in the "src/lib" folder. I have modified them slightly
for my use, including the addition of types for TypeScript. Of note are the
non-type related modifications:

- I have identified two bugs in satellite.js after attempting to convert it to
  JavaScript. I have fixed those bugs, and will likely let the maintainers of
  satellite.js know.
- initShaders has been modified to take in a string.

Webpack is used to load all the libraries and to pack all of my TypeScript files
together. Webpack also gives the ability to load files as strings, which allows
for separating GLSL source files from HTML.

I have three main "Programs", all located in "src/programs":
- EarthProgram renders the earth
- SatelliteProgram renders the satellites
- OrbitProgram renders the orbits of the satellites.

These all derive from the Program class, and as a result these programs can be
combined in a single Context. These aforementioned classes are located in
"src/classes".
A Context is a WebGLRenderingContext with a few extras, storing the necessary
global attributes needed to render. For example, it contains some global MVP
matrices, which are passed to each program separately. This is to ensure that
all programs are rendering using the same MVP matrices (barring any model
transformations that a Program can apply to its own geometry).

Some cool things in this assignment:
- The sphere generation generates spheres using the "longitude latitude" technique,
  but also *shifts* every latitude row based on the row. Instead of generating a 
  "longitude latitude" rectangular grid, it instead generates a grid like a rhombus.
  This increases the resolution of the sphere, especially when generating spheres
  with a low number of rows / columns.
- The selected satellite is highlighted in red, and its orbit is also highlighted
  in red.
- The day/night texture is blended between dusk and dawn.
- The internal co-ordinate system is in kilometers, and gets transformed into
  more sensible co-ordinates using a global model matrix. This ensures that
  calculations are very straightforward, and the scale of the earth w.r.t.
  the satellite orbits is kept.
- Satellites are displayed bigger than real life to ensure that they are clickable.

---------
COMPILING
---------

To compile the TypeScript code to JavaScript and bundle it, be sure to install
all dev dependencies:

$ npm install

and then run Webpack:

$ npm run build

This will compile the source code to "dist/bundle.js".
