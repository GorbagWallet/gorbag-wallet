import gorIcon from "../assets/token-icons/gor.jpg"
import solIcon from "../assets/token-icons/sol.png"
import usdcIcon from "../assets/token-icons/usdc.png"
import usdtIcon from "../assets/token-icons/usdt.png"
import bonkIcon from "../assets/token-icons/bonk.png"
import jupIcon from "../assets/token-icons/jup.png"
import rayIcon from "../assets/token-icons/ray.jpg"

export interface Token {
  id: string
  symbol: string
  name: string
  amount: string
  value: string
  change: string
  positive: boolean
  icon: string
  price: number
  mint?: string
}

export const gorbaganaTokens: Token[] = [
  {
    id: "gor",
    symbol: "GOR",
    name: "Gorbagana",
    amount: "0",
    value: "$0.00",
    change: "+0.00%",
    positive: true,
    icon: gorIcon,
    price: 0,
  },
]

export const solanaTokens: Token[] = [
  {
    id: "sol",
    symbol: "SOL",
    name: "Solana",
    amount: "0",
    value: "$0.00",
    change: "+0.00%",
    positive: true,
    icon: solIcon,
    price: 0,
  },
  {
    id: "usdc",
    symbol: "USDC",
    name: "USD Coin",
    amount: "0",
    value: "$0.00",
    change: "+0.00%",
    positive: true,
    icon: usdcIcon,
    price: 1.0,
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  },
  {
    id: "usdt",
    symbol: "USDT",
    name: "Tether",
    amount: "0",
    value: "$0.00",
    change: "+0.00%",
    positive: true,
    icon: usdtIcon,
    price: 1.0,
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  },
  {
    id: "ray",
    symbol: "RAY",
    name: "Raydium",
    amount: "0",
    value: "$0.00",
    change: "+0.00%",
    positive: true,
    icon: rayIcon,
    price: 1.0,
    mint: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
  },
  {
    id: "jup",
    symbol: "JUP",
    name: "Jupiter",
    amount: "0",
    value: "$0.00",
    change: "+0.00%",
    positive: true,
    icon: jupIcon,
    price: 1.0,
    mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
  },
  {
    id: "bonk",
    symbol: "BONK",
    name: "BONK",
    amount: "0",
    value: "$0.00",
    change: "+0.00%",
    positive: true,
    icon: bonkIcon,
    price: 1.0,
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
  }

]
