# Reya Network - Collateral Account Management

This document provides comprehensive information for UI developers working on the profile page dashboard, specifically focusing on collateral account management functionality.

## Table of Contents

- [Dependencies](#dependencies)
- [Core Concepts](#core-concepts)
- [Account Balance Retrieval](#account-balance-retrieval)
- [Creating Margin Accounts](#creating-margin-accounts)
- [Transferring Between Margin Accounts](#transferring-between-margin-accounts)
- [Withdrawing from Margin Accounts](#withdrawing-from-margin-accounts)
- [Contract Interface (ABI)](#contract-interface-abi)
- [Common Implementation Patterns](#common-implementation-patterns)
- [Error Handling](#error-handling)

## Dependencies

To implement collateral account management, you'll need the following dependencies:

```typescript
// SDK dependencies
import {
  ApiClient,
  // Account creation
  createAccount,
  CreateAccountParams,
  CreateAccountResult,
  // Account transfer
  transferMarginBetweenAccounts,
  TransferMarginBetweenAccountsParams,
  TransferMarginBetweenAccountsResult,
  // Account withdrawal
  withdrawMAAndBridge,
  WithdrawMAAndBridgeParams,
  WithdrawMAAndBridgeParamsResult,
  // Max withdraw balance
  GetMaxWithdrawBalanceForAccountParams,
  GetMaxWithdrawBalanceForAccountResult,
  // Simulation types
  SimulateTransferMarginBetweenMAsEntity,
  TransferMarginBetweenMAsSimulationSimulateParams,
  TransferMarginBetweenMAsSimulationLoadDataParams,
} from '@reyaxyz/api-sdk';

// Ethers.js for RPC calls
import { ethers } from 'ethers';
```

## Core Concepts

Reya Network's collateral account system revolves around these key entities:

1. **Margin Accounts**: User-created accounts for managing collateral
2. **Collaterals**: Assets held in margin accounts (e.g., RUSD, SRUSD)
3. **Margin Ratio**: Health metric for accounts (healthy, warning, danger)

## Account Balance Retrieval

### API Method

The primary method to retrieve account balances is through the API client:

```typescript
// Get all margin accounts for an address
const getMarginAccounts = async (address: string) => {
  return await ApiClient.account.getMarginAccounts({ address });
};

// Get a specific margin account by ID
const getMarginAccount = async (address: string, marginAccountId: number) => {
  const accounts = await ApiClient.account.getMarginAccounts({ address });
  return accounts.find(account => account.id === marginAccountId);
};
```

### RPC Method

For direct blockchain interaction, use the RPC method:

```typescript
// ABI fragments for collateral info retrieval
const abi = [
  `function getNodeMarginInfo(uint128, address) external view returns ((address, int256, int256, int256, int256, int256, int256, int256, int256, uint256))`,
  `function getCollateralInfo(uint128, address) external view returns ((int256, int256, int256))`,
];

const fetchCollateralInfo = async (
  accountId: string,
  collateralAddress: string,
  coreProxyAddress: string = '0xa9F32a851B1800742e47725DA54a09A7Ef2556A3'
) => {
  // Convert accountId to number as expected by the contract
  const accountIdNumber = Number(accountId);
  
  // Connect to Reya RPC
  const provider = new ethers.JsonRpcProvider('https://rpc.reya.xyz');
  const contract = new ethers.Contract(coreProxyAddress, abi, provider);

  // Call the contract method
  const result = await contract.getCollateralInfo(
    accountIdNumber,
    collateralAddress
  );

  return {
    scaledNetDeposits: result.netDeposits / 1e6,
    netDeposits: result.netDeposits,
    marginBalance: result.marginBalance,
    realBalance: result.realBalance,
  };
};
```

### Example Response Structure

```json
[
  {
    "id": 881,
    "name": "skustux1",
    "marginRatioHealth": "healthy",
    "marginRatioPercentage": 1.041084506066926,
    "totalBalance": 21808.240249578736,
    "liquidationMarginRequirement": 205.47565323463434,
    "totalBalanceUnderlyingAsset": "rUSD",
    "totalBalanceWithHaircut": 19736.69303857888,
    "marginRatioHealthDangerThreshold": 95,
    "marginRatioHealthWarningThreshold": 80,
    "collaterals": [
      {
        "address": "0x162b78e827a8db8173d13735c08c8d40cb5ccdab",
        "token": "SRUSD",
        "percentage": 94.98919616129336,
        "balance": 19882.699207387188,
        "balanceRUSD": 20715.472109998478,
        "balanceWithHaircutRUSD": 18643.92489899863,
        "exchangeRate": 1.0418842981994056,
        "exchangeRateWithHaircut": 0.9376958683794651,
        "exchangeRateChange24HPercentage": 0,
        "yieldPercentage": 4.846141905490013
      },
      {
        "address": "0xa9f32a851b1800742e47725da54a09a7ef2556a3",
        "token": "RUSD",
        "percentage": 5.01080383870626,
        "balance": 1092.7681395801749,
        "balanceRUSD": 1092.7681395801749,
        "balanceWithHaircutRUSD": 1092.7681395801749,
        "exchangeRate": 1,
        "exchangeRateWithHaircut": 1,
        "exchangeRateChange24HPercentage": 0
      }
    ],
    "totalBalanceChange24HPercentage": 0,
    "livePnL": 8.577936759190187,
    "livePnLUnderlyingAsset": "rUSD",
    "realizedPnL": -1008.1009350924077,
    "realizedPnlHistoryTotal": -548.8063396180278,
    "realizedPnLUnderlyingAsset": "rUSD",
    "totalPositionsCount": 2,
    "positions": [
      // Position details...
    ],
    "isApproachingLiquidation": false,
    "isLiquidationImminent": false
  }
]
```

## Creating Margin Accounts

### Service Implementation

```typescript
export const createMarginAccountService = async (
  params: CreateMarginAccountParams
): Promise<CreateMarginAccountResult> => {
  return await createAccount(params);
};
```

### Parameters

```typescript
type CreateMarginAccountParams = {
  // User-defined name for the margin account
  name: string;
  // Connected wallet signer for transaction signing
  signer: ethers.Signer;
};
```

### Response

```typescript
type CreateMarginAccountResult = {
  // ID of the newly created margin account
  accountId: number;
  // Transaction hash
  txHash: string;
};
```

### Example Usage

```typescript
const createNewMarginAccount = async (name: string, signer: ethers.Signer) => {
  try {
    const result = await createMarginAccountService({
      name,
      signer,
    });
    
    console.log(`Created account ID: ${result.accountId}`);
    console.log(`Transaction hash: ${result.txHash}`);
    return result;
  } catch (error) {
    console.error('Error creating margin account:', error);
    throw error;
  }
};
```

## Transferring Between Margin Accounts

Transfers between margin accounts occur in multiple steps:

1. Arm the simulation
2. Simulate the transfer to preview effects
3. Execute the actual transfer

### 1. Arm Simulation

```typescript
export const armSimulateTransferBetweenMarginAccountService = async (
  params: ArmSimulateTransferBetweenMarginAccountParams
): Promise<void> => {
  return await ApiClient.transferMarginBetweenMAsSimulation.arm(params);
};
```

### 2. Simulate Transfer

```typescript
export const simulateTransferBetweenMarginAccountService = async (
  params: SimulateTransferBetweenMarginAccountParams
): Promise<SimulateTransferBetweenMarginAccountEntity> => {
  return await ApiClient.transferMarginBetweenMAsSimulation.simulate(params);
};
```

### 3. Execute Transfer

```typescript
export const transferBetweenMarginAccountService = async (
  params: TransferBetweenMarginAccountParams
): Promise<TransferBetweenMarginAccountResult> => {
  return await transferMarginBetweenAccounts(params);
};
```

### Parameters

```typescript
// Parameters for executing transfer
type TransferBetweenMarginAccountParams = {
  // Amount to transfer
  amount: number;
  // Source account ID
  fromAccountId: number;
  // Destination account ID
  toAccountId: number;
  // Token address to transfer
  tokenAddress: string;
  // Wallet signer
  signer: ethers.Signer;
  // Owner metadata
  owner: {
    coreSigNonce: number;
  };
};

// Parameters for simulation
type SimulateTransferBetweenMarginAccountParams = {
  // Amount to transfer
  amount: number;
  // Token address to transfer
  tokenAddress: string;
};
```

### Simulation Response

```typescript
type SimulateTransferBetweenMarginAccountEntity = {
  // Health metrics for source account after transfer
  fromMarginRatio: number;
  fromMarginRatioHealth: 'healthy' | 'warning' | 'danger';
  
  // Health metrics for destination account after transfer
  toMarginRatio: number;
  toMarginRatioHealth: 'healthy' | 'warning' | 'danger';
};
```

### Example Usage

```typescript
const transferBetweenAccounts = async (
  fromAccountId: number,
  toAccountId: number,
  amount: number,
  tokenAddress: string,
  signer: ethers.Signer,
  coreSigNonce: number
) => {
  try {
    // 1. Arm the simulation
    await armSimulateTransferBetweenMarginAccountService({
      fromMarginAccountId: fromAccountId,
      toMarginAccountId: toAccountId,
    });
    
    // 2. Simulate the transfer
    const simulation = await simulateTransferBetweenMarginAccountService({
      amount,
      tokenAddress,
    });
    
    console.log('Transfer simulation:', simulation);
    
    // 3. Check if simulation indicates safe transfer
    if (simulation.fromMarginRatioHealth === 'danger') {
      throw new Error('Transfer would put source account at risk of liquidation');
    }
    
    // 4. Execute the transfer
    const result = await transferBetweenMarginAccountService({
      amount,
      fromAccountId,
      toAccountId,
      tokenAddress,
      signer,
      owner: {
        coreSigNonce,
      },
    });
    
    return result;
  } catch (error) {
    console.error('Error transferring between accounts:', error);
    throw error;
  }
};
```

## Withdrawing from Margin Accounts

### Service Implementation

```typescript
export const withdrawFromMarginAccountService = async (
  params: WithdrawFromMarginAccountParams
): Promise<WithdrawFromMarginAccountResult> => {
  return await withdrawMAAndBridge(params);
};
```

### Getting Maximum Withdraw Amount

```typescript
export const getMarginAccountWithdrawBalanceService = async (
  params: GetMarginAccountWithdrawBalanceParams
): Promise<GetMarginAccountWithdrawBalanceResult> => {
  return await ApiClient.account.getMaxWithdrawBalanceForAccount(params);
};
```

### Parameters

```typescript
// Parameters for withdraw balance check
type GetMarginAccountWithdrawBalanceParams = {
  marginAccountId: number;
  tokenAddress: string;
};

// Parameters for withdrawal
type WithdrawFromMarginAccountParams = {
  // Account ID to withdraw from
  marginAccountId: number;
  // Amount to withdraw
  amount: number;
  // Token address to withdraw
  tokenAddress: string;
  // Destination chain ID
  destinationChainId: number;
  // Wallet signer
  signer: ethers.Signer;
  // Owner metadata
  owner: {
    coreSigNonce: number;
  };
};
```

### Example Usage

```typescript
const withdrawFromMarginAccount = async (
  marginAccountId: number,
  amount: number,
  tokenAddress: string,
  destinationChainId: number,
  signer: ethers.Signer,
  coreSigNonce: number
) => {
  try {
    // 1. Check maximum withdraw amount
    const maxWithdraw = await getMarginAccountWithdrawBalanceService({
      marginAccountId,
      tokenAddress,
    });
    
    console.log(`Maximum withdrawable amount: ${maxWithdraw.maxWithdrawBalance}`);
    
    // 2. Verify amount is within limit
    if (amount > maxWithdraw.maxWithdrawBalance) {
      throw new Error(`Amount exceeds maximum withdrawable: ${maxWithdraw.maxWithdrawBalance}`);
    }
    
    // 3. Execute withdrawal
    const result = await withdrawFromMarginAccountService({
      marginAccountId,
      amount,
      tokenAddress,
      destinationChainId,
      signer,
      owner: {
        coreSigNonce,
      },
    });
    
    return result;
  } catch (error) {
    console.error('Error withdrawing from margin account:', error);
    throw error;
  }
};
```

## Contract Interface (ABI)

The core contract ABI used for direct RPC calls:

```typescript
const coreContractABI = [
  `function getNodeMarginInfo(uint128, address) external view returns ((address, int256, int256, int256, int256, int256, int256, int256, int256, uint256))`,
  `function getCollateralInfo(uint128, address) external view returns ((int256, int256, int256))`,
  `function execute(uint128, (uint8 commandType, bytes inputs, uint128 marketId, uint128 exchangeId)[]) external returns (bytes[], (address, int256, int256, int256, int256, int256, int256, int256, int256, uint256))`,
];
```

The core proxy contract address:
`0xa9F32a851B1800742e47725DA54a09A7Ef2556A3`

## Common Implementation Patterns

### Margin Account List Component

```typescript
const MarginAccountList = () => {
  const marginAccountsUI = useAppSelector(selectMarginAccountsUI);
  const marginAccountsUILoading = useAppSelector(selectIsMarginAccountsLoading);

  if (marginAccountsUILoading) {
    return <LoadingComponent />;
  }

  if (marginAccountsUI.length === 0) {
    return <EmptyState message="No margin accounts found" />;
  }

  return (
    <div>
      {marginAccountsUI.map(({
        id,
        name,
        totalBalanceFormatted,
        balanceChange24HPercentageFormatted,
        marginRatioPercentageFormatted,
        marginRatioPercentage,
        marginRatioHealth,
      }) => (
        <AccountRow
          key={id}
          name={name}
          balanceFormatted={totalBalanceFormatted}
          balanceChange24HPercentage={balanceChange24HPercentageFormatted}
          marginRatioPercentageFormatted={marginRatioPercentageFormatted}
          marginRatioPercentage={marginRatioPercentage}
          marginRatioHealth={marginRatioHealth}
        />
      ))}
    </div>
  );
};
```

### Account Details Component

```typescript
const MarginAccountDetails = () => {
  const marginAccount = useAppSelector(selectCurrentMarginAccountUI);
  
  if (!marginAccount) {
    return <LoadingComponent />;
  }
  
  const { 
    totalBalanceWithHaircutFormatted,
    totalBalanceUnderlyingAsset,
    marginRatioPercentageFormatted,
    marginRatioPercentage,
    collaterals
  } = marginAccount;
  
  return (
    <div>
      <div>
        <h3>Balance</h3>
        <p>
          {totalBalanceWithHaircutFormatted.value} 
          {totalBalanceUnderlyingAsset}
        </p>
      </div>
      
      <div>
        <h3>Margin Ratio</h3>
        <p>{marginRatioPercentageFormatted}%</p>
        <HealthIndicator percentage={marginRatioPercentage} />
      </div>
      
      <div>
        <h3>Collaterals</h3>
        {collaterals.map(collateral => (
          <CollateralRow
            key={collateral.token}
            token={collateral.token}
            balance={collateral.balance}
            percentage={collateral.percentage}
          />
        ))}
      </div>
    </div>
  );
};
```

## Error Handling

Common error patterns for the collateral management operations:

```typescript
try {
  // Operation code here
} catch (error) {
  // Log the error
  console.error('Operation failed:', error);
  
  // Extract user-friendly message
  const message = extractError(error);
  
  // Show notification
  Notifications.showErrorNotification({ message });
  
  // Log telemetry
  Telemetry.logError({
    context: 'operationName',
    error,
    metadata: { params },
  });
  
  // Reject the thunk with error
  return rejectThunkWithError(thunkAPI, error);
}
```

### Common Error Types

- **Not connected**: Wallet connection issues
- **Insufficient balance**: Not enough balance for transfer/withdrawal
- **Invalid margin account**: Account ID doesn't exist or belong to user
- **Liquidation risk**: Operation would put account at risk of liquidation
- **Transaction failure**: On-chain transaction reverted

---

## Additional Resources

- [Reya Network API Documentation](https://docs.reya.xyz/api)
- [Reya Network SDK Reference](https://docs.reya.xyz/sdk)
- [Reya Network Contract Functions](https://docs.reya.xyz/technical-docs/contract-functions/core)
- [Reya Network Contract Documentation](https://docs.reya.xyz/contracts)
