// src/generator/db-generator.ts
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { DatabaseConfig } from '../types/config.js';

interface ModuleModifications {
  moduleConfig: {
    imports: string[];
  };
}

/**
 * Generator class responsible for handling all database-related configurations
 * including environment files, NestJS module modifications, and dependencies
 */
export class DatabaseGenerator {
  private templatesDir: string;
  private targetDir: string;
  private backendDir: string;
  private frontendDir: string;

  constructor(
    private dbConfig: DatabaseConfig,
    private projectName: string
  ) {
    // Go up from cli/dist to outerspace-fullstack-starter
    const projectRoot = path.resolve(process.cwd(), '..');
    this.templatesDir = path.join(projectRoot, 'templates');
    this.targetDir = path.join(process.cwd(), 'target', projectName);
    this.backendDir = path.join(this.targetDir, 'packages', 'backend');
    this.frontendDir = path.join(this.targetDir, 'packages', 'frontend');
  }

  private async validateTemplates(): Promise<void> {
    const requiredFiles = [
      path.join(this.templatesDir, 'backend', '.env.tpl'),
      path.join(this.templatesDir, 'frontend', '.env.tpl'),
      path.join(this.templatesDir, 'backend', `app.module.${this.dbConfig.type}.tpl`)
    ];

    for (const file of requiredFiles) {
      if (!await fs.pathExists(file)) {
        throw new Error(`Required template file not found: ${file}`);
      }
    }
  }

  /**
   * Main method to generate all database-related configurations
   * Handles environment files, NestJS module, and dependencies
   */
  async generate(): Promise<void> {
    try {
      console.log(chalk.blue('\nConfiguring database environment...'));

      // Verify templates directory and files exist
      if (!await fs.pathExists(this.templatesDir)) {
        throw new Error(`Templates directory not found at: ${this.templatesDir}`);
      }
      await this.validateTemplates();

      // Configure environments and modules
      await this.configureEnvironment('backend');
      await this.configureEnvironment('frontend');
      await this.configureNestModule();
      await this.updateBackendDependencies();

      console.log(chalk.green('Database configuration completed successfully!'));
    } catch (error) {
      throw new Error(`Failed to configure database environment: ${error}`);
    }
  }

  /**
   * Configures environment files for both backend and frontend
   */
  private async configureEnvironment(packageName: 'backend' | 'frontend'): Promise<void> {
    const templatePath = path.join(this.templatesDir, packageName, '.env.tpl');
    const targetPath = path.join(this.targetDir, 'packages', packageName, '.env');

    console.log(chalk.gray(`Configuring ${packageName} environment at: ${targetPath}`));

    try {
      const template = await fs.readFile(templatePath, 'utf-8');
      const envContent = this.replaceVariables(template);
      await fs.writeFile(targetPath, envContent);
    } catch (error) {
      throw new Error(`Failed to configure ${packageName} environment: ${error}`);
    }
  }

  /**
   * Configures the NestJS module with database-specific settings
   */
  private async configureNestModule(): Promise<void> {
    const modulePath = path.join(this.backendDir, 'src', 'app.module.ts');
    const templatePath = path.join(this.templatesDir, 'backend', `app.module.${this.dbConfig.type}.tpl`);
  
    try {
      const template = await fs.readFile(templatePath, 'utf-8');
      const modifications: ModuleModifications = JSON.parse(this.replaceVariables(template));
  
      const imports = this.insertImports();
      const moduleContent = this.updateModuleDecorator('', modifications.moduleConfig);
      
      const finalContent = imports + moduleContent;
      
      await fs.writeFile(modulePath, finalContent);
    } catch (error) {
      throw new Error(`Failed to modify NestJS module: ${error}`);
    }
  }

  /**
   * Insert imports at the top of the file, removing duplicates
   */
  private insertImports(): string {
    const uniqueImports = new Set([
      'import { Module } from \'@nestjs/common\';',
      'import { ConfigModule, ConfigService } from \'@nestjs/config\';',
      'import { TypeOrmModule } from \'@nestjs/typeorm\';',
      'import { AppController } from \'./app.controller\';',
      'import { AppService } from \'./app.service\';'
    ]);
  
    return Array.from(uniqueImports).join('\n') + '\n\n';
  }

  /**
   * Update the @Module decorator with new configuration
   */
  private updateModuleDecorator(content: string, moduleConfig: any): string {
    const formattedImports = moduleConfig.imports
      .map((imp: string, index: number, array: string[]) => {
        const isLast = index === array.length - 1;
        return imp.includes('{') 
          ? imp.split('\n').map(line => `    ${line}`).join('\n')
          : `    ${imp}${isLast ? '' : ','}`;
      })
      .join('\n');
  
    const newModule = `@Module({
    imports: [
  ${formattedImports}
    ],
    controllers: [AppController],
    providers: [AppService],
  })
  export class AppModule {}`;
  
    return newModule;
  }

  /**
   * Updates package.json with required database dependencies
   */
  private async updateBackendDependencies(): Promise<void> {
    const packageJsonPath = path.join(this.backendDir, 'package.json');
    console.log(chalk.gray('Updating backend dependencies...'));

    try {
      const packageJson = await fs.readJson(packageJsonPath);
      const dependencies = this.getDatabaseDependencies();
      
      packageJson.dependencies = {
        ...packageJson.dependencies,
        ...dependencies
      };

      await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    } catch (error) {
      throw new Error(`Failed to update backend dependencies: ${error}`);
    }
  }

  /**
   * Returns the appropriate database dependencies based on the selected database type
   */
  private getDatabaseDependencies(): Record<string, string> {
    switch (this.dbConfig.type) {
      case 'postgres':
        return {
          '@nestjs/typeorm': '^10.0.0',
          'typeorm': '^0.3.0',
          'pg': '^8.11.0'
        };
      case 'mysql':
        return {
          '@nestjs/typeorm': '^10.0.0',
          'typeorm': '^0.3.0',
          'mysql2': '^3.0.0'
        };
      case 'mongodb':
        return {
          '@nestjs/mongoose': '^10.0.0',
          'mongoose': '^7.0.0'
        };
      default:
        return {};
    }
  }

  /**
   * Replaces template variables with actual values from the database configuration
   */
  private replaceVariables(template: string): string {
    const { type, host, port, username, password, database } = this.dbConfig;
    
    return template
      .replace(/\${DATABASE_TYPE}/g, type)
      .replace(/\${DATABASE_HOST}/g, host || '')
      .replace(/\${DATABASE_PORT}/g, port?.toString() || '')
      .replace(/\${DATABASE_USER}/g, username || '')
      .replace(/\${DATABASE_PASSWORD}/g, password || '')
      .replace(/\${DATABASE_NAME}/g, database || '');
  }
}