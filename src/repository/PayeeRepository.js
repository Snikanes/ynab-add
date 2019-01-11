const { getSqLiteInstance } = require("./SqLiteDatabase");

class PayeeRepository {
  constructor() {
    this.db = getSqLiteInstance();
  }
}

module.exports = {
  PayeeRepository
};
