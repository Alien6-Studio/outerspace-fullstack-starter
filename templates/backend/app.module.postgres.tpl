{
  "moduleConfig": {
    "imports": [
      "ConfigModule.forRoot()",
      "TypeOrmModule.forRootAsync({",
      "    imports: [ConfigModule]",
      "    useFactory: (configService: ConfigService) => ({",
      "      type: 'postgres'",
      "      host: configService.get('DATABASE_HOST')",
      "      port: configService.get('DATABASE_PORT')",
      "      username: configService.get('DATABASE_USER')",
      "      password: configService.get('DATABASE_PASSWORD')",
      "      database: configService.get('DATABASE_NAME')",
      "      entities: []",
      "      synchronize: process.env.NODE_ENV !== 'production'",
      "      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false",
      "    })",
      "    inject: [ConfigService]",
      "})"
    ]
  }
}