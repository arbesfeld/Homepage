
module.exports = function (app) {

  app.get('/marble', function (req, res) {
    res.render('marble');
  });

}