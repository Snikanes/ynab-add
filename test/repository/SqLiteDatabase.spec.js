const path = require("path");
const fs = require("fs");

const { getSqLiteInstance } = require("../../src/repository/SqLiteDatabase");

const testDbName = "batvett-test";
const dbFilePath = path.resolve(__dirname, "..", "..", testDbName);

let db;
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

const insertTestPayees = async db => {
  await db.run(`insert into payees(name) values('Test payee')`);
  await db.run(`insert into payees(name) values('Test payee 2')`);
};

describe("SqLiteDatabase", () => {
  afterAll(async () => {
    removeDbFromFilesystem(dbFilePath);
  });

  beforeAll(() => {
    removeDbFromFilesystem(dbFilePath);
  });

  beforeEach(() => {
    db = getSqLiteInstance();
  });

  afterEach(async () => {
    await db.dropTables();
  });

  describe("listTables", () => {
    test("should return empty list for empty database", async () => {
      const tables = await db.listTables();

      expect(tables).toEqual([]);
    });

    test("should return list with tables for database with tables", async () => {
      await db.applyMigrationScripts(migrationDirectory);

      const tables = await db.listTables();

      expect(tables.length).toEqual(1);
    });
  });

  describe("applyMigrationScripts", () => {
    test("should apply all migration scripts in the specified directory", async () => {
      await db.applyMigrationScripts(migrationDirectory);

      const tables = await db.listTables();

      expect(tables.length).toEqual(1);
      expect(tables[0].name).toEqual("payees");
    });
  });

  describe("run", () => {
    test("should return id of inserted row", async () => {
      await db.applyMigrationScripts(migrationDirectory);

      const { lastID } = await db.run(
        `insert into payees(name) values('Test payee')`
      );
      expect(lastID).toEqual(1);
    });
  });

  describe("getFirst", () => {
    beforeEach(async () => {
      await db.applyMigrationScripts(migrationDirectory);
      await insertTestPayees(db);
    });

    test("should get first row matching query", async () => {
      const result = await db.getFirst(
        "select * from payees where name = 'Test payee 2'"
      );

      expect(result.id).toEqual(2);
    });

    test("should get first row matching query when using parameters", async () => {
      const result = await db.getFirst(
        "select * from payees where name = (?)",
        ["Test payee 2"]
      );

      expect(result.name).toEqual("Test payee 2");
    });

    test("should return null when no rows match query", async () => {
      const result = await db.getFirst(
        "select name from payees where name = 'Test 3'"
      );

      expect(result).toBeNull();
    });

    test("should return null when no rows match query using parameters", async () => {
      const result = await db.getFirst(
        "select name from payees where name = (?)",
        ["Test 3"]
      );

      expect(result).toBeNull();
    });
  });

  describe("getAll", () => {
    beforeEach(async () => {
      await db.applyMigrationScripts(migrationDirectory);
      await insertTestPayees(db);
    });

    test("should get all rows matching query", async () => {
      const results = await db.getAll("select name from payees where id < 4");

      expect(results.length).toEqual(2);
    });

    test("should get all rows matching query when using parameters", async () => {
      const results = await db.getAll(
        "select name from payees where id < (?)",
        [4]
      );

      expect(results.length).toEqual(2);
    });

    test("should return empty array when no rows match query", async () => {
      const results = await db.getAll(
        "select name from payees where name = 'McMillan'"
      );

      expect(results).toEqual([]);
    });

    test("should return empty array when no rows match query when using parameters", async () => {
      const results = await db.getAll(
        "select name from payees where name = (?)",
        ["McMillan"]
      );

      expect(results).toEqual([]);
    });
  });

  describe("dropTables", () => {
    test("should drop all tables", async () => {
      await db.applyMigrationScripts(migrationDirectory);

      await db.dropTables();
      const tables = await db.listTables();

      expect(tables).toEqual([]);
    });
  });
});
