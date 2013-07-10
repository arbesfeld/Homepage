function makeid() {
  var text = "";
  var possible = "0123456789";
  for (var i = 0; i < 3; ++i) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

var validIds;

module.exports = function(injectedVariable) {
  validIds = injectedVariable;

  return {
    index: function(req, res) {
      var id = makeid();
      validIds[id] = true;
      console.log(JSON.stringify(validIds));
      res.render('index', { idn: id });
    },

    load: function(req, res) {
      var id = req.params.id;
      if (validIds.hasOwnProperty(id)) {
        console.log(id + " is valid");
      } else {
        console.log(id + " is invalid");
      }
      res.render('connect', { idn : id });
    },

    icon: function(req, res) {
    }
  };
};