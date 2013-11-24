var preProcess = function () {
    return 'float x = position.x;\n' +
           'float y = position.y;\n' +
           'float z = position.z;\n';
};

var postProcess = function () {
    return 'vec3 displacedPosition = vec3(x, y, z);\n';
};

THREE.Mesh.prototype.addDisplacement = function (str) {
    if (!this.displacementString)
        this.displacementString = '';
    this.displacementString += "{\n" + str + "}\n";
    this.material = getMaterial(this.b, this.noise, this.fshader, this.displacementString);
}

// get a material based on noise
var getMaterial = function(b, noise, fshader, displacementString) {
    displacementString = displacementString || '';
    var lambertVertexShader = ShaderLib.DEFAULT_FUNC + ShaderLib.LAMBERT_START + preProcess() +
                              displacementString + postProcess() + ShaderLib.LAMBERT_END;


    if (b && noise) {
        // random displacement material
        var uniforms = {
          tExplosion: { type: "t", value: tex },
          bFactor: {type: 'f', value:b},
          noiseFactor: {type: 'f', value:noise}
        };

        return new THREE.ShaderMaterial( {
            vertexShader: this.vsRandDisplacement,
            fragmentShader: this.fsRandDisplacement,
            uniforms: uniforms
        });
    } else {
        return new THREE.ShaderMaterial ({
            fragmentShader: fshader,
            vertexShader: lambertVertexShader,
            uniforms: THREE.ShaderLib.lambert.uniforms,
            lights:true
        });
    }
};