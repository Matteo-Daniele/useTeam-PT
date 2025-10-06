import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CardsController } from './cards.controller';
import { CardsRepository } from './cards.repository';
import { CardsService } from './cards.service';
import { Card, CardSchema } from './schemas/card.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Card.name, schema: CardSchema }])
  ],
  controllers: [CardsController],
  providers: [CardsService, CardsRepository],
  exports: [CardsService, CardsRepository] // Para usar en otros módulos
})
export class CardsModule {}
