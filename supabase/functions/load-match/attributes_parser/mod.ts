import { PlayerSchema, TeamSchema } from "./schema.ts";

export class AttributesParser {
  private data: {
    numTeams: number;
    mode: "quickplay" | "bounty";
    teams: {
      players: Record<string, string>[];
      stats: Record<string, string>;
    }[];
  } = {
    teams: [],
    mode: "bounty",
    numTeams: 0,
  };

  private lineCount = 1;
  private seal = false;

  parseLine(l: string) {
    if (this.seal) {
      throw new Error("Tried to parse next line on sealed AttributesParser");
    }

    const _l = l.trim();
    try {
      if (_l.includes("MissionBagPlayer_")) {
        this.parseMissionBagPlayer(_l);
      } else if (_l.includes("MissionBagTeam_")) {
        this.parseMissionBagTeam(_l);
      } else if (_l.includes("MissionBagNumTeams")) {
        this.parseMissionBagNumTeams(_l);
      } else if (_l.includes("MissionBagIsQuickPlay")) {
        this.parseMissionBagIsQuickPlay(_l);
      }
    } catch (e) {
      if (!(e instanceof PassException)) {
        console.error({ error: e.message, line: this.lineCount, content: _l });
      }
    }
    this.lineCount++;
  }

  finalize() {
    this.seal = true;

    return {
      mode: this.data.mode,
      teams: this.data.teams.slice(0, this.data.numTeams).map((t) => {
        const team = TeamSchema(t.stats);

        return ({
          players: t.players.slice(0, team.numPlayers).map(PlayerSchema),
          ...team,
        });
      }),
    };
  }

  private parseMissionBagPlayer(l: string) {
    const { name, value } = scanAttribute(l);
    const { teamidx, playeridx, stat } = scanMissionBagPlayerAttributeName(
      name,
    );
    if (this.data.numTeams != null && teamidx >= this.data.numTeams) {
      return;
    }
    if (
      this.data.teams[teamidx]?.stats?.numPlayers != null &&
      playeridx >= +this.data.teams[teamidx].stats?.numPlayers
    ) {
      return;
    }
    this.saveTeamsAttr(
      `${teamidx}.players.${playeridx}.${stat}`,
      value,
    );
  }

  private parseMissionBagTeam(l: string) {
    const { name, value } = scanAttribute(l);
    const { teamidx, stat } = scanMissionBagTeamAttributeName(name);
    if (this.data.numTeams != null && (teamidx) >= this.data.numTeams) {
      return;
    }
    this.saveTeamsAttr(`${teamidx}.stats.${stat}`, value);
  }

  private parseMissionBagNumTeams(l: string) {
    const { value } = scanAttribute(l);
    this.data.numTeams = +value;
    this.data.teams.splice(this.data.numTeams);
  }

  private parseMissionBagIsQuickPlay(l: string) {
    const { value } = scanAttribute(l);
    if (value === "true") {
      this.data.mode = "quickplay";
    }
  }

  private saveTeamsAttr(path: string, value: string) {
    const pathArray = path.split(".");
    // deno-lint-ignore no-explicit-any
    let current: any = this.data.teams;

    for (let i = 0; i < pathArray.length - 1; i++) {
      const key = pathArray[i];
      if (!current[key]) {
        current[key] = isNaN(Number(pathArray[i + 1])) ? {} : [];
      }
      current = current[key];
    }

    current[pathArray[pathArray.length - 1]] = value;
  }
}

class PassException extends Error {}

function scanAttribute(s: string) {
  const name = /name="([^"]*)"/.exec(s);
  const value = /value="([^"]*)"/.exec(s);

  if (name?.[1] != null && value?.[1] != null) {
    return { name: name[1], value: value[1] };
  }

  throw new Error("AttributeScanner: RegExp fail");
}

function scanMissionBagPlayerAttributeName(s: string) {
  const m = /(MissionBagPlayer_)(\d+)_(\d+)_(.*)/.exec(s);
  if (m?.length !== 5) {
    throw new Error("MissionBagPlayerAttributeNameScanner: RegExp fail");
  }
  const teamidx = +m[2];
  const playeridx = +m[3];
  if (Number.isNaN(teamidx) || Number.isNaN(playeridx)) {
    throw new Error(
      "MissionBagPlayerAttributeNameScanner: Cannot cast index to number",
    );
  }
  return {
    playeridx,
    teamidx,
    stat: m[4],
  };
}

function scanMissionBagTeamAttributeName(s: string) {
  const m = /(MissionBagTeam_)(\d+)_(.*)/.exec(s);

  if (m?.length !== 4) {
    if ((/MissionBagTeam_\d+/.exec(s) ?? []).length > 0) {
      throw new PassException();
    }
    throw new Error("MissionBagTeamAttributeNameScanner: RegExp fail");
  }
  const teamidx = +m[2];
  if (Number.isNaN(teamidx)) {
    throw new Error(
      "MissionBagTeamAttributeNameScanner: Cannot cast index to number",
    );
  }
  return {
    teamidx,
    stat: m[3],
  };
}
