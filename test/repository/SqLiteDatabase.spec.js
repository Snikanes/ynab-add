const path = require("path");

const {
  getSqLiteInstance
} = require("../../src/repository/SqlLiteDatabase.js");

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

describe("SqLiteDatabase", () => {
  afterAll(async () => {
    removeDbFromFilesystem(path.join(__dirname, "..", "..", testDbName));
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

      expect(tables.length).toEqual(8);
    });
  });

  describe("applyMigrationScripts", () => {
    test("should apply all migration scripts in the specified directory", async () => {
      await db.applyMigrationScripts(migrationDirectory);

      const tables = await db.listTables();

      expect(tables.length).toEqual(8);
      expect(tables[0].name).toEqual("category");
      expect(tables[tables.length - 1].name).toEqual("user");
    });
  });

  describe("run", () => {
    test("should return id of inserted row", async () => {
      await db.applyMigrationScripts(migrationDirectory);

      const { lastID } = await db.run(
        `insert into user(id, full_name, phone_number, has_accepted_terms_and_conditions, address, postal_code, postal_area, email)
        values(4, 'Jonas Gunnarsen', 1412312, true, 'Voksenkollveien 114c', '0790', 'Oslo', 'test@test.no')`
      );
      expect(lastID).toEqual(4);
    });
  });

  describe("getFirst", () => {
    beforeEach(async () => {
      await db.applyMigrationScripts(migrationDirectory);
      await insertUserTestData(db);
    });

    test("should get first row matching query", async () => {
      const result = await db.getFirst(
        "select full_name from user where full_name = 'Jonas Gunnarsen'"
      );

      expect(result.full_name).toEqual("Jonas Gunnarsen");
    });

    test("should get first row matching query when using parameters", async () => {
      const result = await db.getFirst(
        "select full_name from user where full_name = (?)",
        ["Jonas Gunnarsen"]
      );

      expect(result.full_name).toEqual("Jonas Gunnarsen");
    });

    test("should return null when no rows match query", async () => {
      const result = await db.getFirst(
        "select full_name from user where full_name = 'McMillan'"
      );

      expect(result).toBeNull();
    });

    test("should return null when no rows match query using parameters", async () => {
      const result = await db.getFirst(
        "select full_name from user where full_name = (?)",
        ["McMillan"]
      );

      expect(result).toBeNull();
    });
  });

  describe("getAll", () => {
    beforeEach(async () => {
      await db.applyMigrationScripts(migrationDirectory);
      await insertUserTestData(db);
    });

    test("should get all rows matching query", async () => {
      const results = await db.getAll(
        "select full_name from user where id < 4"
      );

      expect(results.length).toEqual(3);
    });

    test("should get all rows matching query when using parameters", async () => {
      const results = await db.getAll(
        "select full_name from user where id < (?)",
        ["4"]
      );

      expect(results.length).toEqual(3);
    });

    test("should return empty array when no rows match query", async () => {
      const results = await db.getAll(
        "select full_name from user where full_name = 'McMillan'"
      );

      expect(results).toEqual([]);
    });

    test("should return empty array when no rows match query when using parameters", async () => {
      const results = await db.getAll(
        "select full_name from user where full_name = (?)",
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
