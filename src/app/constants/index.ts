import { CryptoCurrency, Network } from '../enums';

export const UNISWAP_V2_FACTORY_ADDRESS = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';

export const RAYDIUM_AMM_PROGRAM_ID = '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8';

export const tokens: {
  [network in Network]: {
    [token in CryptoCurrency]: string;
  };
} = {
  [Network.Ethereum]: {
    [CryptoCurrency.BTC]: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    [CryptoCurrency.ETH]: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    [CryptoCurrency.SOL]: '0xD31a59c85aE9D8edEFeC411D448f90841571b89c',
    [CryptoCurrency.USDT]: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  },
  [Network.Solana]: {
    [CryptoCurrency.BTC]: '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh',
    [CryptoCurrency.ETH]: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs',
    [CryptoCurrency.SOL]: 'So11111111111111111111111111111111111111112',
    [CryptoCurrency.USDT]: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  },
};
