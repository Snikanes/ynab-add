const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

/**
 * A wrapper class around the sqlite3 modiule, providing promisified
 * querying methods
 *
 * @class SqLiteDatabase
 */
class SqLiteDatabase {
  constructor(dbName = "ynab") {
    if (process.env.TEST) {
      this.db = new sqlite3.Database("ynab-test");
    } else {
      this.db = new sqlite3.Database(dbName);
    }
  }

  /**
   * Lists all tables in the database
   *
   * @returns A Promise resolving to a list of all the tables in the database
   * @memberof SqLiteDatabase
   */
  async listTables() {
    return this.getAll(
      "select name from sqlite_master where type='table' order by name"
    );
  }

  /**
   * Applies all migration scripts in the migration folder.
   * Any file ending in .sql is regarded as a migration script,
   * Scripts are applied in alphebetic order
   *
   * @memberof SqLiteDatabase
   */
  async applyMigrationScripts(directory) {
    const files = fs.readdirSync(directory);

    const scripts = files
      .sort()
      .filter(file => file.endsWith(".sql"))
      .map(file => String(fs.readFileSync(path.join(directory, file))));

    for (const script of scripts) {
      // eslint-disable-next-line no-await-in-loop
      await this.run(script).catch(err =>
        console.error(`Could not apply all migration scripts: ${err}`)
      );
    }
  }

  /**
   * Runs the specified query against the database
   * Needs custom promisification in order to return
   * the ID of the last inserted row
   *
   * @param {*} query The query to run
   * @param {*} [parameters=[]] The parameters to use in the query
   * @returns A Promise resolving to an object {lastID: <ID of last inserted>}
   * @memberof SqLiteDatabase
   */
  async run(query, parameters = []) {
    const statement = this.db.prepare(query);

    return new Promise((resolve, reject) => {
      statement.run(parameters, function cb(err) {
        statement.finalize();
        if (err) {
          return reject(err);
        }
        return resolve({ ...this });
      });
    });
  }

  /**
   * Runs the specified query and returns the first row that matches
   *
   * @param {*} query The query to run
   * @param {*} [parameters=[]] The parameters to use in the query
   * @returns A Promise resolving to the first row that matches, null if result set is empty
   * @memberof SqLiteDatabase
   */
  async getFirst(query, parameters = []) {
    const statement = this.db.prepare(query);
    const result = await promisify(statement.get).bind(statement)(parameters);
    statement.finalize();
    return result || null;
  }

  /**
   * Runs the specified query and returns all matching rows
   *
   * @param {*} query The query to run
   * @param {*} [parameters=[]] The parameters to use in the query
   * @returns A promise that resolves to a list containing all rows that match
   *          the query or an empty array if result set is empty
   * @memberof SqLiteDatabase
   */
  async getAll(query, parameters = []) {
    const statement = this.db.prepare(query);
    const results = await promisify(statement.all).bind(statement)(parameters);
    statement.finalize();
    return results;
  }

  /**
   * Closes the database connection
   *
   * @returns A promise resolving once the database is closed
   * @memberof SqLiteDatabase
   */
  async closeConnection() {
    return promisify(this.db.close).bind(this.db)();
  }

  async dropTables() {
    const tables = await this.getAll(
      "select name from sqlite_master where type='table'"
    );
    for (const table of tables) {
      // eslint-disable-next-line no-await-in-loop
      await this.run(`drop table if exists ${table.name}`);
    }
  }
}

let instance = null;
const getInstance = dbName => {
  if (instance === null) {
    instance = new SqLiteDatabase(dbName);
  }
  return instance;
};

module.exports = {
  getSqLiteInstance: dbName => getInstance(dbName),
  SqLiteDatabase
};
