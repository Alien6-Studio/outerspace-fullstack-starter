import chalk from 'chalk';

export function displayLogo(): void {
  console.log(`
${chalk.cyan('                          ██')}
${chalk.blue('                    ▄███████')}${chalk.green('░░')}${chalk.greenBright('>')}
${chalk.blue('           ▄▄████████████')}${chalk.green('░░')}${chalk.yellow('✧')}    ${chalk.greenBright('==╾━')}
${chalk.blue('    ▄██████████████████')}${chalk.green('░░')}${chalk.yellow('✦')}      ${chalk.greenBright('>>╾━')}
${chalk.greenBright('  =====================')}${chalk.green('░░')}${chalk.yellow('★')}      ${chalk.green('▒▒▒')}
${chalk.blue('    ▀██████████████████')}${chalk.green('░░')}${chalk.yellow('✦')}      ${chalk.greenBright('>>╾━')}
${chalk.blue('           ▀▀████████████')}${chalk.green('░░')}${chalk.yellow('✧')}    ${chalk.greenBright('==╾━')}
${chalk.blue('                    ▀███████')}${chalk.green('░░')}${chalk.greenBright('>')}
${chalk.cyan('                          ██')}

${chalk.greenBright('╾━━━━━━━━━━━━━━━━━')} ${chalk.yellow('OUTERSPACE')} ${chalk.greenBright('━━━━━━━━━━━━━━━━━╼')}
${chalk.magenta('            Fullstack Starter Kit            ')}
${chalk.green('         [ Ready to explore new dimensions ]      ')}
${chalk.greenBright('╾━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╼')}\n`);
}