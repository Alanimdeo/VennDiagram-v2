import ytsr from "ytsr";

const musicFilter = ["[mv]", "mv", "music video", "가사", "lyrics"];

export async function search(keyword: string, limit: number = 5): Promise<ytsr.Item[]> {
    return new Promise(async (resolve, reject) => {
        const filters = await ytsr.getFilters(keyword);
        const typeFilters = filters.get("Type");
        if (!typeFilters) return reject(new Error("resultNotFound"));
        const filter = typeFilters.get("Video");
        if (!filter || !filter.url) return reject(new Error("resultNotFound"));
        let searchResult = (await ytsr(filter.url, { hl: "ko", gl: "KR", limit: limit > 10 ? limit : 10 })).items;
        if (!searchResult || searchResult.length === 0) return reject(new Error("resultNotFound"));
        searchResult.sort((a, b) => {
            if (a.type !== "video" || b.type !== "video") return 0;
            const lowerA = a.title.toLowerCase();
            const lowerB = b.title.toLowerCase();
            const filterA = musicFilter.some((f) => lowerA.includes(f));
            const filterB = musicFilter.some((f) => lowerB.includes(f));
            if (filterA && !filterB) return -1;
            else if (filterA && filterB) return 0;
            else return 1;
        });
        return resolve(searchResult.slice(0, limit));
    });
}
