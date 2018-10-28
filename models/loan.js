"use srtict"

module.exports = function(sequelize, DataTypes){
  let Loan = sequelize.define("Loan",
  {
    book_id: {
      type: DataTypes.INTEGER,
      validate:{
        notEmpty:{
            message: "Book Id required"
       }
      }
    },
    patron_id: {
      type: DataTypes.INTEGER,
      validate: {
        notEmpty: {
          msg: "Patron ID is required"
        }
      }
    },

    loaned_on: {
      type: DataTypes.DATEONLY,
      validate:{
        isDate:{msg:"Valid date required"},
        notEmpty:{msg: "Date required"}
      }
    },
    return_by: {
      type: DataTypes.DATEONLY,
      validate:{
        isDate:{msg: "Valid date required"},
        notEmpty:{msg: "Date required"}
      }
    },
    returned_on: {
      type: DataTypes.DATEONLY,
      validate:{
        isDate:{msg: "Valid date required"},
        notEmpty:{msg: "Date required"}
      }
    },
  },
  {
    tableName: 'loans',
    timestamps: false,
  });

  Loan.associate = function(models) {
      Loan.belongsTo(models.Book, { foreignKey: "book_id" });
      Loan.belongsTo(models.Patron, { foreignKey: "patron_id" });
  };
  return Loan;
}
