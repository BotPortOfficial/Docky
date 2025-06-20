import { EmbedBuilder } from 'discord.js';
import { logger } from './logger.js';
import { buildMessageContent } from './formatting.js';
export function isEmbedEnabled(optionConfig, ticketConfig) {
    if (!ticketConfig)
        return false;
    const globalEnabled = typeof ticketConfig.enableembeds === 'boolean'
        ? ticketConfig.enableembeds
        : String(ticketConfig.enableembeds).toLowerCase() === 'true';
    const optionEnabled = optionConfig && 'enableembeds' in optionConfig
        ? Boolean(optionConfig.enableembeds)
        : true;
    const result = globalEnabled && optionEnabled;
    logger.debug(`isEmbedEnabled for '${optionConfig?.value || 'global'}': ${result}`);
    return result;
}
export function createTicketContent(optionConfig, user, ticketConfig) {
    logger.debug('Creating ticket content for user:', user.username);
    if (!isEmbedEnabled(optionConfig, ticketConfig)) {
        const content = buildMessageContent(optionConfig.embedTitle, optionConfig.embedDescription, user);
        logger.debug('Created non-embed content:', content);
        return content;
    }
    const desc = optionConfig.embedDescription.replace(/<@&{{\s*permissionRole\s*}}>/g, `<@&${optionConfig.permissionRole}>`);
    const embedContent = new EmbedBuilder()
        .setColor((optionConfig.embedcolor || '#0384e0'))
        .setTitle(optionConfig.embedTitle)
        .setDescription(desc)
        .setFooter({
        text: user.username,
        iconURL: user.displayAvatarURL(),
    });
    logger.debug('Created embed ticket content:', embedContent);
    return embedContent;
}
//# sourceMappingURL=embed.js.map