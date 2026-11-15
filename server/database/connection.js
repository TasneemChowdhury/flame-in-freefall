const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl) {
  throw new Error("SUPABASE_URL is required. Add it to server/.env.");
}

if (!supabaseSecretKey) {
  throw new Error("SUPABASE_SECRET_KEY is required. Add it to server/.env.");
}

module.exports = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
