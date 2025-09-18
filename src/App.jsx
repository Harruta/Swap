import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletDisconnectButton, WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import { useMemo } from "react";

function App(){
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const RPC_URL = import.meta.env.VITE_RPC_URL || endpoint;

  return(
    <ConnectionProvider endpoint={RPC_URL}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <div className="min-h-screen flex items-center justify-center p-5 relative z-10">
            <div className="bg-gray-800/95 rounded-3xl p-10 shadow-2xl border border-white/5 backdrop-blur-sm max-w-lg w-full text-center">
            <h1 className="text-white text-3xl font-semibold mb-2 tracking-tight">Token Swap</h1>
            <p className="text-gray-400 text-base mb-8 font-normal">Swap tokens with ease</p>
            <div className="flex gap-3 mb-6 justify-center items-center">
              <WalletMultiButton/>
              <WalletDisconnectButton/>
            </div>
            </div>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
export default App;