#!/usr/bin/env node
/**
 * Diagnose: do we have a draft of singleton-homePage that's overriding the
 * published doc? List both and show their hero/about fields.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", ".env.local");

function loadEnv() {
  const env = {};
  const raw = readFileSync(envPath, "utf-8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!m) continue;
    let [, key, val] = m;
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    env[key] = val;
  }
  return env;
}

const env = loadEnv();
const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = env.SANITY_API_READ_TOKEN;

const query = encodeURIComponent(
  '*[_id in ["singleton-homePage","drafts.singleton-homePage"]]{_id,heroLabel,heroTitle,aboutLabel,aboutHeading,_updatedAt}'
);
const url = `https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${query}`;

const res = await fetch(url, {
  headers: { Authorization: `Bearer ${token}` },
});
const json = await res.json();
console.log(JSON.stringify(json.result, null, 2));
