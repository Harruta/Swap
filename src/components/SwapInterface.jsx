import { useConnection, useWallet } from "@solana/wallet-adapter-react";
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
    const { connectioin } = useConnection();
    
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
                    inputMint = TOKENS.SOL.mint,
                    outputMint: TOKENS.USDC.mint,
                    amount: parseFloat(inputAmount) * Math.pow(10, TOKENS.SOL.decimals),
                    slippageBps: 50, //0.5 slippage
                }
            })
        }
    }
}
