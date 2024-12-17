#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';

import { displayLogo } from './logo.js';
import { writeConfig } from './config/writer.js';
import { ProjectConfig } from './types/config.js';

import { setupProject } from './prompts/project.prompt.js';
import { setupDatabase } from './prompts/db.prompt.js';

import { ProjectGenerator } from './generator/project-generator.js';
import { DatabaseGenerator } from './generator/db-generator.js';

const program = new Command();

async function init() {
  try {
    // Display the CLI logo
    displayLogo();

    // Collect configurations through interactive prompts
    const projectInfo = await setupProject();
    const dbConfig = await setupDatabase();

    // Assemble the complete project configuration
    const config: ProjectConfig = {
      info: projectInfo,
      database: dbConfig
    };

    // Save configuration to file for future reference
    await writeConfig(config);
    console.log(chalk.blue('\nConfiguration saved successfully.'));

    // Generate project files and structure
    const generator = new ProjectGenerator(config, config.info.name);
    await generator.generate();

    const dbGenerator = new DatabaseGenerator(config.database, config.info.name);
    await dbGenerator.generate();

    // Display success message and next steps
    console.log(chalk.green(`\nProject ${config.info.name} has been generated successfully!`));
    console.log(chalk.blue('\nNext steps:'));
    console.log(chalk.gray('1. cd ' + config.info.name));
    console.log(chalk.gray('2. pnpm install'));
    console.log(chalk.gray('3. pnpm dev'));

  } catch (error) {
    // Handle any errors during initialization
    console.error(chalk.red('Error during initialization:'), error);
    process.exit(1);
  }
}

// Setup CLI program configuration
program
  .name('outerspace-cli')
  .description('CLI for Outerspace Fullstack starter kit')
  .version('0.0.1');

// Register the init command
program
  .command('init')
  .description('Initialize a new project')
  .action(init);

// Parse command line arguments
program.parse();