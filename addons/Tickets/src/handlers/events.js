import { deleteTicketRecord } from '../services/database.service.js';
import { getLangString } from '../services/config.service.js';
import { logger } from '../utils/logger.js';
export function setupEventHandlers(client, lang) {
    client.on('channelDelete', async (channel) => {
        if (!('id' in channel))
            return;
        await deleteTicketRecord(channel.id);
        logger.info(getLangString(lang, 'ticketDeletedLog', 'Ticket channel deleted: {{channelId}}').replace('{{channelId}}', channel.id));
    });
}
//# sourceMappingURL=events.js.map