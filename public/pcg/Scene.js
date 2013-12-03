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
    mesh.matrix.multiply(meshMatrix.multiply(transform));
}

Scene.prototype.resizeCanvas = function() {
   // only change the size of the canvas if the size it's being displayed
   // has changed.

    var $container = $('#canvas');

    this.WIDTH = $container.width();
    this.HEIGHT = $container.height();

    this.renderer.setSize(this.WIDTH, this.HEIGHT);
    console.log("hi");
};

function Scene(callback) {
    // set the scene size
    this.SCALE = 1;

    // get the DOM element to attach to
    // - assume we've got jQuery to hand
    var $container = $('#canvas');

    this.WIDTH = $container.width();
    this.HEIGHT = $container.height();

    // set some camera attributes
    var VIEW_ANGLE = 45,
      ASPECT = this.WIDTH / this.HEIGHT,
      NEAR = 0.1,
      FAR = 10000;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });

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
    this.camera.position.x = 10;
    this.camera.position.y = 10;
    this.camera.position.z = 10;

    this.controls = new THREE.OrbitControls(this.camera);

    // load shaders
    this.vsRandDisplacement = Object("");
    this.fsRandDisplacement = Object("");
    this.fsDefault = Object("");

    function shaderLoaded(shader) {
        return function(str) {
            shader.valueOf = shader.toSource = shader.toString = function() { return str; };

            if (this.fsDefault.valueOf() !== "") {
                // all shaders have loaded, we are done with init
                callback();
            }
        };
    }

    loadFile("shaders/fs-default.txt", shaderLoaded(this.fsDefault).bind(this), false);

    this.fireTexture = new THREE.ImageUtils.loadTexture( 'images/explosion.png' );
}

Scene.prototype.init = function() {
    this.scene = new THREE.Scene();

    // add the camera to the scene
    this.scene.add(this.camera);

    var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
    hemiLight.color.setHSL( 0.6, 0.75, 0.5 );
    hemiLight.groundColor.setHSL( 0.095, 0.5, 0.5 );
    hemiLight.position.set( 0, 500, 0 );
    this.scene.add( hemiLight );

    var dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
    dirLight.position.set( -1, 0.75, 1 );
    dirLight.position.multiplyScalar( 50);
    dirLight.name = "dirlight";
    // dirLight.shadowCameraVisible = true;

    this.scene.add( dirLight );

    dirLight.castShadow = true;
    dirLight.shadowMapWidth = dirLight.shadowMapHeight = 1024*2;

    var d = 300;

    dirLight.shadowCameraLeft = -d;
    dirLight.shadowCameraRight = d;
    dirLight.shadowCameraTop = d;
    dirLight.shadowCameraBottom = -d;

    dirLight.shadowCameraFar = 3500;
    dirLight.shadowBias = -0.0001;
    dirLight.shadowDarkness = 0.35;

    // // add subtle blue ambient lighting
    // var ambientLight = new THREE.AmbientLight(0x000044);
    // this.scene.add(ambientLight);

    // this.controls.addEventListener( 'change',
    //     this.render.bind(this)
    // );

    // this.render();
    this.animate.call(this);
};

Scene.prototype.render = function() {
    this.controls.update();
	this.renderer.render(this.scene, this.camera);
};

Scene.prototype.animate = function() {
//     controls.update();
    requestAnimationFrame(this.animate.bind(this));
    this.render();
};

// q = quality of sphere
// transform = transform of sphere
Scene.prototype.addSphere = function(q, transform) {
    var sphere = new THREE.Mesh(
      new THREE.SphereGeometry(this.SCALE/2, q, q),
      new THREE.MeshBasicMaterial());

    sphere.fshader = this.fsDefault;
    transformMesh(sphere, transform);
    sphere.setMaterial();

    this.scene.add(sphere);
    this.render();
    return sphere;
};

Scene.prototype.addCube = function(q, transform) {
    var cube = new THREE.Mesh(
      new THREE.CubeGeometry(this.SCALE, this.SCALE, this.SCALE, q, q, q),
      new THREE.MeshBasicMaterial());

    cube.fshader = this.fsDefault;
    transformMesh(cube, transform);
    cube.setMaterial();

    this.scene.add(cube);

    return cube;
};

Scene.prototype.addPlane = function(q, transform) {
    var plane = new THREE.Mesh(
      new THREE.PlaneGeometry(this.SCALE, this.SCALE, q, q),
      new THREE.MeshBasicMaterial());

    plane.fshader = this.fsDefault;
    transformMesh(plane, transform);
    plane.setMaterial();
    plane.material.side = THREE.DoubleSide;

    this.scene.add(plane);

    return plane;
};

// Radii array is a 2d array that contains the radius at every point
// from 0 to 2pi around the object, and from 0 to 1 along the y axis.
// radiiArray[i][j] is at the angle i/len*2pi and the height j/len.
Scene.prototype.addLatheObject = function (radiiArray, transform) {
    var lathe = new THREE.Mesh(
        new THREE.CustomLatheGeometry(radiiArray, this.SCALE, this.SCALE),
        new THREE.MeshBasicMaterial());

    lathe.fshader = this.fsDefault;
    lathe.setMaterial();

    transformMesh(lathe, transform);

    this.scene.add(lathe);

    return lathe;
};

Scene.prototype.setSeed = function (seedName) {
    Math.seedrandom(seedName);
};
