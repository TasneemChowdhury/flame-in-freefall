# flame-in-freefall

A web-based, SI-powered dashboard for exploring NASA combustion research.

## Technology Stack

- Frontend: React, JavaScript, CSS
- Backend: Node.js, Express.js
- Database: Supabase PostgreSQL

## Supabase Setup

1. Create a Supabase project and copy its project URL and server-side secret key from **Project Settings → API Keys**. Use the `service_role` key if your project only shows legacy API keys.
2. In Supabase **SQL Editor**, run these files in order:
   - `database/schema.sql`
   - `database/saffire_sample1_metadata.sql`
   - `database/saffire_sensor_readings.sql`
3. Copy `.env.example` to `server/.env` and fill in `SUPABASE_URL` and `SUPABASE_SECRET_KEY`. The secret key is server-only; never put it in the frontend or commit `server/.env`.
4. Install and start the backend, then import the sample sensor readings:

   ```bash
   cd server
   npm install
   npm run db:import-sensors
   npm run dev
   ```

   The importer loads the 20,000 rows from `database/saffire_sample1_core.csv` through Supabase's HTTPS API. It is safe to rerun; existing `(source_file, record_index)` rows are skipped.

The tables have row-level security enabled. The backend uses the secret key server-side to access them through Supabase's HTTPS API.

The backend runs at <http://localhost:5001>. Verify the database connection at <http://localhost:5001/api/db-test>.

## Frontend Setup

In a separate terminal:

```bash
cd client
npm install
npm run dev
```

## Team

- Tasneem Sultana Chowdhury
- Sara Loudagh

Developed as part of the NASA Space Apps Challenge.
