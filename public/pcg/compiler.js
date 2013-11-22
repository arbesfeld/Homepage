var compileExpr = function (expr) {
    if (typeof expr === 'number') {
        var res = expr.toString();
        if (typeof expr === 'int') {
            res += '.';
        }
        return res;
    }
    switch(expr.tag) {
        case '>':
            return '(' + compileExpr(expr.left) + ')>(' +
                         compileExpr(expr.right) + ')';
        case '<':
            return '(' + compileExpr(expr.left) + ')<(' +
                         compileExpr(expr.right) + ')';
        case '>=':
            return '(' + compileExpr(expr.left) + ')>=(' +
                         compileExpr(expr.right) + ')';
        case '<=':
            return '(' + compileExpr(expr.left) + ')<=(' +
                         compileExpr(expr.right) + ')';
        case '!=':
            return '(' + compileExpr(expr.left) + ')!=(' +
                         compileExpr(expr.right) + ')';
        case '==':
            return '(' + compileExpr(expr.left) + ')==(' +
                         compileExpr(expr.right) + ')';

        case '+':
            return '(' + compileExpr(expr.left) + ')+(' +
                         compileExpr(expr.right) + ')';
        case '*':
            return '(' + compileExpr(expr.left) + ')*(' +
                         compileExpr(expr.right) + ')';
        case '/':
            return '(' + compileExpr(expr.left) + ')/(' +
                         compileExpr(expr.right) + ')';
        case '-':
            return '(' + compileExpr(expr.left) + ')-(' +
                         compileExpr(expr.right) + ')';
        case '%':
            return '(' + compileExpr(expr.left) + ')%(' +
                         compileExpr(expr.right) + ')';
        case '^':
            return '(' + compileExpr(expr.left) + ')^(' +
                         compileExpr(expr.right) + ')';

        case 'call':
            // Get function value
            var func = expr.name;
            // Evaluate arguments to pass
            var args = [];
            var i = 0;
            for(i = 0; i < expr.args.length; i++) {
                args[i] = compileExpr(expr.args[i]);
            }
            return expr.name.name + '(' + args.join(',') + ')';

        case 'ident':
            return expr.name.neg ? '-' : '' + expr.name.name;
        default:
            throw new Error('Unknown tag ' + expr.tag);
    }
};

var compileEnvironment = function (env) {
    var i, res, name, val;
    res = '';
    if (env.hasOwnProperty('bindings')) {
        res += compileEnvironment(env.outer);
        var bindings = env.bindings;
        for(var name in bindings) {
            val = bindings[name];

            if (name.charAt(0) === '#')
                continue;

            // do not compile functions
            if (typeof val === 'function')
                continue;

            res += 'float ' + name + ' = ' + val.toString() + ';\n';
        }
    }
    return res;
};

var compileBlock = function (block) {
    // Statements always have tags
    var stmt= block.statement;

    switch(stmt.tag) {
        case '=':
            return stmt.left.name + ' = (' +
                compileExpr(stmt.right) + ');\n';
        
        case 'set':
            return 'float ' + stmt.left.name + ' = (' +
                compileExpr(stmt.right) + ');\n';

        case 'if':
            return 'if (' + compileExpr(stmt.expr) + ') {\n' +
                compileStatements(block.children, false) + '}\n';

        case 'repeat':
            var id = makeid();
            return 'for (int ' + id + ' = 0; ' + id + ' < ' + compileExpr(stmt.expr) + '; ' + id + '++) {\n' +
                compileStatements(block.children, false) + '}\n';

        case 'loop':
            return 'for (float ' + stmt.v.name + ' = ' + compileExpr(stmt.start) + '; ' +
                    stmt.v.name + ' < ' + compileExpr(stmt.end) + '; ' +
                    stmt.v.name + '++) {\n' +
                    compileStatements(block.children, false) + '}\n';


        default:
            throw new Error('Invalid tag ' + stmt.tag);
    }
};

var compileStatements = function (seq, is_funcbody) {
    var res = '';
    var i;
    for(i = 0; i < seq.length; i++) {
        res += compileBlock(seq[i]);
    }
    return res;
};

/* Evaluate a compiled expression.
   Locally defines any needed helper functions.
*/
var evalCompiled = function (txt, env) {
    if(env) {
        return eval(compileEnvironment(env) + txt);
    }
    return eval(txt);
};

/* Generate full source code of compiled program */
var standalone = function (stmts, env) {
    var txt = '';
    if (env) {
        txt += compileEnvironment(env);
    }
    txt += compileStatements(stmts);
    return txt;
};

function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};

// If we are used as Node module, export symbols
if (typeof module !== 'undefined') {
    module.exports.standalone = standalone;
}