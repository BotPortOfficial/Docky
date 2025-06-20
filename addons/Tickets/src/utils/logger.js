import chalk from 'chalk';
const getTimestamp = () => new Date().toLocaleTimeString();
export const logger = {
    info: (msg, ...args) => console.log(chalk.white(`📝 [ticket] ${getTimestamp()} ${msg}`), ...args),
    error: (msg, ...args) => console.error(chalk.red(`⚠️ [error] ${getTimestamp()} ${msg}`), ...args),
    warn: (msg, ...args) => console.warn(chalk.yellow(`⚠️ [warning] ${getTimestamp()} ${msg}`), ...args),
    debug: (msg, ...args) => {
        if (process.env.DEBUG === 'true') {
            console.log(chalk.cyan(`📥 [debug] ${getTimestamp()} ${msg}`), ...args);
        }
    },
};
export { getTimestamp };
//# sourceMappingURL=logger.js.map