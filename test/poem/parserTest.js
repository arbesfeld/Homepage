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

// var input = "Test \"Quote\"";
var input = "An initial reading of John Keats’ “When I have fears that I may cease to be”. The metaphor both compares Keats’ work to a “harvest” which has to be harvested, and to Keats himself as a harvester who has limited time to produce “grain” (poetry).";
var input = listener.preProcess(input);
var parsed = parse(input);
// console.log(JSON.stringify(parsed));
var model = listener.evaluate(parsed);
console.log(JSON.stringify(model.qtips));
console.log(model.title);
console.log(model.author);
// console.log(JSON.stringify(parse("Hi. Bye")));
// console.log(JSON.stringify(parse(listener.preProcess("\"Hell.o sam.\""))));
// console.log(listener.getPoemName(parse("\"Hi\"")));