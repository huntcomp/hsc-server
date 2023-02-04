import { serve } from "https://deno.land/std@0.176.0/http/server.ts";
import { TextLineStream } from "https://deno.land/std@0.176.0/streams/mod.ts";

const nre = new RegExp('(?<=name=")[^"]*');
const vre = new RegExp('(?<=value=")[^"]*');

serve(async (req) => {
  const data: Record<string, string> = {};

  if (req.body) {
    const f = req.body.pipeThrough(new TextDecoderStream()).pipeThrough(
      new TextLineStream(),
    );
    for await (const l of f) {
      if (
        typeof l === "string" &&
        (l.includes("MissionBagPlayer_") || l.includes("MissionBagTeam_") ||
          l.includes("MissionBagNumTeams") ||
          l.includes("MissionBagNumEntries") ||
          l.includes("MissionBagIsQuickPlay") ||
          l.includes("MissionBagIsHunterDead"))
      ) {
        const name = nre.exec(l);
        const value = vre.exec(l);
        if (name?.[0] != null && value?.[0] != null) {
          data[name[0]] = value[0];
        }
      }
    }
  }

  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
});
