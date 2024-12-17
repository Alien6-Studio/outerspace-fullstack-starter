// src/generator/project-generator.ts
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { ProjectConfig } from '../types/config.js';

export class ProjectGenerator {
  private sourceDir: string;
  private targetDir: string;

  constructor(
    private config: ProjectConfig,
    private projectName: string
  ) {
    // Go up from cli/dist to outerspace-fullstack-starter
    const projectRoot = path.resolve(process.cwd(), '..');
    this.sourceDir = path.join(projectRoot, 'packages');
    this.targetDir = path.join(process.cwd(), 'target', projectName);

    console.log(chalk.gray('Debug: Source directory path:', this.sourceDir));
    console.log(chalk.gray('Debug: Target directory path:', this.targetDir));
  }

  async generate(): Promise<void> {
    try {
      console.log(chalk.blue('\nGenerating project structure...'));
      
      // Validate source directory exists
      if (!await fs.pathExists(this.sourceDir)) {
        throw new Error(`Source packages directory not found at: ${this.sourceDir}`);
      }

      console.log(chalk.gray(`Creating project directory: ${this.targetDir}`));
      await this.createProjectDirectory();

      console.log(chalk.gray('Copying packages...'));
      await this.copyPackages();

      console.log(chalk.gray('Creating root package.json...'));
      await this.createRootPackageJson();

      console.log(chalk.green('\nProject structure generated successfully!'));
    } catch (error) {
      throw new Error(`Failed to generate project: ${error}`);
    }
  }

  private async createProjectDirectory(): Promise<void> {
    await fs.ensureDir(this.targetDir);
  }

  private async copyPackages(): Promise<void> {
    const backendSource = path.join(this.sourceDir, 'backend');
    const frontendSource = path.join(this.sourceDir, 'frontend');
    const backendTarget = path.join(this.targetDir, 'packages', 'backend');
    const frontendTarget = path.join(this.targetDir, 'packages', 'frontend');

    // Validate source directories
    if (!await fs.pathExists(backendSource)) {
      throw new Error(`Backend package not found at: ${backendSource}`);
    }
    if (!await fs.pathExists(frontendSource)) {
      throw new Error(`Frontend package not found at: ${frontendSource}`);
    }

    // Ensure target packages directory exists
    await fs.ensureDir(path.join(this.targetDir, 'packages'));

    // Copy packages
    await fs.copy(backendSource, backendTarget);
    await fs.copy(frontendSource, frontendTarget);
  }

  private async createRootPackageJson(): Promise<void> {
    const rootPackageJson = {
      name: this.projectName,
      private: true,
      workspaces: [
        "packages/*"
      ]
    };
    
    await fs.writeJSON(
      path.join(this.targetDir, 'package.json'),
      rootPackageJson,
      { spaces: 2 }
    );
  }
}