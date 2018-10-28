"use strict"

module.exports = function(sequelize, DataTypes){
  let Patron = sequelize.define("Patron",
  {
    //id: DataTypes.INTEGER,
    first_name: {
      type:DataTypes.STRING,
      validate:{
        notEmpty:{msg: 'First name is required'}
      }
    },
    last_name: {
      type: DataTypes.STRING,
      validate:{
        notEmpty:{
          msg: 'Last name is required'
        }
      }
    },
    address: {
      type:DataTypes.STRING,
      validate: {
        notEmpty:{
        msg: 'Address is required'
        }
      }
    },
    email: {
      type:DataTypes.STRING,
      validate:{
        isEmail:{msg: 'Correct email format is required: Ex: name@mail.com'},
        notEmpty:{
          msg: 'Email is required'
        }
      }
    },
    library_id: {
      type: DataTypes.STRING,

      validate: {

        notEmpty:{
          msg: 'Library ID is required'
        }
      }

    },
    zip_code: {
      type: DataTypes.INTEGER,
      validate:{
        isNumeric:{msg: 'Zip code must be a 5 digit number'},
        len: 5,
        notEmpty:{
          msg: 'Zip Code is required'
        }
      }
    }
  },
  {
    tableName: 'patrons',
    timestamps: false,
  });

  Patron.associate = function(models){
    Patron.hasMany(models.Loan, {foreignKey: "patron_id"})
  }
  return Patron;
}
