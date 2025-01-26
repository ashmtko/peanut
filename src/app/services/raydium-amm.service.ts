import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { LIQUIDITY_STATE_LAYOUT_V4 } from '@raydium-io/raydium-sdk';
import { Connection, PublicKey } from '@solana/web3.js';

import { BaseExchengeService } from '@app/abstract';
import { RAYDIUM_AMM_PROGRAM_ID, tokens } from '@app/constants';
import { CryptoCurrency, ExchangeName, Network } from '@app/enums';

@Injectable()
export class RaydiumAmmService extends BaseExchengeService {
  network: Network;
  connection: Connection;

  vaults: {
    [tokenA in CryptoCurrency]: {
      [tokenB in CryptoCurrency]: string | null;
    };
  };

  constructor(private configService: ConfigService) {
    super(ExchangeName.RaydiumAMM);

    const link = this.configService.get('SOLANA_HTTP_ENDPOINT');

    this.network = Network.Solana;
    this.connection = new Connection(link, 'finalized');
  }

  async onModuleInit() {
    console.info('retrieving additional info for Raydium AMM service...');

    const data = Object.entries(tokens[this.network]);

    const mapping = {};

    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data.length; j++) {
        const [baseSymbol, baseMintAddress] = data[i];
        const [quoteSymbol, quoteMintAddress] = data[j];

        if (baseSymbol === quoteSymbol) {
          continue;
        }

        const baseMint = new PublicKey(baseMintAddress);
        const quoteMint = new PublicKey(quoteMintAddress);

        const programAccounts = await this.connection.getProgramAccounts(new PublicKey(RAYDIUM_AMM_PROGRAM_ID), {
          filters: [
            { dataSize: LIQUIDITY_STATE_LAYOUT_V4.span },
            {
              memcmp: {
                offset: LIQUIDITY_STATE_LAYOUT_V4.offsetOf('baseMint'),
                bytes: baseMint.toBase58(),
              },
            },
            {
              memcmp: {
                offset: LIQUIDITY_STATE_LAYOUT_V4.offsetOf('quoteMint'),
                bytes: quoteMint.toBase58(),
              },
            },
          ],
        });

        if (programAccounts.length === 0) {
          if (!this.vaults?.[baseSymbol]?.[quoteSymbol] || !this.vaults?.[quoteSymbol]?.[baseSymbol]) {
            this.vaults = {
              ...this.vaults,
              [baseSymbol]: {
                ...this.vaults?.[baseSymbol],
                [quoteSymbol]: null,
              },
              [quoteSymbol]: {
                ...this.vaults?.[quoteSymbol],
                [baseSymbol]: null,
              },
            };
          }
          continue;
        }

        for (const item of programAccounts) {
          const marketData = LIQUIDITY_STATE_LAYOUT_V4.decode(item.account.data);

          if (mapping[baseSymbol]?.[quoteSymbol] > Number(marketData.swapBaseInAmount)) {
            continue;
          }

          mapping[baseSymbol] = { ...mapping[baseSymbol], [quoteSymbol]: Number(marketData.swapBaseInAmount) };
          mapping[quoteSymbol] = { ...mapping[quoteSymbol], [baseSymbol]: Number(marketData.swapQuoteInAmount) };

          this.vaults = {
            ...this.vaults,
            [baseSymbol]: {
              ...this.vaults?.[baseSymbol],
              [quoteSymbol]: marketData.baseVault.toBase58(),
            },
            [quoteSymbol]: {
              ...this.vaults?.[quoteSymbol],
              [baseSymbol]: marketData.quoteVault.toBase58(),
            },
          };
        }
      }
    }
  }

  async execute(input: CryptoCurrency, output: CryptoCurrency, amount: number): Promise<number | null> {
    if (input === output) {
      return 1;
    }

    const baseVault = this.vaults[input][output];
    const quoteVault = this.vaults[output][input];

    if (!baseVault || !quoteVault) {
      return null;
    }

    const publicKeys = [baseVault, quoteVault].map(item => new PublicKey(item));
    const res = await this.connection.getMultipleParsedAccounts(publicKeys);

    const [reserve0, reserve1] = res.value.map(item => {
      if (item && 'parsed' in item?.data) {
        const { amount, decimals } = item?.data.parsed.info.tokenAmount;

        return Number(amount) / 10 ** decimals;
      }
    });

    if (!reserve0 || !reserve1) {
      return null;
    }

    return reserve1 / reserve0;
  }
}
