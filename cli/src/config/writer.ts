import fs from 'fs-extra';
import path from 'path';
import { ProjectConfig } from '../types/config.js';

export const CONFIG_FILENAME = 'outerspace.config.json';

export async function writeConfig(config: ProjectConfig): Promise<void> {
  try {
    let targetDir = path.join(process.cwd(), 'target');
    await fs.ensureDir(targetDir);
    await fs.writeFile(
      path.join(process.cwd(), 'target', CONFIG_FILENAME),
      JSON.stringify(config, null, 2),
      'utf-8'
    );
  } catch (error) {
    throw new Error(`Failed to write configuration file: ${error}`);
  }
}

export async function readConfig(): Promise<ProjectConfig> {
  try {
    const configContent = await fs.readFile(
      path.join(process.cwd(), CONFIG_FILENAME),
      'utf-8'
    );
    return JSON.parse(configContent) as ProjectConfig;
  } catch (error) {
    throw new Error(`Failed to read configuration file: ${error}`);
  }
}