import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ExportBacklogDto } from './dto/export-backlog.dto';
import { ExportService } from './export.service';

@Controller('export')
export class ExportController {
  constructor(private exportService: ExportService) {}

  @Post('backlog/:boardId')
  async exportBacklog(
    @Param('boardId') boardId: string,
    @Body() exportBacklogDto: ExportBacklogDto,
  ): Promise<{ message: string; requestId: string }> {
    try {
      const requestId = await this.exportService.exportBoardBacklog(
        boardId,
        exportBacklogDto,
      );
      
      return {
        message: 'Exportación iniciada exitosamente',
        requestId,
      };
    } catch (error) {
      throw new HttpException(
        `Error al exportar backlog: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
