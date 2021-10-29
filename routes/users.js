var express = require('express');
var router = express.Router();
var multer = require('multer');
const passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var upload = multer({dest: './uploads'}); // kako pronadje putanju ???

var Korisnik = require('../models/korisnik');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/registracija', function(req, res, next) {
  res.render('registracija', { naslov: 'Registracija' });
});

router.post('/registracija', upload.single('profilna'), function(req, res, next) {
  var ime = req.body.ime;
  var korisnicko = req.body.korisnicko;
  var imejl = req.body.imejl;
  var lozinka = req.body.lozinka;
  var lozinka2 = req.body.lozinka2;
  // console.log(`${ime}, ${korisnicko}, ${imejl}, ${lozinka}, ${lozinka2}`);

  if (req.file) {
    var profilna = req.file.filename;
  }
  else {
    var profilna = 'nema.png';
  }
  //console.log(req.file);

  req.checkBody('ime', 'Ime je obavezno!').notEmpty();
  req.checkBody('korisnicko', 'Korisnicko ime je obavezno!').notEmpty();
  req.checkBody('imejl', 'Imejl je obavezan!').notEmpty();
  req.checkBody('imejl', 'Nepravilan format imejla!').isEmail();
  req.checkBody('lozinka', 'Lozinka je obavezna!').notEmpty();
  req.checkBody('lozinka2', 'Lozinka se ne poklapa!').equals(req.body.lozinka);

  var greske = req.validationErrors();

  if (greske) {
    res.render('registracija', { greske: greske, naslov: 'Registracija' });
  }
  else {
    var noviKorisnik = new Korisnik({
      ime: ime,
      imejl: imejl,
      korisnicko: korisnicko,
      lozinka: lozinka,
      profilna: profilna
    });

    Korisnik.kreirajKorisnika(noviKorisnik, function(err, user) {
      if (err) throw err;
      console.log(user);
    });
    // Problem!!! Nece da je sacuva u kolekciju - korisnici, nego kreira kolekciju korisniks, i tu cuva sve nove zapise!!!

    req.flash('success', 'Registrovali ste se. Možete da se prijavite.');

    res.location('/');
    res.redirect('/');
  }

});

router.get('/prijava', function(req, res, next) {
  res.render('prijava', { naslov: 'Prijava' });
});

router.post('/prijava', passport.authenticate('local', {failureRedirect: '/users/prijava', 
                                                        failureFlash: 'Pogrešno korisničko ime ili lozinka.'}), function (req, res) {
  // ako je ova f-ja pozvana - autorizacija (provjera identiteta) je uspjela
  // 'req.user' sadrzi autentifikovanog korisnika
  req.flash('success', 'Prijavili ste se.');
  res.redirect('/');
});

passport.serializeUser(function (korisnik, done) {
  done(null, korisnik.id);
});

passport.deserializeUser(function (id, done) {
  Korisnik.dajKorisnikaId(id, function (err, korisnik) {
    done(err, korisnik);
  });
});

// korisnicko i lozinka su 'name' atributi iz prijava.jade
// Da su 'name' atributi bili 'username' i 'password', mogli bismo da izostavimo {usernameField: 'korisnicko', passwordField: 'lozinka'}
passport.use(new LocalStrategy({usernameField: 'korisnicko', passwordField: 'lozinka'}, function (korisnicko, lozinka, done) {
  Korisnik.dajKorisnikaKorisnicko(korisnicko, function (err, korisnik) {

    if (err) return done(err);
    
    if (!korisnik) return done(null, false, {message: 'Korisnik nije pronadjen.'});

    Korisnik.uporediLozinke(korisnik.lozinka, lozinka, function (err, poklapanje) {
      if (err) return done(err);

      if (poklapanje) {
        return done(null, korisnik);
      }
      else {
        return done(null, false, {message: 'Pogresna lozinka.'});
      }
    });
  });
}));

router.get('/odjava', (req, res) => {
  req.logout();
  req.flash('success', 'Odjavili ste se.');
  res.redirect('/users/prijava');
});

router.get('/neautorizovan', (req, res) => {
  res.render('neautorizovan');
})

module.exports = router;
