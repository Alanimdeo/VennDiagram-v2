"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const discord_js_1 = require("discord.js");
class Player {
    constructor() {
        this.queue = new discord_js_1.Collection();
    }
}
exports.Player = Player;
