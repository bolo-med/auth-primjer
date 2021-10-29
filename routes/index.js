var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', jeLiIdentifikovan, function(req, res, next) {
  res.render('index', { naslov: 'Za članove' });
});

function jeLiIdentifikovan(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/users/neautorizovan');
}

module.exports = router;
