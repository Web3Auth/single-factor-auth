import { TORUS_LEGACY_NETWORK, type TORUS_NETWORK_TYPE, TORUS_SAPPHIRE_NETWORK } from "@toruslabs/constants";
import { type AuthUserInfo, type IStorage } from "@web3auth/auth";
import {
  type AdapterEvents,
  CustomChainConfig,
  type IBaseProvider,
  IProvider,
  IWeb3AuthCore,
  IWeb3AuthCoreOptions,
  SafeEventEmitterProvider,
} from "@web3auth/base";

import { ADAPTER_STATUS, SDK_MODE } from "./constants";

export type Web3AuthSfaEvents = AdapterEvents;

export interface TorusSubVerifierInfo {
  verifier: string;
  idToken: string;
}

export type InitParams = { network: TORUS_NETWORK_TYPE };

export type SDK_MODE_TYPE = (typeof SDK_MODE)[keyof typeof SDK_MODE];

export type PrivateKeyProvider = IBaseProvider<string> & { getEd25519Key?: (privKey: string) => string };

export type UserAuthInfo = { idToken: string };

export interface IAsyncStorage {
  async?: boolean;
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

export interface ISecureStore {
  /**
   * Fetch the stored value associated with the provided key.
   */

  getItemAsync(key: string, options: unknown): Promise<string | null>;

  /**
   * Store a key–value pair.
   */
  setItemAsync(key: string, value: string, options: unknown): Promise<void>;

  /**
   * Delete the value associated with the provided key.
   *
   */
  deleteItemAsync(key: string, options: unknown): Promise<void>;
}

export interface Web3AuthOptions extends Omit<IWeb3AuthCoreOptions, "uiConfig" | "useCoreKitKey"> {
  /**
   * setting this to true returns the same key as web sdk (i.e., plug n play key)
   * By default, this sdk returns CoreKitKey
   *
   * @defaultValue false
   */
  usePnPKey?: boolean;

  /**
   * Specify a custom storage server url
   *
   * @defaultValue https://session.web3auth.io
   */
  storageServerUrl?: string;

  /**
   * Specify a custom server time offset.
   *
   * @defaultValue 0
   */
  serverTimeOffset?: number;

  /**
   * Private key provider for your chain namespace
   */
  privateKeyProvider: IBaseProvider<string>;

  /**
   * Account abstraction provider for your chain namespace
   */
  accountAbstractionProvider?: IBaseProvider<IProvider>;

  /**
   * Defines the mode of the SDK
   *
   * @defaultValue "web"
   */
  mode?: SDK_MODE_TYPE;

  /**
   *  storage for sfa's local state.
   *
   *  - undefined with localStorage
   *  - "local" with localStorage
   *  - "session" with sessionStorage
   *
   *  For asyncStorage, provide instance of IAsyncStorage.
   *
   */
  storage?: IAsyncStorage | ISecureStore | "session" | "local";

  /**
   * set use dkg flag to generate keys.
   *
   * @defaultValue true
   */
  useDkg?: boolean;
}

export type AggregateVerifierParams = {
  verify_params: { verifier_id: string; idtoken: string }[];
  sub_verifier_ids: string[];
  verifier_id: string;
};

export interface Auth0UserInfo {
  picture: string;
  email: string;
  name: string;
  sub: string;
  nickname: string;
}

export interface SessionData {
  basePrivKey?: string;
  privKey?: string;
  userInfo?: AuthUserInfo;
  signatures?: string[];
  passkeyToken?: string;
}

export interface LoginParams {
  verifier: string;
  verifierId: string;
  idToken: string;
  subVerifierInfoArray?: TorusSubVerifierInfo[];
  // offset in seconds
  serverTimeOffset?: number;
  fallbackUserInfo?: Partial<Auth0UserInfo>;
}

export interface DeletePasskeyParams {
  credentialPublicKey?: string;
  verifier: string;
}

export type ADAPTER_STATUS_TYPE = (typeof ADAPTER_STATUS)[keyof typeof ADAPTER_STATUS];

export type IFinalizeLoginParams = { privKey: string; userInfo: AuthUserInfo; signatures?: string[]; passkeyToken?: string };

export interface IWeb3Auth extends IWeb3AuthCore {
  readonly coreOptions: Omit<Web3AuthOptions, "storage"> & { storage: IAsyncStorage | IStorage | ISecureStore };
  status: ADAPTER_STATUS_TYPE;
  provider: IProvider | null;
  connected: boolean;
  state: SessionData;
  init(): Promise<void>;
  connect(loginParams: LoginParams): Promise<SafeEventEmitterProvider | null>;
  addChain(chainConfig: CustomChainConfig): Promise<void>;
  switchChain(params: { chainId: string }): Promise<void>;
  getUserInfo(): Promise<AuthUserInfo>;
  _finalizeLogin(params: IFinalizeLoginParams): Promise<void>;
  _getBasePrivKey(): string;
}
export { TORUS_LEGACY_NETWORK, type TORUS_NETWORK_TYPE, TORUS_SAPPHIRE_NETWORK };
