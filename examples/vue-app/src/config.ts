import { CHAIN_NAMESPACES, ChainNamespaceType, CustomChainConfig, WEB3AUTH_NETWORK, WEB3AUTH_NETWORK_TYPE } from "@web3auth/base";

export const GOOGLE = "google";
export const FACEBOOK = "facebook";
export const REDDIT = "reddit";
export const DISCORD = "discord";
export const TWITCH = "twitch";
export const GITHUB = "github";
export const APPLE = "apple";
export const LINKEDIN = "linkedin";
export const TWITTER = "twitter";
export const WEIBO = "weibo";
export const LINE = "line";
export const EMAIL_PASSWORD = "email_password";
export const PASSWORDLESS = "passwordless";
export const HOSTED_EMAIL_PASSWORDLESS = "hosted_email_passwordless";
export const HOSTED_SMS_PASSWORDLESS = "hosted_sms_passwordless";
export const PASSKEYS_LOGIN = "passkeys_login";
export const PASSKEYS_REGISTER = "passkeys_register";
export const COGNITO = "cognito";
export const AUTH_DOMAIN = "https://torus-test.auth0.com";
export const COGNITO_AUTH_DOMAIN = "https://torus-test.auth.ap-southeast-1.amazoncognito.com/oauth2/";
export const TORUS_EMAIL_PASSWORDLESS = "torus_email_passwordless";
export const TORUS_SMS_PASSWORDLESS = "torus_sms_passwordless";
export const LOCAL_NETWORK = "network";
export const WEB3AUTH_CLIENT_ID = "BJ6l3_kIQiy6YVL7zDlCcEAvGpGukwFgp-C_0WvNI_fAEeIaoVRLDrV5OjtbZr_zJxbyXFsXMT-yhQiUNYvZWpo";

export interface LoginProviderItem {
  name: string;
  clientId: string;
  verifier: string;
}

export type FormData = {
  network: WEB3AUTH_NETWORK_TYPE;
  chainNamespace: ChainNamespaceType;
  chain: string;
};

export const networkOptions = Object.values(WEB3AUTH_NETWORK).map((x) => ({ name: x, value: x }));

export const chainNamespaceOptions = Object.values(CHAIN_NAMESPACES).map((x) => ({ name: x, value: x }));

export const chainConfigs: Record<ChainNamespaceType, CustomChainConfig[]> = {
  [CHAIN_NAMESPACES.EIP155]: [
    {
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      rpcTarget: "https://rpc.ankr.com/eth",
      blockExplorerUrl: "https://etherscan.io",
      logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
      chainId: "0x1",
      ticker: "ETH",
      tickerName: "Ethereum",
    },
    {
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      rpcTarget: "https://data-seed-prebsc-2-s3.binance.org:8545",
      blockExplorerUrl: "https://testnet.bscscan.com",
      logo: "https://cryptologos.cc/logos/binance-coin-bnb-logo.png",
      chainId: "0x61",
      displayName: "Binance SmartChain Testnet",
      ticker: "BNB",
      tickerName: "BNB",
    },
    {
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      rpcTarget: "https://rpc-mumbai.maticvigil.com",
      blockExplorerUrl: "https://mumbai-explorer.matic.today",
      logo: "https://cryptologos.cc/logos/polygon-matic-logo.png",
      chainId: "0x13881",
      displayName: "Polygon Mumbai Testnet",
      ticker: "matic",
      tickerName: "matic",
    },
  ],
  [CHAIN_NAMESPACES.SOLANA]: [
    {
      chainNamespace: CHAIN_NAMESPACES.SOLANA,
      rpcTarget: "https://rpc.ankr.com/solana_devnet",
      blockExplorerUrl: "https://solscan.io",
      logo: "https://cryptologos.cc/logos/solana-sol-logo.png",
      chainId: "0x3",
      ticker: "SOL",
      tickerName: "Solana",
    },
  ],
  [CHAIN_NAMESPACES.CASPER]: [],
  [CHAIN_NAMESPACES.XRPL]: [],
  [CHAIN_NAMESPACES.OTHER]: [],
};

export const clientIds: Record<WEB3AUTH_NETWORK_TYPE, string> = {
  [WEB3AUTH_NETWORK.MAINNET]: "BJRZ6qdDTbj6Vd5YXvV994TYCqY42-PxldCetmvGTUdoq6pkCqdpuC1DIehz76zuYdaq1RJkXGHuDraHRhCQHvA",
  [WEB3AUTH_NETWORK.TESTNET]: "BHr_dKcxC0ecKn_2dZQmQeNdjPgWykMkcodEHkVvPMo71qzOV6SgtoN8KCvFdLN7bf34JOm89vWQMLFmSfIo84A",
  [WEB3AUTH_NETWORK.AQUA]: "BM34K7ZqV3QwbDt0lvJFCdr4DxS9gyn7XZ2wZUaaf0Ddr71nLjPCNNYtXuGWxxc4i7ivYdgQzFqKlIot4IWrWCE",
  [WEB3AUTH_NETWORK.CYAN]: "BEglQSgt4cUWcj6SKRdu5QkOXTsePmMcusG5EAoyjyOYKlVRjIF1iCNnMOTfpzCiunHRrMui8TIwQPXdkQ8Yxuk",
  [WEB3AUTH_NETWORK.SAPPHIRE_DEVNET]: "BHgArYmWwSeq21czpcarYh0EVq2WWOzflX-NTK-tY1-1pauPzHKRRLgpABkmYiIV_og9jAvoIxQ8L3Smrwe04Lw",
  [WEB3AUTH_NETWORK.SAPPHIRE_MAINNET]: "BPi5PB_UiIZ-cPz1GtV5i1I2iOSOHuimiXBI0e-Oe_u6X3oVAbCiAZOTEBtTXw4tsluTITPqA8zMsfxIKMjiqNQ",
  [WEB3AUTH_NETWORK.CELESTE]: "openlogin",
};

export const testnetVerifierMap = {
  [GOOGLE]: {
    name: "Google",
    typeOfLogin: "google",
    clientId: "519228911939-cri01h55lsjbsia1k7ll6qpalrus75ps.apps.googleusercontent.com",
    verifier: "w3a-sfa-web-google",
  },
  [FACEBOOK]: { name: "Facebook", typeOfLogin: "facebook", clientId: "617201755556395", verifier: "facebook-lrc" },
  [REDDIT]: { name: "Reddit", typeOfLogin: "jwt", clientId: "RKlRuuRoDKOItbJSoOZabDLzizvd1uKn", verifier: "torus-reddit-test" },
  [TWITCH]: { name: "Twitch", typeOfLogin: "twitch", clientId: "f5and8beke76mzutmics0zu4gw10dj", verifier: "twitch-lrc" },
  [DISCORD]: { name: "Discord", typeOfLogin: "discord", clientId: "682533837464666198", verifier: "discord-lrc" },
  [APPLE]: { name: "Apple", typeOfLogin: "apple", clientId: "m1Q0gvDfOyZsJCZ3cucSQEe9XMvl9d9L", verifier: "torus-auth0-apple-lrc" },
  [GITHUB]: { name: "Github", typeOfLogin: "github", clientId: "PC2a4tfNRvXbT48t89J5am0oFM21Nxff", verifier: "torus-auth0-github-lrc" },
  [LINKEDIN]: { name: "Linkedin", typeOfLogin: "linkedin", clientId: "59YxSgx79Vl3Wi7tQUBqQTRTxWroTuoc", verifier: "torus-auth0-linkedin-lrc" },
  [TWITTER]: { name: "Twitter", typeOfLogin: "twitter", clientId: "A7H8kkcmyFRlusJQ9dZiqBLraG2yWIsO", verifier: "torus-auth0-twitter-lrc" },
  [WEIBO]: { name: "Weibo", typeOfLogin: "weibo", clientId: "dhFGlWQMoACOI5oS5A1jFglp772OAWr1", verifier: "torus-auth0-weibo-lrc" },
  [LINE]: { name: "Line", typeOfLogin: "line", clientId: "WN8bOmXKNRH1Gs8k475glfBP5gDZr9H1", verifier: "torus-auth0-line-lrc" },
  [HOSTED_EMAIL_PASSWORDLESS]: {
    name: "Hosted Email Passwordless",
    typeOfLogin: "jwt",
    clientId: "P7PJuBCXIHP41lcyty0NEb7Lgf7Zme8Q",
    verifier: "torus-auth0-passwordless",
  },
  [HOSTED_SMS_PASSWORDLESS]: {
    name: "Hosted SMS Passwordless",
    typeOfLogin: "jwt",
    clientId: "nSYBFalV2b1MSg5b2raWqHl63tfH3KQa",
    verifier: "torus-auth0-sms-passwordless",
  },
  [PASSKEYS_LOGIN]: { name: "Passkeys Login", typeOfLogin: "passkeys", clientId: "passkey", verifier: "passkey-legacy-testnet" },
  [PASSKEYS_REGISTER]: { name: "Passkeys Register", typeOfLogin: "passkeys", clientId: "passkey", verifier: "passkey-legacy-testnet" },
  [COGNITO]: {
    name: "Cognito",
    typeOfLogin: "jwt",
    clientId: "78i338ev9lkgjst3mfeuih9tsh",
    verifier: "demo-cognito-example",
  },
  [TORUS_EMAIL_PASSWORDLESS]: {
    name: "Torus Email Passwordless",
    typeOfLogin: "jwt",
    clientId: "P7PJuBCXIHP41lcyty0NEb7Lgf7Zme8Q",
    verifier: "torus-auth0-email-passwordless-lrc",
  },
  [TORUS_SMS_PASSWORDLESS]: {
    name: "Torus Sms Passwordless",
    typeOfLogin: "jwt",
    clientId: "P7PJuBCXIHP41lcyty0NEb7Lgf7Zme8Q",
    verifier: "torus-sms-passwordless-lrc",
  },
} as Record<string, LoginProviderItem>;

export const sapphireDevnetVerifierMap = {
  [GOOGLE]: {
    name: "Google",
    typeOfLogin: "google",
    clientId: "519228911939-cri01h55lsjbsia1k7ll6qpalrus75ps.apps.googleusercontent.com",
    verifier: "web3auth-google-sapphire-devnet",
  },
  [FACEBOOK]: { name: "Facebook", typeOfLogin: "facebook", clientId: "226597929760394", verifier: "web3auth-facebook-sapphire-devnet" },
  [REDDIT]: { name: "Reddit", typeOfLogin: "jwt", clientId: "XfiFWQbsZ9t5WQ4TfzHWZOpEghkNskko", verifier: "web3auth-auth0-reddit-sapphire-devnet" },
  [TWITCH]: { name: "Twitch", typeOfLogin: "twitch", clientId: "94nxxpy7inarina6kc9hyg2ao3mja2", verifier: "web3auth-twitch-sapphire-devnet" },
  [DISCORD]: { name: "Discord", typeOfLogin: "discord", clientId: "1126902533936394330", verifier: "web3auth-discord-sapphire-devnet" },
  [APPLE]: { name: "Apple", typeOfLogin: "apple", clientId: "ADG0f0EZsBHvcbu2in7W938XngxJQJrJ", verifier: "web3auth-auth0-apple-sapphire-devnet" },
  [GITHUB]: {
    name: "Github",
    typeOfLogin: "github",
    clientId: "srB1w8yWLtvD8QFqp4FgzAPHkmJ6FU5M",
    verifier: "web3auth-auth0-github-sapphire-devnet",
  },
  [LINKEDIN]: {
    name: "Linkedin",
    typeOfLogin: "linkedin",
    clientId: "gCzESkrR2LZDQS1gZIARcRzWvayFUWjv",
    verifier: "web3auth-auth0-linkedin-sapphire-devnet",
  },
  [TWITTER]: {
    name: "Twitter",
    typeOfLogin: "twitter",
    clientId: "wz4w3pdutXsbmWltyUJjq1pyaoF0GBxW",
    verifier: "web3auth-auth0-twitter-sapphire-devnet",
  },
  [WEIBO]: { name: "Weibo", typeOfLogin: "weibo", clientId: "X3BSYMr3BVZFVls6XOEMZ4VdOTW58mQZ", verifier: "web3auth-auth0-weibo-sapphire-devnet" },
  [LINE]: { name: "Line", typeOfLogin: "line", clientId: "AUDHMShLlzzS15cb9F8IjYQHBbfWO5iB", verifier: "web3auth-auth0-line-sapphire-devnet" },
  [HOSTED_EMAIL_PASSWORDLESS]: {
    name: "Hosted Email Passwordless",
    typeOfLogin: "jwt",
    clientId: "d84f6xvbdV75VTGmHiMWfZLeSPk8M07C",
    verifier: "web3auth-auth0-email-passwordless-sapphire-devnet",
  },
  [HOSTED_SMS_PASSWORDLESS]: {
    name: "Hosted SMS Passwordless",
    typeOfLogin: "jwt",
    clientId: "4jK24VpfepWRSe5EMdd2if0RBD55pAuA",
    verifier: "web3auth-auth0-sms-passwordless-sapphire-devnet",
  },
  [TORUS_EMAIL_PASSWORDLESS]: {
    name: "Torus Email Passwordless",
    typeOfLogin: "jwt",
    clientId: "d84f6xvbdV75VTGmHiMWfZLeSPk8M07C",
    verifier: "web3auth-auth0-email-passwordless-sapphire-devnet",
  },
  [TORUS_SMS_PASSWORDLESS]: {
    name: "Torus Sms Passwordless",
    typeOfLogin: "jwt",
    clientId: "4jK24VpfepWRSe5EMdd2if0RBD55pAuA",
    verifier: "web3auth-auth0-sms-passwordless-sapphire-devnet",
  },
  [PASSKEYS_LOGIN]: { name: "Passkeys Login", typeOfLogin: "passkeys", clientId: "passkey", verifier: "passkey-sapphire-devnet" },
  [PASSKEYS_REGISTER]: { name: "Passkeys Register", typeOfLogin: "passkeys", clientId: "passkey", verifier: "passkey-sapphire-devnet" },
} as Record<string, LoginProviderItem>;

export const sapphireDevnetVerifierOptions = Object.entries(sapphireDevnetVerifierMap).map(([key]) => ({ name: key, value: key }));
export const testnetVerifierOptions = Object.entries(testnetVerifierMap).map(([key]) => ({ name: key, value: key }));
