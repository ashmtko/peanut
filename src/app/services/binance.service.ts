import axios from 'axios';
import { Injectable } from '@nestjs/common';

import { BaseExchengeService } from '@app/abstract';
import { CryptoCurrency, ExchangeName } from '@app/enums';

@Injectable()
export class BinanceService extends BaseExchengeService {
  baseLink: string;

  constructor() {
    super(ExchangeName.Binance);

    this.baseLink = 'https://api.binance.com';
  }

  async getPrice(input: CryptoCurrency) {
    const baseCurrency = CryptoCurrency.USDT;

    if (input === baseCurrency) {
      return 1;
    }

    const res = await axios.get(`${this.baseLink}/api/v3/depth?symbol=${input}${baseCurrency}&limit=1`);

    return Number(res.data.asks[0][0]);
  }

  async execute(input: CryptoCurrency, output: CryptoCurrency, amount: number): Promise<number> {
    if (input === output) {
      return 1;
    }

    const inputPrice = await this.getPrice(input);

    const outputPrice = await this.getPrice(output);

    return (inputPrice / outputPrice) * amount;
  }
}
