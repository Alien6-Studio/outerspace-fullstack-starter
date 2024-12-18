import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { ProjectConfig } from '../types/config.js';

const CONFIG_FILENAME = 'outerspace.config.json';

export class ConfigReader {
  private configPath: string;

  constructor(configPath: string = process.cwd()) {
    this.configPath = path.join(configPath, CONFIG_FILENAME);
  }

  async exists(): Promise<boolean> {
    try {
      await fs.access(this.configPath);
      return true;
    } catch {
      return false;
    }
  }

  async read(): Promise<ProjectConfig> {
    try {
      const configData = await fs.readFile(this.configPath, 'utf8');
      return JSON.parse(configData);
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        throw new Error(`Configuration file not found at ${this.configPath}`);
      }
      throw new Error(`Error reading configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async validate(config: ProjectConfig): Promise<boolean> {
    const requiredSections = ['info', 'database', 'i18n', 'theme'];
    const missingSections = requiredSections.filter(section => !config[section as keyof ProjectConfig]);

    if (missingSections.length > 0) {
      throw new Error(`Invalid configuration: Missing sections: ${missingSections.join(', ')}`);
    }

    return true;
  }

  async readAndValidate(): Promise<ProjectConfig> {
    const config = await this.read();
    await this.validate(config);
    return config;
  }
}

export async function getConfig(): Promise<ProjectConfig> {
  const reader = new ConfigReader();
  
  if (!(await reader.exists())) {
    console.error(chalk.red('No configuration file found. Run init first.'));
    process.exit(1);
  }

  try {
    const config = await reader.readAndValidate();
    return config;
  } catch (error) {
    console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
    process.exit(1);
  }
}