import { CredentialResponse, googleLogout } from "@react-oauth/google";
import { AuthUserInfo } from "@web3auth/auth";
import { CHAIN_NAMESPACES, IProvider, log, WEB3AUTH_NETWORK, IPlugin } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { PasskeysPlugin } from "@web3auth/passkeys-sfa-plugin";
// Import Single Factor Auth SDK for no redirect flow
import { ADAPTER_EVENTS, decodeToken, UserAuthInfo, Web3Auth } from "@web3auth/single-factor-auth";
import { WalletServicesPlugin } from "@web3auth/wallet-services-plugin";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

import RPC from "../evm.ethers";
import { shouldSupportPasskey } from "../utils";
import {
  AccountAbstractionProvider,
  BiconomySmartAccount,
  ISmartAccount,
  KernelSmartAccount,
  SafeSmartAccount,
  TrustSmartAccount,
} from "@web3auth/account-abstraction-provider";
import { getDefaultBundlerUrl } from "../config";

type PasskeysData = {
  id: number;
  name: string;
  detail1: string;
  detail2: string;
};

export type SmartAccountType = "safe" | "kernel" | "biconomy" | "trust";

export type AccountAbstractionConfig = {
  bundlerUrl?: string;
  paymasterUrl?: string;
  smartAccountType?: SmartAccountType;
};

const AAConfig: AccountAbstractionConfig = {
  // bundlerUrl: "https://bundler.safe.global",
  // paymasterUrl: "https://paymaster.safe.global",
  smartAccountType: "safe",
};

export interface IPlaygroundContext {
  address: string;
  balance: string;
  chainId: string;
  isLoggedIn: boolean;
  isLoading: boolean;
  userInfo: AuthUserInfo | null;
  playgroundConsoleTitle: string;
  playgroundConsoleData: string;
  hasPasskeys: boolean;
  passkeys: PasskeysData[];
  deletingPasskeyId: number | null;
  isCancelModalOpen: boolean;
  showRegisterPasskeyModal: boolean;
  useAccountAbstraction: boolean;
  onSuccess: (response: CredentialResponse) => void;
  loginWithPasskey: () => void;
  registerPasskey: () => void;
  unlinkPasskey: (id: number) => void;
  logout: () => void;
  getUserInfo: () => Promise<AuthUserInfo | null>;
  getExternalIdToken: () => Promise<UserAuthInfo | null>;
  showCheckout: () => void;
  showWalletUI: () => void;
  showWalletScanner: () => void;
  signMessage: () => Promise<string>;
  sendTransaction: () => void;
  toggleCancelModal: (isOpen: boolean) => void;
  toggleRegisterPasskeyModal: (isOpen: boolean) => void;
  resetConsole: () => void;
  toggleUseAccountAbstraction: () => void;
}

export const PlaygroundContext = createContext<IPlaygroundContext>({
  address: "",
  balance: "",
  isLoggedIn: false,
  isLoading: false,
  userInfo: null,
  playgroundConsoleTitle: "",
  playgroundConsoleData: "",
  chainId: "",
  hasPasskeys: false,
  passkeys: [],
  deletingPasskeyId: null,
  isCancelModalOpen: false,
  showRegisterPasskeyModal: false,
  useAccountAbstraction: false,
  onSuccess: async () => null,
  loginWithPasskey: async () => null,
  registerPasskey: async () => null,
  unlinkPasskey: async () => null,
  logout: async () => null,
  getUserInfo: async () => null,
  getExternalIdToken: async () => null,
  showCheckout: async () => null,
  showWalletUI: async () => null,
  showWalletScanner: async () => null,
  signMessage: async () => "",
  sendTransaction: async () => null,
  toggleCancelModal: async () => null,
  toggleRegisterPasskeyModal: async () => null,
  resetConsole: async () => null,
  toggleUseAccountAbstraction: () => null,
});

interface IPlaygroundProps {
  children?: ReactNode;
}

export function usePlayground(): IPlaygroundContext {
  return useContext(PlaygroundContext);
}

const verifier = "w3a-sfa-web-google";

const clientId = "BPi5PB_UiIZ-cPz1GtV5i1I2iOSOHuimiXBI0e-Oe_u6X3oVAbCiAZOTEBtTXw4tsluTITPqA8zMsfxIKMjiqNQ"; // get from https://dashboard.web3auth.io

export const chainConfigMain = {
  chainId: "0x1",
  displayName: "Ethereum Mainnet",
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  tickerName: "Ethereum",
  ticker: "ETH",
  decimals: 18,
  rpcTarget: "https://rpc.ankr.com/eth",
  blockExplorerUrl: "https://etherscan.io",
  logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
};

// const chainConfigTest = {
//   chainId: "0xaa36a7",
//   displayName: "Ethereum Sepolia Testnet",
//   chainNamespace: CHAIN_NAMESPACES.EIP155,
//   tickerName: "Ethereum",
//   ticker: "ETH",
//   decimals: 18,
//   rpcTarget: "https://rpc.ankr.com/eth_sepolia",
//   blockExplorerUrl: "https://sepolia.etherscan.io",
//   logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
// };

export function Playground({ children }: IPlaygroundProps) {
  const [web3authSFAuth, setWeb3authSFAuth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [plugin, setPlugin] = useState<PasskeysPlugin | null>(null);
  const [playgroundConsoleTitle, setPlaygroundConsoleTitle] = useState<string>("");
  const [playgroundConsoleData, setPlaygroundConsoleData] = useState<string>("");
  const [wsPlugin, setWsPlugin] = useState<WalletServicesPlugin | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<AuthUserInfo | null>(null);
  const [address, setAddress] = useState<string>("");
  const [balance, setBalance] = useState<string>("");
  const [chainId, setChainId] = useState<string>("");
  const [hasPasskeys, setHasPasskeys] = useState<boolean>(false);
  const [showRegisterPasskeyModal, setShowRegisterPasskeyModal] = useState<boolean>(false);
  const [passkeys, setPasskeys] = useState<PasskeysData[]>([]);
  const [deletingPasskeyId, setDeletingPasskeyId] = useState<number | null>(null);

  const [useAccountAbstraction, setUseAccountAbstraction] = useState<boolean>(() => {
    const stored = localStorage.getItem("useAccountAbstraction");
    return stored ? JSON.parse(stored) : false;
  });

  // Dialog
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const uiConsole = (...args: unknown[]) => {
    log.info(...args);
  };

  const toggleCancelModal = (isOpen: boolean) => {
    if (isOpen) {
      setTimeout(() => {
        setIsCancelModalOpen(true);
      }, 0);
    } else {
      setIsCancelModalOpen(false);
    }
  };

  const onSuccess = useCallback(
    async (response: CredentialResponse): Promise<void> => {
      try {
        if (!web3authSFAuth) {
          log.info("Web3Auth Single Factor Auth SDK not initialized yet");
          return;
        }
        setIsLoading(true);
        const idToken = response.credential;
        if (!idToken) {
          setIsLoading(false);
          return;
        }
        const { payload } = decodeToken<{ email: string }>(idToken);
        await web3authSFAuth.connect({
          verifier,
          verifierId: payload.email,
          idToken: idToken!,
        });
        setIsLoading(false);
        const res = await plugin?.listAllPasskeys();
        if (res && Object.values(res).length === 0) {
          setShowRegisterPasskeyModal(true);
        }
        uiConsole();
      } catch (err) {
        // Single Factor Auth SDK throws an error if the user has already enabled MFA
        // One can use the Web3AuthNoModal SDK to handle this case
        setIsLoading(false);
        log.error(err);
      }
    },
    [plugin, web3authSFAuth]
  );

  const getAllPasskeys = async (activePasskeyPlugin: PasskeysPlugin) => {
    const res = await activePasskeyPlugin?.listAllPasskeys();
    setHasPasskeys(res.length > 0);
    setPasskeys(
      res.map((passkey) => {
        return {
          id: passkey.id,
          name: passkey.provider_name,
          detail1: `${passkey.browser} ${passkey.browser_version} (${passkey.os})`,
          detail2: new Date(passkey.updated_at).toLocaleString(),
        };
      })
    );
  };

  const loginWithPasskey = useCallback(async () => {
    try {
      setIsLoading(true);
      if (!plugin) throw new Error("Passkey plugin not initialized");
      const result = shouldSupportPasskey();
      if (!result.isBrowserSupported) {
        uiConsole("Browser not supported");
        return;
      }
      await plugin.loginWithPasskey();
      uiConsole("Passkey logged in successfully");
    } catch (error) {
      log.error((error as Error).message);
      toggleCancelModal(true);
    } finally {
      setIsLoading(false);
    }
  }, [plugin]);

  const registerPasskey = useCallback(async () => {
    try {
      setIsLoading(true);
      setShowRegisterPasskeyModal(false);
      if (!plugin) {
        uiConsole("plugin not initialized yet");
        return;
      }
      const result = shouldSupportPasskey();
      if (!result.isBrowserSupported) {
        uiConsole("Browser not supported");
        return;
      }
      const sfaAuthUserInfo = await web3authSFAuth?.getUserInfo();
      const res = await plugin?.registerPasskey({
        username: `google|${sfaAuthUserInfo?.email || sfaAuthUserInfo?.name} - ${new Date().toLocaleDateString("en-GB")}`,
      });
      if (res) {
        setTimeout(async () => {
          await getAllPasskeys(plugin);
        }, 500);
        uiConsole("Passkey saved successfully");
      }
    } catch (error: unknown) {
      if (!hasPasskeys) toggleCancelModal(true);
      uiConsole((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [hasPasskeys, plugin, web3authSFAuth]);

  const unlinkPasskey = useCallback(
    async (id: number) => {
      if (!plugin) {
        uiConsole("plugin not initialized yet");
        return;
      }

      setDeletingPasskeyId(id);

      try {
        const success = await plugin.unregisterPasskey(id);
        if (success) {
          setTimeout(async () => {
            await getAllPasskeys(plugin);
          }, 500);
          uiConsole("Passkey deleted successfully");
        }
      } catch (error) {
        uiConsole((error as Error).message);
      } finally {
        setDeletingPasskeyId(null);
      }
    },
    [plugin]
  );

  const logout = useCallback(async () => {
    if (!web3authSFAuth) {
      throw new Error("web3auth sfa auth not initialized.");
    }
    googleLogout();
    await web3authSFAuth.logout();
    uiConsole("Logged out");
  }, [web3authSFAuth]);

  const getUserInfo = useCallback(async (): Promise<AuthUserInfo | null> => {
    if (web3authSFAuth && web3authSFAuth?.connected) {
      const useInfo = await web3authSFAuth?.getUserInfo();
      setPlaygroundConsoleTitle("User Info Console");
      setPlaygroundConsoleData(JSON.stringify(useInfo, null, 2));
      uiConsole(useInfo);
    }
    return null;
  }, [web3authSFAuth]);

  const getExternalIdToken = useCallback(async (): Promise<UserAuthInfo | null> => {
    if (web3authSFAuth && web3authSFAuth?.connected) {
      const data = await web3authSFAuth?.authenticateUser();
      setPlaygroundConsoleTitle("Id Token");
      setPlaygroundConsoleData(JSON.stringify(data, null, 2));
      uiConsole(data);
      return data;
    }
    return null;
  }, [web3authSFAuth]);

  const showCheckout = useCallback(async () => {
    if (!wsPlugin) {
      uiConsole("wallet services plugin not initialized yet");
      return;
    }
    if (chainId !== chainConfigMain.chainId) {
      log.warn("check: checkout not supported on testnets");
      return;
    }
    await wsPlugin.showCheckout();
  }, [chainId, wsPlugin]);

  const showWalletUI = useCallback(async () => {
    if (!wsPlugin) {
      uiConsole("wallet services plugin not initialized yet");
      return;
    }
    await wsPlugin.showWalletUi();
  }, [wsPlugin]);

  const signMessage = useCallback(async (): Promise<string> => {
    if (!provider) {
      uiConsole("No provider found");
      return "";
    }

    const message = "YOUR_MESSAGE";
    const from = address;
    const signedMessage = (await wsPlugin?.wsEmbedInstance.provider.request<[string, string], string>({
      method: "personal_sign",
      params: [message, from],
    })) as string;
    uiConsole(signedMessage);
    return signedMessage;
  }, [address, provider, wsPlugin]);

  const sendTransaction = useCallback(async () => {
    if (!provider) {
      uiConsole("No provider found");
      return;
    }
    const rpc = new RPC(provider);
    const result = await rpc.signAndSendTransaction();
    uiConsole(result);
  }, [provider]);

  const showWalletScanner = useCallback(async () => {
    if (!wsPlugin) {
      uiConsole("wallet services plugin not initialized yet");
      return;
    }
    await wsPlugin.showWalletConnectScanner();
  }, [wsPlugin]);

  const toggleRegisterPasskeyModal = (isOpen: boolean) => {
    setShowRegisterPasskeyModal(isOpen);
  };

  useEffect(() => {
    setIsLoggedIn(!!(provider && web3authSFAuth));
  }, [provider, web3authSFAuth]);

  const resetConsole = () => {
    setPlaygroundConsoleData("");
    setPlaygroundConsoleTitle("");
  };

  const toggleUseAccountAbstraction = () => {
    setUseAccountAbstraction((prev) => {
      const newValue = !prev;
      localStorage.setItem("useAccountAbstraction", JSON.stringify(newValue));
      return newValue;
    });
  };

  useEffect(() => {
    const init = async () => {
      try {
        const ethPrivateKeyProvider = new EthereumPrivateKeyProvider({ config: { chainConfig: chainConfigMain } });

        // setup aa provider
        let aaProvider: AccountAbstractionProvider | undefined;
        if (useAccountAbstraction) {
          const { bundlerUrl, paymasterUrl, smartAccountType } = AAConfig;

          let smartAccountInit: ISmartAccount;
          switch (smartAccountType) {
            case "biconomy":
              smartAccountInit = new BiconomySmartAccount();
              break;
            case "kernel":
              smartAccountInit = new KernelSmartAccount();
              break;
            case "trust":
              smartAccountInit = new TrustSmartAccount();
              break;
            // case "light":
            //   smartAccountInit = new LightSmartAccount();
            //   break;
            // case "simple":
            //   smartAccountInit = new SimpleSmartAccount();
            //   break;
            case "safe":
            default:
              smartAccountInit = new SafeSmartAccount();
              break;
          }

          aaProvider = new AccountAbstractionProvider({
            config: {
              chainConfig: chainConfigMain,
              bundlerConfig: { url: bundlerUrl ?? getDefaultBundlerUrl(chainConfigMain.chainId) },
              paymasterConfig: paymasterUrl
                ? {
                    url: paymasterUrl,
                  }
                : undefined,
              smartAccountInit,
            },
          });
        }

        // Initialising Web3Auth Single Factor Auth SDK
        const web3authSfa = new Web3Auth({
          clientId, // Get your Client ID from Web3Auth Dashboard
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
          usePnPKey: true, // Setting this to true returns the same key as PnP Web SDK, By default, this SDK returns CoreKitKey.
          privateKeyProvider: ethPrivateKeyProvider,
          accountAbstractionProvider: aaProvider,
        });
        const passkeyPlugin = new PasskeysPlugin();
        web3authSfa?.addPlugin(passkeyPlugin as IPlugin);
        const walletServicePlugin = new WalletServicesPlugin({
          walletInitOptions: {
            whiteLabel: {
              logoLight: "https://web3auth.io/images/web3auth-logo.svg",
              logoDark: "https://web3auth.io/images/web3auth-logo-w.svg",
            },
            confirmationStrategy: "modal",
          },
        });
        web3authSfa?.addPlugin(walletServicePlugin);
        setWsPlugin(walletServicePlugin);
        setPlugin(passkeyPlugin);
        web3authSfa.on(ADAPTER_EVENTS.CONNECTED, async (data) => {
          log.info("sfa:connected", data);
          log.info("sfa:state", web3authSfa?.state);
          setProvider(web3authSfa.provider);
          if (web3authSfa.state.userInfo) setUserInfo(web3authSfa.state.userInfo);

          // Get account data

          const rpc = new RPC(web3authSfa.provider!);
          const [account, rpcBalance, rpcChainId] = await Promise.all([rpc.getAccounts(), rpc.getBalance(), rpc.getChainId()]);
          setAddress(account);
          setBalance(rpcBalance);
          setChainId(`0x${rpcChainId}`);
          getAllPasskeys(passkeyPlugin);
        });

        web3authSfa.on(ADAPTER_EVENTS.DISCONNECTED, () => {
          log.info("sfa:disconnected");
          setProvider(null);
        });

        setWeb3authSFAuth(web3authSfa);
        await web3authSfa.init();
        window.web3auth = web3authSfa;
      } catch (error) {
        log.error(error);
      }
    };

    init();
  }, [useAccountAbstraction]);

  const contextProvider = useMemo(
    () => ({
      address,
      balance,
      chainId,
      isLoggedIn,
      isLoading,
      userInfo,
      playgroundConsoleTitle,
      playgroundConsoleData,
      hasPasskeys,
      passkeys,
      deletingPasskeyId,
      isCancelModalOpen,
      showRegisterPasskeyModal,
      onSuccess,
      loginWithPasskey,
      registerPasskey,
      unlinkPasskey,
      logout,
      getUserInfo,
      getExternalIdToken,
      showCheckout,
      showWalletUI,
      showWalletScanner,
      signMessage,
      sendTransaction,
      toggleCancelModal,
      toggleRegisterPasskeyModal,
      resetConsole,
      useAccountAbstraction,
      toggleUseAccountAbstraction,
    }),
    [
      address,
      balance,
      chainId,
      isLoggedIn,
      isLoading,
      userInfo,
      playgroundConsoleTitle,
      playgroundConsoleData,
      hasPasskeys,
      passkeys,
      deletingPasskeyId,
      isCancelModalOpen,
      showRegisterPasskeyModal,
      onSuccess,
      loginWithPasskey,
      registerPasskey,
      unlinkPasskey,
      logout,
      getUserInfo,
      getExternalIdToken,
      showCheckout,
      showWalletUI,
      showWalletScanner,
      signMessage,
      sendTransaction,
      useAccountAbstraction,
      toggleUseAccountAbstraction,
    ]
  );
  return <PlaygroundContext.Provider value={contextProvider}>{children}</PlaygroundContext.Provider>;
}
