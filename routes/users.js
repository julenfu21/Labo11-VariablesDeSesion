var express = require('express');
var router = express.Router();
// Concatenar paths
var path = require("path");
// Modulo para realizas validaciones en formularios
const { check, validationResult } = require('express-validator');
// Modulo para conectar con una base de datos MongoDB
const mongojs = require('mongojs');
// Objeto exportado de mongojs para identificar un elemento de una tabla de una BD
var ObjectId = mongojs.ObjectId;

// Conexion con la base de datos: nombre de la BD y de la tabla
const db = mongojs('clientesapp', ['users']);

// Declaracion y definicion de variables globales: en este caso errors
router.use(function (req, res, next) {
  res.locals.errors = null;
  next();
});

/* Añadir usuarios */
router.post('/add', [
      check("first_name", "El nombre es obligatorio").notEmpty(),
      check("last_name", "El apellido es obligatorio").notEmpty(),
      check("email", "El email es obligatorio").notEmpty()
    ],
    function(req, res) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.render('index', {
          title:'clientes',
          users: users,
          errors: errors.array()
        });
      } else {
        var newUser = {
          "first_name" : req.body.first_name,
          "last_name" : req.body.last_name,
          "email" : req.body.email,
        };
        db.users.insertOne(newUser, function(err, resp) {
          if(err) {
            console.log(err);
          } else {
            db.users.insertOne(newUser);
          }
          res.redirect('/');
        });
        console.log(newUser)
      }
    });

/* Borrar usuario */
router.delete('/delete/:id', function(req, res) {
  db.users.remove({_id: ObjectId(req.params.id)}, function(err, result) {
    if(err) {
      console.log(err);
    }
    res.redirect(303, '/');
  });
});

/* Buscar usuario por ID */
router.post('/find/:id', function(req, res){
  db.users.find({_id: ObjectId(req.params.id)}, function(err, result){
    if (err){
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

/* Actualizar usuario por ID */
router.post('/update/:id', function(req, res){
  db.users.update({_id: ObjectId(req.params.id)},
    {$set: {"first_name": req.body.first_name, "last_name": req.body.last_name, "email": req.body.email}},
    function(err, result){
      if (err){
        console.log(err);
      }
      res.redirect(303, '/');
    });
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  if(req.session.email) {
    // res.write(`<h1>Hello ${req.session.email} </h1><br>`);
    db.users.find(function(err, docs) {
      if (err) {
        console.log(err);
      } else {
        console.log(docs);
        res.render('users', {
          title: 'Customers',
          users: docs,
          email: req.session.email
        });
      }
    });
    // res.end('<a href='+'/logout'+'>Logout</a>');
  }


  else {
    res.write('<h1>Please login first.</h1>');
    res.end('<a href='+'/'+'>Login</a>');
  }
});

module.exports = router;
