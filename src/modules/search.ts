import ytsr from "ytsr";

export async function search(keyword: string, limit?: number): Promise<ytsr.Item[]> {
    return new Promise(async (resolve, reject) => {
        const filters = await ytsr.getFilters(keyword);
        const typeFilters = filters.get("Type");
        if (!typeFilters) return reject(new Error("resultNotFound"));
        const filter = typeFilters.get("Video");
        if (!filter || !filter.url) return reject(new Error("resultNotFound"));
        const searchResult = await ytsr(filter.url, { limit: limit ? limit : 5 });
        return resolve(searchResult.items);
    });
}
