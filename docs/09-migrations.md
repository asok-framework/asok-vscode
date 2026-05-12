# Database Migrations

Asok includes a professional, version-controlled migration system that allows you to manage your database schema evolution with confidence. It features **automatic change detection**, batch tracking, and atomic rollbacks.

## 1. Concept

Instead of modifying your database manually or relying solely on automatic schema updates, you define your schema in your **Models**. Asok then detects the differences between your code and the actual database state, generating versioned migration files in `src/migrations/`.

## 2. Generating Migrations

When you add a new model or modify an existing one (adding fields), run the following command:

```bash
asok make migration add_phone_to_users
```

Asok will perform a deep analysis of your models and current database schema, then create a file like `src/migrations/0001_add_phone_to_users.py`.

### What Asok Detects
- **New Tables**: Automatically generates `CREATE TABLE` with all fields, constraints (UNIQUE, NOT NULL), and default values.
- **New Columns**: Detects missing columns in existing tables and generates `ALTER TABLE ADD COLUMN` statements.
- **Indexes**: (Future) detects missing indexes.

### Anatomy of a Migration File
A migration file contains two functions:
- `up(conn)`: The SQL changes to apply.
- `down(conn)`: The SQL changes to revert (rollback).

```python
"""
Asok Migration: add_phone_to_users
Generated at: 2024-05-08 10:00:00
"""

def up(conn):
    """Apply changes."""
    conn.execute("ALTER TABLE users ADD COLUMN phone TEXT DEFAULT ''")

def down(conn):
    """Revert changes."""
    # SQLite has limited DROP COLUMN support in older versions
    # Asok logs a comment here if it cannot safely generate the revert SQL
    pass
```

## 3. Applying Migrations

To apply all pending migrations:

```bash
asok migrate
```

Asok tracks applied migrations in a special `_asok_migrations` table. Migrations are executed in **batches**. All migrations run in a single `asok migrate` call belong to the same batch.

## 4. Checking Status

To see the history of applied migrations and what is pending:

```bash
asok migrate --status
```

Output example:
```text
MIGRATION STATUS
  [X] 0001_initial_schema
  [X] 0002_add_user_bio
  [ ] 0003_create_posts_table
```

## 5. Rolling Back

If you need to undo changes, you can roll back the **last batch** of migrations:

```bash
asok migrate --rollback
```

This will execute the `down()` function of every migration in the most recent batch and remove them from the tracking table.

## 6. Advanced Options

### Faking Migrations
If your database is out of sync but the schema is correct, you can "fake" a migration:

```bash
asok migrate --fake
```

This marks pending migrations as applied in the tracking table without actually running the SQL. It also works with `--rollback`.

### Why Versioned Migrations?
While Asok supports "Auto-Evolution" (automatic `ALTER TABLE` on app start), versioned migrations are recommended for:
1. **Team Collaboration**: Everyone has the same database state.
2. **Production Safety**: You can review the SQL before it runs.
3. **Traceability**: You know exactly when and why a change was made.
4. **Rollbacks**: Easy recovery from schema mistakes.

> Always review generated migration files before applying them, especially in production environments.

---
[← Previous: Advanced ORM Features](08-advanced-orm.md) | [Documentation](README.md) | [Next: Native Vector Search →](10-vector-search.md)
