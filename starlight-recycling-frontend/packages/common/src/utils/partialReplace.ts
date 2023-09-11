export default function partialReplace(str: string, map: Record<string, string>) {
  for (const key in map) {
    str = str.replace(key, map[key]);
  }

  return str;
}
