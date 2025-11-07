# Gorbag Wallet

![Gorbag Wallet Banner](src/assets/Gorbag-Wallet-Banner.png)

Gorbag Wallet is an open-source cryptocurrency wallet extension that provides secure access to the Gorbagana network and other blockchain ecosystems. Built with TypeScript and React, it offers users a seamless way to manage their digital assets.

## About Cryptocurrency Wallets

Cryptocurrency wallets are essential tools that allow users to store, send, and receive digital assets. Unlike traditional wallets, crypto wallets don't actually store currency; instead, they provide access to blockchain addresses where assets are recorded. Wallets come in various forms:

- **Hardware wallets**: Physical devices offering maximum security
- **Software wallets**: Applications running on computers or mobile devices
- **Web wallets**: Browser-based solutions for easy access
- **Mobile wallets**: Smartphone applications optimized for on-the-go use

Popular existing wallets include MetaMask, Phantom, Coinbase Wallet, Trust Wallet, and Exodus. Each offers different features and supports various blockchain networks. Wallets use public/private key cryptography to secure transactions and provide users with control over their digital assets.

## The Gorbagana Network

Gorbagana is a blockchain network designed for high-throughput applications with low transaction fees. Built on Solana technology, it provides:

- Fast transaction processing
- Low-cost operations
- Developer-friendly environment
- Ecosystem support for decentralized applications

The network's native token is GOR, which powers transactions and enables governance within the ecosystem.

## About Gorbag Wallet

Gorbag Wallet is a browser extension that provides secure access to the Gorbagana network and other compatible blockchains. Built with security and usability in mind, it offers a comprehensive suite of features for managing your digital assets.

## 🚀 Key Features

### 🔐 **Security First**
- Advanced encryption for private keys
- Password protection with configurable auto-lock timers
- Secure transaction signing
- Seed phrase backup and recovery

### 🌐 **Multi-Network Support**
- Native support for Gorbagana and Solana networks
- Seamless network switching
- Cross-chain compatibility

### 💰 **Token Management**
- Multi-token support with real-time price tracking
- Portfolio value tracking across networks
- Token hiding functionality
- Detailed token information and analytics

### 🔄 **Transaction Capabilities**
- Send and receive multiple token types
- Swap capabilities through integrated DEX
- Transaction history tracking
- Real-time balance updates

### 🎨 **User Experience**
- Intuitive interface for both beginners and advanced users
- Responsive design optimized for all screen sizes
- Smooth animations and transitions
- Multi-language support

### Technical Stack

Gorbag Wallet is built using modern web technologies:

- **TypeScript**: For type-safe development
- **React**: For component-based UI development
- **Plasmo**: For browser extension framework
- **Tailwind CSS**: For styling
- **Solana Web3.js**: For blockchain interactions
- **Lucide React**: For UI icons

### Installation

1. Clone the repository: `git clone https://github.com/your-username/gorbag-wallet.git`
2. Install dependencies: `pnpm install`
3. Build the extension: `pnpm build`
4. Load the extension in your browser (developer mode)

### Development

To run in development mode:
```bash
pnpm dev
```

To build for production:
```bash
pnpm build
```

### Testing

Gorbag Wallet includes a comprehensive test suite to ensure reliability and correctness of core functionality.

#### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode (re-run on file changes)
pnpm test:watch

# Run tests with coverage report
pnpm test:coverage
```

#### Test Coverage

The test suite covers the following areas:

- **Currency & Token Services**: Token value calculations, portfolio management, and API fallback mechanisms
- **Wallet Configuration**: Network configurations, token data structures, and constants
- **Token Utilities**: Token amount formatting, value conversion, and utility functions  
- **Security Features**: Wallet data structures, security-related configurations, and encryption utilities
- **API Integration**: Mocked external API calls with proper fallback handling
- **Wallet Session Management**: Session lifecycle, expiration handling, and security features
- **Solana/Solana Interactions**: Balance fetching, transaction history, and token operations
- **Swap Service Logic**: Swap quoting, transaction execution, and integration with Jupiter
- **Wallet Utilities**: Seed phrase generation, validation, wallet import, and address validation

All tests focus on core business logic rather than UI components, ensuring the wallet's critical functions work reliably. The test suite includes 127 tests across 11 test suites, providing comprehensive coverage of the wallet's core functionality.

Based on the coverage report, the tests now provide excellent coverage of the core logic files, with particular strength in security features, wallet utilities, and currency services. The test suite focuses on critical business logic while intentionally leaving UI components untested to maximize effectiveness of testing resources.

### Contributing

This project is open-source under the GPL v3 license. Contributions are welcome! Please feel free to submit pull requests or open issues to improve the wallet.

### License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0). See the [LICENSE](./LICENSE) file for more details.

### Security

Please note that this is experimental software. Always backup your seed phrase and never share it with anyone. The authors are not responsible for any loss of funds resulting from the use of this software.

---

**Author**: David Nzube (Skipp)  
[![Twitter](https://img.shields.io/badge/Twitter-@davidnzubee-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://x.com/davidnzubee) [![GitHub](https://img.shields.io/badge/GitHub-DavidNzube101-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/DavidNzube101)
