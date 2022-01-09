"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = exports.Bot = void 0;
const discord_js_1 = require("discord.js");
const player_1 = require("./modules/player");
class Bot extends discord_js_1.Client {
    constructor(clientOptions) {
        super(clientOptions);
        this.player = new player_1.Player();
        this.commands = new discord_js_1.Collection();
        this.adminCommands = new discord_js_1.Collection();
    }
}
exports.Bot = Bot;
class Command {
    constructor(data, execute) {
        this.data = data;
        this.execute = execute;
    }
}
exports.Command = Command;
