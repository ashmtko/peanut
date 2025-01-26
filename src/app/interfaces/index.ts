import { ExchangeName } from '@app/enums';

export interface EstimateResponse {
  exchangeName: ExchangeName;
  outputAmount: number | null;
}

export interface GetRatesResponse {
  exchangeName: ExchangeName;
  rate: number | null;
}

export interface EthereumRequestPayload {
  method: string;
  params: [
    {
      to: string;
      data: string;
    },
    string,
  ];
}

export interface FullEthereumRequest extends EthereumRequestPayload {
  jsonrpc: string;
  id: number;
}

export interface EthereumResponse {
  jsonrpc: string;
  id: number;
  result: string;
}
