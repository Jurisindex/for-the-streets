const fs = require('fs').promises;
const path = require('path');

async function runMigrations(db) {
  console.log('Starting migration process...');

  try {
    // Create migrations table if it doesn't exist
    await db.run(`
      CREATE TABLE IF NOT EXISTS migrations (
        id TEXT PRIMARY KEY,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Migrations table created or already exists.');

    const migrationsDir = path.join(__dirname, 'migrations');
    console.log(`Reading migrations from: ${migrationsDir}`);

    const migrationFiles = await fs.readdir(migrationsDir);
    console.log(`Found migration files: ${migrationFiles.join(', ')}`);

    const sortedMigrations = migrationFiles.sort();

    for (const migrationFile of sortedMigrations) {
      const migrationId = path.parse(migrationFile).name;
      console.log(`Checking migration: ${migrationId}`);

      const executed = await db.get('SELECT id FROM migrations WHERE id = ?', migrationId);

      if (!executed) {
        console.log(`Executing migration: ${migrationId}`);
        const migration = require(path.join(migrationsDir, migrationFile));
        try {
          await migration.up(db);
          await db.run('INSERT INTO migrations (id) VALUES (?)', migrationId);
          console.log(`Successfully executed migration: ${migrationId}`);
        } catch (error) {
          console.error(`Error executing migration ${migrationId}:`, error);
          throw error;
        }
      } else {
        console.log(`Migration ${migrationId} already executed, skipping`);
      }
    }

    console.log('Migration process completed.');
  } catch (error) {
    console.error('Error in migration process:', error);
    throw error;
  }
}

module.exports = runMigrations;

// If this script is run directly (not imported), execute migrations
if (require.main === module) {
  const sqlite3 = require('sqlite3');
  const { open } = require('sqlite');

  (async () => {
    const db = await open({
      filename: path.join(__dirname, '../streetreview.db'),
      driver: sqlite3.Database
    });

    try {
      await runMigrations(db);
      console.log('Migrations completed successfully');

      // Check database content
      console.log("\nChecking database content:");
      const migrations = await db.all('SELECT * FROM migrations');
      console.log('Executed migrations:', migrations);

      const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
      console.log('Tables in the database:', tables);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      await db.close();
    }
  })();
}