import { CryptoCurrency, ExchangeName } from '@app/enums';
import { EstimateResponse, GetRatesResponse } from '@app/interfaces';

export abstract class BaseExchengeService {
  name: ExchangeName;

  constructor(name: ExchangeName) {
    this.name = name;
  }

  abstract execute(input: CryptoCurrency, output: CryptoCurrency, amount: number): Promise<number | null>;

  async estimate(input: CryptoCurrency, output: CryptoCurrency, amount: number): Promise<EstimateResponse> {
    const res = await this.execute(input, output, amount);

    return { exchangeName: this.name, outputAmount: res };
  }

  async getRates(input: CryptoCurrency, output: CryptoCurrency): Promise<GetRatesResponse> {
    const res = await this.execute(input, output, 1);

    return { exchangeName: this.name, rate: res };
  }
}
