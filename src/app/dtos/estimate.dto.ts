import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

import { CryptoCurrency } from '@app/enums';

export class EstimateDto {
  @IsNumber()
  @IsNotEmpty()
  inputAmount: number;

  @IsEnum(CryptoCurrency)
  @IsNotEmpty()
  inputCurrency: CryptoCurrency;

  @IsEnum(CryptoCurrency)
  @IsNotEmpty()
  outputCurrency: CryptoCurrency;
}
