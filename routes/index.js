var express = require('express');
var router = express.Router();
var session = require('express-session');
const MongoStore = require('connect-mongo');

var admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

// Use the session middleware
router.use(session({
  secret: 'clavesecretaparaexpresss',
  saveUninitialized: true, // create session even if there is nothing stored
  resave: true, // save session even if unmodified
  cookie: { maxAge: 60 * 60 * 1000 },
  store: MongoStore.create({mongoUrl: 'mongodb://127.0.0.1:27017/labo_variables_sesion'})
}));

router.get('/',(req,res) => {
  if(req.session.email) {
    // return res.redirect('/admin');
      return res.redirect('/users');
  }
    // res.render('index', { title : 'title'})
    res.redirect('/email-password.html?logout');
});

router.post('/login',(req,res) => {
  req.session.email = req.body.email;
  res.end('done');
});

router.get('/admin',(req,res) => {
  if(req.session.email) {
    res.write(`<h1>Hello ${req.session.email} </h1><br>`);
    res.end('<a href='+'/logout'+'>Logout</a>');
  }
  else {
    res.write('<h1>Please login first.</h1>');
    res.end('<a href='+'/'+'>Login</a>');
  }
});

router.get('/logout',(req,res) => {
  req.session.destroy((err) => {
    if(err) {
      return console.log(err);
    }
    res.redirect('/');
  });

});

router.post('/getToken', (req, res) => {
  const idToken = req.body.idToken; // capturar parámetro

// idToken comes from the client app
// verificamos el idToken para ver si es válido
  admin.auth().verifyIdToken(idToken)
      .then(function (decodedToken) {
// si es válido, lo decodificamos
        let uid = decodedToken.uid;

// y obtenemos los datos asociados a ese usuario
        admin.auth().getUser(uid)
            .then(function(userRecord) {
              // See the UserRecord reference doc for the contents of userRecord.
              console.log('Successfully fetched user data:', userRecord.toJSON());
              req.session.email = userRecord.email;
              req.session.emailVerified = userRecord.emailVerified;
              res.send('{"status": "done"}');
            })
            .catch(function(error) {
              console.log('Error fetching user data:', error);
              res.send('{"status": "error"}');
            });

      }).catch(function (error) {
    // Handle error
    res.render('error', {error: error, message: "You must be signed-up"});
  });


});

module.exports = router;
