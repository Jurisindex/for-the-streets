// runMigrations.js
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const runMigrations = require('./server/src/db/migrationRunner');

async function resetMigrations(db) {
  console.log("Resetting migrations...");
  await db.run('DELETE FROM migrations WHERE id = ?', '001_initial_schema');
  console.log("Migration record deleted.");
}

async function main() {
  const db = await open({
    filename: path.join(__dirname, 'server', 'streetreview.db'),
    driver: sqlite3.Database
  });

  try {
    // Reset migrations
    await resetMigrations(db);

    // Run migrations again
    await runMigrations(db);
    console.log('Migrations completed successfully');

    // Check database content
    console.log("\nChecking database content:");
    const migrations = await db.all('SELECT * FROM migrations');
    console.log('Executed migrations:', migrations);

    const schema = await db.all("PRAGMA table_info(person_of_interest)");
    console.log('person_of_interest schema:', schema);

    const pois = await db.all('SELECT * FROM person_of_interest');
    console.log('Persons of Interest:', pois);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.close();
  }
}

main();