var express = require("express");
var router = express.Router();
const moment = require("moment");
var Patron = require("../models").Patron;
var Book = require("../models").Book;
var Loan = require("../models").Loan;

var Sequelize = require("sequelize");
const Op = Sequelize.Op;

let todaysDate = moment().format("YYYY-MM-DD");
let returnDate = moment(todaysDate)
  .add(7, "days")
  .format("YYYY-MM-DD");



//ALL
router.get("/", function(req, res, next) {
  Patron.findAll({
    order: [["last_name", "ASC"]]
  }).then(function(patrons) {
    res.render("patrons", { patrons });
  });
});


//NEW
router.get("/new", function(req, res, next) {
  res.render("patron_new", { patron: Patron.build() });
});


//POST NEW
router.post("/new", function(req, res, next) {
  Patron.create(req.body)
    .then(function(patron) {
      res.redirect("/patrons");
    })
    .catch(function(error) {
      if (error.name === "SequelizeValidationError") {
        res.render("patron_new", {
          errors: error.errors,
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          address: req.body.address,
          email: req.body.email,
          library_id: req.body.library_id,
          zip_code: req.body.zip_code
        });
      } else {
        throw error;
      }
    })
    .catch(function(error) {
      res.send(500);
    });
});


//DETAIL
router.get("/edit/:id", function(req, res, next) {
  let errors = [req.query.errors];
  const foundPatron = Patron.findById(req.params.id);
  const foundLoan = Loan.findAll({
    where: [
      {
        patron_id: req.params.id
      }
    ],
    include: [{ model: Patron }, { model: Book }]
  });

  Promise.all([foundPatron, foundLoan]).then(function(values) {
    res.render("patron_detail", {
      patron: values[0],
      loans: values[1],
      dateLoaned: moment(values[1].loaned_on).format("YYYY-MM-DD"),
      returnDate,
      errors: errors
    });
  });
});



//UPDATE
router.post("/edit/:id", function(req, res, next) {
  Patron.update(req.body, {
    where: [
      {
        id: req.params.id
      }
    ]
  })
    .then(function() {
      return res.redirect("/patrons");
    })
    .catch(errors => {
      const errorMessages = errors.errors.map(err => err.message);
      return res.redirect(
        `/patrons/edit/${req.params.id}?errors=${errorMessages}`
      );
    });
});

module.exports = router;
