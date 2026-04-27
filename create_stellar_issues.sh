#!/bin/bash
# Script to create 30 Stellar integration issues for PayEasy

REPO="Ogstevyn/payeasy"

# Issue 42
gh issue create -R "$REPO" --title "[Issue #42] Wallet: Freighter Connection Hook" --body '## Description
Create a React hook `useFreighter` that handles Freighter wallet connection, disconnection, and public key retrieval.

## Requirements
- Detect if Freighter extension is installed.
- Implement `connect()`, `disconnect()`, and `getPublicKey()` methods.
- Store connection state in React context.
- Handle errors gracefully (extension not installed, user rejected).

## Acceptance Criteria
- Hook returns `{ publicKey, isConnected, connect, disconnect, isFreighterInstalled }`.
- Works in the browser environment only (SSR-safe).

## Files to Create/Modify
- `hooks/useFreighter.ts` (Create)
- `lib/stellar/wallet.ts` (Create)

## Test Requirements
- Unit test for hook state transitions.'

# Issue 43
gh issue create -R "$REPO" --title "[Issue #43] Wallet: Stellar Auth Context Provider" --body '## Description
Create a `StellarAuthProvider` React context that wraps the app and provides wallet state globally.

## Requirements
- Wrap `useFreighter` hook in a context provider.
- Persist wallet connection state across page navigations.
- Auto-reconnect on page reload if previously connected.
- Expose `publicKey`, `isConnected`, `connect`, `disconnect` via context.

## Acceptance Criteria
- Any component can access wallet state via `useStellarAuth()`.
- Provider is added to `app/layout.tsx`.

## Files to Create/Modify
- `contexts/StellarAuthContext.tsx` (Create)
- `app/layout.tsx` (Modify)

## Test Requirements
- Test that context provides correct default values.'

# Issue 44
gh issue create -R "$REPO" --title "[Issue #44] Wallet: Connect Wallet Button Component" --body '## Description
Build a `ConnectWalletButton` component that shows wallet connection status and allows users to connect/disconnect.

## Requirements
- Show "Connect Wallet" when disconnected.
- Show truncated public key (e.g., `GABCD...WXYZ`) when connected.
- Dropdown menu with "Copy Address" and "Disconnect" options.
- Use Framer Motion for smooth transitions.

## Acceptance Criteria
- Button integrates with `useStellarAuth()` context.
- Renders correctly in the Navbar.

## Files to Create/Modify
- `components/wallet/ConnectWalletButton.tsx` (Create)
- `components/landing/Navbar.tsx` (Modify)

## Test Requirements
- Visual test for both connected/disconnected states.'

# Issue 45
gh issue create -R "$REPO" --title "[Issue #45] Soroban: Contract Client Generator Setup" --body '## Description
Set up the Soroban contract client bindings so the frontend can call smart contract methods directly.

## Requirements
- Use `soroban contract bindings typescript` CLI to generate TypeScript client from the compiled WASM.
- Create a `lib/stellar/contract.ts` that exports a configured contract client instance.
- Support both testnet and mainnet contract IDs via env variables.

## Acceptance Criteria
- Generated client types match the `RentEscrow` contract interface.
- `NEXT_PUBLIC_CONTRACT_ID` env variable is used for the deployed contract address.

## Files to Create/Modify
- `lib/stellar/contract.ts` (Create)
- `scripts/generate-bindings.sh` (Create)
- `.env.example` (Modify)

## Test Requirements
- N/A (Build check only)'

# Issue 46
gh issue create -R "$REPO" --title "[Issue #46] Soroban: Transaction Builder Utility" --body '## Description
Create a utility module for building, simulating, and submitting Soroban transactions.

## Requirements
- Build `TransactionBuilder` wrapper that handles Soroban-specific transaction assembly.
- Implement `simulateTransaction()` before submission for gas estimation.
- Handle `SorobanRpc.Api.GetTransactionResponse` parsing.
- Support transaction timeout and retry logic.

## Acceptance Criteria
- Utility can build a transaction, simulate it, sign via Freighter, and submit.
- Returns parsed result or meaningful error.

## Files to Create/Modify
- `lib/stellar/transaction.ts` (Create)

## Test Requirements
- Unit test for transaction assembly with mock data.'

# Issue 47
gh issue create -R "$REPO" --title "[Issue #47] Soroban: Initialize Escrow Frontend Action" --body '## Description
Create a frontend action that calls the `initialize` contract method to set up a new rent escrow agreement.

## Requirements
- Accept `landlord`, `totalRent`, `deadline`, `tokenAddress`, and roommate list as inputs.
- Build and submit the Soroban transaction using the transaction utility.
- Sign via Freighter wallet.
- Return the transaction hash on success.

## Acceptance Criteria
- Calling `initializeEscrow()` creates a valid on-chain escrow.
- Handles simulation errors and surfaces them to the caller.

## Files to Create/Modify
- `lib/stellar/actions/initialize.ts` (Create)

## Test Requirements
- Integration test against Stellar testnet (manual verification).'

# Issue 48
gh issue create -R "$REPO" --title "[Issue #48] Soroban: Contribute Payment Frontend Action" --body '## Description
Create a frontend action that calls the `contribute` contract method for roommate payments.

## Requirements
- Accept `from` (roommate address) and `amount` as inputs.
- Build Soroban transaction with proper token approval.
- Sign via Freighter and submit.
- Emit success/failure status.

## Acceptance Criteria
- Roommates can contribute their share through the UI.
- Transaction confirmation is returned with ledger details.

## Files to Create/Modify
- `lib/stellar/actions/contribute.ts` (Create)

## Test Requirements
- Integration test against Stellar testnet.'

# Issue 49
gh issue create -R "$REPO" --title "[Issue #49] Soroban: Release Funds Frontend Action" --body '## Description
Create a frontend action that calls the `release` contract method to transfer escrowed funds to the landlord.

## Requirements
- Verify escrow is fully funded before attempting release.
- Build and submit the Soroban transaction.
- Sign via Freighter (landlord wallet).

## Acceptance Criteria
- Landlord can release funds when escrow is fully funded.
- Returns transaction confirmation.

## Files to Create/Modify
- `lib/stellar/actions/release.ts` (Create)

## Test Requirements
- Integration test against Stellar testnet.'

# Issue 50
gh issue create -R "$REPO" --title "[Issue #50] Soroban: Claim Refund Frontend Action" --body '## Description
Create a frontend action that calls `claim_refund` to return deposits to roommates after deadline expiry.

## Requirements
- Check deadline has passed before calling.
- Build and submit Soroban transaction.
- Sign via roommate Freighter wallet.

## Acceptance Criteria
- Roommates can claim refunds after deadline.
- Returns transaction confirmation with refunded amount.

## Files to Create/Modify
- `lib/stellar/actions/claimRefund.ts` (Create)

## Test Requirements
- Integration test against Stellar testnet.'

# Issue 51
gh issue create -R "$REPO" --title "[Issue #51] Soroban: Read-Only Contract Queries" --body '## Description
Create helper functions for all read-only contract queries (getters) that do not require transaction signing.

## Requirements
- Implement `getLandlord()`, `getTotal()`, `getDeadline()`, `getBalance(address)`, `getTotalFunded()`, `isFullyFunded()`.
- Use `SorobanRpc.Server.simulateTransaction()` for read-only calls.
- Return typed results.

## Acceptance Criteria
- All getters return correct typed data without requiring wallet signature.
- Errors are caught and typed.

## Files to Create/Modify
- `lib/stellar/queries.ts` (Create)

## Test Requirements
- Unit tests with mocked Soroban RPC responses.'

# Issue 52
gh issue create -R "$REPO" --title "[Issue #52] Deploy: Contract Deployment Script" --body '## Description
Create a deployment script that compiles and deploys the rent-escrow contract to Stellar testnet.

## Requirements
- Compile contract to optimized WASM (`cargo build --target wasm32-unknown-unknown --release`).
- Deploy using `soroban contract deploy` CLI.
- Output the deployed contract ID.
- Store contract ID in a `.env` or config file.

## Acceptance Criteria
- Single command deploys the contract to testnet.
- Contract ID is saved for frontend use.

## Files to Create/Modify
- `scripts/deploy.sh` (Create)
- `scripts/README.md` (Create)

## Test Requirements
- Successful deployment to testnet.'

# Issue 53
gh issue create -R "$REPO" --title "[Issue #53] Deploy: Contract Upgrade Script" --body '## Description
Create a script for upgrading an already-deployed contract to a new WASM version.

## Requirements
- Use `soroban contract install` to upload new WASM hash.
- Invoke upgrade mechanism if contract supports it.
- Verify deployment with a health check call.

## Acceptance Criteria
- Existing contract can be upgraded without losing state.
- Script outputs new WASM hash and confirmation.

## Files to Create/Modify
- `scripts/upgrade.sh` (Create)

## Test Requirements
- Verify getter returns correct data after upgrade.'

# Issue 54
gh issue create -R "$REPO" --title "[Issue #54] Horizon: Account Balance Fetcher" --body '## Description
Create a utility to fetch Stellar account balances (native XLM and custom tokens) using the Horizon API.

## Requirements
- Query Horizon `/accounts/{accountId}` endpoint.
- Parse and return balances with asset type, code, and issuer.
- Handle account not found errors.

## Acceptance Criteria
- Returns structured balance data for any valid Stellar address.
- Works for both native XLM and token balances.

## Files to Create/Modify
- `lib/stellar/horizon.ts` (Create)

## Test Requirements
- Unit test with mocked Horizon response.'

# Issue 55
gh issue create -R "$REPO" --title "[Issue #55] Horizon: Transaction History Fetcher" --body '## Description
Fetch and display transaction history for a given Stellar account from the Horizon API.

## Requirements
- Query Horizon `/accounts/{accountId}/transactions` with pagination.
- Parse transaction envelope and extract relevant operations.
- Support cursor-based pagination for loading more transactions.

## Acceptance Criteria
- Returns paginated list of transactions with type, amount, counterparty, and timestamp.

## Files to Create/Modify
- `lib/stellar/history.ts` (Create)

## Test Requirements
- Unit test with mocked paginated Horizon response.'

# Issue 56
gh issue create -R "$REPO" --title "[Issue #56] Token: Stellar Asset Contract Helper" --body '## Description
Create utilities for interacting with Stellar Asset Contracts (SAC) — the wrapped token standard used for payments.

## Requirements
- Wrap SAC operations: `balance()`, `allowance()`, `approve()`, `transfer()`.
- Support any SAC token address.
- Format token amounts with proper decimal handling.

## Acceptance Criteria
- Can query token balance and approve spending for escrow contributions.
- Amount formatting matches Stellar 7-decimal precision.

## Files to Create/Modify
- `lib/stellar/token.ts` (Create)

## Test Requirements
- Unit test for amount formatting and decimal conversion.'

# Issue 57
gh issue create -R "$REPO" --title "[Issue #57] Token: Testnet Token Minting Script" --body '## Description
Create a script to mint test tokens on Stellar testnet for development and testing.

## Requirements
- Use Stellar friendbot for testnet XLM.
- Create and fund a token issuer account.
- Issue custom test tokens and distribute to test accounts.
- Wrap the issued asset as a Stellar Asset Contract.

## Acceptance Criteria
- Script creates funded test accounts with custom tokens.
- Output includes account keypairs and token contract ID.

## Files to Create/Modify
- `scripts/mint-test-tokens.sh` (Create)

## Test Requirements
- Verify minted tokens appear in account balance.'

# Issue 58
gh issue create -R "$REPO" --title "[Issue #58] Network: Soroban RPC Health Monitor" --body '## Description
Create a health check utility that monitors Soroban RPC node connectivity and network status.

## Requirements
- Ping Soroban RPC endpoint with `getHealth()`.
- Check latest ledger sequence to detect stale connections.
- Return network status: healthy, degraded, or offline.

## Acceptance Criteria
- Health check runs on app startup and periodically.
- Status is surfaced via a `useNetworkStatus()` hook.

## Files to Create/Modify
- `lib/stellar/health.ts` (Create)
- `hooks/useNetworkStatus.ts` (Create)

## Test Requirements
- Unit test for status parsing logic.'

# Issue 59
gh issue create -R "$REPO" --title "[Issue #59] UI: Escrow Dashboard - Contract State Display" --body '## Description
Build the Escrow Dashboard page that displays the current state of a rent escrow contract.

## Requirements
- Show landlord address, total rent, deadline, and escrow status.
- Display progress bar for total funded vs. total required.
- List each roommate with their expected share and paid amount.
- Real-time updates using Soroban read-only queries.

## Acceptance Criteria
- Dashboard reflects live on-chain state.
- Progress bar accurately shows funding percentage.

## Files to Create/Modify
- `app/escrow/[contractId]/page.tsx` (Create)
- `components/escrow/EscrowStatus.tsx` (Create)
- `components/escrow/RoommateList.tsx` (Create)
- `components/escrow/FundingProgress.tsx` (Create)

## Test Requirements
- Component renders correctly with mock contract data.'

# Issue 60
gh issue create -R "$REPO" --title "[Issue #60] UI: Contribute Payment Flow" --body '## Description
Build the payment flow UI for roommates to contribute their rent share to the escrow.

## Requirements
- Show roommate expected share and remaining balance.
- Amount input with validation (min/max constraints).
- Transaction confirmation modal with fee estimation.
- Loading state during transaction submission.
- Success/failure feedback with transaction hash link to Stellar Explorer.

## Acceptance Criteria
- Roommate can input amount, confirm, sign with Freighter, and see result.
- Links to stellarchain.io or stellar.expert for transaction verification.

## Files to Create/Modify
- `components/escrow/ContributeForm.tsx` (Create)
- `components/escrow/TransactionConfirmModal.tsx` (Create)

## Test Requirements
- Form validation tests.'

# Issue 61
gh issue create -R "$REPO" --title "[Issue #61] UI: Create Escrow Agreement Form" --body '## Description
Build a multi-step form for landlords to create a new rent escrow agreement.

## Requirements
- Step 1: Enter total rent amount and select payment token.
- Step 2: Set deadline (date picker converted to ledger timestamp).
- Step 3: Add roommates with their addresses and share amounts.
- Step 4: Review and confirm — calls `initialize` + `add_roommate` contract methods.
- Validate share sum equals total rent.

## Acceptance Criteria
- Multi-step form creates a fully configured escrow on-chain.
- Share validation prevents over/under-allocation.

## Files to Create/Modify
- `app/escrow/create/page.tsx` (Create)
- `components/escrow/CreateEscrowForm.tsx` (Create)
- `components/escrow/RoommateInput.tsx` (Create)

## Test Requirements
- Form validation and step navigation tests.'

# Issue 62
gh issue create -R "$REPO" --title "[Issue #62] UI: Transaction History Page" --body '## Description
Build a page displaying the user payment history and escrow-related transactions.

## Requirements
- Fetch transactions from Horizon API filtered by contract interactions.
- Display: date, type (contribute/release/refund), amount, status, tx hash.
- Support pagination for loading older transactions.
- Link each transaction to Stellar block explorer.

## Acceptance Criteria
- Page shows chronological list of escrow-related transactions.
- Pagination works correctly.

## Files to Create/Modify
- `app/history/page.tsx` (Create)
- `components/history/TransactionList.tsx` (Create)
- `components/history/TransactionCard.tsx` (Create)

## Test Requirements
- Component renders with mock transaction data.'

# Issue 63
gh issue create -R "$REPO" --title "[Issue #63] Events: Soroban Contract Event Listener" --body '## Description
Create a utility that fetches and parses Soroban contract events (Contribution, AgreementReleased) from the RPC.

## Requirements
- Use `SorobanRpc.Server.getEvents()` to poll for new contract events.
- Parse event topics and data into typed structures.
- Support filtering by event type and contract ID.

## Acceptance Criteria
- Can retrieve and parse `Contribution` and `AgreementReleased` events.
- Returns structured event data with timestamps.

## Files to Create/Modify
- `lib/stellar/events.ts` (Create)

## Test Requirements
- Unit test for event parsing logic with mock RPC responses.'

# Issue 64
gh issue create -R "$REPO" --title "[Issue #64] Events: Real-Time Escrow Notifications" --body '## Description
Implement a polling mechanism that monitors escrow events and triggers UI notifications.

## Requirements
- Poll for new contract events at configurable intervals.
- Show toast notifications for: new contribution, fully funded, released, refund claimed.
- Use React hook `useEscrowEvents(contractId)`.

## Acceptance Criteria
- UI updates automatically when escrow events occur.
- Toast notifications appear for relevant events.

## Files to Create/Modify
- `hooks/useEscrowEvents.ts` (Create)
- `components/notifications/EscrowToast.tsx` (Create)

## Test Requirements
- Hook test with mocked event polling.'

# Issue 65
gh issue create -R "$REPO" --title "[Issue #65] Security: Transaction Signing Validation" --body '## Description
Add client-side validation and safety checks before signing any Stellar transaction.

## Requirements
- Validate transaction XDR before presenting to Freighter.
- Check destination addresses are valid Stellar public keys.
- Verify transaction network passphrase matches expected network.
- Display human-readable transaction summary before signing.
- Reject suspicious transactions (unexpected operations, wrong network).

## Acceptance Criteria
- No transaction is signed without user-visible summary.
- Invalid transactions are caught before reaching Freighter.

## Files to Create/Modify
- `lib/stellar/validation.ts` (Create)
- `components/wallet/TransactionReview.tsx` (Create)

## Test Requirements
- Unit tests for validation edge cases (invalid addresses, wrong network).'

# Issue 66
gh issue create -R "$REPO" --title "[Issue #66] Error: Stellar Error Handling & User Messaging" --body '## Description
Create a centralized error handler that translates Stellar/Soroban errors into user-friendly messages.

## Requirements
- Map Soroban contract errors (InvalidAmount, InsufficientFunding, Unauthorized, DeadlineNotReached) to clear UI messages.
- Handle RPC errors (network timeout, node unavailable, simulation failure).
- Handle Freighter errors (rejected, locked, not installed).
- Provide actionable guidance in error messages.

## Acceptance Criteria
- All Stellar-related errors show meaningful messages instead of raw codes.
- Error messages include suggested next steps.

## Files to Create/Modify
- `lib/stellar/errors.ts` (Create)

## Test Requirements
- Unit test for each error code mapping.'

# Issue 67
gh issue create -R "$REPO" --title "[Issue #67] CI: Soroban Contract Build & Test Pipeline" --body '## Description
Enhance the CI pipeline to build the WASM contract artifact and run contract tests on every PR.

## Requirements
- Install Rust toolchain with `wasm32-unknown-unknown` target.
- Install Soroban CLI.
- Run `cargo build --target wasm32-unknown-unknown --release` in contracts/rent-escrow.
- Run `cargo test` with testutils feature.
- Upload compiled WASM as a build artifact.
- Fail PR if tests fail or WASM build fails.

## Acceptance Criteria
- Every PR triggers contract build and test.
- WASM artifact is downloadable from CI.

## Files to Create/Modify
- `.github/workflows/contract-tests.yml` (Modify)

## Test Requirements
- CI passes on current main branch.'

# Issue 68
gh issue create -R "$REPO" --title "[Issue #68] CI: Testnet Deployment Pipeline" --body '## Description
Create a GitHub Actions workflow for automated contract deployment to Stellar testnet on release tags.

## Requirements
- Trigger on `release` events or manual dispatch.
- Build optimized WASM binary.
- Deploy to Stellar testnet using `soroban contract deploy`.
- Store deployed contract ID as a GitHub Actions output/artifact.
- Post deployment summary as a GitHub release comment.

## Acceptance Criteria
- Tagging a release auto-deploys to testnet.
- Contract ID is recorded in the release.

## Files to Create/Modify
- `.github/workflows/deploy-testnet.yml` (Create)

## Test Requirements
- Successful deployment to testnet on test release.'

# Issue 69
gh issue create -R "$REPO" --title "[Issue #69] Explorer: Stellar Block Explorer Links" --body '## Description
Create a utility for generating links to Stellar block explorers for transactions, accounts, and contracts.

## Requirements
- Support multiple explorers: stellar.expert, stellarchain.io.
- Generate links for: transaction hash, account ID, contract ID.
- Network-aware (testnet vs mainnet links).

## Acceptance Criteria
- `getExplorerLink(type, id)` returns correct URL for current network.
- Links open in new tab when used in UI components.

## Files to Create/Modify
- `lib/stellar/explorer.ts` (Create)

## Test Requirements
- Unit test for each link type and network combination.'

# Issue 70
gh issue create -R "$REPO" --title "[Issue #70] Stellar: Friendbot Testnet Funding Integration" --body '## Description
Integrate Stellar Friendbot to auto-fund new testnet accounts for development and onboarding.

## Requirements
- Create `fundTestnetAccount(publicKey)` function.
- Call Stellar friendbot API to fund accounts with testnet XLM.
- Show funding status in UI during onboarding on testnet.
- Only available when `NEXT_PUBLIC_STELLAR_NETWORK=testnet`.

## Acceptance Criteria
- New users on testnet can get funded automatically.
- Funding is gated to testnet only.

## Files to Create/Modify
- `lib/stellar/friendbot.ts` (Create)
- `components/wallet/FundTestnetButton.tsx` (Create)

## Test Requirements
- Unit test for friendbot API call with mock response.'

# Issue 71
gh issue create -R "$REPO" --title "[Issue #71] Stellar: Multi-Signature Escrow Support" --body '## Description
Add support for multi-signature authorization on the escrow contract, requiring multiple parties to approve fund release.

## Requirements
- Implement multi-sig threshold logic using Stellar account signers.
- Configure escrow to require landlord + majority roommate approval for release.
- Build UI for multi-sig approval flow.

## Acceptance Criteria
- Release requires configurable threshold of approvals.
- Each signer can independently approve from their wallet.

## Files to Create/Modify
- `lib/stellar/multisig.ts` (Create)
- `components/escrow/MultiSigApproval.tsx` (Create)

## Test Requirements
- Test multi-sig approval flow with mock signers.'

echo "--- All 30 Stellar issues (42-71) created ---"
