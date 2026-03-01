export const getPagination = (query: any) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 10, 1);

  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const buildFilter = (
  query: any,
  options?: {
    exact?: string[];
    boolean?: string[];
    searchFields?: string[];
    range?: string[];
  },
) => {
  const filter: any = {};

  const {
    exact = [],
    boolean = [],
    searchFields = [],
    range = [],
  } = options || {};

  const excludedFields = ["page", "limit", "sort", "search"];

  const queryObj = { ...query };

  excludedFields.forEach((field) => delete queryObj[field]);

  // EXACT MATCH
  exact.forEach((field) => {
    if (query[field] !== undefined) {
      filter[field] = query[field];
    }
  });

  // BOOLEAN
  boolean.forEach((field) => {
    if (query[field] !== undefined) {
      filter[field] = query[field] === "true";
    }
  });

  // RANGE FILTER
  range.forEach((field) => {
    if (query[`${field}Min`] || query[`${field}Max`]) {
      filter[field] = {};

      if (query[`${field}Min`]) {
        filter[field].$gte = Number(query[`${field}Min`]);
      }

      if (query[`${field}Max`]) {
        filter[field].$lte = Number(query[`${field}Max`]);
      }
    }
  });

  // SEARCH
  if (query.search && searchFields.length > 0) {
    filter.$or = searchFields.map((field) => ({
      [field]: { $regex: query.search, $options: "i" },
    }));
  }

  return filter;
};
