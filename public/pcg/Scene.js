function Scene() {
    // set the scene size
    this.WIDTH = 400;
    this.HEIGHT = 300;

    // get the DOM element to attach to
    // - assume we've got jQuery to hand
    var $container = $('#container');

    // create a WebGL renderer, camera
    // and a scene
    this.renderer = new THREE.WebGLRenderer();

    // start the renderer
    this.renderer.setSize(this.WIDTH, this.HEIGHT);

    // attach the render-supplied DOM element
    $container.append(this.renderer.domElement);
}

Scene.prototype.init = function() {
    this.scene = new THREE.Scene();

    // set some camera attributes
    var VIEW_ANGLE = 45,
      ASPECT = this.WIDTH / this.HEIGHT,
      NEAR = 0.1,
      FAR = 10000;

    this.camera =
      new THREE.PerspectiveCamera(
        VIEW_ANGLE,
        ASPECT,
        NEAR,
        FAR);

    // add the camera to the scene
    this.scene.add(this.camera);

    // the camera starts at 0,0,0
    // so pull it back
    this.camera.position.z = 300;

    // create a point light
    var pointLight =
      new THREE.PointLight(0xFFFFFF);

    // set its position
    pointLight.position.x = 10;
    pointLight.position.y = 50;
    pointLight.position.z = 130;

    // add to the scene
    this.scene.add(pointLight);
}

Scene.prototype.draw = function() {
	this.renderer.render(this.scene, this.camera);
}

Scene.prototype.addSphere = function(x, y, transform) {
    // set up the sphere vars
    var radius = 50,
        segments = x,
        rings = y;

    // create the sphere's material
    var sphereMaterial =
      new THREE.MeshLambertMaterial(
        {
          color: 0xCC0000
        });

    // create a new mesh with
    // sphere geometry - we will cover
    // the sphereMaterial next!
    var sphere = new THREE.Mesh(

      new THREE.SphereGeometry(
        radius,
        segments,
        rings),

      sphereMaterial);

    sphere.matrixAutoUpdate = false;

    var sphereMatrix = sphere.matrixWorld.clone();
    var updateMatrix = construct(THREE.Matrix4, transform.transpose().flatten());
    sphere.matrix.multiply(sphereMatrix.multiply(updateMatrix));

    // add the sphere to the scene
    this.scene.add(sphere);
}

function construct(constructor, args) {
    function F() {
        return constructor.apply(this, args);
    }
    F.prototype = constructor.prototype;
    return new F();
}