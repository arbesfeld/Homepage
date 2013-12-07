var PEG = require('pegjs');
var assert = require('chai').assert;
var expect = require('chai').assert;
var fs = require('fs'); // for loading files
var listener = require('../../server_js/poem/listener'); // for loading files
var wrapExceptions = require('../helperUtils.js').wrapExceptions;

// Read file contents
var data = fs.readFileSync('peg/poem.peg', 'utf-8');
// var parse = wrapExceptions(PEG.buildParser(data).parse);
var parse = PEG.buildParser(data).parse;

console.log(JSON.stringify(parse("Hi. Bye")));
console.log(JSON.stringify(parse(listener.preProcess("\"Hell.o sam.\""))));
console.log(listener.getPoemName(parse("\"Hi\"")));