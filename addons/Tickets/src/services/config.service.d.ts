import { TicketConfig, LanguageStrings } from '../types/index.js';
export declare function loadConfig(): Promise<{
    ticketOptions: {
        Ticket: TicketConfig;
    };
    lang: LanguageStrings;
}>;
export declare function getLangString(lang: LanguageStrings, key: string, fallback: string): string;
//# sourceMappingURL=config.service.d.ts.map