import { Module } from '@nestjs/common';
import { BoardsModule } from '../boards/boards.module';
import { CardsModule } from '../cards/cards.module';
import { ColumnsModule } from '../columns/columns.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';

@Module({
  imports: [BoardsModule, ColumnsModule, CardsModule, RealtimeModule],
  controllers: [ExportController],
  providers: [ExportService],
  exports: [ExportService],
})
export class ExportModule {}
