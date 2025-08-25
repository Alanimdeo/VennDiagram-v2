"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = exports.Bot = void 0;
const discord_js_1 = require("discord.js");
class Bot extends discord_js_1.Client {
    constructor(clientOptions, manager) {
        super(clientOptions);
        this.commands = new discord_js_1.Collection();
        this.adminCommands = new discord_js_1.Collection();
        this.consoleCommands = new discord_js_1.Collection();
        this.lastInteraction = null;
        this.manager = manager;
        this.players = new discord_js_1.Collection();
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
