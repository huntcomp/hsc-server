import {
  assertArrayIncludes,
  assertEquals,
} from "https://deno.land/std@0.177.0/testing/asserts.ts";
import {
  dirname,
  fromFileUrl,
  resolve,
} from "https://deno.land/std@0.177.0/path/mod.ts";
import { AttributesParser } from "./mod.ts";

Deno.test("attributes_parser (sample_1) test", async (t) => {
  const sample = await Deno.readTextFile(
    resolve(dirname(fromFileUrl(Deno.mainModule)), "./attributes_sample_1.xml"),
  );

  const parser = new AttributesParser();
  for (const l of sample.split("\n")) {
    parser.parseLine(l);
  }
  const data = parser.finalize();

  await t.step({
    name: "has correct mode",
    fn: () => {
      assertEquals(data.mode, "bounty");
    },
  });

  await t.step({
    name: "has correct number of teams",
    fn: () => {
      assertEquals(data.teams.length, 6);
    },
  });

  await t.step({
    name: "each team has 2 players",
    fn: () => {
      data.teams.forEach((_) => {
        assertEquals(_.players.length, 2);
        assertEquals(_.numPlayers, 2);
      });
    },
  });

  await t.step({
    name: "parses properly",
    fn: () => {
      assertArrayIncludes(data.teams, [
        {
          "players": [
            {
              "name": "FUCKING NOOT NOOT",
              "bountyExtracted": 0,
              "bountyPickedUp": 0,
              "downedByMe": 0,
              "downedMe": 0,
              "hadBounty": true,
              "killedByMe": 0,
              "killedMe": 0,
              "profileid": "77309440243",
              "skillBased": true,
              "teamExtraction": false,
              "mmr": 2743,
            },
            {
              "name": "Aaskereia",
              "bountyExtracted": 0,
              "bountyPickedUp": 0,
              "downedByMe": 0,
              "downedMe": 0,
              "hadBounty": false,
              "killedByMe": 0,
              "killedMe": 0,
              "profileid": "60129592754",
              "skillBased": true,
              "teamExtraction": false,
              "mmr": 2860,
            },
          ],
          "isInvite": true,
          "mmr": 2756,
          "numPlayers": 2,
          "ownTeam": false,
        },
        {
          "players": [
            {
              "name": "0x4721",
              "bountyExtracted": 2,
              "bountyPickedUp": 2,
              "downedByMe": 0,
              "downedMe": 0,
              "hadBounty": false,
              "killedByMe": 0,
              "killedMe": 0,
              "profileid": "68719525278",
              "skillBased": true,
              "teamExtraction": true,
              "mmr": 2879,
            },
            {
              "name": "Chlebeg",
              "bountyExtracted": 2,
              "bountyPickedUp": 2,
              "downedByMe": 0,
              "downedMe": 0,
              "hadBounty": false,
              "killedByMe": 0,
              "killedMe": 0,
              "profileid": "30064910039",
              "skillBased": true,
              "teamExtraction": true,
              "mmr": 2821,
            },
          ],
          "isInvite": true,
          "mmr": 2801,
          "numPlayers": 2,
          "ownTeam": true,
        },
        {
          "players": [
            {
              "name": "Crow511",
              "bountyExtracted": 0,
              "bountyPickedUp": 0,
              "downedByMe": 0,
              "downedMe": 0,
              "hadBounty": false,
              "killedByMe": 0,
              "killedMe": 0,
              "profileid": "77309418068",
              "skillBased": true,
              "teamExtraction": false,
              "mmr": 2822,
            },
            {
              "name": "JokerTowelie",
              "bountyExtracted": 0,
              "bountyPickedUp": 0,
              "downedByMe": 0,
              "downedMe": 0,
              "hadBounty": false,
              "killedByMe": 0,
              "killedMe": 0,
              "profileid": "25769834677",
              "skillBased": true,
              "teamExtraction": false,
              "mmr": 2805,
            },
          ],
          "isInvite": true,
          "mmr": 2763,
          "numPlayers": 2,
          "ownTeam": false,
        },
        {
          "players": [
            {
              "name": "Henker",
              "bountyExtracted": 0,
              "bountyPickedUp": 0,
              "downedByMe": 0,
              "downedMe": 0,
              "hadBounty": false,
              "killedByMe": 0,
              "killedMe": 0,
              "profileid": "47244653346",
              "skillBased": true,
              "teamExtraction": false,
              "mmr": 2767,
            },
            {
              "name": "Sir Rührgerät Maximale Stufe",
              "bountyExtracted": 0,
              "bountyPickedUp": 0,
              "downedByMe": 0,
              "downedMe": 0,
              "hadBounty": false,
              "killedByMe": 0,
              "killedMe": 0,
              "profileid": "60129587738",
              "skillBased": true,
              "teamExtraction": false,
              "mmr": 2874,
            },
          ],
          "isInvite": true,
          "mmr": 2775,
          "numPlayers": 2,
          "ownTeam": false,
        },
        {
          "players": [
            {
              "name": "Filip",
              "bountyExtracted": 0,
              "bountyPickedUp": 1,
              "downedByMe": 0,
              "downedMe": 0,
              "hadBounty": false,
              "killedByMe": 0,
              "killedMe": 0,
              "profileid": "51539629994",
              "skillBased": false,
              "teamExtraction": false,
              "mmr": 2819,
            },
            {
              "name": "O_Cadela",
              "bountyExtracted": 0,
              "bountyPickedUp": 1,
              "downedByMe": 0,
              "downedMe": 0,
              "hadBounty": false,
              "killedByMe": 0,
              "killedMe": 0,
              "profileid": "68719575001",
              "skillBased": false,
              "teamExtraction": false,
              "mmr": 2871,
            },
          ],
          "isInvite": true,
          "mmr": 2796,
          "numPlayers": 2,
          "ownTeam": false,
        },
        {
          "players": [
            {
              "name": "Ripakosss",
              "bountyExtracted": 0,
              "bountyPickedUp": 1,
              "downedByMe": 0,
              "downedMe": 0,
              "hadBounty": false,
              "killedByMe": 0,
              "killedMe": 0,
              "profileid": "55834812714",
              "skillBased": false,
              "teamExtraction": false,
              "mmr": 2772,
            },
            {
              "name": "Aggeloukos",
              "bountyExtracted": 0,
              "bountyPickedUp": 1,
              "downedByMe": 0,
              "downedMe": 0,
              "hadBounty": false,
              "killedByMe": 0,
              "killedMe": 0,
              "profileid": "73014465840",
              "skillBased": false,
              "teamExtraction": false,
              "mmr": 2920,
            },
          ],
          "isInvite": true,
          "mmr": 2804,
          "numPlayers": 2,
          "ownTeam": false,
        },
      ]);
    },
  });
});
