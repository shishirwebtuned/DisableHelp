export const getPagination = (query) => {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.max(Number(query.limit) || 10, 1);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};
export const buildFilter = (query, searchFields = []) => {
    const filter = {};
    if (query.role)
        filter.role = query.role;
    if (query.approved !== undefined) {
        filter.approved = query.approved === "true";
    }
    if (query.search && searchFields.length > 0) {
        filter.$or = searchFields.map((field) => ({
            [field]: { $regex: query.search, $options: "i" },
        }));
    }
    return filter;
};
//# sourceMappingURL=queryHelper.js.map