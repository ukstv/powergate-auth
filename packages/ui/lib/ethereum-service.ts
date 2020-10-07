export class EthereumService {
  static instance = new EthereumService();

  async ethereum(): Promise<any> {
    const isMetaMaskAvailable =
      typeof window !== "undefined" &&
      typeof (window as any).ethereum !== "undefined";
    if (isMetaMaskAvailable) {
      return (window as any).ethereum;
    } else {
      throw new Error(`MetaMask is not available`);
    }
  }
}
