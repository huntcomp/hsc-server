import { serve } from "https://deno.land/std@0.176.0/http/server.ts";
import { TextLineStream } from "https://deno.land/std@0.176.0/streams/mod.ts";

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
  const pathArray = path.split('.');
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

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
});
