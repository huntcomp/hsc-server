import h from "https://deno.land/x/object_hash@2.0.3.1/mod.ts";
import { ParsedAttributes } from "./attributes_parser/mod.ts";

export function hash(a: ParsedAttributes) {
  /*
    Keys are explicitly stated to omit potential
    hash inequality in the future after
    non-breaking changes to the parser
  */
  return h({
    mode: a.mode,
    teams: a.teams.map((t) => ({
      numPlayers: t.numPlayers,
      isInvite: t.isInvite,
      mmr: t.mmr,
      ownTeam: t.ownTeam,
      players: t.players.map((p) => ({
        name: p.name,
        bountyExtracted: p.bountyExtracted,
        bountyPickedUp: p.bountyPickedUp,
        downedByMe: p.downedByMe,
        downedMe: p.downedMe,
        hadBounty: p.hadBounty,
        killedByMe: p.killedByMe,
        killedMe: p.killedMe,
        profileid: p.profileid,
        skillBased: p.skillBased,
        teamExtraction: p.teamExtraction,
        mmr: p.mmr,
      })),
    })),
  }, { unorderedArrays: true, unorderedObjects: true });
}
