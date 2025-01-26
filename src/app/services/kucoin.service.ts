import axios from 'axios';
import { Injectable } from '@nestjs/common';

import { BaseExchengeService } from '@app/abstract';
import { CryptoCurrency, ExchangeName } from '@app/enums';

@Injectable()
export class KucoinService extends BaseExchengeService {
  baseLink: string;

  constructor() {
    super(ExchangeName.KuCoin);

    this.baseLink = 'https://api.kucoin.com/api/v1';
  }

  async getPrice(input: CryptoCurrency) {
    const baseCurrency = CryptoCurrency.USDT;

    if (input === baseCurrency) {
      return 1;
    }

    const res = await axios.get(`${this.baseLink}/market/orderbook/level1?symbol=${input}-${baseCurrency}`);

    return Number(res.data.data.price);
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
