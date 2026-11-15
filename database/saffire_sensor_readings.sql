USE flame_in_freefall;

CREATE TABLE IF NOT EXISTS sensor_readings (
    reading_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    experiment_id BIGINT UNSIGNED NULL,
    sample_number TINYINT UNSIGNED NOT NULL,
    source_file VARCHAR(255) NOT NULL,
    record_index INT UNSIGNED NOT NULL,
    elapsed_time_s DOUBLE NOT NULL,
    epoch_time_ms BIGINT UNSIGNED NOT NULL,
    fan_speed_rpm DOUBLE,
    co2_percent DOUBLE,
    o2_percent DOUBLE,
    anemometer_1_cm_s DOUBLE,
    anemometer_2_cm_s DOUBLE,
    ambient_pressure_psia DOUBLE,
    radiometer_1_mw_cm2 DOUBLE,
    radiometer_2_mw_cm2 DOUBLE,
    radiometer_3_mw_cm2 DOUBLE,
    radiometer_4_mw_cm2 DOUBLE,
    downstream_front_mw_cm2 DOUBLE,
    upstream_front_mw_cm2 DOUBLE,
    upstream_back_mw_cm2 DOUBLE,
    downstream_back_mw_cm2 DOUBLE,
    humidity_percent DOUBLE,
    test_section_inlet_temp_c DOUBLE,
    plume_temp_1_c DOUBLE,
    plume_temp_2_c DOUBLE,
    plume_temp_3_c DOUBLE,
    plume_temp_4_c DOUBLE,
    plume_temp_5_c DOUBLE,
    plume_temp_6_c DOUBLE,
    sample_temp_1_c DOUBLE,
    sample_temp_2_c DOUBLE,
    sample_temp_3_c DOUBLE,
    sample_temp_4_c DOUBLE,
    sample_temp_5_c DOUBLE,
    sample_temp_6_c DOUBLE,
    igniter_current_a DOUBLE,
    igniter_voltage_v DOUBLE,
    igniter_power_enable DOUBLE,

    CONSTRAINT uq_sensor_readings_source_record
        UNIQUE (source_file, record_index),
    CONSTRAINT fk_sensor_readings_experiment
        FOREIGN KEY (experiment_id)
        REFERENCES experiments(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    INDEX idx_sensor_readings_experiment_time (experiment_id, elapsed_time_s)
);
