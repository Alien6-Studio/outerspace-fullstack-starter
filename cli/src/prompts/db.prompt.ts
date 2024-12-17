import inquirer from 'inquirer';
import chalk from 'chalk';
import { DatabaseConfig } from '../types/config.js';

const databaseQuestions = [
  {
    type: 'list',
    name: 'type',
    message: 'Which database would you like to use?',
    choices: [
      { name: 'PostgreSQL', value: 'postgres' },
      { name: 'MySQL', value: 'mysql' },
      { name: 'MongoDB', value: 'mongodb' }
    ]
  },
  {
    type: 'input',
    name: 'host',
    message: 'Database host:',
    default: 'localhost'
  },
  {
    type: 'number',
    name: 'port',
    message: 'Database port:',
    default: (answers: any) => {
      switch (answers.type) {
        case 'postgres':
          return 5432;
        case 'mysql':
          return 3306;
        case 'mongodb':
          return 27017;
        default:
          return 5432;
      }
    }
  },
  {
    type: 'input',
    name: 'username',
    message: 'Username:'
  },
  {
    type: 'password',
    name: 'password',
    message: 'Password:'
  },
  {
    type: 'input',
    name: 'database',
    message: 'Database name:',
    default: 'my_app'
  }
];

export async function setupDatabase(): Promise<DatabaseConfig> {
  console.log(chalk.blue('\n[2] Database Configuration'));
  
  try {
    const dbConfig = await inquirer.prompt<DatabaseConfig>(databaseQuestions);
    console.log(chalk.green('\nDatabase configuration completed!'));
    
    return dbConfig;
  } catch (error) {
    throw new Error(`Error during database configuration: ${error}`);
  }
}