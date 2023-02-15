import { serve } from "https://deno.land/std@0.176.0/http/server.ts";
import { TextLineStream } from "https://deno.land/std@0.176.0/streams/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { AttributesParser } from "./attributes_parser/mod.ts";

/*
  Whole file is just a prototype,
  please do not judge!

  FIXME: Benny, refactor everything.
  Benny: What do you mean "everything"?
  EVERYTHING!
*/

serve(async (req) => {
  if (req.headers.get("Authorization") == null) {
    throw new Error("Requires authorization");
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    },
  );

  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (user == null) {
    throw new Error("Requires authorization");
  }

  const playedAs = req.headers.get("X-Played-As");

  if (playedAs == null) {
    throw new Error("Incorrect payload");
  }

  console.log(`Logged as ${user.email} and played as ${playedAs}`);

  const parser = new AttributesParser();

  if (req.body) {
    const f = req.body.pipeThrough(new TextDecoderStream()).pipeThrough(
      new TextLineStream(),
    );

    for await (const l of f) {
      parser.parseLine(l);
    }
  }

  const data = parser.finalize();

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
    user_id: user.id,
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
    for (let i = 0; i < +t.numPlayers; i++) {
      const p = t.players[i];
      game.avg_mmr += p.mmr;
      players += 1;

      if (t.ownTeam) {
        game.bounty_extracted += p.bountyExtracted;
        game.bounty_picked_up += p.bountyPickedUp;
      }

      if (p.bloodLineName === playedAs) {
        game.mmr = p.mmr;
        game.team_extraction = p.teamExtraction;
      }

      if (
        p.killedMe + p.killedByMe + p.downedMe + p.downedByMe > 0
      ) {
        showdowns.push({
          name: p.bloodLineName,
          profileid: p.profileid,
          mmr: p.mmr,
          killed_by_me: p.killedByMe + p.downedByMe,
          killed_me: p.killedMe + p.downedMe,
          had_bounty: p.hadBounty,
        });
      }
    }
  }

  game.avg_mmr = Math.round(game.avg_mmr / players);

  const g = await supabaseClient.from("games").insert(game).select("id")
    .maybeSingle().then((_) => _.data?.id);

  await supabaseClient.from("showdowns").insert(
    showdowns.map((_) =>
      Object.assign({
        user_id: user.id,
        game_id: g,
        created_at,
      }, _)
    ),
  );

  return new Response(JSON.stringify({ game, showdowns }), {
    headers: { "Content-Type": "application/json" },
  });
});
