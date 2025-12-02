import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("--- DEBUG SUPABASE ENV ---");
console.log("URL:", supabaseUrl);
console.log("Key:", supabaseAnonKey ? "Found (Hidden)" : "Missing");
console.log("Available NEXT_PUBLIC keys:", Object.keys(process.env).filter(k => k.startsWith("NEXT_PUBLIC")));
console.log("--------------------------");

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Missing Supabase environment variables. Supabase client will not be initialized correctly.");
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder"
);
