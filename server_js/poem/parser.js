var PEG = require('pegjs');
var fs = require('fs'); // for loading files

exports.parse = function(input) {
  	var data = fs.readFileSync('peg/poem.peg', 'utf-8');
  	var parse = PEG.buildParser(data).parse;
	return parse(input);
}