import { BlockSource, Block } from 'barretenberg/block_source';

export { Block } from 'barretenberg/block_source';

export interface NetworkInfo {
  chainId: number;
  networkOrHost: string;
}

export interface ProofReceiver {
  sendProof(proof: Buffer, signatures: Buffer[], sigIndexes: number[], viewingKeys: Buffer[]): Promise<Buffer>;
}

export interface Receipt {
  blockNum: number;
}

export interface Blockchain extends BlockSource, ProofReceiver {
  getBlocks(from: number, to?: number): Promise<Block[]>;
  getTransactionReceipt(txHash: Buffer): Promise<Receipt>;
  validateDepositFunds(publicOwner: Buffer, publicInput: Buffer): Promise<boolean>;
  validateSignature(publicOwnerBuf: Buffer, signature: Buffer, proof: Buffer): boolean;
  getNetworkInfo(): Promise<NetworkInfo>;
  getRollupContractAddress(): string;
  getTokenContractAddress(): string;
}
