var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost/authprimjer');

var KorisnikSchema = mongoose.Schema({
    ime: {
        type: String
    },
    imejl: {
        type: String
    },
    korisnicko: {
        type: String,
        index: true
    },
    lozinka: {
        type: String
    },
    profilna: {
        type: String
    }
});

const Korsnk = module.exports = mongoose.model('korisnic1', KorisnikSchema); // naziv modela i schema

module.exports.kreirajKorisnika = function(noviKorisnik, callback) {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(noviKorisnik.lozinka, salt, (err, hash) => {
            noviKorisnik.lozinka = hash;
            noviKorisnik.save(callback);
            // nazivu modela doda 's' na kraj (npr: korisnik - korisniks)
            // kolekciji sa tim imenom (npr: korisniks) doda zapis; ako kolekcija ne postoji - kreira je, pa joj doda zapis
            // ako naziv modela ima broj na kraju (npr: korisnic1) - ne dodaje nista nazivu
        });
    });
};

module.exports.dajKorisnikaId = function (id, callback) {
    Korsnk.findById(id, callback);
};

module.exports.dajKorisnikaKorisnicko = function (korisnicko, callback) {
    const upit = {korisnicko: korisnicko};
    Korsnk.findOne(upit, callback);
};

module.exports.uporediLozinke = (hash, unijeta, callback) => {
    bcrypt.compare(unijeta, hash, (err, poklapanje) => {
        callback(err, poklapanje);
    });
};

