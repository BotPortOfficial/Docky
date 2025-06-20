import { StringSelectMenuInteraction } from 'discord.js';
import { TicketConfig, LanguageStrings } from '../types/index.js';
export declare function handleSelectMenu(interaction: StringSelectMenuInteraction, ticketConfig: TicketConfig, lang: LanguageStrings, ticketCount: {
    value: number;
}, _ticketCooldowns: Map<string, number>): Promise<void>;
//# sourceMappingURL=selectMenu.d.ts.map