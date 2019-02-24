# FIT3088 Assignment 2: 3D Globe and Satellite Visualisation with WebGL

This was my submission for the aforementioned university assignment, written
from scratch in TypeScript. While TypeScript wasn't a strict requirement for
the assignment, it made coding much easier after the initial setup.

The original assignment specification is in this repo as `assignment.pdf`.
The university subject, FIT3088, has unfortunately been discontinued, so it
is okay to make this repo public without fears of plagiarism.

## Libraries used

Many libraries were used in this assignment:

- [satellite.js](https://github.com/shashwatak/satellite-js)
- [suncalc.js](https://github.com/mourner/suncalc)
- [webgl-obj-loader](https://github.com/frenchtoast747/webgl-obj-loader) - note
  that this was before webgl-obj-loader was updated to use TypeScript
- [various scripts](https://www.cs.unm.edu/~angel/WebGL/6E/Common/) from Angel's
  WebGL book

These libraries are all located in `src/lib` with the appropriate TypeScript
typings. Some were completely re-written in TypeScript, while others were
typed using definition files (adding enough types for use in this assignment).
