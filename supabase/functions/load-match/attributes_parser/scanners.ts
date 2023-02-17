export class PassException extends Error {}

export function scanAttribute(s: string) {
  const name = /name="([^"]*)"/.exec(s);
  const value = /value="([^"]*)"/.exec(s);

  if (name?.[1] != null && value?.[1] != null) {
    return { name: name[1], value: value[1] };
  }

  throw new Error("AttributeScanner: RegExp fail");
}

export function scanMissionBagPlayerAttributeName(s: string) {
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

export function scanMissionBagTeamAttributeName(s: string) {
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
