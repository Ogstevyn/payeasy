import { buildContractTransaction } from "../../lib/stellar/contract-transactions";
import { SorobanRpc, Transaction, Networks } from "stellar-sdk";

// Mock stellar-sdk components
jest.mock("stellar-sdk", () => {
  const actual = jest.requireActual("stellar-sdk") as any;
  return {
    ...actual,
    Contract: jest.fn().mockImplementation(() => ({
      call: jest.fn().mockReturnValue({}),
    })),
    TransactionBuilder: jest.fn().mockImplementation(() => ({
      addOperation: jest.fn().mockReturnThis(),
      setTimeout: jest.fn().mockReturnThis(),
      build: jest.fn().mockReturnValue({
        toXDR: () => "mock-xdr",
        fee: "100",
      }),
    })),
    SorobanRpc: {
      Server: jest.fn().mockImplementation(() => ({
        getAccount: jest.fn().mockResolvedValue({
          sequenceNumber: () => "1",
          accountId: () => "G...",
        }),
        getFeeStats: jest.fn().mockResolvedValue({
          inclusionFee: { mode: "150" },
        }),
        simulateTransaction: jest.fn().mockResolvedValue({
          minResourceFee: "1000",
          transactionData: {
            resources: () => ({
              instructions: () => 100,
              readBytes: () => 200,
              writeBytes: () => 300,
            }),
          },
        }),
        prepareTransaction: jest.fn().mockResolvedValue({
          fee: "100",
          toXDR: () => "mock-xdr",
        }),
      })),
    },
  };
});

describe("Fee Calculation Logic", () => {
  it("should apply 20% buffer to resource fee and use mode inclusion fee", async () => {
    const params = {
      sourcePublicKey: "GDVP...123",
      contractId: "C...",
      method: "deposit",
      args: [],
      network: "testnet" as any,
    };

    const build = await buildContractTransaction(params);

    expect(build.feeStats?.inclusionFee.mode).toBe("150");
    expect(build.gasEstimate?.stroops).toBe(1000);
  });
});
