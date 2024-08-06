"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = exports.Bot = void 0;
const discord_js_1 = require("discord.js");
const player_1 = require("./modules/player");
const ytdl_core_1 = __importDefault(require("@distube/ytdl-core"));
class Bot extends discord_js_1.Client {
    constructor(clientOptions, cookies) {
        super(clientOptions);
        this.player = new player_1.Player();
        this.commands = new discord_js_1.Collection();
        this.adminCommands = new discord_js_1.Collection();
        this.consoleCommands = new discord_js_1.Collection();
        this.lastInteraction = null;
        this.ytdlAgent = ytdl_core_1.default.createAgent(cookies);
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
