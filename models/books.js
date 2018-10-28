"use strict"

module.exports = function(sequelize, DataTypes){
  let Book = sequelize.define("Book",
  {
    title: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: "Book title is required"
        }
      }
    },
    author: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: "Book author is required"
        }
      }
    },
    genre: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: "Book genre is required"
        }
      }
    },
    first_published: DataTypes.INTEGER
  },
  {
    tableName: "books",
    timestamps: false
  });

  Book.associate = function(models) {
    Book.hasOne(models.Loan, { foreignKey: "book_id" });
  };
  return Book;
}
