var defaultEnv = function() {
    var env = { };
    addBinding(env, {neg:false, name:'sin'}, function(x) { return Math.sin(x); });
    addBinding(env, {neg:false, name:'cos'}, function(x) { return Math.cos(x); });
    addBinding(env, {neg:false, name:'abs'}, function(x) { return Math.abs(x); });
    addBinding(env, {neg:false, name:'sqrt'}, function(x) { return Math.sqrt(x); });
    addBinding(env, {neg:false, name:'rand'}, function() { return Math.random(); });
    return env;
};