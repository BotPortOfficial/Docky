import { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder } from 'discord.js';
import { TicketConfig } from '../types/index.js';
export declare function getTicketSelectMenuRow(ticketConfig: TicketConfig): ActionRowBuilder<StringSelectMenuBuilder>;
export declare function getTicketActionRow(lang: any): ActionRowBuilder<ButtonBuilder>;
export declare function getClosedActionRow(ticketConfig: TicketConfig): ActionRowBuilder<ButtonBuilder>;
//# sourceMappingURL=components.d.ts.map