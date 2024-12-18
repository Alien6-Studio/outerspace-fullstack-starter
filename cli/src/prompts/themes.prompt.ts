import inquirer from 'inquirer';
import chalk from 'chalk';
import { ThemeConfig } from '../types/config.js';

interface ThemeAnswers {
  enableTheming: boolean;
  defaultTheme: 'light' | 'dark';
  allowUserPreference: boolean;
  enableSystemTheme: boolean;
}

const themeQuestions = [
  {
    type: 'confirm',
    name: 'enableTheming',
    message: 'Enable theme support (light/dark mode)?',
    default: true
  },
  {
    type: 'list',
    name: 'defaultTheme',
    message: 'Choose default theme:',
    choices: ['light', 'dark'],
    default: 'light',
    when: (answers: ThemeAnswers) => answers.enableTheming
  },
  {
    type: 'confirm',
    name: 'allowUserPreference',
    message: 'Allow users to override theme preference?',
    default: true,
    when: (answers: ThemeAnswers) => answers.enableTheming
  },
  {
    type: 'confirm',
    name: 'enableSystemTheme',
    message: 'Enable system theme detection?',
    default: true,
    when: (answers: ThemeAnswers) => answers.enableTheming && answers.allowUserPreference
  }
];

export async function setupTheme(): Promise<ThemeConfig> {
  console.log(chalk.blue('\nTheme Configuration'));
  
  try {
    const themeConfig = await inquirer.prompt<ThemeConfig>(themeQuestions);
    console.log(chalk.green('\nTheme configuration completed!'));
    
    return themeConfig;
  } catch (error) {
    throw new Error(`Error during theme configuration: ${error}`);
  }
}
