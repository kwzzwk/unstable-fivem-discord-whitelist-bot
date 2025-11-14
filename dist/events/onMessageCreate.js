"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onMessageCreate = void 0;
const database_handler_1 = require("../database-handler");
const onMessageCreate = async (message) => {
    if (message.author.bot)
        return;
    const [cb] = await database_handler_1.db.query('SELECT * FROM reactionchannels');
    if (!cb || cb.length === 0)
        return;
    for (const app of cb) {
        if (message.channelId === app.id) {
            try {
                await message.react(app.reaction1);
                await message.react(app.reaction2);
                if (app.thread) {
                    const thread = await message.startThread({
                        name: `Keskustelu: ${message.content.substring(0, 40)}`,
                        autoArchiveDuration: 60,
                        reason: 'Aloitettu botin toimesta!',
                    });
                }
            }
            catch (error) {
                console.error('Ongelma reaktio emojeiden luomisessa', error);
            }
        }
    }
};
exports.onMessageCreate = onMessageCreate;
