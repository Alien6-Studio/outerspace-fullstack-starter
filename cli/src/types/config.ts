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

export interface ProjectConfig {
  info: ProjectInfo;
  database: DatabaseConfig;
}
