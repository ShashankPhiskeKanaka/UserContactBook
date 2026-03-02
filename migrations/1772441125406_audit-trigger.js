/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
    pgm.sql(`
    CREATE OR REPLACE FUNCTION audit_trigger_func()
    RETURNS TRIGGER AS $$
    DECLARE
        _before JSONB := NULL;
        _after JSONB := NULL;
        _record_id TEXT;
    BEGIN
        -- 1. Determine Action and Data States
        IF (TG_OP = 'DELETE') THEN
            _before := row_to_json(OLD)::jsonb;
            _record_id := OLD.id::text;
        ELSIF (TG_OP = 'INSERT') THEN
            _after := row_to_json(NEW)::jsonb;
            _record_id := NEW.id::text;
        ELSIF (TG_OP = 'UPDATE') THEN
            _before := row_to_json(OLD)::jsonb;
            _after := row_to_json(NEW)::jsonb;
            _record_id := NEW.id::text;
        END IF;

        -- 2. Insert into audit_logs
        INSERT INTO auditlog (
            id,
            model, 
            action, 
            "recordId", 
            before, 
            after, 
            metadata, 
            "performedAt"
        )
        VALUES (
            gen_random_uuid(),
            TG_TABLE_NAME, 
            TG_OP, 
            _record_id, 
            _before, 
            _after, 
            current_setting('app.current_user_metadata', true)::jsonb, -- Captures User/Role
            NOW()
        );

        IF (TG_OP = 'DELETE') THEN RETURN OLD; ELSE RETURN NEW; END IF;
    END;
    $$ LANGUAGE plpgsql;
`);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {};
