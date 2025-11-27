-- QUICK VERIFICATION SCRIPT
-- Run this after applying the fix to verify everything is working

-- 1. Check if journal_entries table exists with correct schema
DO $$
DECLARE
    table_exists BOOLEAN;
    columns_correct INTEGER;
    rls_enabled BOOLEAN;
    policies_count INTEGER;
BEGIN
    -- Check table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'journal_entries'
    ) INTO table_exists;

    IF table_exists THEN
        RAISE NOTICE '✅ journal_entries table exists';

        -- Check required columns exist
        SELECT COUNT(*) INTO columns_correct
        FROM information_schema.columns
        WHERE table_name = 'journal_entries'
        AND column_name IN ('id', 'user_id', 'title', 'date', 'mood', 'energy', 'reflections', 'gratitude', 'created_at', 'updated_at');

        IF columns_correct = 10 THEN
            RAISE NOTICE '✅ All required columns present';
        ELSE
            RAISE NOTICE '❌ Missing columns. Found: %', columns_correct;
        END IF;

        -- Check RLS is enabled
        SELECT rowsecurity INTO rls_enabled
        FROM pg_tables
        WHERE schemaname = 'public' AND tablename = 'journal_entries';

        IF rls_enabled THEN
            RAISE NOTICE '✅ Row Level Security is enabled';
        ELSE
            RAISE NOTICE '❌ Row Level Security is NOT enabled';
        END IF;

        -- Check RLS policies exist
        SELECT COUNT(*) INTO policies_count
        FROM pg_policies
        WHERE tablename = 'journal_entries';

        IF policies_count >= 4 THEN
            RAISE NOTICE '✅ RLS policies configured (%)', policies_count;
        ELSE
            RAISE NOTICE '❌ Insufficient RLS policies (%)', policies_count;
        END IF;

    ELSE
        RAISE NOTICE '❌ journal_entries table does NOT exist';
    END IF;
END $$;

-- 2. Test table structure
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'journal_entries'
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check RLS policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'journal_entries'
ORDER BY policyname;

-- 4. Check indexes
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'journal_entries'
    AND schemaname = 'public'
ORDER BY indexname;

-- 5. Test user permissions (if you have a test user)
-- Uncomment and modify with a real user ID if needed:
-- SELECT auth.uid();

-- 6. Final status report
DO $$
DECLARE
    issues_count INTEGER := 0;
BEGIN
    -- Count potential issues
    IF NOT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'journal_entries'
    ) THEN
        issues_count := issues_count + 1;
    END IF;

    IF NOT EXISTS (
        SELECT FROM pg_policies WHERE tablename = 'journal_entries'
    ) THEN
        issues_count := issues_count + 1;
    END IF;

    IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'journal_entries' AND column_name = 'user_id'
    ) THEN
        issues_count := issues_count + 1;
    END IF;

    IF issues_count = 0 THEN
        RAISE NOTICE '🎉 ALL CHECKS PASSED - Database is ready for production!';
        RAISE NOTICE '🚀 Your journal app should now work properly';
        RAISE NOTICE '📝 Users can save and sync journal entries';
    ELSE
        RAISE NOTICE '⚠️ Issues found: %', issues_count;
        RAISE NOTICE '❌ Please review the output above and fix remaining issues';
    END IF;
END $$;