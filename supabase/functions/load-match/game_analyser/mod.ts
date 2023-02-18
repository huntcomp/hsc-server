import { ParsedAttributes } from "../attributes_parser/mod.ts";

export function analyseGame(attributes: ParsedAttributes, playedAs: string) {
  const game = {
    mmr: 0,
    bountyPickedUp: 0,
    bountyExtracted: 0,
    teamExtraction: false,
    avgMmr: 0,
    players: 0,
  };

  const showdowns: {
    profileid: string;
    name: string;
    mmr: number;
    killedByMe: number;
    killedMe: number;
    hadBounty: boolean;
  }[] = [];

  for (const team of attributes.teams) {
    for (const player of team.players) {
      game.avgMmr += player.mmr;
      game.players += 1;

      if (team.ownTeam) {
        game.bountyExtracted += player.bountyExtracted;
        game.bountyPickedUp += player.bountyPickedUp;
      }

      if (player.name === playedAs) {
        game.mmr = player.mmr;
        game.teamExtraction = player.teamExtraction;
      }

      const isShowdown = player.killedMe + player.killedByMe + player.downedMe +
          player.downedByMe > 0;
      if (isShowdown) {
        showdowns.push({
          name: player.name,
          profileid: player.profileid,
          mmr: player.mmr,
          killedByMe: player.killedByMe + player.downedByMe,
          killedMe: player.killedMe + player.downedMe,
          hadBounty: player.hadBounty,
        });
      }
    }
  }

  game.avgMmr = Math.round(game.avgMmr / game.players);

  return { game, showdowns };
}
