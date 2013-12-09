exports.preProcess = function(inputStr) {
	// deal with the case of ." by flipping the characters
	return inputStr.replace(/“/g,"\"").replace(/”/g,"\"").replace(/\."/, "\.\"");
};

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
};

function Model() {
    this.title = undefined;
    this.author = undefined;
    this.qtips = {};
}

Model.prototype.setTitle = function(name) {
    if (!this.title)
        this.title = name;
}

Model.prototype.setAuthor = function(name) {
    if (!this.author)
        this.author = name;
}


exports.evaluate = function(tree) {
    var result = [];
    var model = new Model();
    // tree is a collection of paragraphs
    for (var i = 0; i < tree.length; i++) {
        result.push(evalParagraph(tree[i], i, model));
    }
    return model;
};


var evalParagraph = function(paragraph, paragraphNum, model) {
    if (paragraph.tag !== "paragraph")
        throw new Error("Not paragraph.");

    var result = [];
    // paragraph is a collection of sentences
    for (var i = 0; i < paragraph.content.length; i++) {
        result.push(evalSentence(paragraph.content[i], paragraphNum, i, model));
    }
    return result;
}

var evalSentence = function(sentence, paragraphNum, sentenceNum, model) {
    if (sentence.tag !== "sentence")
        throw new Error("Not sentence.");

    var sentenceString = "";
    var item;
    var quotes = [];

    // sentence is a collection of "items"
    for (var i = 0; i < sentence.content.length; i++) {
        item = evalItem(sentence.content[i], model);
        sentenceString += item.text;
        if (item.quoted) {
            quotes.push(item.text.toLowerCase().trim());
        }
    }

    for (var i = 0; i < quotes.length; i++) {
        var entry = model.qtips[quotes[i]];
        var description = { text:sentenceString + ".",
                            paragraph:paragraphNum,
                            sentence:sentenceNum};

        if (!entry) {
            entry = [];
        }

        entry.push(description);
        model.qtips[quotes[i]] = entry;
    }

    return sentenceString;
}

var evalItem = function(item, model) {
    // word has
    // {tag: "word", quoted:true, text:"text"}

    // tags have things like
    // {tag: "title", title:"Title"}

    switch (item.tag) {

    case "title":
        model.title = evalItem(item.title, model).text;
        return {quoted:false, text:'"' + model.title + '"'};

    case "author":
        model.setAuthor(evalItem(item.author, model).text);
        return {quoted:false, text:model.author};

    case "word":
        if (item.quoted) {
            model.setTitle(item.text, model);
            return {quoted:true, text:'"' + item.text + '"'};
        }
        return {quoted:false, text:item.text};
    }
}
