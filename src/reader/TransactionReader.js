const moment = require("moment");
const path = require("path");
const fs = require("fs");

const { Transaction } = require("../domain/Transaction");

class TransactionReader {
  parseTransaction(line) {
    const cleanedLine = this.cleanLine(line);
    const components = cleanedLine.split(";");

    const date = moment(components[0], "DD.MM.YYYY");
    const payee = components[1];

    const withdrawal = components[3];
    const deposit = components[4];

    return !!withdrawal
      ? new Transaction(date, payee, this.formatAmount(withdrawal))
      : new Transaction(date, payee, this.formatAmount(`-${deposit}`));
  }

  parseTransactionsFromFile(filePath) {
    const file = path.resolve(filePath);
    const lines = String(fs.readFileSync(file)).split("\n");
    const linesWithoutHeaderAndDanglingNewline = lines
      .slice(1)
      .filter(line => !!line);

    return linesWithoutHeaderAndDanglingNewline.map(line =>
      this.parseTransaction(line)
    );
  }

  cleanLine(line) {
    return line.replace(/["']/g, "");
  }

  formatAmount(amount) {
    const separatorsRemoved = amount.replace(/[.]/g, "");
    return Number(separatorsRemoved.replace(/[,]/g, "."));
  }
}

module.exports = {
  TransactionReader
};
