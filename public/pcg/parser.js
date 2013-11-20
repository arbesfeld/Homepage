var log_console = function(msg) {
    $('#console').append('<p>' + msg + '</p>');
};

// env is like:
// { bindings: { x: 5, ... }, outer: { } }

// Lookup a variable in an environment
var lookup = function (env, v) {
    console.info(env.bindings);
    if (!(env.hasOwnProperty('bindings')))
        throw new Error("Env does not have bindings for " + v);
    if (env.bindings.hasOwnProperty(v))
        return env.bindings[v];
    return lookup(env.outer, v);
};

// Update existing binding in environment
var update = function (env, v, val) {
    if (env.hasOwnProperty('bindings')) {
        if (env.bindings.hasOwnProperty(v)) {
            env.bindings[v] = val;
        } else {
            update(env.outer, v, val);
        }
    } else {
        throw new Error('Undefined variable update ' + v);
    }
};

// Add a new binding to outermost level
var addBinding = function (env, v, val) {
    if (env.hasOwnProperty('bindings')) {
        env.bindings[v] = val;
    } else {
        env.bindings = {};
        env.transform = Matrix.I(4);
        env.outer = {};
        env.bindings[v] = val;
    }
};

// Create a new scope.
var newScope = function (env) {
    return { bindings:{}, transform:env.transform, outer:env };
}

// Call a fucnction on arguments.
// { tag: "call", name:"function-name", args:[] }
var call = function (expr, env) {
    // Get function value.
    var func = lookup(env, expr.name);

    // Evaluate argumetns to pass.
    var ev_args = [];
    var i;
    for (i = 0; i < expr.args.length; ++i) {
        ev_args[i] = evalExpr(expr.args[i], env);
    }
    return func.apply(null, ev_args);
};

// Evaluate an expression and return the result.
var evalExpr = function (expr, env) {
    // Numbers evaluate to themselves
    if (typeof expr === 'number') {
        return expr;
    }

    // Look at tag to see what to do.
    switch(expr.tag) {
        // Conditionals.
        case '<':
            return evalExpr(expr.left, env) <
                   evalExpr(expr.right, env);
        case '>':
            return evalExpr(expr.left, env) >
                   evalExpr(expr.right, env);
        case '<=':
            return evalExpr(expr.left, env) <=
                   evalExpr(expr.right, env);
        case '>=':
            return evalExpr(expr.left, env) >=
                   evalExpr(expr.right, env);
        case '!=':
            return evalExpr(expr.left, env) !=
                   evalExpr(expr.right, env);
        case '==':
            return evalExpr(expr.left, env) ===
                   evalExpr(expr.right, env);

        // Basic operations.
        case '+':
            return evalExpr(expr.left, env) +
                   evalExpr(expr.right, env);
        case '-':
            return evalExpr(expr.left, env) -
                   evalExpr(expr.right, env);
        case '*':
            return evalExpr(expr.left, env) *
                   evalExpr(expr.right, env);
        case '/':
            return evalExpr(expr.left, env) /
                   evalExpr(expr.right, env);
        case '^':
            return Math.pow(evalExpr(expr.left, env),
                            evalExpr(expr.right, env));

        // Variable expression:
        // {tag: "ident", name: "x"}
        case "ident":
            return lookup(env, expr.name);

        // Function calls.
        case 'call':
            return call(expr, env);

        // Should not get here
        default:
            throw new Error('Unknown form in AST expression ' + expr.tag);
    }
};

// Evaluate a statement and return the result.
// {statement:statment, children:children}
var evalBlock = function (block, env) {
    var val = undefined;
    var stmt = block.statement;
    var num;
    var i;

    // Statements always have tags.
    switch(stmt.tag) {
        // A single expression
        // { tag:"ignore", body:expression }
        case 'ignore':
            // Just evaluate expression.
            return evalExpr(stmt.body, env);

        // Declare a new variable.
        // { tag:"set", left:x, right:5}
        case 'set':
            val = evalExpr(stmt.right, env);
            addBinding(env, stmt.left, val);
            return 0;

        // Assign a variable.
        // { tag:"=", left:x, right:5}
        case '=':
            val = evalExpr(stmt.right, env);
            update(env, stmt.left, val);
            return 0;

        // If statement.
        // {expr: { tag:"if", body:expression }, children:...}
        case 'if':
            // Create a new scope for if statements.
            var newEnv = newScope(env);
            if (evalExpr(stmt.expr, env)) {
                val = evalStatements(block.children, newEnv);
            }
            return 0;

        // Loop statement.
        // {expr: { tag:"loop", v:v, start:start, end:end}, children:...}
        case 'loop':
            var startVal = evalExpr(stmt.start, env);
            var endVal = evalExpr(stmt.end, env);
            var newEnv;
            for (i = startVal; i < endVal; i++) {
                newEnv = newScope(env);
                var str = stmt.v.name;
                addBinding(newEnv, str, i);
                evalStatements(block.children, newEnv);
            }
            return 0;

        // Repeat statment
        // {expr: { tag:"repeat", body:expression }, children:...}
        case 'repeat':
            // Evaluate expr for number of times to repeat
            num = evalExpr(stmt.expr, env);

            // Now do a loop
            for (i = 0; i < num; i++) {
                var newEnv = newScope(env);
                evalStatements(block.children, newEnv);
            }
            return 0;

        // Functions.
        // {expr: { tag:"function", name:"f", args[]}, children:...}
        case 'function':
            var newFunc = function() {
                // This function takes any number of arguments.
                var i;
                var newEnv = newScope(env);
                for (i = 0; i < stmt.args.length; i++) {
                    newEnv.bindings[stmt.args[i]] = arguments[i];
                }
                return evalFunction(block.children, newEnv);
            };
            addBinding(env, stmt.name, newFunc);
            return 0;

        case 'return':
            // Just evaluate expression.
            return evalExpr(stmt.body, env);

        // Transforms.
        // {{tag:'transform', exprs:[list of transforms}}
        case 'transform':
            var newEnv = newScope(env);
            evalTransform(stmt.exprs, newEnv);
            evalStatements(block.children, newEnv);
            return 0;

        // Translate/scale/rotate
        // {tag:"translate"/"scale"/"rotate", xExpr:..., yExpr:..., zExpr:...}
        case 'translate':
            var newEnv = newScope(env);
            evalTranslate(stmt.xExpr, stmt.yExpr, stmt.zExpr, newEnv);
            evalStatements(block.children, newEnv);
            return 0;

        case 'scale':
            var newEnv = newScope(env);
            evalScale(stmt.xExpr, stmt.yExpr, stmt.zExpr, newEnv);
            evalStatements(block.children, newEnv);
            return 0;

        case 'rotate':
            var newEnv = newScope(env);
            evalRotate(stmt.xExpr, stmt.yExpr, stmt.zExpr, newEnv);
            evalStatements(block.children, newEnv);
            return 0;

        // Sphere
        // {{tag:'sphere', q1:16, q2:16 }}
        case 'sphere':
            var q1 = evalExpr(stmt.q1, env);
            var q2 = evalExpr(stmt.q2, env);
            scene.addSphere(q1, q2, env.transform);
            return 0;

        // Should not get here.
        default:
            throw new Error('Unknown form in AST statement ' + stmt.tag);
    }
};

var evalTranslate = function (xExpr, yExpr, zExpr, env) {
    var tx = evalExpr(xExpr, env);
    var ty = evalExpr(yExpr, env);
    var tz = evalExpr(zExpr, env);
    var translateMat = Matrix.Translation(Vector.create([tx, ty, tz]));
    env.transform = env.transform.multiply(translateMat);
};

var evalScale = function (xExpr, yExpr, zExpr, env) {
    var sx = evalExpr(xExpr, env);
    var sy = evalExpr(yExpr, env);
    var sz = evalExpr(zExpr, env);

    var scaleMat = Matrix.Diagonal([sx, sy, sz, 1]);
    env.transform = env.transform.multiply(scaleMat);
};

var evalRotate = function(xExpr, yExpr, zExpr, env) {
    var rx = evalExpr(xExpr, env);
    var ry = evalExpr(yExpr, env);
    var rz = evalExpr(zExpr, env);

    var rotX = Matrix.RotateX4(rx);
    var rotY = Matrix.RotateY4(ry);
    var rotZ = Matrix.RotateZ4(rz);

    var rotationMat = rotX.multiply(rotY.multiply(rotZ));
    env.transform = env.transform.multiply(rotationMat);
};

var evalTransform = function (seq, env) {
    if (seq.length % 3 != 0 || seq.length == 0 || seq.length > 9)
        throw new Error('Invalid transform of length ' + seq.length);

    // rotate first
    if (seq.length == 9) {
        evalRotate(seq[6], seq[7], seq[8], env);
    }

    evalTranslate(seq[0], seq[1], seq[2], env);

    if (seq.length >= 6) {
        evalScale(seq[3], seq[4], seq[5], env);
    }
};

var evalFunction = function (seq, env) {
    var i;
    var val = undefined;

    // Only return the result of the "return" statement.
    for (i = 0; i < seq.length; i++) {
        if (seq[i] === undefined || seq[i].statement === undefined)
            continue;

        val = evalBlock(seq[i], env);
        if (seq[i].statement.tag === 'return') {
            return val;
        }
    }
    return undefined;
};

var evalStatements = function (seq, env) {
    var i;
    var val = undefined;

    for (i = 0; i < seq.length; i++) {
        if (seq[i] === undefined || seq[i].statement == undefined)
            continue;

        val = evalBlock(seq[i], env);
    }
    return val;
};