import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, } from 'discord.js';
import { logger } from '../utils/logger.js';
import { getLangString } from '../services/config.service.js';
import { handleSelectMenu } from './selectMenu.js';
import { handleCloseTicket, handleArchiveTicket, handleDeleteTicket, } from './buttons.js';
import { handleCloseReasonModal } from './modals.js';
export function setupInteractionHandlers(client, ticketConfig, lang, ticketCount, ticketCooldowns) {
    client.on('interactionCreate', async (interaction) => {
        if (interaction.isCommand() || interaction.isChatInputCommand())
            return;
        const customId = 'customId' in interaction ? interaction.customId : 'unknown';
        logger.debug('New interaction received:', customId || interaction.type);
        try {
            if (interaction.isStringSelectMenu() &&
                interaction.customId === 'ticket_menu') {
                await handleSelectMenu(interaction, ticketConfig, lang, ticketCount, ticketCooldowns);
                return;
            }
            if (interaction.isButton()) {
                switch (interaction.customId) {
                    case 'close_ticket':
                        await handleCloseTicket(interaction, ticketConfig);
                        break;
                    case 'close_ticket_reason':
                        await showCloseReasonModal(interaction, lang);
                        break;
                    case 'archive_ticket':
                    case 'archiveTicket':
                        await handleArchiveTicket(interaction, ticketConfig);
                        break;
                    case 'delete_ticket':
                        await handleDeleteTicket(interaction);
                        break;
                }
                return;
            }
            if (interaction.isModalSubmit() &&
                interaction.customId === 'close_reason_modal') {
                await handleCloseReasonModal(interaction, ticketConfig);
                return;
            }
        }
        catch (error) {
            logger.error('Error handling interaction:', error);
        }
    });
}
async function showCloseReasonModal(interaction, lang) {
    const modal = new ModalBuilder()
        .setCustomId('close_reason_modal')
        .setTitle(getLangString(lang, 'closeModalTitle', 'Close Ticket'));
    const reasonInput = new TextInputBuilder()
        .setCustomId('reason_input')
        .setLabel(getLangString(lang, 'closeModalLabel', 'Reason for closing'))
        .setStyle(TextInputStyle.Paragraph);
    modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));
    await interaction.showModal(modal);
    logger.debug('Closing-modal shows for:', interaction.user.username);
}
//# sourceMappingURL=interactions.js.map