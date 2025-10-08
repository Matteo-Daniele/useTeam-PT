import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RealtimeModule } from '../realtime/realtime.module';
import { ColumnsController } from './columns.controller';
import { ColumnsRepository } from './columns.repository';
import { ColumnsService } from './columns.service';
import { Column, ColumnSchema } from './schemas/column.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Column.name, schema: ColumnSchema }]),
    RealtimeModule
  ],
  controllers: [ColumnsController],
  providers: [ColumnsService, ColumnsRepository],
  exports: [ColumnsService, ColumnsRepository] // Para usar en otros módulos
})
export class ColumnsModule {}
