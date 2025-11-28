#!/usr/bin/env node

/**
 * Database migration script
 * Runs all SQL migration files in order
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, '../migrations/database');
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || '5432',
  user: process.env.DB_USERNAME || 'ehrms',
  password: process.env.DB_PASSWORD || 'ehrms_dev_password',
  database: process.env.DB_NAME || 'ehrms',
};

function runMigration() {
  console.log('Running database migrations...');
  
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql') && file !== 'init.sql')
    .sort();

  for (const file of migrationFiles) {
    console.log(`Running migration: ${file}`);
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    try {
      execSync(`psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} -f ${filePath}`, {
        env: { ...process.env, PGPASSWORD: dbConfig.password },
        stdio: 'inherit',
      });
      console.log(`✓ Migration ${file} completed successfully`);
    } catch (error) {
      console.error(`✗ Migration ${file} failed:`, error.message);
      process.exit(1);
    }
  }

  console.log('All migrations completed successfully!');
}

runMigration();

