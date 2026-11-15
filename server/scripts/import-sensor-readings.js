const path = require("node:path");
const { createReadStream } = require("node:fs");
const { parse } = require("csv-parse");

require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

const db = require("../database/connection");

const csvPath = path.resolve(
  __dirname,
  "..",
  "..",
  "database",
  "saffire_sample1_core.csv"
);
const batchSize = 500;
const csvColumns = [
  "sample_number",
  "source_file",
  "elapsed_time_s",
  "epoch_time_ms",
  "record_index",
  "fan_speed_rpm",
  "co2_percent",
  "o2_percent",
  "anemometer_1_cm_s",
  "anemometer_2_cm_s",
  "ambient_pressure_psia",
  "radiometer_1_mw_cm2",
  "radiometer_2_mw_cm2",
  "radiometer_3_mw_cm2",
  "radiometer_4_mw_cm2",
  "downstream_front_mw_cm2",
  "upstream_front_mw_cm2",
  "upstream_back_mw_cm2",
  "downstream_back_mw_cm2",
  "humidity_percent",
  "test_section_inlet_temp_c",
  "igniter_current_a",
  "igniter_voltage_v",
  "igniter_power_enable",
  "plume_temp_1_c",
  "sample_temp_1_c",
  "plume_temp_2_c",
  "sample_temp_2_c",
  "plume_temp_3_c",
  "sample_temp_3_c",
  "plume_temp_4_c",
  "sample_temp_4_c",
  "plume_temp_5_c",
  "sample_temp_5_c",
  "plume_temp_6_c",
  "sample_temp_6_c",
];

function createParser() {
  return parse({
    bom: true,
    columns: (headers) => {
      const matchesExpectedColumns =
        headers.length === csvColumns.length &&
        headers.every((header, index) => header === csvColumns[index]);

      if (!matchesExpectedColumns) {
        throw new Error("Sensor CSV headers do not match the expected format.");
      }

      return headers;
    },
    skip_empty_lines: true,
  });
}

function toSensorRow(reading, experimentId) {
  const row = { experiment_id: experimentId };

  for (const column of csvColumns) {
    if (column === "source_file") {
      row[column] = reading[column];
    } else if (reading[column] === "") {
      row[column] = null;
    } else {
      const value = Number(reading[column]);
      if (!Number.isFinite(value)) {
        throw new Error(`Invalid numeric value in CSV column "${column}".`);
      }
      row[column] = value;
    }
  }

  return row;
}

async function insertBatch(experimentId, readings) {
  const rows = readings.map((reading) => toSensorRow(reading, experimentId));
  const { data, error } = await db
    .from("sensor_readings")
    .upsert(rows, {
      onConflict: "source_file,record_index",
      ignoreDuplicates: true,
    })
    .select("reading_id");

  if (error) {
    throw error;
  }

  return data.length;
}

async function main() {
  const { data: experiment, error } = await db
    .from("experiments")
    .select("id")
    .eq("title", "SAFFIRE-I Sample 1")
    .order("id")
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!experiment) {
    throw new Error(
      "SAFFIRE-I Sample 1 was not found. Run schema.sql and saffire_sample1_metadata.sql first."
    );
  }

  const parser = createReadStream(csvPath).pipe(createParser());
  let batch = [];
  let processedRows = 0;
  let insertedRows = 0;

  for await (const reading of parser) {
    batch.push(reading);

    if (batch.length === batchSize) {
      insertedRows += await insertBatch(experiment.id, batch);
      processedRows += batch.length;
      batch = [];
    }
  }

  if (batch.length > 0) {
    insertedRows += await insertBatch(experiment.id, batch);
    processedRows += batch.length;
  }

  console.log(
    `Processed ${processedRows} sensor readings; inserted ${insertedRows} new rows.`
  );
}

main().catch((error) => {
  console.error("Sensor import failed:", error);
  process.exitCode = 1;
});
