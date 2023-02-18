const va = {
  number: (_: Record<string, string>, prop: string) => {
    if (_[prop] == null) {
      throw new Error(`Required number "${prop}" was undefined`);
    }
    const _n = +_[prop];
    if (Number.isNaN(_n)) {
      throw new Error(`Required number "${prop}" was not a number`);
    }
    return _n as number;
  },
  string: (_: Record<string, string>, prop: string) => {
    if (_[prop] == null) {
      throw new Error(`Required string "${prop}" was undefined`);
    } else if (typeof _[prop] === "string") {
      return _[prop] as string;
    }

    throw new Error(`Required string "${prop}" was not a string`);
  },
  boolean: (_: Record<string, string>, prop: string) => {
    if (_[prop] == null) {
      throw new Error(`Required boolean "${prop}" was undefined`);
    } else if (typeof _[prop] === "boolean") {
      return (_[prop] as unknown) as boolean;
    } else if (typeof _[prop] === "string") {
      if (_[prop] === "true") {
        return true;
      } else if (_[prop] === "false") {
        return false;
      }
      throw new Error(`Required boolean "${prop}" was not a boolean`);
    }

    throw new Error(`Required boolean "${prop}" was not a boolean`);
  },
};

export function PlayerSchema(_: Record<string, string>) {
  try {
    return {
      name: unescapeBloodLineName(va.string(_, "blood_line_name")),
      bountyExtracted: va.number(_, "bountyextracted"),
      bountyPickedUp: va.number(_, "bountypickedup"),
      downedByMe: va.number(_, "downedbyme"),
      downedMe: va.number(_, "downedme"),
      hadBounty: va.boolean(_, "hadbounty"),
      killedByMe: va.number(_, "killedbyme"),
      killedMe: va.number(_, "killedme"),
      profileid: va.string(_, "profileid"),
      skillBased: va.boolean(_, "skillbased"),
      teamExtraction: va.boolean(_, "teamextraction"),
      mmr: va.number(_, "mmr"),
    };
  } catch (e) {
    console.error({
      error: `PlayerSchema: ${e.message}`,
      record: JSON.stringify(_),
    });
    throw e;
  }
}

export type Player = ReturnType<typeof PlayerSchema>;

export function TeamSchema(_: Record<string, string>) {
  try {
    return {
      isInvite: va.boolean(_, "isinvite"),
      mmr: va.number(_, "mmr"),
      numPlayers: va.number(_, "numplayers"),
      ownTeam: va.boolean(_, "ownteam"),
    };
  } catch (e) {
    console.error({
      error: `TeamSchedaj mima: ${e.message}`,
      record: JSON.stringify(_),
    });
    throw e;
  }
}

export type Team = ReturnType<typeof TeamSchema>;

export function unescapeBloodLineName(s: string) {
  return s.replaceAll("&quot", '"')
    .replaceAll("&amp", "&")
    .replaceAll("&apos", "'")
    .replaceAll("&lt", "<")
    .replaceAll("&gt", ">");
}
