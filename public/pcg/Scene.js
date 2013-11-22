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

function Scene(callback) {
    // set the scene size
    this.WIDTH = 700;
    this.HEIGHT = 400;
    this.SCALE = 1;

    // set some camera attributes
    var VIEW_ANGLE = 45,
      ASPECT = this.WIDTH / this.HEIGHT,
      NEAR = 0.1,
      FAR = 10000;

    // get the DOM element to attach to
    // - assume we've got jQuery to hand
    var $container = $('#container');

    this.renderer = new THREE.WebGLRenderer();

    // start the renderer
    this.renderer.setSize(this.WIDTH, this.HEIGHT);

    // attach the render-supplied DOM element
    $container.append(this.renderer.domElement);

    this.camera =
      new THREE.PerspectiveCamera(
        VIEW_ANGLE,
        ASPECT,
        NEAR,
        FAR);

    // the camera starts at 0,0,0
    // so pull it back
    this.camera.position.z = 10;

    this.controls = new THREE.OrbitControls(this.camera);

    // load shaders
    this.vsRandDisplacement = Object("");
    this.fsRandDisplacement = Object("");

    function shaderLoaded(shader) {
        return function(str) {
            shader.valueOf = shader.toSource = shader.toString
                = function() { return str };

            if (this.vsDisplacement !== Object("") && this.fsDisplacement !== Object("")) {
                // all shaders have loaded, we are done with init
                callback();
            }
        }
    };

    loadFile("shaders/vs-randDisplacement.txt", shaderLoaded(this.vsRandDisplacement).bind(this), false);
    loadFile("shaders/fs-randDisplacement.txt", shaderLoaded(this.fsRandDisplacement).bind(this), false);

    this.fireTexture = new THREE.ImageUtils.loadTexture( 'images/explosion.png' );
};

Scene.prototype.init = function() {
    this.scene = new THREE.Scene();

    // add the camera to the scene
    this.scene.add(this.camera);

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

    this.scene.add(pointLight);
    this.scene.add(pointLight2);
    this.scene.add(pointLight3);

    // this.controls.addEventListener( 'change',
    //     this.render.bind(this)
    // );

    this.animate.call(this);
    // // add subtle blue ambient lighting
    // var ambientLight = new THREE.AmbientLight(0x000044);
    // this.scene.add(ambientLight);
};

Scene.prototype.render = function() {
    // controls.update();
	this.renderer.render(this.scene, this.camera);
};

Scene.prototype.animate = function() {
//     // note: three.js includes requestAnimationFrame shim
//     controls.update();
    requestAnimationFrame(this.animate.bind(this));
    this.render();
};

// q = quality of sphere
// transform = transform of sphere
Scene.prototype.addSphere = function(q, transform, b, noise) {
    // set up the sphere vars
    var radius = this.SCALE,
        segments = q,
        rings = q;

    var sphereMaterial = getMaterial(b, noise, this.fireTexture);

    var sphere = new THREE.Mesh(

      new THREE.SphereGeometry(
        1,
        segments,
        rings),

      sphereMaterial);

    transformMesh(sphere, transform);

    // add the sphere to the scene
    this.scene.add(sphere);

    return sphere;
};

// Radii array is a 2d array that contains the radius at every point
// from 0 to 2pi around the object, and from 0 to 1 along the y axis.
// radiiArray[i][j] is at the angle i/len*2pi and the height j/len.
Scene.prototype.addLatheObject = function (radiiArray, transform, b, noise) {
    var latheMaterial = this.getMaterial(b, noise, this.fireTexture);

    var lathe = new THREE.Mesh(
        new THREE.CustomLatheGeometry(radiiArray, this.SCALE, this.SCALE),
        latheMaterial);

    transformMesh(lathe, transform);
    this.scene.add(lathe);

    return lathe;
};

Scene.prototype.setSeed = function (seedName) {
    Math.seedrandom(seedName);
};
