var cThreshold = 1.5;
var cDivFactor = 100.0;

function Game() {
  var xVal, yVal;

  this.init = function() {
    console.log("init");

    xVal = 0;
    yVal = 0;

    initWebGL(document.getElementById('c'));
  };

  this.setVals = function(x, y) {
    if (Math.abs(x) > cThreshold)
        xVal = x / cDivFactor;
    else
        xVal = 0;
    if (Math.abs(y) > cThreshold)
        yVal = y / cDivFactor;
    else
        yVal = 0;
  };

  this.start = function() {
    console.log("start");
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0,0,0,1);
    var mesh = new Mesh();
    var plane = new DAGNode([new Geometry(mesh)]);
    var scene = new DAGNode([plane]);

    var target = vec3.fromValues(0, 0, 0);
    var eye = vec3.fromValues(0, -20, 20);
    var up = vec3.fromValues(0, 1, 0);
    mat4.lookAt(viewMatrix(), eye, target, up);

    function draw() {
        requestAnimationFrame(draw, c);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        mat4.rotateX(plane.local, plane.local, xVal);
        mat4.rotateY(plane.local, plane.local, yVal);
        xVal /= 2;
        yVal /= 2;
        scene.draw();
    }

    mesh.load('meshes/plane.json', draw);
  };
}