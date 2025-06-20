import { getTimestamp, logger } from './logger.js';
import { db } from '@botport/framework';
export function getUnixTimestamp(date = new Date()) {
    return Math.floor(date.getTime() / 1000);
}
export function getFormattedDate(type = 'long', date = new Date()) {
    return type === 'short'
        ? date.toLocaleDateString()
        : date.toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' });
}
export function formatDiscordTimestamp(value = 'now', format = 'R') {
    const unix = value === 'now'
        ? getUnixTimestamp()
        : !isNaN(Number(value))
            ? parseInt(String(value))
            : getUnixTimestamp();
    return `<t:${unix}:${format}>`;
}
export async function formatCustomMessage(template, user, optionConfig, ticketRow = {}) {
    logger.debug('Formatting custom message with template:', template);
    if (ticketRow?.Id) {
        try {
            const [rows] = (await db.query('SELECT * FROM Tickets WHERE Id = ?', [
                ticketRow.Id,
            ]));
            if (rows && rows.length > 0) {
                ticketRow = rows[0];
                logger.debug('Updated ticketRow from DB:', ticketRow);
            }
            else {
                logger.warn(`No ticket record found for Id ${ticketRow.Id}`);
            }
        }
        catch (err) {
            logger.error('Error fetching ticket from database:', err);
        }
    }
    const createdAt = ticketRow.CreatedAt ? new Date(ticketRow.CreatedAt) : null;
    const closedAt = ticketRow.ClosedAt ? new Date(ticketRow.ClosedAt) : null;
    const formattedMessage = template.replace(/<<([^>]+)>>/g, (match, raw) => {
        const [type, ...args] = raw.split(':').map((s) => s.trim());
        const arg = args.join(':');
        switch (type.toLowerCase()) {
            case '@user':
                return user ? `<@${user.id}>` : '';
            case '@username':
                return user?.username || '';
            case '@permissionrole':
                return optionConfig?.permissionRole
                    ? `<@&${optionConfig.permissionRole}>`
                    : '';
            case '@ticketcount':
                return '1';
            case '@reason':
                return ticketRow.Reason || 'No reason provided.';
            case '@createdat':
                return createdAt ? getFormattedDate('long', createdAt) : 'Unknown';
            case '@closedat':
                return closedAt ? getFormattedDate('long', closedAt) : 'Unknown';
            case '@createdatcode':
                return createdAt
                    ? `\`${getFormattedDate('long', createdAt)}\``
                    : 'Unknown';
            case '@closedatcode':
                return closedAt ? `\`${getFormattedDate('long', closedAt)}\`` : 'Unknown';
            case '@timestamp':
                return getTimestamp();
            case '@date':
                return getFormattedDate('short');
            case '@timedate':
                return getFormattedDate('long');
            case '@timestampcode':
                return `\`${getTimestamp()}\``;
            case '@relativetimestamp':
                return `**Time**: <t:${getUnixTimestamp()}:R> \`${getTimestamp()}\``;
            case '@discordtimestamp':
                return formatDiscordTimestamp(arg || 'now', 'F');
            case '@relative':
                return formatDiscordTimestamp(arg || 'now', 'R');
            case '@shortdate':
                return formatDiscordTimestamp(arg || 'now', 'd');
            case '@time':
                return formatDiscordTimestamp(arg || 'now', 't');
            case '@customts':
                return `<t:${arg}:${args[1] || 'F'}>`;
            case '@code':
                return `\`\`\`\n${arg}\n\`\`\``;
            case '@inline':
                return `\`${arg}\``;
            case '@lower':
                return arg.toLowerCase();
            case '@upper':
                return arg.toUpperCase();
            case '@bold':
                return `**${arg}**`;
            case '@italic':
                return `*${arg}*`;
            case '@underline':
                return `__${arg}__`;
            case '@strike':
                return `~~${arg}~~`;
            case '@emoji':
                return `:${arg}:`;
            case '@divider':
                return '--------------------------';
            case '@newline':
                return '\n';
            default:
                return match;
        }
    });
    logger.debug('Formatted message:', formattedMessage);
    return formattedMessage;
}
export function applyPlaceholders(template, data) {
    for (const key in data) {
        const value = data[key];
        if (value !== undefined) {
            template = template.replace(new RegExp(`<<@${key}>>`, 'g'), value);
        }
    }
    logger.debug('Template after placeholder application:', template);
    return template;
}
export function buildMessageContent(embedTitle, embedDescription, _user) {
    const message = `**${embedTitle}**\n${embedDescription}`;
    return message;
}
//# sourceMappingURL=formatting.js.map