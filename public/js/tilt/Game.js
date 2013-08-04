function Game() {
  this.init = function() {
    console.log("init");
    this.canvas = document.getElementById('c');
    initWebGL(this.canvas);
  };

  this.start = function() {
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0,0,0,1);
    var mesh = new Mesh();
    var z = 0;
    var rot = new Matrix4x3();
    var camera = new Matrix4x3();

    var spinNode = new DAGNode([new Geometry(mesh)]);
    var scene = new DAGNode([spinNode]);

    function draw() {
        requestAnimationFrame(draw, c);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        spinNode.local.makeRotate(z, 1, 0, 0);
        spinNode.local.multiply(rot.makeRotate(z, 0, 1, 0));
        spinNode.local.multiply(rot.makeRotate(z, 0, 0, 1));
        scene.local.makeRotate(z,0,1,0);
        camera.d[14] = 8 + Math.sin(z);
        viewMatrix().makeInverseRigidBody(camera);
        scene.draw();

        z += 0.01;
    }

    mesh.load('meshes/plane.json', draw);
  };
}