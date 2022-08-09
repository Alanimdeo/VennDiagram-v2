"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const types_1 = require("../types");
module.exports = new types_1.Command(new discord_js_1.SlashCommandBuilder().setName("clear").setDescription("콘솔 초기화"), async (message, bot) => {
    console.clear();
    return null;
});
