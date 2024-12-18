import inquirer from 'inquirer';
import chalk from 'chalk';
import { I18nConfig } from '../types/config.js';

interface I18nAnswers {
  enableI18n: boolean;
  defaultLanguage: string;
  additionalLanguages: string[];
}

const AVAILABLE_LANGUAGES = [
  'en-US',
  'fr-FR',
  'es-ES',
  'de-DE',
  'it-IT',
  'pt-PT',
  'nl-NL',
  'pl-PL',
  'ja-JP',
  'zh-CN',
  'ko-KR'
];

const i18nQuestions = [
  {
    type: 'confirm',
    name: 'enableI18n',
    message: 'Enable internationalization (i18n)?',
    default: true
  },
  {
    type: 'list',
    name: 'defaultLanguage',
    message: 'Choose default language:',
    choices: AVAILABLE_LANGUAGES,
    default: 'en-US',
    when: (answers: I18nAnswers) => answers.enableI18n
  },
  {
    type: 'checkbox',
    name: 'additionalLanguages',
    message: 'Select additional languages to support:',
    choices: (answers: I18nAnswers) => AVAILABLE_LANGUAGES.filter(lang => lang !== answers.defaultLanguage),
    when: (answers: I18nAnswers) => answers.enableI18n,
    validate: (input: string[]) => {
      if (input.length === 0) {
        return 'Please select at least one additional language';
      }
      return true;
    }
  }
];

export async function setupI18n(): Promise<I18nConfig> {
  console.log(chalk.blue('\nInternationalization Configuration'));
  
  try {
    const i18nConfig = await inquirer.prompt<I18nConfig>(i18nQuestions);
    console.log(chalk.green('\nInternationalization configuration completed!'));
    
    return i18nConfig;
  } catch (error) {
    throw new Error(`Error during i18n configuration: ${error}`);
  }
}