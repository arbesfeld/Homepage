var preProcess = function () {
    return 'float x = position.x;\n' +
           'float y = position.y;\n' +
           'float z = position.z;\n';
};

var postProcess = function () {
    return 'vec3 displacedPosition = vec3(x, y, z);\n';
};

THREE.Mesh.prototype.addDisplacement = function (mapFunc) {
    var geometry = this.geometry;
    for (var i = 0; i < geometry.vertices.length; i++) {
        geometry.vertices[i].set.apply(geometry.vertices[i], mapFunc(geometry.vertices[i].x,
                                         geometry.vertices[i].y,
                                         geometry.vertices[i].z));
    }
    geometry.verticesNeedUpdate = true;
    geometry.normalsNeedUpdate = true;
    geometry.mergeVertices();
    geometry.computeCentroids();
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
};
THREE.Mesh.prototype.addVDisplacement = function (str) {
    if (!this.displacementString)
        this.displacementString = '';
    this.displacementString += "{\n" + str + "}\n";
    this.setMaterial();
};

THREE.Mesh.prototype.addDisplacementNoise = function (noiseVal) {
    this.noise = noiseVal;
    this.setMaterial();
};

THREE.Mesh.prototype.setMaterial = function () {
    var displacementString = this.displacementString || '';
    var vertexShaderStart = document.getElementById('vertexShaderStart').textContent;
    var vertexShaderEnd = document.getElementById('vertexShaderEnd').textContent;

    var lambertVertexShader = ShaderLib.DEFAULT_FUNC + vertexShaderStart + preProcess() +
                              displacementString + postProcess() + vertexShaderEnd;
    var uniforms = THREE.ShaderLib.lambert.uniforms;
    if (this.noise) {
        // random displacement material
        var myUniforms = {
            tExplosion: { type: "t", value: this.fireTexture },
            noiseFactor: {type: 'f', value:this.noise}
        };

        var mergeUniforms = THREE.UniformsUtils.merge( [
            uniforms,
            myUniforms
        ] );

        this.material = new THREE.ShaderMaterial( {
            vertexShader: "#define USE_NOISE\n" + lambertVertexShader,
            fragmentShader: "#define USE_NOISE\n" + this.fshader,
            uniforms: mergeUniforms,
            lights:true
        });
    } else {
        // this.material = new THREE.ShaderMaterial ({
        //     vertexShader: lambertVertexShader,
        //     fragmentShader: this.fshader,
        //     uniforms: uniforms,
        //     lights:true
        // });
        this.material = new THREE.ShaderMaterial ({
            vertexShader: THREE.ShaderLib.lambert.vertexShader,
            fragmentShader: THREE.ShaderLib.lambert.fragmentShader,
            uniforms: uniforms,
            lights:true
        });
    }
    this.material.needsUpdate = true;
};