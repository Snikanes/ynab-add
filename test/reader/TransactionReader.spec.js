const { Transaction } = require("../../src/domain/Transaction");
const { TransactionReader } = require("../../src/reader/TransactionReader");
const moment = require("moment");

const transactionListPath =
  "/Users/eirikv/Developer/ynab-convert/test/fixtures/transaksjonliste.txt";

describe("TransactionReader", () => {
  let transactionReader;

  beforeEach(() => {
    transactionReader = new TransactionReader();
  });

  describe("parseTransaction", () => {
    test("should return instances of Transaction", () => {
      const transactionLine =
        '"01.01.2019";"Giro  530 Obos Factoring AS AvtalegiroFellesutgifter";"02.01.2019";"2.401,00";""';

      const parsedTransaction = transactionReader.parseTransaction(
        transactionLine
      );
      expect(parsedTransaction).toBeInstanceOf(Transaction);
    });

    test("should correctly parse line to Transaction for withdrawals", () => {
      const transactionLine =
        '"01.01.2019";"Giro  530 Obos Factoring AS AvtalegiroFellesutgifter";"02.01.2019";"2.401,00";""';

      const parsedTransaction = transactionReader.parseTransaction(
        transactionLine
      );
      expect(parsedTransaction.date).toEqual(
        moment("01.01.2019", "DD.MM.YYYY")
      );
      expect(parsedTransaction.payee).toEqual(
        "Giro  530 Obos Factoring AS AvtalegiroFellesutgifter"
      );
      expect(parsedTransaction.amount).toEqual(2401.0);
    });

    test("should correctly parse line to Transaction for deposits", () => {
      const transactionLine =
        '"01.01.2019";"Giro  530 Obos Factoring AS AvtalegiroFellesutgifter";"02.01.2019";"";"2.401,00"';

      const parsedTransaction = transactionReader.parseTransaction(
        transactionLine
      );
      expect(parsedTransaction.date).toEqual(
        moment("01.01.2019", "DD.MM.YYYY")
      );
      expect(parsedTransaction.payee).toEqual(
        "Giro  530 Obos Factoring AS AvtalegiroFellesutgifter"
      );
      expect(parsedTransaction.amount).toEqual(-2401.0);
    });
  });

  describe("parseTransactionsFromFile", () => {
    let parseTransaction;

    beforeEach(() => {
      parsedTransactions = transactionReader.parseTransactionsFromFile(
        transactionListPath
      );
    });

    test("should return a transaction for each line in the file", () => {
      expect(parsedTransactions.length).toBe(207);
    });
    test("should return the first line as the first transaction", () => {
      const firstTransaction = parsedTransactions[0];

      expect(firstTransaction.date).toEqual(moment("01.01.2019", "DD.MM.YYYY"));
      expect(firstTransaction.payee).toEqual(
        "Giro  530 Obos Factoring AS AvtalegiroFellesutgifter"
      );
      expect(firstTransaction.amount).toEqual(2401.0);
    });

    test("should return the last line as the last transaction", () => {
      const lastTransaction = parsedTransactions[parsedTransactions.length - 1];

      expect(lastTransaction.date).toEqual(moment("03.11.2018", "DD.MM.YYYY"));
      expect(lastTransaction.payee).toEqual(
        "Visa  101322  Gbp 16,20 Two FloorsValutakurs: 11,0919"
      );
      expect(lastTransaction.amount).toEqual(179.69);
    });
  });

  describe("formatAmount", () => {
    test("should parse amount string to number", () => {
      const amount = "2.401,67";

      const formattedAmount = transactionReader.formatAmount(amount);

      expect(formattedAmount).toEqual(2401.67);
    });

    test("should parse amount to number when string does not contain thousand separators", () => {
      const amount = "42,67";

      const formattedAmount = transactionReader.formatAmount(amount);

      expect(formattedAmount).toEqual(42.67);
    });
  });
});
