import { Collection } from "discord.js";
import { Queue } from "../modules/queue";

export class Player {
    queue: Collection<string, Queue>;

    constructor() {
        this.queue = new Collection<string, Queue>();
    }
}
