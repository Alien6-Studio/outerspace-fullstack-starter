import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { exec } from 'child_process';
import { promisify } from 'util';
import { ProjectConfig } from '../types/config.js';

export class ThemeGenerator {
  private templatesDir: string;
  private targetDir: string;
  private frontendDir: string;

  constructor(
    private config: ProjectConfig
  ) {
    const projectRoot = path.resolve(process.cwd(), '..');
    this.templatesDir = path.join(projectRoot, 'templates');
    this.targetDir = path.join(process.cwd(), 'target', config.info.name);
    this.frontendDir = path.join(this.targetDir, 'packages', 'frontend');
  }

  /**
   * Validates the existence of all required template files
   */
  private async validateTemplates(): Promise<void> {
    const requiredFiles = [
      path.join(this.templatesDir, 'frontend', 'theme', 'theme-provider.tsx.tpl'),
      path.join(this.templatesDir, 'frontend', 'theme', 'theme-toggle.tsx.tpl'),
      path.join(this.templatesDir, 'frontend', 'theme', 'tailwind.theme.tpl'),
      path.join(this.templatesDir, 'frontend', 'theme', 'globals.css.tpl')
    ];

    for (const file of requiredFiles) {
      if (!await fs.pathExists(file)) {
        throw new Error(`Required template file not found: ${file}`);
      }
    }
  }

  /**
   * Main generation function that orchestrates the theme setup process
   */
  async generate(): Promise<void> {
    if (!this.config.theme.enableTheming) {
      console.log(chalk.yellow('Theme support is disabled, skipping...'));
      return;
    }

    try {
      console.log(chalk.blue('\nConfiguring theme support...'));
      await this.validateTemplates();
      await this.createDirectoryStructure();
      await this.installShadcnComponents();
      await this.copyAndProcessTemplates();
      await this.updatePackageJson();
      await this.updateTailwindConfig();
      await this.updateLayout();
    } catch (error) {
      throw new Error(`Failed to configure theme support: ${error}`);
    }
  }

  /**
   * Creates the necessary directory structure
   */
  private async createDirectoryStructure(): Promise<void> {
    const directories = [
      path.join(this.frontendDir, 'theme'),
      path.join(this.frontendDir, 'components', 'ui')
    ];

    for (const dir of directories) {
      await fs.ensureDir(dir);
    }
  }

  /**
   * Installs required shadcn/ui components using CLI
   */
  private async installShadcnComponents(): Promise<void> {
    console.log(chalk.blue('\nInstalling shadcn/ui components...'));
      
    const execAsync = promisify(exec);
    
    try {
      const dependencies = [
        '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-slot',
        'class-variance-authority',
        'clsx',
        'tailwind-merge',
        'lucide-react'
      ];
  
      console.log(chalk.gray('Installing shadcn/ui dependencies...'));
      const installCommand = `npm install ${dependencies.join(' ')}`;
      await execAsync(installCommand, { cwd: this.frontendDir });

      await fs.ensureDir(path.join(this.frontendDir, 'components', 'ui'));
      await fs.ensureDir(path.join(this.frontendDir, 'lib'));
  
      const componentsToDownload = [
        {
          url: 'https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/registry/default/ui/button.tsx',
          dest: path.join(this.frontendDir, 'components', 'ui', 'button.tsx')
        },
        {
          url: 'https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/registry/default/ui/dropdown-menu.tsx',
          dest: path.join(this.frontendDir, 'components', 'ui', 'dropdown-menu.tsx')
        },
        {
          url: 'https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/lib/utils.ts',
          dest: path.join(this.frontendDir, 'lib', 'utils.ts')
        }
      ];
  
      for (const { url, dest } of componentsToDownload) {
        console.log(chalk.gray(`Downloading: ${path.basename(dest)}`));
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to download ${url}`);
        const content = await response.text();
        await fs.writeFile(dest, content);
      }
  
      console.log(chalk.green('✓ Installed UI components'));
    } catch (error) {
      console.error(chalk.red(`Failed during component installation:`, error));
      throw error;
    }
  }

  /**
   * Replaces template variables with actual values
   */
  private replaceVariables(content: string): string {
    return content
      .replace(/\${DEFAULT_THEME}/g, this.config.theme.defaultTheme || 'light')
      .replace(/\${ENABLE_SYSTEM_THEME}/g, String(this.config.theme.enableSystemTheme))
      .replace(/\${ALLOW_USER_PREFERENCE}/g, String(this.config.theme.allowUserPreference))
      .replace(/\${PROJECT_NAME}/g, this.config.info.name)
      .replace(/\${PROJECT_DESCRIPTION}/g, this.config.info.description || '');
  }

  /**
   * Copies and processes all theme-related templates
   */
  private async copyAndProcessTemplates(): Promise<void> {
    const templates = [
      {
        src: path.join('theme', 'theme-provider.tsx.tpl'),
        dest: path.join('theme', 'theme-provider.tsx')
      },
      {
        src: path.join('theme', 'theme-toggle.tsx.tpl'),
        dest: path.join('components', 'ui', 'theme-toggle.tsx')
      },
      {
        src: path.join('theme', 'tailwind.theme.tpl'),
        dest: path.join('theme', 'colors.ts')
      }
    ];

    for (const { src, dest } of templates) {
      const templatePath = path.join(this.templatesDir, 'frontend', src);
      const targetPath = path.join(this.frontendDir, dest);

      let content = await fs.readFile(templatePath, 'utf-8');
      content = this.replaceVariables(content);

      await fs.ensureDir(path.dirname(targetPath));
      await fs.writeFile(targetPath, content);
    }

    // Handle globals.css separately
    await this.updateGlobalsCss();
  }

  /**
   * Updates globals.css by merging theme styles with existing content
   */
  private async updateGlobalsCss(): Promise<void> {
    const globalsPath = path.join(this.frontendDir, 'app', 'globals.css');
    const templatePath = path.join(this.templatesDir, 'frontend', 'theme', 'globals.css.tpl');

    let existingContent = '';
    if (await fs.pathExists(globalsPath)) {
      existingContent = await fs.readFile(globalsPath, 'utf-8');
    }

    const themeContent = await fs.readFile(templatePath, 'utf-8');

    // Only add Tailwind directives if they don't exist
    const tailwindDirectives = '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n';
    if (!existingContent.includes('@tailwind')) {
      existingContent = tailwindDirectives + existingContent;
    }

    // Only add theme variables if they don't exist
    if (!existingContent.includes(':root')) {
      existingContent += '\n' + themeContent.split('@layer base {')[1];
    }

    await fs.writeFile(globalsPath, existingContent);
  }

  /**
   * Updates package.json with required dependencies
   */
  private async updatePackageJson(): Promise<void> {
    const packageJsonPath = path.join(this.frontendDir, 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);

    packageJson.dependencies = {
      ...packageJson.dependencies,
      'next-themes': '^0.4.4'
    };

    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }

  /**
   * Updates Tailwind configuration with theme settings
   */
  private async updateTailwindConfig(): Promise<void> {
    const configPath = path.join(this.frontendDir, 'tailwind.config.ts');

    if (await fs.pathExists(configPath)) {
      let config = await fs.readFile(configPath, 'utf-8');

      // Add colors import if not present
      if (!config.includes('./theme/colors')) {
        config = `import { colors } from "./theme/colors";\n${config}`;
      }

      // Add darkMode configuration if not present
      if (!config.includes('darkMode:')) {
        config = config.replace(
          'export default {',
          `export default {
  darkMode: "class",`
        );
      }

      // Update or add theme colors configuration
      if (config.includes('theme: {')) {
        config = config.replace(
          /theme:\s*{([^}]*)}/,
          `theme: {
    extend: {
      colors: {
        ...colors,
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))"
      },
    }
  }`
        );
      }

      await fs.writeFile(configPath, config);
    }
  }

  /**
   * Updates the layout file with ThemeProvider
   */
  private async updateLayout(): Promise<void> {
    const layoutPath = path.join(this.frontendDir, 'app', 'layout.tsx');

    if (await fs.pathExists(layoutPath)) {
      let layoutContent = await fs.readFile(layoutPath, 'utf-8');

      // Add ThemeProvider import if not present
      if (!layoutContent.includes('theme-provider')) {
        // Add import after existing imports
        const importIndex = layoutContent.lastIndexOf('import');
        const importEndIndex = layoutContent.indexOf(';', importIndex) + 1;
        layoutContent = layoutContent.slice(0, importEndIndex) +
          '\nimport { ThemeProvider } from "@/theme/theme-provider";' +
          layoutContent.slice(importEndIndex);
      }

      layoutContent = layoutContent.replace(
        /{children}/,
        `<ThemeProvider
          attribute="class"
          defaultTheme="${this.config.theme.defaultTheme}"
          enableSystem={${this.config.theme.enableSystemTheme}}
        >
          {children}
        </ThemeProvider>`
      );

      await fs.writeFile(layoutPath, layoutContent);
    }
  }
}