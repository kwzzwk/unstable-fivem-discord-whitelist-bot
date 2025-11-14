"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class config {
    /*---------------------------------------------------------------------------------*/
    /*TOKENS / IDS*/
    /*---------------------------------------------------------------------------------*/
    static TOKEN = process.env.token || '';
    static TRANSCRIPT = process.env.transcript || '';
    static REACTIONROLE = process.env.reactionrole || '';
    static VOTING = process.env.voting || '';
    static ARCHIVES = process.env.archives || '';
    static APPROVAL = process.env.approval || '';
    static LOGS = process.env.logs || '';
    static COMMANDS = process.env.commands || '';
    static GUILD = process.env.guild || '';
    static WLROLE = process.env.wlrole || '';
    static TICKETOPEN = process.env.ticketopen || '';
    static TICKETCLOSE = process.env.ticketclose || '';
    static STAFFROLE = process.env.staffrole || '';
    static WELCOMECHANNEL = process.env.welcomechannel || '';
    static PRIOROLE = process.env.priorole || '';
    static WHITELISTROLE = process.env.whitelistrole || '';
    /*---------------------------------------------------------------------------------*/
    /*NUMBER VALUES*/
    /*---------------------------------------------------------------------------------*/
    static VOTELIMIT = 1;
}
exports.config = config;
