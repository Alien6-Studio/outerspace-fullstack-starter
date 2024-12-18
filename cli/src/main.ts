#!/usr/bin/env node


import { Command } from 'commander';
import chalk from 'chalk';

import { displayLogo } from './logo.js';
import { writeConfig } from './config/writer.js';
import { getConfig } from './config/reader.js';
import { ProjectConfig } from './types/config.js';

import { setupProject } from './prompts/project.prompt.js';
import { setupDatabase } from './prompts/db.prompt.js';
import { setupI18n } from './prompts/i18n.prompt.js';
import { setupTheme } from './prompts/themes.prompt.js';

import { ProjectGenerator } from './generator/project-generator.js';
import { DatabaseGenerator } from './generator/db-generator.js';
import { I18nGenerator } from './generator/i18n-generator.js';
import { ThemeGenerator } from './generator/themes-generator.js';

const program = new Command();

/**
 * Static class containing all generator functions.
 * Each method corresponds to a specific part of the project that can be generated independently.
 */
class Generators {
  /**
   * Generates the base project structure.
   * @param config - The complete project configuration
   */
  static async project(config: ProjectConfig): Promise<void> {
    const generator = new ProjectGenerator(config, config.info.name);
    await generator.generate();
    console.log(chalk.green('\nBase project structure generated successfully!'));
  }

  /**
   * Generates database-related configurations and files.
   * @param config - The complete project configuration
   */
  static async database(config: ProjectConfig): Promise<void> {
    const generator = new DatabaseGenerator(config.database, config.info.name);
    await generator.generate();
    console.log(chalk.green('\nDatabase configuration generated successfully!'));
  }

  /**
   * Generates internationalization files if enabled in config.
   * @param config - The complete project configuration
   */
  static async i18n(config: ProjectConfig): Promise<void> {
    if (!config.i18n.enableI18n) {
      console.log(chalk.yellow('\nI18n is not enabled in the configuration.'));
      return;
    }
    const generator = new I18nGenerator(config.i18n, config.info);
    await generator.generate();
    console.log(chalk.green('\nI18n configuration generated successfully!'));
  }

  /**
   * Generates theme-related files if enabled in config.
   * @param config - The complete project configuration
   */
  static async theme(config: ProjectConfig): Promise<void> {
    if (!config.theme.enableTheming) {
      console.log(chalk.yellow('\nTheming is not enabled in the configuration.'));
      return;
    }
    const generator = new ThemeGenerator(config);
    await generator.generate();
    console.log(chalk.green('\nTheme configuration generated successfully!'));
  }
}

/**
 * Static class containing all command handlers.
 * Manages the execution flow of CLI commands.
 */
class CommandHandlers {
  /**
   * Handles the 'init' command which creates a new project from scratch.
   * This includes collecting all necessary configurations through prompts
   * and generating all project files.
   */
  static async init(): Promise<void> {
    try {
      displayLogo();

      // Collect all configurations through interactive prompts
      const projectInfo = await setupProject();
      const dbConfig = await setupDatabase();
      const i18nConfig = await setupI18n();
      const themeConfig = await setupTheme();

      // Assemble the complete configuration object
      const config: ProjectConfig = {
        info: projectInfo,
        database: dbConfig,
        i18n: i18nConfig,
        theme: themeConfig,
      };

      // Save configuration for future use
      await writeConfig(config);
      console.log(chalk.blue('\nConfiguration saved successfully.'));

      // Generate all project components
      await Generators.project(config);
      await Generators.database(config);
      await Generators.i18n(config);
      await Generators.theme(config);

      // Display next steps for the user
      console.log(chalk.blue('\nNext steps:'));
      console.log(chalk.gray('1. cd ' + config.info.name));
      console.log(chalk.gray('2. npm install'));
      console.log(chalk.gray('3. npm run dev'));
    } catch (error) {
      console.error(chalk.red('Error during initialization:'),
        error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  }

  /**
   * Creates a command handler for individual generators.
   * This is a higher-order function that wraps generator functions
   * with common error handling and configuration loading.
   *
   * @param generatorFn - The generator function to wrap
   * @returns A function that can be used as a command handler
   */
  static createGeneratorCommand(
    generatorFn: (config: ProjectConfig) => Promise<void>
  ): () => Promise<void> {
    return async () => {
      try {
        const config = await getConfig();
        await generatorFn(config);
      } catch (error) {
        console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
        process.exit(1);
      }
    };
  }
}

// CLI Configuration
program
  .name('outerspace-cli')
  .description('CLI for Outerspace Fullstack starter kit')
  .version('0.0.1');

// Register all available commands
program
  .command('init')
  .description('Initialize a new project')
  .action(CommandHandlers.init);

program
  .command('generate-project')
  .description('Generate only the project structure')
  .action(CommandHandlers.createGeneratorCommand(Generators.project));

program
  .command('generate-database')
  .description('Generate only the database configuration')
  .action(CommandHandlers.createGeneratorCommand(Generators.database));

program
  .command('generate-i18n')
  .description('Generate only the i18n configuration')
  .action(CommandHandlers.createGeneratorCommand(Generators.i18n));

program
  .command('generate-theme')
  .description('Generate only the theme configuration')
  .action(CommandHandlers.createGeneratorCommand(Generators.theme));

// Parse command line arguments
program.parse();