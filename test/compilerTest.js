var PEG = require('pegjs');
var assert = require('chai').assert;
var expect = require('chai').assert;
var fs = require('fs'); // for loading files
var wrapExceptions = require('./helperUtils.js').wrapExceptions;
var compiler = require('../public/pcg/compiler.js');
var defaultEnv = require('../public/pcg/default-env.js').defaultEnv;

// Read file contents
var data = fs.readFileSync('peg/main.peg', 'utf-8');
var parse = PEG.buildParser(data).parse;

var bindings = {};

bindings['b1'] = 20;
bindings['b2'] = 15;

var env = { bindings:bindings, outer:{}};
var basicTest = 'y = x+5\n';
var stmts = parse(basicTest);
console.log(compiler.standalone(stmts));
console.log(compiler.standalone(stmts, env));

env = defaultEnv();
var funcTest = 'y = sin(x)\n';
stmts = parse(funcTest);
console.log(compiler.standalone(stmts, env));

var complexTest = 'if x < 5\n\
  set theta rand(5)\n\
  loop i 0 theta\n\
    x = x + i\n';
stmts = parse(complexTest);
console.log(compiler.standalone(stmts));