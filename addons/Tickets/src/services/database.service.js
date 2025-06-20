import { db } from '@botport/framework';
import { logger } from '../utils/logger.js';
import { cache } from './cache.service.js';
export async function getTicketCount(userId, category) {
    try {
        const cachedCount = cache.getTicketCount(userId, category);
        if (cachedCount !== null) {
            logger.debug(`Cache hit for ticket count: ${userId}:${category} = ${cachedCount}`);
            return cachedCount;
        }
        const [result] = await db.execute("SELECT COUNT(*) as count FROM Tickets WHERE CreatorId = ? AND Category = ? AND Status = 'open'", [userId, category]);
        const count = result[0].count;
        cache.setTicketCount(userId, category, count);
        logger.debug(`Database query for ticket count: ${userId}:${category} = ${count}`);
        return count;
    }
    catch (error) {
        logger.error('Error getting ticket count:', error);
        return 0;
    }
}
export async function createTicketRecord(creatorId, creatorUsername, category, channelId, guildId, messageId) {
    try {
        await db.execute('INSERT INTO Tickets (CreatorId, CreatorUsername, Category, ChannelId, GuildId, MessageId, Status, CreatedAt) VALUES (?, ?, ?, ?, ?, ?, "open", NOW())', [creatorId, creatorUsername, category, channelId, guildId, messageId]);
        cache.delete(`ticket_count:${creatorId}:${category}`);
        logger.debug('Ticket inserted into database for:', creatorUsername);
    }
    catch (error) {
        logger.error('Error creating ticket record:', error);
        throw error;
    }
}
export async function getTicketByChannel(channelId) {
    try {
        const [rows] = await db.execute('SELECT * FROM Tickets WHERE ChannelId = ? LIMIT 1', [channelId]);
        return rows[0] || null;
    }
    catch (error) {
        logger.error('Error getting ticket by channel:', error);
        return null;
    }
}
export async function updateTicketStatus(channelId, status, reason) {
    try {
        const ticket = await getTicketByChannel(channelId);
        if (reason) {
            await db.execute('UPDATE Tickets SET Status = ?, Reason = ?, ClosedAt = NOW() WHERE ChannelId = ?', [status, reason, channelId]);
        }
        else {
            await db.execute('UPDATE Tickets SET Status = ?, ClosedAt = NOW() WHERE ChannelId = ?', [status, channelId]);
        }
        if (ticket) {
            cache.delete(`ticket_count:${ticket.CreatorId}:${ticket.Category}`);
        }
        logger.debug(`Ticket status updated to ${status} for channel:`, channelId);
    }
    catch (error) {
        logger.error('Error updating ticket status:', error);
        throw error;
    }
}
export async function deleteTicketRecord(channelId) {
    try {
        const ticket = await getTicketByChannel(channelId);
        await db.execute('DELETE FROM Tickets WHERE ChannelId = ?', [channelId]);
        if (ticket) {
            cache.delete(`ticket_count:${ticket.CreatorId}:${ticket.Category}`);
        }
        logger.info('Ticket record deleted for channel:', channelId);
    }
    catch (error) {
        logger.error('Error deleting ticket record:', error);
    }
}
export async function batchUpdateTicketStatuses(channelIds, status) {
    if (channelIds.length === 0)
        return;
    try {
        const placeholders = channelIds.map(() => '?').join(',');
        await db.execute(`UPDATE Tickets SET Status = ?, ClosedAt = NOW() WHERE ChannelId IN (${placeholders})`, [status, ...channelIds]);
        cache.clear();
        logger.debug(`Batch updated ${channelIds.length} tickets to ${status}`);
    }
    catch (error) {
        logger.error('Error batch updating ticket statuses:', error);
        throw error;
    }
}
//# sourceMappingURL=database.service.js.map