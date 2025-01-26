import { IsEnum, IsNotEmpty } from 'class-validator';

import { CryptoCurrency } from '@app/enums';

export class GetRatesQueryDto {
  @IsEnum(CryptoCurrency)
  @IsNotEmpty()
  baseCurrency: CryptoCurrency;

  @IsEnum(CryptoCurrency)
  @IsNotEmpty()
  quoteCurrency: CryptoCurrency;
}
