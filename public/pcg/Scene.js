// helper functions

// convert a list into a list of args and apply a constructor
function construct(constructor, args) {
    function F() {
        return constructor.apply(this, args);
    }
    F.prototype = constructor.prototype;
    return new F();
}

// transform a mesh according to transform
function transformMesh(mesh, transform) {
    mesh.matrixAutoUpdate = false;

    var meshMatrix = mesh.matrixWorld.clone();
    var updateMatrix = construct(THREE.Matrix4, transform.transpose().flatten());
    mesh.matrix.multiply(meshMatrix.multiply(updateMatrix));
}

function Scene() {
    // set the scene size
    this.WIDTH = 400;
    this.HEIGHT = 300;
    this.SCALE = 50;

    // get the DOM element to attach to
    // - assume we've got jQuery to hand
    var $container = $('#container');

    renderer = new THREE.WebGLRenderer();

    // start the renderer
    renderer.setSize(this.WIDTH, this.HEIGHT);

    // attach the render-supplied DOM element
    $container.append(renderer.domElement);
};

Scene.prototype.init = function() {
    scene = new THREE.Scene();

    // set some camera attributes
    var VIEW_ANGLE = 45,
      ASPECT = this.WIDTH / this.HEIGHT,
      NEAR = 0.1,
      FAR = 10000;

    camera =
      new THREE.PerspectiveCamera(
        VIEW_ANGLE,
        ASPECT,
        NEAR,
        FAR);

    // add the camera to the scene
    scene.add(camera);

    // the camera starts at 0,0,0
    // so pull it back
    camera.position.z = 300;

    controls = new THREE.OrbitControls(camera);
    controls.addEventListener( 'change', this.render );

    // create a point light
    var pointLight =
      new THREE.PointLight(0xFFFFFF);

    // set its position
    pointLight.position.x = 10;
    pointLight.position.y = 50;
    pointLight.position.z = 130;

    var pointLight2 =
      new THREE.PointLight(0xFFFFFF);

    pointLight2.position.x = -10;
    pointLight2.position.y = -50;
    pointLight2.position.z = -130;

    var pointLight3 =
      new THREE.PointLight(0xFFFFFF);

    pointLight3.position.x = 10;
    pointLight3.position.y = 130;
    pointLight3.position.z = -50;

    scene.add(pointLight);
    scene.add(pointLight2);
    scene.add(pointLight3);

    // add subtle blue ambient lighting
    var ambientLight = new THREE.AmbientLight(0x000044);
    scene.add(ambientLight);
};

Scene.prototype.render = function() {
	renderer.render(scene, camera);
};

// Scene.prototype.animate = function() {
//     // note: three.js includes requestAnimationFrame shim
//     controls.update();
//     requestAnimationFrame( this.animate );
//     this.render();
// };

// x = segments
// y = rings
// transform = transform of sphere
Scene.prototype.addSphere = function(x, y, transform) {
    // set up the sphere vars
    var radius = this.SCALE,
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

    transformMesh(sphere, transform);

    // add the sphere to the scene
    scene.add(sphere);
};

// Radii array is a 2d array that contains the radius at every point
// from 0 to 2pi around the object, and from 0 to 1 along the y axis.
// radiiArray[i][j] is at the angle i/len*2pi and the height j/len.
Scene.prototype.addLatheObject = function (radiiArray, transform) {
    var latheMaterial =
      new THREE.MeshLambertMaterial(
        {
          color: 0xCC0000
        });

    var lathe = new THREE.Mesh(
        new THREE.CustomLatheGeometry(radiiArray, this.SCALE/2, this.SCALE/10),
        latheMaterial);

    transformMesh(lathe, transform);
    scene.add(lathe);
};

Scene.prototype.setSeed = function (seedName) {
    Math.seedrandom(seedName);
};
