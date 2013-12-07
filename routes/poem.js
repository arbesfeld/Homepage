exports.get = function(req, res, next) {
    res.render('poem/poem');
};

exports.post = function(req, res, next) {
 	res.send('You sent the name "' + req.body.name + '".');
};