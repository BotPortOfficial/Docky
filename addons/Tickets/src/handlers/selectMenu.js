import { ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionsBitField, StringSelectMenuBuilder, } from 'discord.js';
import { logger } from '../utils/logger.js';
import { getLangString } from '../services/config.service.js';
import { getTicketCount, createTicketRecord } from '../services/database.service.js';
import { createTicketContent } from '../utils/embed.js';
import { getTicketActionRow } from '../utils/components.js';
import { sendTicketLogEvent } from '../services/logging.service.js';
import { formatDiscordTimestamp } from '../utils/formatting.js';
import { cache } from '../services/cache.service.js';
const getTicketSelectMenuRow = (ticketConfig) => {
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
};
const refreshPanel = async (interaction, ticketConfig) => {
    try {
        const row = getTicketSelectMenuRow(ticketConfig);
        const originalMessage = interaction.message;
        logger.debug('Updating ticket panel message with new row:', row);
        await originalMessage.edit({ components: [row] });
        logger.debug('Ticket panel updated');
    }
    catch (error) {
        logger.error('Error updating ticket panel:', error);
    }
};
export async function handleSelectMenu(interaction, ticketConfig, lang, ticketCount, _ticketCooldowns) {
    if (!interaction.deferred && !interaction.replied) {
        try {
            await interaction.deferReply({ flags: 64 });
            logger.debug('DeferReply performed for select menu interaction');
        }
        catch (error) {
            logger.error('Error handling interaction:', error);
            return;
        }
    }
    logger.debug('Select menu interaction from:', interaction.user.username);
    const selected = interaction.values[0];
    if (!selected) {
        logger.error('No option selected by:', interaction.user.username);
        await interaction.editReply({ content: 'No option selected.' });
        return;
    }
    const optionConfig = ticketConfig.options.find((opt) => opt.value === selected);
    if (!optionConfig) {
        logger.error('Invalid option selected by:', interaction.user.username);
        await interaction.editReply({ content: 'Invalid option selected.' });
        return;
    }
    logger.debug('Selected option:', optionConfig);
    if (optionConfig.type === 'link') {
        logger.debug("Handling 'link' type option");
        const linkButton = new ButtonBuilder()
            .setLabel(optionConfig.buttonLabel || 'Go to Forum')
            .setStyle(ButtonStyle.Link)
            .setURL(optionConfig.url || 'https://discord.gg/discord');
        await refreshPanel(interaction, ticketConfig);
        await interaction.editReply({
            content: optionConfig.replyContent || 'Please visit our forum for applications.',
            components: [
                new ActionRowBuilder().addComponents(linkButton),
            ],
        });
        return;
    }
    const count = await getTicketCount(interaction.user.id, selected);
    logger.debug(`User ${interaction.user.username} already has ${count} open tickets for category ${selected}`);
    if (count >= (optionConfig.MaxTicketsPerUser || 1)) {
        logger.info('Max tickets reached for:', interaction.user.username);
        const customResponses = ticketConfig.customization?.customResponses;
        await refreshPanel(interaction, ticketConfig);
        await interaction.editReply({
            content: customResponses?.maxTickets ||
                getLangString(lang, 'maxTicketsReached', 'You have reached the maximum number of tickets for this category.'),
        });
        return;
    }
    const cooldownTimestamp = cache.getCooldown(interaction.user.id);
    if (cooldownTimestamp && Date.now() - cooldownTimestamp < 5000) {
        logger.info('User on cooldown:', interaction.user.username);
        const customResponses = ticketConfig.customization?.customResponses;
        await refreshPanel(interaction, ticketConfig);
        const cooldownMsg = customResponses?.ticketCooldown ||
            getLangString(lang, 'ticketCooldownMsg', 'You have recently created a ticket. Please wait before trying again.');
        await interaction.editReply({ content: cooldownMsg });
        return;
    }
    cache.setCooldown(interaction.user.id, Date.now());
    logger.debug('Cooldown set for user:', interaction.user.username);
    ticketCount.value++;
    logger.debug('Increasing ticket count to:', ticketCount.value);
    const ticketName = `${interaction.user.username}-${optionConfig.prefix}`;
    const categoryId = optionConfig.category;
    if (!categoryId) {
        logger.error('Invalid category ID for:', interaction.user.username);
        const customResponses = ticketConfig.customization?.customResponses;
        await interaction.editReply({
            content: customResponses?.categoryIdError ||
                getLangString(lang, 'categoryIdError', 'Error: Invalid category ID'),
        });
        return;
    }
    const categoryChannel = interaction.guild?.channels.cache.get(categoryId);
    if (!categoryChannel) {
        logger.error('Category channel not found for ticket:', interaction.user.username);
        const customResponses = ticketConfig.customization?.customResponses;
        await interaction.editReply({
            content: customResponses?.categoryIdError ||
                getLangString(lang, 'categoryIdError', 'Error: Invalid category ID'),
        });
        return;
    }
    const permissionOverwrites = [
        {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
            id: interaction.user.id,
            allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
            ],
        },
    ];
    if (optionConfig.permissionRole) {
        permissionOverwrites.push({
            id: optionConfig.permissionRole,
            allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
            ],
        });
    }
    try {
        const channel = await interaction.guild.channels.create({
            name: ticketName,
            type: 0,
            parent: categoryId,
            permissionOverwrites,
        });
        logger.info('Ticket channel created:', channel.id);
        const content = createTicketContent(optionConfig, interaction.user, ticketConfig);
        const actionRow = getTicketActionRow(lang);
        let messageOptions = { components: [actionRow] };
        if (typeof content === 'string') {
            messageOptions.content = content;
        }
        else {
            messageOptions.embeds = [content];
        }
        const [ticketMessage] = await Promise.all([
            channel.send(messageOptions),
        ]);
        await Promise.all([
            createTicketRecord(interaction.user.id, interaction.user.username, selected, channel.id, interaction.guild.id, ticketMessage.id),
            sendTicketLogEvent('open', '', interaction.client, ticketConfig, {
                openuser: `<@${interaction.user.id}>`,
                opencode: `\`${new Date().toLocaleTimeString()}\``,
                relative: formatDiscordTimestamp('now', 'R'),
                '#channelid': `<#${channel.id}>`,
            })
        ]);
        logger.info('Ticket record created for:', interaction.user.username);
        const customResponses = ticketConfig.customization?.customResponses;
        await refreshPanel(interaction, ticketConfig);
        let successMessage = customResponses?.ticketCreated ||
            getLangString(lang, 'ticketCreated', 'Your ticket has been created successfully!');
        successMessage = successMessage.replace('{{channelId}}', `<#${channel.id}>`);
        await interaction.editReply({
            content: successMessage,
        });
        logger.info('Ticket creation completed for:', interaction.user.username);
    }
    catch (error) {
        logger.error('Error creating ticket:', error);
        await refreshPanel(interaction, ticketConfig);
        await interaction.editReply({
            content: getLangString(lang, 'ticketCreationError', 'An error occurred while creating your ticket. Please try again.'),
        });
    }
}
//# sourceMappingURL=selectMenu.js.map