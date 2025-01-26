import axios from 'axios';
import { Injectable } from '@nestjs/common';

import { BaseExchengeService } from '@app/abstract';
import { CryptoCurrency, ExchangeName } from '@app/enums';

@Injectable()
export class BinanceService extends BaseExchengeService {
  baseLink: string;

  constructor() {
    super(ExchangeName.Binance);

    this.baseLink = 'https://www.binance.com/bapi';
  }

  async execute(input: CryptoCurrency, output: CryptoCurrency, amount: number): Promise<number> {
    if (input === output) {
      return 1;
    }

    const res = await axios.post(`${this.baseLink}/margin/v2/public/new-otc/get-quote`, {
      allowBlock: '1',
      fromCoin: input,
      requestAmount: amount,
      requestCoin: input,
      toCoin: output,
      walletType: 'SPOT',
    });

    return Number(res.data.data.quotePrice) * amount;
  }
}
