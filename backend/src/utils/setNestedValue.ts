export function setNestedValue(obj: any, path: string[], value: any) {
  let current = obj as Record<string, any>;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (key && !current[key]) current[key] = {};
    if (key) current = current[key] as Record<string, any>;
  }
  const lastKey = path[path.length - 1];
  if (lastKey) current[lastKey] = value;
}