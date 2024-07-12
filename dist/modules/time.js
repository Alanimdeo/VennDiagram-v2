"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertSecondsToTime = convertSecondsToTime;
function convertSecondsToTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds / 60) % 60;
    const secondsLeft = seconds % 60;
    return `${hours > 0 ? `${hours}:` : ""}\
${hours > 0 && minutes < 10 ? String(minutes).padStart(2, "0") : minutes}:\
${String(secondsLeft).padStart(2, "0")}`;
}
