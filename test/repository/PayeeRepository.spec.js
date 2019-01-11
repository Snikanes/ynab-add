const path = require("path");
const { PayeeRepository } = require("../../src/repository/PayeeRepository");

let repository;
const migrationDirectory = path.join(
  __dirname,
  "..",
  "..",
  "src",
  "migrations",
  "schema"
);

const removeDbFromFilesystem = path => {
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
};

describe("PayeeRepository", () => {
  afterAll(async () => {
    removeDbFromFilesystem(path.join(__dirname, "..", "..", testDbName));
  });

  beforeEach(async () => {
    repository = new PayeeRepository();
    await repository.db.applyMigrationScripts(migrationDirectory);
  });

  afterEach(async () => {
    await repository.db.dropTables();
  });

  describe("contructor", () => {
    test("should setup database connection", () => {
      expect(repository.db).toBeTruthy();
    });
  });
});
