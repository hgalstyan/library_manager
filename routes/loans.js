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

//ALL LOANS
router.get("/", function(req, res, next) {
  Loan.findAll({
    order: [["loaned_on", "ASC"]],
    include: [{ model: Book }, { model: Patron }]
  }).then(function(results) {
    res.render("loans", {
      loans: results
    });
  });
});


//OVERDUE
router.get("/overdue", function(req, res, next) {
  Loan.findAll({
    where: {
      return_by: {
        [Op.lt]: new Date()
      },
      returned_on: {
        [Op.eq]: null
      }
    },
    include: [{ model: Book }, { model: Patron }]
  })
    .then(function(results) {
      res.render("loans_overdue", {
        overdue: results
      });
    })
    .catch(function(error) {
      res.send(500, error);
    });
});


//CHECKED

router.get("/checked", function(req, res, next) {
  Loan.findAll({
    where: {
      loaned_on: {
        [Op.ne]: null
      },
      returned_on: {
        [Op.eq]: null
      }
    },

    include: [{ model: Book }, { model: Patron }]
  })
    .then(function(results) {
      res.render("loans_checked", {
        loans: results
      });
    })
    .catch(function(error) {
      res.send(500, error);
    });
});


// NEW LOAN FORM

router.get("/new", function(req, res, next) {
  const allBooks = Book.findAll({
    order: [["title", "ASC"]]
  });

  const allPatrons = Patron.findAll({
    order: [["first_name", "ASC"], ["last_name", "ASC"]]
  });

  Promise.all([allBooks, allPatrons])
    .then(function(values) {
      res.render("new_loan", {
        books: values[0],
        patrons: values[1],
        todaysDate,
        returnDate
      });
    })
    .catch(function(error) {
      res.send(500, error);
    });
});

//POST NEW LOAN
router.post("/new", function(req, res, next) {

  Loan.create(req.body)
     .then(function(loan) {
       res.redirect("/loans");
     }).catch(function(error){

    if(error.name === 'SequelizeValidationError'){

    const allBooks = Book.findAll({
      order: [["title", "ASC"]]
    });

    const allPatrons = Patron.findAll({
      order: [["first_name", "ASC"], ["last_name", "ASC"]]
    });

    Promise.all([allBooks, allPatrons])
      .then(function(values) {
        res.render("new_loan", {
          errors: error.errors,
          books: values[0],
          patrons: values[1],
          todaysDate,
          returnDate
        });
      })

    }else {
          res.send(500, error);
        }

     });

  });

module.exports = router;
