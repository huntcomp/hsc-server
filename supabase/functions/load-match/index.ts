import { serve } from "https://deno.land/std@0.176.0/http/server.ts";
import { TextLineStream } from "https://deno.land/std@0.176.0/streams/mod.ts";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { AttributesParser } from "./attributes_parser/mod.ts";
import { authenticate } from "./authenticate.ts";
import {
  BadRequestException,
  ConflictException,
  ResponseException,
} from "./errors.ts";
import { analyseGame } from "./game_analyser/mod.ts";
import { createJSONResponse } from "./utils.ts";

serve(async (req) => {
  try {
    const { user, supabaseClient } = await authenticate(req);
    const playedAs = getPlayedAs(req);
    console.info(`Authenticated as ${user.email} and played as ${playedAs}`);

    const attributes = await parseAttributesFileFromBody(req);
    await validateDuplicatedGame(attributes.signature, supabaseClient);

    const { game, showdowns } = analyseGame(attributes, playedAs);

    const timestamp = new Date().toISOString();
    const gameId = await supabaseClient
      .from("games")
      .insert({
        created_at: timestamp,
        bounty_picked_up: game.bountyPickedUp,
        bounty_extracted: game.bountyExtracted,
        mmr: game.mmr,
        team_extraction: game.teamExtraction,
        user_id: user.id,
        avg_mmr: game.avgMmr,
        signature: attributes.signature,
      })
      .select("id")
      .maybeSingle()
      .then((_) => _.data?.id);

    await supabaseClient.from("showdowns").insert(
      showdowns.map((_) => ({
        created_at: timestamp,
        profileid: _.profileid,
        name: _.name,
        mmr: _.mmr,
        killed_by_me: _.killedByMe,
        killed_me: _.killedMe,
        game_id: gameId,
        user_id: user.id,
        had_bounty: _.hadBounty,
      })),
    );

    return createJSONResponse({
      game,
      showdowns,
      signature: attributes.signature,
    });
  } catch (e) {
    if (e instanceof ResponseException) {
      return createJSONResponse({
        message: e.message,
      }, e.status);
    } else {
      console.error(e);
      return createJSONResponse({ message: "Internal server error" }, 500);
    }
  }
});

function getPlayedAs(req: Request) {
  const playedAs = req.headers.get("X-Played-As");

  if (playedAs == null) {
    throw new BadRequestException("Request is missing `X-Played-As` header");
  }

  return playedAs;
}

async function parseAttributesFileFromBody(req: Request) {
  if (req.body == null) {
    throw new BadRequestException(
      "Request is missing body (valid attributes.xml file)",
    );
  }

  try {
    const parser = new AttributesParser();
    for await (
      const l of req.body
        .pipeThrough(new TextDecoderStream())
        .pipeThrough(new TextLineStream())
    ) {
      parser.parseLine(l);
    }

    return parser.finalize();
  } catch (e) {
    throw new BadRequestException(
      e.message ?? e,
    );
  }
}

async function validateDuplicatedGame(
  signature: string,
  supabaseClient: SupabaseClient,
) {
  const response = await supabaseClient.from("games").select("id", {
    head: true,
    count: "exact",
  }).filter(
    "signature",
    "eq",
    signature,
  );
  if (response.count != null && response.count > 0) {
    throw new ConflictException("Game was already registered");
  }
}
