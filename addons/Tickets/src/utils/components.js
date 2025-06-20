import { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, } from 'discord.js';
import { getLangString } from '../services/config.service.js';
import { logger } from './logger.js';
export function getTicketSelectMenuRow(ticketConfig) {
    const menu = new StringSelectMenuBuilder()
        .setCustomId('ticket_menu')
        .setPlaceholder(ticketConfig.selectMenuPlaceholder || 'Select a ticket type');
    const options = ticketConfig.options.map(({ label, value, description }) => ({
        label,
        value,
        description,
    }));
    menu.addOptions(options);
    logger.debug('Ticket select menu created with options:', options);
    return new ActionRowBuilder().addComponents(menu);
}
export function getTicketActionRow(lang) {
    const closeButton = new ButtonBuilder()
        .setCustomId('close_ticket')
        .setLabel(getLangString(lang, 'ticketCloseButton', 'Close Ticket'))
        .setStyle(ButtonStyle.Danger);
    const closeReasonButton = new ButtonBuilder()
        .setCustomId('close_ticket_reason')
        .setLabel(getLangString(lang, 'ticketCloseWithReasonButton', 'Close with Reason'))
        .setStyle(ButtonStyle.Secondary);
    return new ActionRowBuilder().addComponents(closeButton, closeReasonButton);
}
export function getClosedActionRow(ticketConfig) {
    const row = new ActionRowBuilder();
    if (ticketConfig.Arkiv && ticketConfig.Arkiv.enabled) {
        const archiveButton = new ButtonBuilder()
            .setCustomId('archive_ticket')
            .setLabel('Archive')
            .setStyle(ButtonStyle.Primary);
        row.addComponents(archiveButton);
    }
    const deleteButton = new ButtonBuilder()
        .setCustomId('delete_ticket')
        .setLabel('Delete')
        .setStyle(ButtonStyle.Danger);
    row.addComponents(deleteButton);
    logger.debug('Created action row for closed tickets', row);
    return row;
}
//# sourceMappingURL=components.js.map