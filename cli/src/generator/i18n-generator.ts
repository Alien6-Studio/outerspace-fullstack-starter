import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { I18nConfig, ProjectInfo } from '../types/config.js';

export class I18nGenerator {
  private templatesDir: string;
  private targetDir: string;
  private frontendDir: string;

  constructor(
    private i18nConfig: I18nConfig,
    private projectInfo: ProjectInfo
  ) {
    const projectRoot = path.resolve(process.cwd(), '..');
    this.templatesDir = path.join(projectRoot, 'templates');
    this.targetDir = path.join(process.cwd(), 'target', projectInfo.name);
    this.frontendDir = path.join(this.targetDir, 'packages', 'frontend');
  }

  private async validateTemplates(): Promise<void> {
    const requiredFiles = [
      path.join(this.templatesDir, 'frontend', 'i18n', '[locale]', 'layout.tsx.tpl'),
      path.join(this.templatesDir, 'frontend', 'i18n', '[locale]', 'page.tsx.tpl'),
      path.join(this.templatesDir, 'frontend', 'i18n', 'config', 'request.ts.tpl'),
      path.join(this.templatesDir, 'frontend', 'i18n', 'config', 'routing.ts.tpl'),
      path.join(this.templatesDir, 'frontend', 'i18n', 'middleware.ts.tpl'),
      path.join(this.templatesDir, 'frontend', 'i18n', 'next-config.i18n.tpl'),
    ];

    for (const file of requiredFiles) {
      if (!await fs.pathExists(file)) {
        throw new Error(`Required template file not found: ${file}`);
      }
    }
  }

  async generate(): Promise<void> {
    if (!this.i18nConfig.enableI18n || !this.i18nConfig.defaultLanguage || !this.i18nConfig.additionalLanguages) {
      console.log(chalk.yellow('Internationalization is disabled or not fully configured, skipping...'));
      return;
    }

    try {
      console.log(chalk.blue('\nConfiguring internationalization...'));
      await this.validateTemplates();
      await this.createDirectoryStructure();
      await this.copyAndProcessTemplates();
      await this.updatePackageJson();
      console.log(chalk.green('Internationalization configuration completed successfully!'));
    } catch (error) {
      throw new Error(`Failed to configure internationalization: ${error}`);
    }
  }

  private getLanguageMapping(): string {
    const languages = [this.i18nConfig.defaultLanguage, ...this.i18nConfig.additionalLanguages ?? []];
    return languages
      .filter((lang): lang is string => !!lang)
      .map(lang => `'${lang}': '${lang.split('-')[0].toUpperCase()}'`)
      .join(',\n  ');
  }

  private replaceVariables(content: string): string {
    if (!this.i18nConfig.defaultLanguage || !this.i18nConfig.additionalLanguages) {
      throw new Error('Default language and additional languages must be defined when i18n is enabled');
    }

    const localesList = [this.i18nConfig.defaultLanguage, ...this.i18nConfig.additionalLanguages]
      .map(locale => `'${locale}'`)
      .join(', ');

    const localesArray = [this.i18nConfig.defaultLanguage, ...this.i18nConfig.additionalLanguages]
      .map(locale => `{ locale: '${locale}' }`)
      .join(',\n    ');

      return content
      .replace(/\${LANGUAGE_MAPPING}/g, this.getLanguageMapping())
      .replace(/\${LOCALES_LIST}/g, localesList)
      .replace(/\${LOCALES_ARRAY}/g, localesArray)
      .replace(/\${DEFAULT_LOCALE}/g, this.i18nConfig.defaultLanguage || 'en')
      .replace(/\${PROJECT_NAME}/g, this.projectInfo.name)
      .replace(/\${PROJECT_DESCRIPTION}/g, this.projectInfo.description);
  }

  private async createDirectoryStructure(): Promise<void> {
    const directories = [
      path.join(this.frontendDir, 'i18n', 'locales'),
      path.join(this.frontendDir, 'app', '[locale]')
    ];
  
    for (const dir of directories) {
      await fs.ensureDir(dir);
    }
  }

  private async copyAndProcessTemplates(): Promise<void> {
    const templates = [
      {
        src: path.join('i18n', '[locale]', 'layout.tsx.tpl'),
        dest: path.join('app', '[locale]', 'layout.tsx')
      },
      {
        src: path.join('i18n', '[locale]', 'page.tsx.tpl'),
        dest: path.join('app', '[locale]', 'page.tsx')
      },
      {
        src: path.join('i18n', 'config', 'request.ts.tpl'),
        dest: path.join('i18n', 'request.ts')
      },
      {
        src: path.join('i18n', 'config', 'routing.ts.tpl'),
        dest: path.join('i18n', 'routing.ts')
      },
      {
        src: path.join('i18n', 'middleware.ts.tpl'),
        dest: 'middleware.ts'
      },
      {
        src: path.join('i18n', 'next-config.i18n.tpl'),
        dest: 'next.config.ts'
      },
      {
        src: path.join('i18n', 'components', 'language-selector.tsx.tpl'),
        dest: path.join('components', 'ui', 'language-selector.tsx')
      }
    ];
  
    await fs.ensureDir(path.join(this.frontendDir, 'i18n', 'locales'));
    await fs.ensureDir(path.join(this.frontendDir, 'app', '[locale]'));
    await fs.ensureDir(path.join(this.frontendDir, 'components', 'ui'));

    for (const { src, dest } of templates) {
      const templatePath = path.join(this.templatesDir, 'frontend', src);
      const targetPath = path.join(this.frontendDir, dest);
  
      let content = await fs.readFile(templatePath, 'utf-8');
      content = this.replaceVariables(content);
  
      await fs.ensureDir(path.dirname(targetPath));
      await fs.writeFile(targetPath, content);
    }
  
    const nextConfigPath = path.join(this.frontendDir, 'next.config.ts');
    if (await fs.pathExists(nextConfigPath)) {
      let nextConfig = await fs.readFile(nextConfigPath, 'utf-8');
      const i18nConfig = `
    i18n: {
      defaultLocale: '${this.i18nConfig.defaultLanguage}',
      locales: [${[this.i18nConfig.defaultLanguage, ...this.i18nConfig.additionalLanguages ?? []].map(l => `'${l}'`).join(', ')}],
    },`;
      
      nextConfig = nextConfig.replace(
        /const nextConfig: NextConfig = {([^}]*)}/,
        `const nextConfig: NextConfig = {$1  ${i18nConfig}\n};`
      );
      
      await fs.writeFile(nextConfigPath, nextConfig);
    }
  
    if (this.i18nConfig.defaultLanguage && this.i18nConfig.additionalLanguages) {
      const languages = [this.i18nConfig.defaultLanguage, ...this.i18nConfig.additionalLanguages];
      for (const lang of languages) {
        await this.generateMessageFile(lang);
      }
    }
  }

  private async generateMessageFile(locale: string): Promise<void> {
    const templatePath = path.join(this.templatesDir, 'frontend', 'i18n', 'messages', 'default.json.tpl');
    const targetPath = path.join(this.frontendDir, 'i18n', 'locales', `${locale}.json`);
  
    let content = await fs.readFile(templatePath, 'utf-8');
    content = this.replaceVariables(content);
  
    await fs.writeFile(targetPath, content);
  }  

  private async updatePackageJson(): Promise<void> {
    const packageJsonPath = path.join(this.frontendDir, 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);

    packageJson.dependencies = {
      ...packageJson.dependencies,
      'next-intl': '^3.0.0'
    };

    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }
}