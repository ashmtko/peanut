import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AppService } from './services/app.service';
import { EstimateDto, GetRatesQueryDto } from './dtos';

@Controller()
export class AppController {
  constructor(private readonly service: AppService) {}

  @Post('/estimate')
  estimate(@Body() data: EstimateDto) {
    return this.service.estimate(data);
  }

  @Get('/getRates')
  getRates(@Query() query: GetRatesQueryDto) {
    return this.service.getRates(query);
  }
}
