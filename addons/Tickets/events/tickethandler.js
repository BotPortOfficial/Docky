import { db } from '@botport/framework';
import chalk from "chalk";

const getTimestamp = () => new Date().toLocaleTimeString();

const logger = {
  info: (msg, ...args) => {
    console.log(chalk.white(`✨ [tickethandler] ${getTimestamp()} ${msg}`), ...args);
  },
  error: (msg, ...args) => {
    console.error(chalk.red(`⚠️ [error] ${getTimestamp()} ${msg}`), ...args);
  },
  warn: (msg, ...args) => {
    console.warn(chalk.yellow(`⚠️ [Warn] ${getTimestamp()} ${msg}`), ...args);
  },
  debug: (msg, ...args) => {
    if (process.env.DEBUG === "true") {
      console.log(chalk.cyan(`🛠️ [debug] ${getTimestamp()} ${msg}`), ...args);
    }
  },
};

export default {
  name: "ready",
  once: true,
  async execute(client) {
    const lang = client.lang["tickethandler.js"] || {};
    const noTickets =
      lang.NO_TICKETS || "✅ Inga tickets hittades i databasen.";
    const checkingTicket =
      lang.CHECKING_TICKET ||
      "🔍 Kontrollerar ticket ID {id} för ChannelId {channelId}";
    const channelFoundText =
      lang.CHANNEL_FOUND || "✅ Channel hittades för Ticket ID {id}";
    const channelNotFoundText =
      lang.CHANNEL_NOT_FOUND ||
      "❌ Channel hittades inte för Ticket ID {id} i Guild: {guild}";
    const deletingTicketText =
      lang.DELETING_TICKET ||
      "🗑️ Tar bort Ticket ID {id} från DB p.g.a. saknad channel";
    const deletionSuccess =
      lang.DELETION_SUCCESS || "✅ Ticket ID {id} togs bort.";
    const deletionFail =
      lang.DELETION_FAIL || "⚠️ Kunde inte ta bort Ticket ID {id}.";
    const errorText = lang.ERROR || "❌ Fel vid hantering av tickets:";

    try {
      const [tickets] = await db.execute("SELECT * FROM Tickets");
      if (tickets.length === 0) {
        logger.info(noTickets);
      }
      const guilds = client.guilds.cache;
      for (const ticket of tickets) {
        logger.info(
          checkingTicket
            .replace("{id}", ticket.Id)
            .replace("{channelId}", ticket.ChannelId)
        );

        let channelFound = false;
        for (const guild of guilds.values()) {
          try {
            const channel = await guild.channels.fetch(ticket.ChannelId);
            if (channel) {
              channelFound = true;
              logger.info(channelFoundText.replace("{id}", ticket.Id));
              break;
            }
          } catch (err) {
            logger.info(
              channelNotFoundText
                .replace("{id}", ticket.Id)
                .replace("{guild}", guild.name)
            );
          }
        }

        if (!channelFound) {
          logger.info(deletingTicketText.replace("{id}", ticket.Id));
          const [result] = await db.execute(
            "DELETE FROM Tickets WHERE ChannelId = ?",
            [ticket.ChannelId]
          );

          if (result.affectedRows > 0) {
            logger.info(deletionSuccess.replace("{id}", ticket.Id));
          } else {
            logger.info(deletionFail.replace("{id}", ticket.Id));
          }
        }
      }
    } catch (error) {
      logger.error(errorText, error);
    }
  },
};
