export declare function getTicketCount(userId: string, category: string): Promise<number>;
export declare function createTicketRecord(creatorId: string, creatorUsername: string, category: string, channelId: string, guildId: string, messageId: string): Promise<void>;
export declare function getTicketByChannel(channelId: string): Promise<any>;
export declare function updateTicketStatus(channelId: string, status: 'closed' | 'archived', reason?: string): Promise<void>;
export declare function deleteTicketRecord(channelId: string): Promise<void>;
export declare function batchUpdateTicketStatuses(channelIds: string[], status: 'closed' | 'archived'): Promise<void>;
//# sourceMappingURL=database.service.d.ts.map