var defaultEnv = function() {
    var env = { };
    addBinding(env, 'sin', function(x) { return Math.sin(x); });
    addBinding(env, 'cos', function(x) { return Math.cos(x); });
    addBinding(env, 'abs', function(x) { return Math.abs(x); });
    addBinding(env, 'sqrt', function(x) { return Math.sqrt(x); });
    return env;
};