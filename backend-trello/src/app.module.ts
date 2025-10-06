import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BoardsModule } from './boards/boards.module';
import { CardsModule } from './cards/cards.module';
import { ColumnsModule } from './columns/columns.module';
import { ConfigModule } from './config';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
      }),
      inject: [ConfigService],
    }),
    BoardsModule,
    ColumnsModule,
    CardsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
