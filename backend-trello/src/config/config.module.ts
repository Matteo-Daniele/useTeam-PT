import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import appConfig from './app.config';
import databaseConfig from './database.config';
import n8nConfig from './n8n.config';
import { validationSchema } from './validation.schema';

@Module({
  imports: [
    // Carga y valida variables de entorno; expone ConfigService de forma global
     
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, n8nConfig],
       
      validationSchema,
    }),
  ],
})
export class ConfigModule {}
