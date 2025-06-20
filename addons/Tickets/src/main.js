import { EmbedBuilder } from 'discord.js';
import { loadConfig } from './services/config.service.js';
import { logger } from './utils/logger.js';
import { getTicketSelectMenuRow } from './utils/components.js';
import { isEmbedEnabled } from './utils/embed.js';
import { buildMessageContent } from './utils/formatting.js';
import { setupInteractionHandlers } from './handlers/interactions.js';
import { setupEventHandlers } from './handlers/events.js';
import { cache } from './services/cache.service.js';
export default {
    name: 'ticket',
    once: true,
    async execute(client) {
        if (client.ticketInitialized) {
            logger.debug('Ticket handling already initialized, skipping');
            return;
        }
        client.ticketInitialized = true;
        logger.info('✅ Tickets ready – checking guild and channel for ticket panel');
        try {
            const { ticketOptions, lang } = await loadConfig();
            const ticketConfig = ticketOptions.Ticket;
            const TICKET_GUILD = ticketConfig.Guild;
            const PANEL_CHANNEL = ticketConfig.KanalId;
            logger.debug('Current ticketOptions:', ticketOptions);
            let ticketCount = { value: 0 };
            let ticketPanelMessage;
            const ticketCooldowns = new Map();
            const guild = await client.guilds.fetch(TICKET_GUILD);
            logger.debug('Guild fetched:', guild.id);
            const channel = await guild.channels.fetch(PANEL_CHANNEL);
            if (!channel) {
                logger.error('Could not fetch channel');
                return;
            }
            logger.debug('Channel fetched:', channel.id);
            if (!channel || !('messages' in channel)) {
                logger.error('Invalid channel type for ticket panel');
                return;
            }
            const cachedPanelId = cache.getPanelMessage(PANEL_CHANNEL);
            if (cachedPanelId) {
                try {
                    ticketPanelMessage = await channel.messages.fetch(cachedPanelId);
                    logger.debug('Using cached panel message:', cachedPanelId);
                }
                catch (error) {
                    logger.debug('Cached panel message not found, will search for new one');
                    cache.delete(`panel:${PANEL_CHANNEL}`);
                }
            }
            if (!ticketPanelMessage) {
                const messages = await channel.messages.fetch({ limit: 5 });
                ticketPanelMessage = messages.find((m) => m.author.id === client.user.id && m.components?.length);
                if (ticketPanelMessage) {
                    cache.setPanelMessage(PANEL_CHANNEL, ticketPanelMessage.id);
                }
                logger.debug('Searching for existing ticket panel, found:', Boolean(ticketPanelMessage));
            }
            if (!ticketPanelMessage) {
                logger.info('🔄 No existing panel, creating new ticket panel');
                const row = getTicketSelectMenuRow(ticketConfig);
                let contentOrEmbed;
                if (isEmbedEnabled(undefined, ticketConfig)) {
                    const embed = new EmbedBuilder()
                        .setColor((ticketConfig.embedColor || '#007BFF'))
                        .setTitle(ticketConfig.embedTitle || 'Ticket System')
                        .setDescription(ticketConfig.embedDescription || 'Select a ticket type below');
                    if (ticketConfig.enablefooter && ticketConfig.embedFooter) {
                        embed.setFooter({ text: ticketConfig.embedFooter });
                    }
                    if (ticketConfig.enableimage && ticketConfig.embedImage?.trim()) {
                        embed.setImage(ticketConfig.embedImage);
                    }
                    if (ticketConfig.enablefields &&
                        Array.isArray(ticketConfig.addfields)) {
                        embed.addFields(...ticketConfig.addfields);
                    }
                    contentOrEmbed = { embeds: [embed] };
                    logger.debug('Created embed content for ticket panel:', embed);
                }
                else {
                    contentOrEmbed = {
                        content: buildMessageContent(ticketConfig.embedTitle || 'Ticket System', ticketConfig.embedDescription || 'Select a ticket type below'),
                    };
                    logger.debug('Created text-based content for ticket panel:', contentOrEmbed.content);
                }
                ticketPanelMessage = await channel.send({
                    ...contentOrEmbed,
                    components: [row],
                });
                cache.setPanelMessage(PANEL_CHANNEL, ticketPanelMessage.id);
                logger.info('✅ Ticket panel sent with ID:', ticketPanelMessage.id);
            }
            else {
                logger.info('✅ Using existing ticket panel with ID:', ticketPanelMessage.id);
            }
            if (ticketConfig.Arkiv?.enabled && ticketConfig.Arkiv.id) {
                process.env.ARCHIVE_CATEGORY_ID = ticketConfig.Arkiv.id;
                logger.debug('Archive category ID set in environment variable:', ticketConfig.Arkiv.id);
            }
            if (!client.ticketListenersRegistered) {
                client.ticketListenersRegistered = true;
                logger.debug('Registering ticket interaction listeners');
                setupInteractionHandlers(client, ticketConfig, lang, ticketCount, ticketCooldowns);
                setupEventHandlers(client, lang);
            }
        }
        catch (error) {
            logger.error('Error initializing ticket system:', error);
        }
    },
};
//# sourceMappingURL=main.js.map