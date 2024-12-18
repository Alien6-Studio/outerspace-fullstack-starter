export interface DatabaseConfig {
  type: 'postgres' | 'mysql' | 'mongodb';
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
}

export interface ProjectInfo {
  name: string;
  description: string;
}

export interface I18nConfig {
  enableI18n: boolean;
  defaultLanguage?: string;
  additionalLanguages?: string[];
}

export interface ThemeConfig {
  enableTheming: boolean;
  defaultTheme: 'light' | 'dark';
  allowUserPreference: boolean;
  enableSystemTheme: boolean;
}

export interface ProjectConfig {
  info: ProjectInfo;
  i18n: I18nConfig;
  theme: ThemeConfig;
  database: DatabaseConfig;
}
