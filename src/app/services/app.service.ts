import { Injectable } from '@nestjs/common';

import { EstimateDto, GetRatesQueryDto } from '@app/dtos';
import { BaseExchengeService } from '@app/abstract';

import { BinanceService } from '@app/services/binance.service';
import { KucoinService } from '@app/services/kucoin.service';
import { UniswapV2Service } from '@app/services/uniswap-v2.service';
import { RaydiumAmmService } from '@app/services/raydium-amm.service';

@Injectable()
export class AppService {
  constructor(
    private binanceService: BinanceService,
    private kucoinService: KucoinService,
    private uniswapV2Service: UniswapV2Service,
    private raydiumAmmService: RaydiumAmmService,
  ) {}

  private services: BaseExchengeService[] = [
    this.binanceService,
    this.kucoinService,
    this.uniswapV2Service,
    this.raydiumAmmService,
  ];

  async estimate({ inputAmount, outputCurrency, inputCurrency }: EstimateDto) {
    const res = await Promise.all(this.services.map(s => s.estimate(inputCurrency, outputCurrency, inputAmount)));

    const sorted = res.sort((a, b) => Number(b.outputAmount) - Number(a.outputAmount));

    return sorted[0];
  }

  async getRates({ baseCurrency, quoteCurrency }: GetRatesQueryDto) {
    return Promise.all(this.services.map(s => s.getRates(baseCurrency, quoteCurrency)));
  }
}
