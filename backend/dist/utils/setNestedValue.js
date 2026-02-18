export function setNestedValue(obj, path, value) {
    let current = obj;
    for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (key && !current[key])
            current[key] = {};
        if (key)
            current = current[key];
    }
    const lastKey = path[path.length - 1];
    if (lastKey)
        current[lastKey] = value;
}
//# sourceMappingURL=setNestedValue.js.map