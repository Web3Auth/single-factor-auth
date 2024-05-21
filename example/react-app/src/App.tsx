import { useEffect, useState } from "react";

// Import Single Factor Auth SDK for no redirect flow
import { Web3Auth, ADAPTER_EVENTS, decodeToken } from "@web3auth/single-factor-auth";
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { PasskeysPlugin } from "@web3auth/passkeys-sfa-plugin";
import { WalletServicesPlugin } from "@web3auth/wallet-services-plugin";

// RPC libraries for blockchain calls
import RPC from "./evm.web3";
// import RPC from "./evm.ethers";

// Google OAuth libraries for login and logout
import { GoogleLogin, CredentialResponse, googleLogout } from "@react-oauth/google";

import Loading from "./Loading";
import "./App.css";
import { IProvider } from "@web3auth/base";
import { shouldSupportPasskey } from "./utils";

const verifier = "w3a-sfa-web-google";

const clientId = "BPi5PB_UiIZ-cPz1GtV5i1I2iOSOHuimiXBI0e-Oe_u6X3oVAbCiAZOTEBtTXw4tsluTITPqA8zMsfxIKMjiqNQ"; // get from https://dashboard.web3auth.io

const chainConfig = {
  chainId: "0xaa36a7",
  displayName: "Ethereum Sepolia Testnet",
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  tickerName: "Ethereum",
  ticker: "ETH",
  decimals: 18,
  rpcTarget: "https://rpc.ankr.com/eth_sepolia",
  blockExplorerUrl: "https://sepolia.etherscan.io",
  logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
};

function App() {
  const [web3authSFAuth, setWeb3authSFAuth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [plugin, setPlugin] = useState<PasskeysPlugin | null>(null);
  const [wsPlugin, setWsPlugin] = useState<WalletServicesPlugin | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const provider = new EthereumPrivateKeyProvider({ config: { chainConfig } });
        // Initialising Web3Auth Single Factor Auth SDK
        const web3authSfa = new Web3Auth({
          clientId, // Get your Client ID from Web3Auth Dashboard
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
          usePnPKey: true, // Setting this to true returns the same key as PnP Web SDK, By default, this SDK returns CoreKitKey.
          privateKeyProvider: provider,
        });
        const plugin = new PasskeysPlugin({ buildEnv: "testing" });
        web3authSfa?.addPlugin(plugin);
        const wsPlugin = new WalletServicesPlugin({ walletInitOptions: { 
          whiteLabel: {     
            logoLight: "https://web3auth.io/images/web3auth-logo.svg",
            logoDark: "https://web3auth.io/images/web3auth-logo.svg",
          }
        }});
        web3authSfa?.addPlugin(wsPlugin);
        setWsPlugin(wsPlugin);
        setPlugin(plugin);
        web3authSfa.on(ADAPTER_EVENTS.CONNECTED, (data) => {
          console.log("sfa:connected", data);
          console.log("sfa:state", web3authSfa?.state);
          setProvider(web3authSfa.provider);
        });
        web3authSfa.on(ADAPTER_EVENTS.DISCONNECTED, () => {
          console.log("sfa:disconnected");
          setProvider(null);
        });
        setWeb3authSFAuth(web3authSfa);
        await web3authSfa.init();
        (window as any).web3auth = web3authSfa;
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  const onSuccess = async (response: CredentialResponse) => {
    try {
      if (!web3authSFAuth) {
        uiConsole("Web3Auth Single Factor Auth SDK not initialized yet");
        return;
      }
      setIsLoggingIn(true);
      const idToken = response.credential;
      if (!idToken) {
        setIsLoggingIn(false);
        return;
      }
      const { payload } = decodeToken(idToken);
      await web3authSFAuth.connect({
        verifier,
        verifierId: (payload as any).email,
        idToken: idToken!,
      });
      setIsLoggingIn(false);
    } catch (err) {
      // Single Factor Auth SDK throws an error if the user has already enabled MFA
      // One can use the Web3AuthNoModal SDK to handle this case
      setIsLoggingIn(false);
      console.error(err);
    }
  };

  const loginWithPasskey = async () => {
    try {
      setIsLoggingIn(true);
      if (!plugin) throw new Error("Passkey plugin not initialized");
      const result = shouldSupportPasskey();
      if (!result.isBrowserSupported) {
        uiConsole("Browser not supported");
        return;
      }
      await plugin.loginWithPasskey();
      uiConsole("Passkey logged in successfully");
    } catch (error) {
      console.error((error as Error).message);
      uiConsole((error as Error).message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const getUserInfo = async () => {
    if (web3authSFAuth && web3authSFAuth?.connected) {
      uiConsole("user info", await web3authSFAuth?.getUserInfo());
      return;
    }
  };

  const authenticateUser = async () => {
    if (!web3authSFAuth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const token = await web3authSFAuth?.authenticateUser();
    uiConsole(token);
  };

  const addChain = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const newChain = {
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      chainId: "0x13882", // hex of 80002, polygon testnet
      rpcTarget: "https://rpc.ankr.com/polygon_amoy",
      displayName: "Polygon Amoy Testnet",
      ticker: "MATIC",
      tickerName: "MATIC",
      decimals: 18,
      blockExplorerUrl: "https://amoy.polygonscan.com/",
    };
    await web3authSFAuth?.addChain(newChain);
    uiConsole("New Chain Added");
  };

  const switchChain = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    await web3authSFAuth?.switchChain({ chainId: "0x13882" });
    uiConsole("Chain Switched");
  };

  const logout = async () => {
    if (!web3authSFAuth) {
      throw new Error("web3auth sfa auth not initialized.");
    }
    googleLogout();
    await web3authSFAuth.logout();
    // const provider = new EthereumPrivateKeyProvider({ config: { chainConfig } });
    await web3authSFAuth.init();
    uiConsole("Logged out");
    return;
  };

  const getAccounts = async () => {
    if (!provider) {
      uiConsole("No provider found");
      return;
    }
    const rpc = new RPC(provider);
    const userAccount = await rpc.getAccounts();
    uiConsole(userAccount);
  };

  const getBalance = async () => {
    if (!provider) {
      uiConsole("No provider found");
      return;
    }
    const rpc = new RPC(provider);
    const balance = await rpc.getBalance();
    uiConsole(balance);
  };

  const signMessage = async () => {
    if (!provider) {
      uiConsole("No provider found");
      return;
    }
    const rpc = new RPC(provider);
    const result = await rpc.signMessage();
    uiConsole(result);
  };

  const sendTransaction = async () => {
    if (!provider) {
      uiConsole("No provider found");
      return;
    }
    const rpc = new RPC(provider);
    const result = await rpc.signAndSendTransaction();
    uiConsole(result);
  };

  const getChainId = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const chainId = await rpc.getChainId();
    uiConsole(chainId);
  };

  const getPrivateKey = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const privateKey = await provider?.request({ method: "eth_private_key" });
    uiConsole(privateKey);
  };

  const registerPasskey = async () => {
    try {
      if (!plugin) {
        uiConsole("plugin not initialized yet");
        return;
      }
      const result = shouldSupportPasskey();
      if (!result.isBrowserSupported) {
        uiConsole("Browser not supported");
        return;
      }
      const userInfo = await web3authSFAuth?.getUserInfo();
      const res = await plugin?.registerPasskey({
        username: `google|${userInfo?.email || userInfo?.name} - ${new Date().toLocaleDateString("en-GB")}`,
      });
      if (res) uiConsole("Passkey saved successfully");
    } catch (error: unknown) {
      uiConsole((error as Error).message);
    }
  };

  const listAllPasskeys = async () => {
    if (!plugin) {
      uiConsole("plugin not initialized yet");
      return;
    }
    const res = await plugin?.listAllPasskeys();
    uiConsole(res);
  };

  const showCheckout = async () => {
    if (!wsPlugin) {
      uiConsole("wallet services plugin not initialized yet");
      return;
    }
    await wsPlugin.showCheckout()
  }

  const showWalletUI = async () => {
    if (!wsPlugin) {
      uiConsole("wallet services plugin not initialized yet");
      return;
    }
    await wsPlugin.showWalletUi()
  }

  const showWalletScanner = async () => {
    if (!wsPlugin) {
      uiConsole("wallet services plugin not initialized yet");
      return;
    }
    await wsPlugin.showWalletConnectScanner()
  }

  function uiConsole(...args: any[]): void {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
    }
  }

  const loginView = (
    <>
      <div className="flex-container">
        <div>
          <button onClick={getUserInfo} className="card">
            Get User Info
          </button>
        </div>
        <div>
          <button onClick={getAccounts} className="card">
            Get Accounts
          </button>
        </div>
        <div>
          <button onClick={getChainId} className="card">
            Get Chain ID
          </button>
        </div>
        <div>
          <button onClick={authenticateUser} className="card">
            Get ID Token
          </button>
        </div>
        <div>
          <button onClick={getBalance} className="card">
            Get Balance
          </button>
        </div>
        <div>
          <button onClick={addChain} className="card">
            Add Chain
          </button>
        </div>
        <div>
          <button onClick={switchChain} className="card">
            Switch Chain
          </button>
        </div>
        <div>
          <button onClick={signMessage} className="card">
            Sign Message
          </button>
        </div>
        <div>
          <button onClick={sendTransaction} className="card">
            Send Transaction
          </button>
        </div>
        <div>
          <button onClick={getPrivateKey} className="card">
            Get Private Key
          </button>
        </div>
        <div>
          <button onClick={registerPasskey} className="card">
            Register passkey
          </button>
        </div>
        <div>
          <button onClick={listAllPasskeys} className="card">
            List all Passkeys
          </button>
        </div>

        <div>
          <button onClick={showCheckout} className="card">
            Show Checkout
          </button>
        </div>
        <div>
          <button onClick={showWalletUI} className="card">
            Show Wallet UI
          </button>
        </div>
        <div>
          <button onClick={showWalletScanner} className="card">
            Show Wallet Scanner
          </button>
        </div>
        <div>
          <button onClick={logout} className="card">
            Log Out
          </button>
        </div>
      </div>
    </>
  );

  const logoutView = (
    <>
      <>
        <GoogleLogin onSuccess={onSuccess} useOneTap />
      </>
      <button onClick={loginWithPasskey} className="card passkey">
        Login with Passkey
      </button>
      <>
        <div className="flex-container text">
          <p>Steps:</p>
          <ol>
            <li>Click on the Sign in with Google or use Google One Tap</li>
            <li>Once logged in, Register the Passkey, then logout</li>
            <li>Click on the "Login with Passkey" button to experience the Passkey login.</li>
          </ol>
        </div>
      </>
    </>
  );

  return (
    <div className="container">
      <h1 className="title">
        <a target="_blank" href="http://web3auth.io/" rel="noreferrer">
          Web3Auth
        </a>{" "}
        SFA PassKey Demo
      </h1>

      {isLoggingIn ? <Loading /> : <div className="grid">{web3authSFAuth ? (provider ? loginView : logoutView) : null}</div>}

      <div id="console" style={{ whiteSpace: "pre-line" }}>
        <p style={{ whiteSpace: "pre-line" }}></p>
      </div>

      <footer className="footer">
        <a
          href="https://github.com/Web3Auth/web3auth-core-kit-examples/tree/main/single-factor-auth-web/sfa-web-google-example"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source code
        </a>
      </footer>
    </div>
  );
}

export default App;
