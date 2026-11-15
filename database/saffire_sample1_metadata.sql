-- Run after schema.sql. Adds only verified SAFFIRE-I Sample 1 metadata.
USE flame_in_freefall;

START TRANSACTION;

INSERT INTO investigations (
    title,
    description
)
SELECT
    'SAFFIRE-I',
    'Studies low-gravity large-scale fire growth and whether the fire reaches a steady-state spread rate.'
WHERE NOT EXISTS (
    SELECT 1
    FROM investigations
    WHERE title = 'SAFFIRE-I'
);

SET @saffire_investigation_id = (
    SELECT id
    FROM investigations
    WHERE title = 'SAFFIRE-I'
    ORDER BY id
    LIMIT 1
);

INSERT INTO experiments (
    investigation_id,
    title,
    description,
    experiment_date,
    source_url,
    metadata
)
SELECT
    @saffire_investigation_id,
    'SAFFIRE-I Sample 1',
    'Sample 1 test using SIBAL cloth (75% cotton and 25% fiberglass by weight). The documented nominal airflow velocity is 20 cm/s.',
    NULL,
    NULL,
    JSON_OBJECT(
        'sample_number', 1,
        'fuel', JSON_OBJECT(
            'type', 'solid',
            'material', 'SIBAL cloth',
            'composition_by_weight', JSON_OBJECT(
                'cotton_percent', 75,
                'fiberglass_percent', 25
            ),
            'shape', NULL,
            'dimensions', NULL
        ),
        'environment', JSON_OBJECT(
            'gravity', 'low gravity',
            'nominal_airflow_cm_s', 20,
            'oxygen_percent', NULL,
            'pressure_psi', NULL
        ),
        'source_document', 'SAFFIRE-I and SAFFIRE-III DoD.docx',
        'unknowns_note', 'Null values were not specified in the reviewed source document.'
    )
WHERE @saffire_investigation_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM experiments
      WHERE investigation_id = @saffire_investigation_id
        AND title = 'SAFFIRE-I Sample 1'
  );

COMMIT;

SELECT
    i.id AS investigation_id,
    e.id AS experiment_id,
    i.title AS investigation,
    e.title AS experiment
FROM investigations AS i
JOIN experiments AS e ON e.investigation_id = i.id
WHERE i.title = 'SAFFIRE-I'
  AND e.title = 'SAFFIRE-I Sample 1';
