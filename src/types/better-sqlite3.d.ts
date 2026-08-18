declare module "better-sqlite3" {
  namespace Database {
    type Database = any;
    type Statement = any;
  }
  interface Database {
    prepare(source: string): any;
    exec(source: string): this;
    transaction(fn: Function): any;
    close(): this;
    [key: string]: any;
  }
  interface DatabaseConstructor {
    new (filename: string, options?: any): Database;
    (filename: string, options?: any): Database;
  }
  const Database: DatabaseConstructor;
  export = Database;
}
