import h from "https://deno.land/x/object_hash@2.0.3.1/mod.ts";
import { ParsedAttributes } from "./attributes_parser/mod.ts";

export function hash(a: ParsedAttributes) {
  return h(a, { unorderedArrays: true, unorderedObjects: true });
}
