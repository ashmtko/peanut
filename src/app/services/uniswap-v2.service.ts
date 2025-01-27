import axios, { AxiosResponse } from 'axios';
import { ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

import FactoryAbi from '@abis/uniswap-v2/factory.json';
import PairAbi from '@abis/uniswap-v2/pair.json';
import Erc20Abi from '@abis/common/erc20.json';

import { BaseExchengeService } from '@app/abstract';
import { tokens, UNISWAP_V2_FACTORY_ADDRESS } from '@app/constants';
import { CryptoCurrency, ExchangeName, Network } from '@app/enums';
import { EthereumRequestPayload, EthereumResponse, FullEthereumRequest } from '@app/interfaces';

@Injectable()
export class UniswapV2Service extends BaseExchengeService {
  network: Network;
  provider: ethers.JsonRpcProvider;
  rpcLink: string;

  decimals: {
    [tokenA in CryptoCurrency]: number;
  };
  pairs: {
    [tokenA in CryptoCurrency]: {
      [tokenB in CryptoCurrency]: string | null;
    };
  };

  constructor(private configService: ConfigService) {
    super(ExchangeName.UniswapV2);
    // Decided to choose ethereum as network
    this.rpcLink = this.configService.get('ETHEREUM_HTTP_ENDPOINT')!;

    this.network = Network.Ethereum;
    this.provider = new ethers.JsonRpcProvider(this.rpcLink);
  }

  async batchRequest(data: EthereumRequestPayload[]): Promise<EthereumResponse[]> {
    const res = await axios.post<EthereumResponse[], AxiosResponse<EthereumResponse[]>, FullEthereumRequest[]>(
      this.rpcLink,
      data.map((req, i) => ({ ...req, jsonrpc: '2.0', id: i + 1 })),
    );

    return res.data;
  }

  async onModuleInit() {
    console.info(`[${this.name}]: retrieving additional info...`);

    const tokensAddresses = Object.values(tokens[this.network]);
    const tokensSymbols = Object.keys(tokens[this.network]);

    const poolsCalls: EthereumRequestPayload[] = [];
    const factoryIface = new ethers.Interface(FactoryAbi);

    for (let i = 0; i < tokensAddresses.length - 1; i++) {
      for (let j = i + 1; j < tokensAddresses.length; j++) {
        const addressA = tokensAddresses[i];
        const addressB = tokensAddresses[j];

        poolsCalls.push({
          method: 'eth_call',
          params: [
            {
              to: UNISWAP_V2_FACTORY_ADDRESS,
              data: factoryIface.encodeFunctionData('getPair', [addressA, addressB]),
            },
            'latest',
          ],
        });
      }
    }

    const pools = await this.batchRequest(poolsCalls);

    for (let i = 0; i < tokensSymbols.length - 1; i++) {
      for (let j = i + 1; j < tokensSymbols.length; j++) {
        const symbolA = tokensSymbols[i];
        const symbolB = tokensSymbols[j];

        const res = pools.shift();

        if (!res) {
          throw new Error(`no pool for such tokens: ${symbolA}-${symbolB}`);
        }

        const pair = factoryIface.decodeFunctionResult('getPair', res.result)[0];

        this.pairs = {
          ...this.pairs,
          [symbolA]: {
            ...this.pairs?.[symbolA],
            [symbolB]: pair !== ethers.ZeroAddress ? pair : null,
          },
          [symbolB]: {
            ...this.pairs?.[symbolB],
            [symbolA]: pair !== ethers.ZeroAddress ? pair : null,
          },
        };
      }
    }

    const decimalsCalls: EthereumRequestPayload[] = [];
    const erc20Iface = new ethers.Interface(Erc20Abi);

    for (const address of tokensAddresses) {
      decimalsCalls.push({
        method: 'eth_call',
        params: [
          {
            to: address,
            data: erc20Iface.encodeFunctionData('decimals'),
          },
          'latest',
        ],
      });
    }

    const decimals = await this.batchRequest(decimalsCalls);

    for (const symbol of tokensSymbols) {
      const res = decimals.shift();

      if (!res) {
        throw new Error(`no decimals for such token: ${symbol}`);
      }

      const tokenDecimals = erc20Iface.decodeFunctionResult('decimals', res.result)[0];
      this.decimals = { ...this.decimals, [symbol]: Number(tokenDecimals) };
    }

    console.info(`[${this.name}]: done✅`);
  }

  async execute(input: CryptoCurrency, output: CryptoCurrency, amount: number): Promise<number | null> {
    if (input === output) {
      return 1;
    }

    const pairAddress = this.pairs[input][output];

    if (!pairAddress) {
      throw new Error('no pair address');
    }

    const pairIface = new ethers.Interface(PairAbi);

    const calls: EthereumRequestPayload[] = [
      {
        method: 'eth_call',
        params: [
          {
            to: pairAddress,
            data: pairIface.encodeFunctionData('getReserves'),
          },
          'latest',
        ],
      },
      {
        method: 'eth_call',
        params: [
          {
            to: pairAddress,
            data: pairIface.encodeFunctionData('token0'),
          },
          'latest',
        ],
      },
    ];

    const res = await this.batchRequest(calls);

    const reserves = pairIface.decodeFunctionResult('getReserves', res[0].result).toArray().slice(0, 2);
    const token0 = pairIface.decodeFunctionResult('token0', res[1].result)[0];

    const decimals0 = this.decimals[input];
    const decimals1 = this.decimals[output];

    const inputAddress = tokens[this.network][input];

    const [reserve0, reserve1] = inputAddress === token0 ? reserves : reserves.reverse();

    const adjustedReserves0 = Number(reserve0) / 10 ** decimals0;
    const adjustedReserves1 = Number(reserve1) / 10 ** decimals1;

    const price = adjustedReserves1 / adjustedReserves0;

    const withSlipage = (price * 997) / 1000;

    return withSlipage * amount;
  }
}
