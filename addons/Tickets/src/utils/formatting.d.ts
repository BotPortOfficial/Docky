import { User } from 'discord.js';
import { TicketOption, TicketRow } from '../types/index.js';
export declare function getUnixTimestamp(date?: Date): number;
export declare function getFormattedDate(type?: 'long' | 'short', date?: Date): string;
export declare function formatDiscordTimestamp(value?: string | number, format?: string): string;
export declare function formatCustomMessage(template: string, user: User, optionConfig: TicketOption, ticketRow?: Partial<TicketRow>): Promise<string>;
export declare function applyPlaceholders(template: string, data: Record<string, string | undefined>): string;
export declare function buildMessageContent(embedTitle: string, embedDescription: string, _user?: User): string;
//# sourceMappingURL=formatting.d.ts.map