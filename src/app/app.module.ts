import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './services/app.service';
import { KucoinService } from './services/kucoin.service';
import { BinanceService } from './services/binance.service';
import { UniswapV2Service } from './services/uniswap-v2.service';
import { RaydiumAmmService } from './services/raydium-amm.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController],
  providers: [AppService, KucoinService, BinanceService, UniswapV2Service, RaydiumAmmService],
})
export class AppModule {}
