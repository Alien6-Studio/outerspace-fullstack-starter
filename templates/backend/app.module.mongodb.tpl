{
  "moduleConfig": {
    "imports": [
      "ConfigModule.forRoot()",
      "MongooseModule.forRootAsync({",
      "  imports: [ConfigModule],",
      "  useFactory: (configService: ConfigService) => ({",
      "    uri: `mongodb://${configService.get('DATABASE_USER')}:${configService.get('DATABASE_PASSWORD')}@${configService.get('DATABASE_HOST')}:${configService.get('DATABASE_PORT')}/${configService.get('DATABASE_NAME')}`,",
      "    useNewUrlParser: true,",
      "    useUnifiedTopology: true",
      "  }),",
      "  inject: [ConfigService]",
      "})"
    ]
  }
}