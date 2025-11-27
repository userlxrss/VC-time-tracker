-- Database Backup and Recovery Plan for Journal Entries
-- Run this before making changes to backup existing data

-- Step 1: Backup existing data (if table exists with wrong schema)
DO $$
BEGIN
    -- Check if table exists and create backup
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'journal_entries') THEN
        -- Create backup table
        EXECUTE 'CREATE TABLE IF NOT EXISTS journal_entries_backup_' || to_char(now(), 'YYYY_MM_DD_HH24_MI_SS') || ' AS SELECT * FROM journal_entries';
        RAISE NOTICE '✅ Created backup of existing journal_entries table';
    ELSE
        RAISE NOTICE 'ℹ️ No existing journal_entries table found - no backup needed';
    END IF;
END $$;

-- Step 2: Check for orphaned data and create recovery script
-- This helps if users have data that needs to be migrated

CREATE OR REPLACE FUNCTION recover_journal_entries()
RETURNS TABLE(
    recovered_count INTEGER,
    message TEXT
) AS $$
DECLARE
    recovery_count INTEGER := 0;
    backup_table_name TEXT;
BEGIN
    -- Find the most recent backup table
    SELECT table_name INTO backup_table_name
    FROM information_schema.tables
    WHERE table_name LIKE 'journal_entries_backup_%'
    ORDER BY table_name DESC
    LIMIT 1;

    IF backup_table_name IS NOT NULL THEN
        -- Migrate data from backup to new table
        EXECUTE format('INSERT INTO journal_entries (user_id, title, date, mood, energy, reflections, gratitude, tags, created_at, updated_at)
                       SELECT user_id, title, date, mood, energy, reflections, gratitude, tags, created_at, updated_at FROM %I', backup_table_name);

        GET DIAGNOSTICS recovery_count = ROW_COUNT;

        RETURN QUERY SELECT recovery_count, 'Successfully recovered ' || recovery_count || ' journal entries from backup';
    ELSE
        RETURN QUERY SELECT 0, 'No backup table found for recovery';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create verification functions
CREATE OR REPLACE FUNCTION verify_journal_entries_schema()
RETURNS TABLE(
    column_name TEXT,
    data_type TEXT,
    is_present BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        unnest(ARRAY['id', 'user_id', 'title', 'date', 'mood', 'energy', 'reflections', 'gratitude', 'tags', 'created_at', 'updated_at']) as column_name,
        unnest(ARRAY['uuid', 'uuid', 'text', 'date', 'integer', 'integer', 'text', 'text', 'text[]', 'timestamp with time zone', 'timestamp with time zone']) as expected_type,
        (column_name IN (
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'journal_entries' AND table_schema = 'public'
        )) as is_present;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create data integrity checks
CREATE OR REPLACE FUNCTION check_journal_entries_integrity()
RETURNS TABLE(
    check_name TEXT,
    status TEXT,
    details TEXT
) AS $$
BEGIN
    -- Check RLS is enabled
    RETURN QUERY
    SELECT
        'RLS Enabled' as check_name,
        CASE WHEN rowsecurity = true THEN '✅ PASS' ELSE '❌ FAIL' END as status,
        'Row Level Security should be enabled for security' as details
    FROM pg_tables
    WHERE tablename = 'journal_entries' AND schemaname = 'public';

    -- Check user_id column exists and is NOT NULL
    RETURN QUERY
    SELECT
        'User ID Column' as check_name,
        CASE WHEN COUNT(*) > 0 THEN '✅ PASS' ELSE '❌ FAIL' END as status,
        'user_id column should exist and be NOT NULL' as details
    FROM information_schema.columns
    WHERE table_name = 'journal_entries'
        AND column_name = 'user_id'
        AND is_nullable = 'NO';

    -- Check required policies exist
    RETURN QUERY
    SELECT
        'RLS Policies' as check_name,
        CASE WHEN COUNT(*) >= 4 THEN '✅ PASS' ELSE '❌ FAIL' END as status,
        'Should have SELECT, INSERT, UPDATE, DELETE policies for user isolation' as details
    FROM pg_policies
    WHERE tablename = 'journal_entries';

    -- Check indexes exist
    RETURN QUERY
    SELECT
        'Performance Indexes' as check_name,
        CASE WHEN COUNT(*) >= 3 THEN '✅ PASS' ELSE '❌ FAIL' END as status,
        'Should have indexes on user_id, date, created_at' as details
    FROM pg_indexes
    WHERE tablename = 'journal_entries'
        AND indexname LIKE 'idx_journal_entries_%';
END;
$$ LANGUAGE plpgsql;

-- Step 5: Rollback function (in case of issues)
CREATE OR REPLACE FUNCTION rollback_journal_changes()
RETURNS TEXT AS $$
DECLARE
    backup_table_name TEXT;
BEGIN
    -- Find the most recent backup table
    SELECT table_name INTO backup_table_name
    FROM information_schema.tables
    WHERE table_name LIKE 'journal_entries_backup_%'
    ORDER BY table_name DESC
    LIMIT 1;

    IF backup_table_name IS NOT NULL THEN
        -- Drop current table and restore from backup
        DROP TABLE IF EXISTS journal_entries;
        EXECUTE format('ALTER TABLE %I RENAME TO journal_entries', backup_table_name);

        RETURN '✅ Successfully rolled back to backup: ' || backup_table_name;
    ELSE
        RETURN '❌ No backup table found for rollback';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create monitoring function for production
CREATE OR REPLACE FUNCTION monitor_journal_health()
RETURNS TABLE(
    metric_name TEXT,
    value TEXT,
    status TEXT
) AS $$
BEGIN
    -- Total entries
    RETURN QUERY
    SELECT
        'Total Entries'::TEXT,
        COUNT(*)::TEXT,
        CASE WHEN COUNT(*) > 0 THEN '✅ OK' ELSE '⚠️ No data' END
    FROM journal_entries;

    -- Unique users
    RETURN QUERY
    SELECT
        'Unique Users'::TEXT,
        COUNT(DISTINCT user_id)::TEXT,
        CASE WHEN COUNT(DISTINCT user_id) > 0 THEN '✅ OK' ELSE '⚠️ No users' END
    FROM journal_entries;

    -- Recent activity
    RETURN QUERY
    SELECT
        'Recent Activity (24h)'::TEXT,
        COUNT(*)::TEXT,
        CASE WHEN COUNT(*) > 0 THEN '✅ Active' ELSE '⚠️ No recent activity' END
    FROM journal_entries
    WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours';

    -- Table size
    RETURN QUERY
    SELECT
        'Table Size'::TEXT,
        pg_size_pretty(pg_total_relation_size('journal_entries'))::TEXT,
        '📊 Info'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Verification query
SELECT
    'Database Setup Complete' as status,
    'All backup and recovery functions are now available' as message,
    'Run SELECT * FROM check_journal_entries_integrity() to verify setup' as next_step;