function DAGNode(ch) {
  this.local = mat4.create();
  this.children = ch ? ch : [];
}

DAGNode.prototype = {
  draw : function() {
    var top = pushModelMatrix();
    mat4.multiply(top, top, this.local);
    for (var c in this.children) {
        this.children[c].draw();
    }
    popModelMatrix();
  }
};

function Geometry(mesh) {
  this.mesh = mesh;
}

Geometry.prototype = {
  draw : function() {
    this.mesh.draw();
  }
};

Geometry.prototype.prototype = DAGNode.prototype;