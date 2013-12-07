exports.preProcess = function(inputStr) {
	// deal with the case of ." by flipping the characters
	return inputStr.replace(/\."/, "\.\"");
}

// Format is:
// {tag: paragraph, content:{ tag:sentence, content:{tag: word, quoted:true content:{}}}
exports.getPoemName = function(parsed) {
	// Look at only the first paragraph.
	var paragraph = parsed[0];

	if (paragraph.tag !== "paragraph")
		throw new Error("Poem name not paragraph.");

	var sentences = paragraph.content;
	var sentence, words, word;
	for (var i = 0; i < sentences.length; i++) {
		sentence = sentences[i];

		if (sentence.tag !== "sentence")
			throw new Error("Poem name does not have sentence.");

		words = sentence.content;
		for (var j = 0; j < words.length; j++) {
			word = words[j];

			if (word.tag !== "word")
				throw new Error("Poem name does not have word.");

			if (word.quoted) {
				return word.text;
			}
		}
	}
}