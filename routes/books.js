let express = require("express");
let router = express.Router();
const moment = require("moment");
let Patron = require("../models").Patron;
let Book = require("../models").Book;
let Loan = require("../models").Loan;

let Sequelize = require("sequelize");
const Op = Sequelize.Op;

let todaysDate = moment().format("YYYY-MM-DD");
let returnDate = moment(todaysDate)
  .add(7, "days")
  .format("YYYY-MM-DD");

//ALL BOOKS
router.get("/",(req,res,next)=>{
  Book.findAll({
    order: [["title", "ASC"]]
  }).then(function(books) {
      res.render("books", { books });
    });
});

//CHECKED BOOKS
router.get("/checked",(req,res,next)=>{
  Book.findAll({
    include:[
      {
        all:true,
        where: {
          loaned_on: {
            [Op.ne]: null
          },
          returned_on: {
            [Op.eq]: null
          }
        }
      }
    ]
  }).then(function(checked){
    res.render("checked_books",{checked})
  });
});

//NEW BOOK GET
router.get("/new", (req, res, next)=> {
    let errors = [req.query.errors];
  res.render("new_book", {errors});
});

//NEW BOOK POST
router.post("/new",(req,res,next)=>{
  Book.create(req.body)
   .then(function(book) {
     res.redirect("/books");
   }).catch(function(errors){
        const errorMessages = errors.errors.map(err => err.message);
        return res.redirect(`/books/new/?errors=${errorMessages}`);
   }).catch(function(error) {
      res.send(500);
    });
});

//OVERDUE BOOK GET
router.get("/overdue",(req,res,next)=>{
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
    .then(function(overdue) {
      res.render("overdue_books", { overdue });
    }).catch(function(error) {
      res.send(500, error);
    });
});

//BOOK DETAIL POST
router.post("/edit/:id",(req,res)=>{
  Book.update(req.body, {
    where: [
      {
        id: req.params.id
      }
    ]
  })
    .then(function() {
      return res.redirect("/books");
    }).catch(function(errors){
      const errorMessages = errors.errors.map(err => err.message);
      return res.redirect(`/books/edit/${req.params.id}?errors=${errorMessages}`);
    });
});

//BOOK DETAIL GET
router.get("/edit/:id", (req,res,next)=>{
  let errors = [req.query.errors]
  const foundBook = Book.findById(req.params.id);
  const foundLoan = Loan.findAll({
    where: [
      {
        book_id: req.params.id
      }
    ],
    include: [{ model: Patron }, { model: Book }]
  });
  Promise.all([foundBook, foundLoan])
    .then(function(values) {
      if (values) {
        res.render("book_detail", {
          book: values[0],
          loans: values[1],
          errors: errors
        });
      }
      else {
        res.send(404);
      }
    }).catch(function(error) {
     console.err(error);
      res.send(500);
    });

});

//RETURN BOOK GET
router.get("/return/:id", function(req, res, next) {
  Loan.findAll({
    where: [
      {
        book_id: req.params.id
      }
    ],
    include: [{ model: Patron }, { model: Book }]
  })
    .then(function(loans) {
        console.log();
      if (loans) {
        const id = loans[0].Book.dataValues.id;
        const p =  loans[0].Patron.dataValues;
        const bookName = loans[0].Book.dataValues.title;
        const fullName =p.first_name +" "+ p.last_name; 
        res.render("return_book", {
          id: id,
          loan: loans[0],
          patron: fullName,
          book: bookName,
          todaysDate
        });
      } else {
        res.send(404);
      }
    })
    .catch(function(error) {
      res.send('500');
    });
});

//RETURN BOOK POST
router.post("/return/:id", (req,res,next)=>{
    if(req.body.returned_on == ""){
        res.send("All fields required");
    }
    console.log(req.params.id);
    Loan.findAll({
        where: [
          {
            book_id: req.params.id
          }
        ],
        include: [{ model: Patron }, { model: Book }]
      }).then(function(loan){
          console.log(loan[0]);
        return loan[0].destroy();
      }).then(function(){
        res.redirect("/loans");
      })
});

module.exports = router;
