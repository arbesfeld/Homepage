globalGLMatrixState = {
    modelMatrix : [ mat4.create(), mat4.create() ],
    projectionMatrix : mat4.perspective(mat4.create(), 45, 1, 0.01, 100),
    viewMatrix : mat4.create(),
    modelStackTop : 0
};

function modelMatrix() {
    return globalGLMatrixState.modelMatrix[globalGLMatrixState.modelStackTop];
}

function projectionMatrix() {
    return globalGLMatrixState.projectionMatrix;
}

function viewMatrix() {
    return globalGLMatrixState.viewMatrix;
}

function pushModelMatrix() {
    ++globalGLMatrixState.modelStackTop;
    if (globalGLMatrixState.modelStackTop == globalGLMatrixState.modelMatrix.length) {
        globalGLMatrixState.modelMatrix[globalGLMatrixState.modelMatrix.length] = mat4.create();
    }
    var top = globalGLMatrixState.modelMatrix[globalGLMatrixState.modelStackTop];
    var parent = globalGLMatrixState.modelMatrix[globalGLMatrixState.modelStackTop - 1];
    mat4.copy(top, parent);
    return top;
}

function popModelMatrix() {
    --globalGLMatrixState.modelStackTop;
}