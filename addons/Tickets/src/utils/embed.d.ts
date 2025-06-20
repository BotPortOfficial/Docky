import { EmbedBuilder, User } from 'discord.js';
import { TicketOption, TicketConfig } from '../types/index.js';
export declare function isEmbedEnabled(optionConfig?: TicketOption, ticketConfig?: TicketConfig): boolean;
export declare function createTicketContent(optionConfig: TicketOption, user: User, ticketConfig: TicketConfig): EmbedBuilder | string;
//# sourceMappingURL=embed.d.ts.map