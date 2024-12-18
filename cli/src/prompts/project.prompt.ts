import inquirer from 'inquirer';
import chalk from 'chalk';
import { ProjectInfo } from '../types/config.js';

const projectQuestions = [
  {
    type: 'input',
    name: 'name',
    message: 'Project name:',
    default: 'my-fullstack-app',
    validate: (input: string) => {
      if (/^[a-z0-9-]+$/.test(input)) {
        return true;
      }
      return 'Project name must contain only lowercase letters, numbers, and hyphens';
    }
  },
  {
    type: 'input',
    name: 'description',
    message: 'Project description:',
    default: 'A fullstack application built with Outerspace CLI',
    validate: (input: string) => {
      if (input.length === 0) {
        return 'Description cannot be empty';
      }
      if (input.length > 100) {
        return 'Description should be less than 100 characters';
      }
      return true;
    }
  }
];

export async function setupProject(): Promise<ProjectInfo> {
  console.log(chalk.blue('\nProject Configuration'));
  
  try {
    const projectInfo = await inquirer.prompt<ProjectInfo>(projectQuestions);
    console.log(chalk.green('\nProject configuration completed!'));
    
    return projectInfo;
  } catch (error) {
    throw new Error(`Error during project configuration: ${error}`);
  }
}