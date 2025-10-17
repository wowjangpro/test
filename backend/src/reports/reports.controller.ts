import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  ValidationPipe,
  UsePipes,
  Param,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto';
import { ClientIp } from '../common/decorators';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createReportDto: CreateReportDto, @ClientIp() clientIp: string) {
    return this.reportsService.create(createReportDto, clientIp);
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('targetType') targetType?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reportsService.findAll({
      status,
      targetType,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('count/:targetType/:targetId')
  async getReportCount(
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
  ) {
    const count = await this.reportsService.getReportCount(targetType, targetId);
    const shouldBlur = await this.reportsService.shouldBlur(targetType, targetId);
    return { count, shouldBlur };
  }
}
