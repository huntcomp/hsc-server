import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { UnauthorizedException } from "./errors.ts";

export async function authenticate(req: Request) {
  const Authorization = req.headers.get("Authorization");

  if (Authorization == null) {
    throw new UnauthorizedException();
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: { headers: { Authorization } },
    },
  );

  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (user == null) {
    throw new UnauthorizedException();
  }

  return { supabaseClient, user };
}
