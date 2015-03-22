module.exports = function(express) {

  express.get('/', function(req, res, next) {
    res.render('index');
  });

};
