import { db } from '../db';
import { sql } from 'drizzle-orm';
import { logger } from '../middleware/errorHandler';

interface Migration {
  id: string;
  name: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
}

export class MigrationRunner {
  private migrations: Migration[] = [];

  addMigration(migration: Migration) {
    this.migrations.push(migration);
  }

  async createMigrationsTable() {
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS migrations (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      logger.info('Migrations table created successfully');
    } catch (error) {
      logger.error('Failed to create migrations table:', error);
      throw error;
    }
  }

  async getExecutedMigrations(): Promise<string[]> {
    try {
      const result = await db.execute(sql`SELECT name FROM migrations ORDER BY executed_at`);
      return result.map((row: any) => row.name);
    } catch (error) {
      logger.error('Failed to get executed migrations:', error);
      return [];
    }
  }

  async runMigrations() {
    await this.createMigrationsTable();
    const executedMigrations = await this.getExecutedMigrations();
    
    for (const migration of this.migrations) {
      if (!executedMigrations.includes(migration.name)) {
        try {
          logger.info(`Running migration: ${migration.name}`);
          await migration.up();
          await db.execute(sql`
            INSERT INTO migrations (name) VALUES (${migration.name})
          `);
          logger.info(`Migration completed: ${migration.name}`);
        } catch (error) {
          logger.error(`Migration failed: ${migration.name}`, error);
          throw error;
        }
      }
    }
  }
}

export const migrationRunner = new MigrationRunner();