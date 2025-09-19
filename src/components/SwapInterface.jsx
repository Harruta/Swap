import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { VersionedTransaction } from "@solana/web3.js";
import axios from "axios";
import { useState } from "react";

const TOKENS = {
    SOL: {
        mint: 'So11111111111111111111111111111111111111112',
        symbol: 'SOL',
        name: 'Solana',
        decimals: 9,
    },
    USDC: {
        mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        symbol: 'USDC',
        name: 'USDC coin',
        decimals: 6,
    },
};

const SwapInterface = () => {
    const { publicKey, signTransaction, connected } = useWallet();
    const { connection } = useConnection();
    
    const [inputAmount, setInputAmount] = useState();
    const [outputAmount, setOutputAmount] = useState();
    const [isLoading, setIsLoading] = useState();
    const [quote, setQuote] = useState();

    //get quote from Jupiter
    const getQuote = async() => {
        if(!inputAmount || inputAmount <= 0) return;

        setIsLoading(true);
        try {
            const response = await axios.get('https://quote-api.jub.ag/v6/quote', {
                params: {
                    inputMint : TOKENS.SOL.mint,
                    outputMint: TOKENS.USDC.mint,
                    amount: parseFloat(inputAmount) * Math.pow(10, TOKENS.SOL.decimals),
                    slippageBps: 50, //0.5 slippage
                },
            });

            setQuote(response.data);
            const output = response.data.outAmount / Math.pow(10, TOKENS.USDC.decimals);
            setOutputAmount(output.toFixed(6));
        } catch(error){
            console.error('Quote error: ', error);
            alert('Failed to get quote');
        } finally {
            setIsLoading(false);
        }
    };

    //Execute the swap
    const executeSwap = async() => {
        if(!connected || !publicKey || !quote){
            alert('Please connect wallet and get a quote first');
            return;
        }
        
        setIsLoading(true);
        try {
            const { data } = await axios.post('https://quote-api.jup.ag/v6/swap',{
                quoteRespose: quote,
                userPublicKey: publicKey.toString(),
            });

            //Deserialize transaction
            const swapTransactionBuff = Buffer.from(data.swapTransaction,'base64');
            const transaction = VersionedTransaction.deserialize(swapTransactionBuff);

            //sign transaction
            const rawTransaction = signedTransaction.serialize();
            const txid = await connection.sendRawTransaction(rawTransaction, {
                skipPreflight: true,
                maxRetries: 2,
            });

            //Confirm transaction
            const latestBlockHash = await connection.getLatestBlockhash();
            await connection.confirmTransaction({
                blockhash: latestBlockHash.blockhash,
                lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
                signature: txid,
            });

            alert(`Swap succesfull! Transaction: ${txid}`);
            console.log(`https://solsacn.io/tx/${txid}?cluster=devnet`);

            //reset from
            setInputAmount('');
            setOutputAmount('');
            setQuote(null);
        } catch (error) {
            console.error('Swap error:', error);
            alert('Swap failed: ' + error.message);
        }finally{
            setIsLoading(false);
        }
    };
    if (!connected){
        return (
            <div className="text-center text-gray-400">
                <p>Please connect your wallet to start swapping</p>
            </div>
        );
    }
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <lable className="block text-sm font-medium text-gray-300">From</lable>
                <div className="realtive">
                    <button
                    type="number"
                    value={inputAmount}
                    onChange={(e) => setInputAmount(e.target.value)}
                    placeholder="0.0"
                    className="w-full bg-gray-700 disabled:bg-gray-600 p-2 rounded-full transition-colors">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                        </svg>
                    </button>
                </div>

                <div className="spacey-y-2">
                    <label className="block text-sm font-medium text-gray-300">To</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={outputAmount}
                            readOnly
                            placeholder="0.0"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400"
                            />
                            <div className="absolute right-3 top-3 text-gray-300 font-medium">
                                USDC
                            </div>
                    </div>
                </div>
            </div>

            <button 
            onClick={executeSwap}
            disabled={!quote || isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Processing...': quote ? 'Swap' : 'Get Quote First'}
            </button>

            {quote && (
                <div className="bg-gray-700/70 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex jufify-between text-gray-300">
                        <span>Price Impact:</span>
                        <span>{(quote.priceImpact * 100).toFixed}%</span>
                    </div>
                    <div className="fex justify-between text-gray-300">
                        <span>Slippage:</span>
                        <span>0.5%</span>
                    </div>
                </div>
            )}
        </div>
    );
};
export default SwapInterface;
