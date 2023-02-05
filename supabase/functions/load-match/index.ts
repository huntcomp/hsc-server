import { serve } from "https://deno.land/std@0.176.0/http/server.ts";
import { TextLineStream } from "https://deno.land/std@0.176.0/streams/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/*
  Whole file is just a prototype,
  please do not judge!

  FIXME: Benny, refactor everything.
  Benny: What do you mean "everything"?
  EVERYTHING!
*/

const nre = new RegExp('(?<=name=")[^"]*');
const vre = new RegExp('(?<=value=")[^"]*');
const pre = new RegExp("(?<=MissionBagPlayer_)([^_]*)_([^_]*)_(.*)");
const tre = new RegExp("(?<=MissionBagTeam_)([^_]*)_(.*)");

function parseAttr(s: string) {
  const name = nre.exec(s);
  const value = vre.exec(s);
  if (name?.[0] != null && value?.[0] != null) {
    return { name: name[0], value: value[0] };
  }
}

function setValue(obj: any, path: string, value: any) {
  const pathArray = path.split(".");
  let current: any = obj;

  for (let i = 0; i < pathArray.length - 1; i++) {
    const key = pathArray[i];
    if (!current[key]) {
      current[key] = isNaN(Number(pathArray[i + 1])) ? {} : [];
    }
    current = current[key];
  }

  current[pathArray[pathArray.length - 1]] = value;
  return obj;
}

serve(async (req) => {
  const user = req.headers.get("X-User");
  const playedAs = req.headers.get("X-Played-As");

  if (user == null || playedAs == null) {
    throw new Error("Incorrect payload");
  }

  const data: {
    numTeams: number;
    isQuickplay: boolean;
    teams: any[];
  } = {
    teams: [],
    isQuickplay: false,
    numTeams: 0,
  };

  if (req.body) {
    const f = req.body.pipeThrough(new TextDecoderStream()).pipeThrough(
      new TextLineStream(),
    );

    for await (const l of f) {
      if (typeof l === "string" && l.includes("MissionBagPlayer_")) {
        const v = parseAttr(l);
        if (v != null) {
          const m = pre.exec(v.name);
          if (m?.length === 4) {
            const [_, team, player, stat] = m;
            setValue(data.teams, `${team}.players.${player}.${stat}`, v.value);
          }
        }
      }

      if (typeof l === "string" && l.includes("MissionBagTeam_")) {
        const v = parseAttr(l);
        if (v != null) {
          if (v != null) {
            const m = tre.exec(v.name);
            if (m?.length === 3) {
              const [_, team, stat] = m;
              setValue(data.teams, `${team}.${stat}`, v.value);
            }
          }
        }
      }

      if (typeof l === "string" && l.includes("MissionBagNumTeams")) {
        const v = parseAttr(l);
        if (v != null) {
          data.numTeams = +v.value;
        }
      }

      if (typeof l === "string" && l.includes("MissionBagIsQuickPlay")) {
        const v = parseAttr(l);
        if (v != null) {
          data.isQuickplay = v.value === "true";
        }
      }
    }
  }

  data.teams.splice(data.numTeams);

  const created_at = new Date().toISOString();

  const game: {
    mmr: number;
    bounty_picked_up: number;
    bounty_extracted: number;
    team_extraction: boolean;
    avg_mmr: number;
    user_id: string;
    created_at: string;
  } = {
    mmr: 0,
    bounty_picked_up: 0,
    bounty_extracted: 0,
    team_extraction: false,
    avg_mmr: 0,
    user_id: user,
    created_at,
  };

  const showdowns: {
    profileid: string;
    name: string;
    mmr: number;
    killed_by_me: number;
    killed_me: number;
    had_bounty: boolean;
  }[] = [];

  let players = 0;

  for (const t of data.teams) {
    for (const p of t.players) {
      game.avg_mmr += +p.mmr;
      players += 1;

      if (t.ownteam === "true") {
        game.bounty_extracted += +p.bountyextracted;
        game.bounty_picked_up += +p.bountypickedup;
      }

      if (p.blood_line_name === playedAs) {
        game.mmr = +p.mmr;
        game.team_extraction = p.teamextraction === "true";
      }

      if (
        p.killedme != "0" || p.killedbyme != "0" || p.downedme != "0" ||
        p.downedbyme != "0"
      ) {
        showdowns.push({
          name: p.blood_line_name,
          profileid: p.profileid,
          mmr: +p.mmr,
          killed_by_me: +p.killedbyme + +p.downedbyme,
          killed_me: +p.killedme + +p.downedme,
          had_bounty: p.hadbounty === "true",
        });
      }
    }
  }

  game.avg_mmr = Math.round(game.avg_mmr / players);

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    },
  );

  const g = await supabaseClient.from("games").insert(game).select("id")
    .maybeSingle().then((_) => _.data?.id);

  await supabaseClient.from("showdowns").insert(
    showdowns.map((_) =>
      Object.assign({
        user_id: user,
        game_id: g,
        created_at,
      }, _)
    ),
  ).then(console.log);

  return new Response(JSON.stringify({ game, showdowns }), {
    headers: { "Content-Type": "application/json" },
  });
});
