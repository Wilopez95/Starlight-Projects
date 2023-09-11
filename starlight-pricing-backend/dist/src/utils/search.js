"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSearchQuery = void 0;
const parseSearchQuery = (query) => {
    let searchQuery;
    let searchId;
    if (query) {
        if (Array.isArray(query)) {
            searchQuery = query.join(",");
        }
        searchQuery = query.toString().toLowerCase();
        // check query.length to prevent `is out of range for type integer` error from Postgres
        // when searching by phone number
        const id = searchQuery.length > 10 ? Number.NaN : Number.parseInt(searchQuery, 10);
        const isId = !Number.isNaN(id) && id > 0 && String(id) === searchQuery;
        if (isId) {
            searchId = id;
        }
    }
    return { searchQuery, searchId };
};
exports.parseSearchQuery = parseSearchQuery;
//# sourceMappingURL=search.js.map