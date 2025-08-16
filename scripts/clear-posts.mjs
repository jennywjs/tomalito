import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error("Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false } });

async function main() {
  const { error } = await supabase.from("posts").delete().not("id", "is", null);
  if (error) {
    console.error("Failed to delete posts:", error.message);
    process.exit(1);
  }
  console.log("All posts deleted.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}); 