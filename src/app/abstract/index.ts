import { CryptoCurrency, ExchangeName } from '@app/enums';
import { EstimateResponse, GetRatesResponse } from '@app/interfaces';

export abstract class BaseExchengeService {
  name: ExchangeName;

  constructor(name: ExchangeName) {
    this.name = name;
    console.info(`[${this.name}]: initialization...`);
  }

  abstract execute(input: CryptoCurrency, output: CryptoCurrency, amount: number): Promise<number | null>;

  async handle(input: CryptoCurrency, output: CryptoCurrency, amount: number) {
    try {
      return await this.execute(input, output, amount);
    } catch (e) {
      console.error(`[${this.name}]: ${e}`);
      return null;
    }
  }

  async estimate(input: CryptoCurrency, output: CryptoCurrency, amount: number): Promise<EstimateResponse> {
    console.info(`[${this.name}]: estimate exchange from ${amount} ${input} to ${output}`);

    const res = await this.handle(input, output, amount);

    return { exchangeName: this.name, outputAmount: res };
  }

  async getRates(input: CryptoCurrency, output: CryptoCurrency): Promise<GetRatesResponse> {
    console.info(`[${this.name}]: get rate from ${input} to ${output}`);

    const res = await this.handle(input, output, 1);

    return { exchangeName: this.name, rate: res };
  }
}
