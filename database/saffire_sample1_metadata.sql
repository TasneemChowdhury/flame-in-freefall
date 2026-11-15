-- Run after schema.sql. Adds only verified SAFFIRE-I Sample 1 metadata.

BEGIN;

INSERT INTO public.investigations (
    title,
    description
)
SELECT
    'SAFFIRE-I',
    'Studies low-gravity large-scale fire growth and whether the fire reaches a steady-state spread rate.'
WHERE NOT EXISTS (
    SELECT 1
    FROM public.investigations
    WHERE title = 'SAFFIRE-I'
);

WITH investigation AS (
    SELECT id
    FROM public.investigations
    WHERE title = 'SAFFIRE-I'
    ORDER BY id
    LIMIT 1
)
INSERT INTO public.experiments (
    investigation_id,
    title,
    description,
    experiment_date,
    source_url,
    metadata
)
SELECT
    investigation.id,
    'SAFFIRE-I Sample 1',
    'Sample 1 test using SIBAL cloth (75% cotton and 25% fiberglass by weight). The documented nominal airflow velocity is 20 cm/s.',
    NULL,
    NULL,
    jsonb_build_object(
        'sample_number', 1,
        'fuel', jsonb_build_object(
            'type', 'solid',
            'material', 'SIBAL cloth',
            'composition_by_weight', jsonb_build_object(
                'cotton_percent', 75,
                'fiberglass_percent', 25
            ),
            'shape', NULL,
            'dimensions', NULL
        ),
        'environment', jsonb_build_object(
            'gravity', 'low gravity',
            'nominal_airflow_cm_s', 20,
            'oxygen_percent', NULL,
            'pressure_psi', NULL
        ),
        'source_document', 'SAFFIRE-I and SAFFIRE-III DoD.docx',
        'unknowns_note', 'Null values were not specified in the reviewed source document.'
    )
FROM investigation
WHERE NOT EXISTS (
      SELECT 1
      FROM public.experiments AS existing
      WHERE existing.investigation_id = investigation.id
        AND existing.title = 'SAFFIRE-I Sample 1'
  );

COMMIT;

SELECT
    i.id AS investigation_id,
    e.id AS experiment_id,
    i.title AS investigation,
    e.title AS experiment
FROM public.investigations AS i
JOIN public.experiments AS e ON e.investigation_id = i.id
WHERE i.title = 'SAFFIRE-I'
  AND e.title = 'SAFFIRE-I Sample 1';
