# PayEasy: Smart Contract Development Roadmap (40 Granular Issues)

> [!IMPORTANT]
> **4-Hour Resolution Rule**: Once an issue is assigned to you, it must be resolved and a Pull Request submitted within **4 hours**. If the deadline passes without a PR, the issue will be unassigned and given to another contributor to keep the project moving at speed.

---

## Stage 1: Infrastructure & Project Setup (Issues 1-5)

### [Issue #1] Setup: Workspace Configuration
**Description**  
Configure the root `Cargo.toml` to manage the `contracts/rent-escrow` contract as a workspace member.

**Requirements**  
- Must include `[workspace]` section.
- Must list `contracts/rent-escrow` in `members`.

**Acceptance Criteria**  
- `cargo check` at the root recognizes the contract member.

**Files to Create/Modify**  
- `Cargo.toml` (Modify)

**Test Requirements**  
- N/A (Build check only)

---

### [Issue #2] Setup: Soroban SDK Optimization
**Description**  
Add build profiles to `contracts/rent-escrow/Cargo.toml` to optimize the contract for size and production safety.

**Requirements**  
- Add `[profile.release]` with `opt-level = "z"`.
- Add `panic = "abort"` and `lto = true`.

**Acceptance Criteria**  
- Contract compiles to a smaller `.wasm` file after release build.

**Files to Create/Modify**  
- `contracts/rent-escrow/Cargo.toml` (Modify)

**Test Requirements**  
- N/A

---

### [Issue #3] Setup: Define Base Contract Struct
**Description**  
Implement the `RentEscrow` struct with the `#[contract]` attribute.

**Requirements**  
- Use `soroban_sdk::contract`.
- Struct must be empty for now.

**Acceptance Criteria**  
- Struct `RentEscrow` is defined in `lib.rs`.

**Files to Create/Modify**  
- `contracts/rent-escrow/src/lib.rs` (Modify)

**Test Requirements**  
- N/A

---

### [Issue #4] Setup: Implement No-Standard Flag
**Description**  
Ensure the contract environment is properly set to `#![no_std]`.

**Requirements**  
- Use `#![no_std]` at the top of the crate.

**Acceptance Criteria**  
- Contract builds for the `wasm32-unknown-unknown` target.

**Files to Create/Modify**  
- `contracts/rent-escrow/src/lib.rs` (Modify)

**Test Requirements**  
- N/A

---

### [Issue #5] Setup: Test Environment Boilerplate
**Description**  
Create a basic `test.rs` file that can register the contract in a test environment.

**Requirements**  
- Use `#[cfg(test)]`.
- Use `env.register_contract(None, RentEscrow)`.

**Acceptance Criteria**  
- `cargo test` runs without errors.

**Files to Create/Modify**  
- `contracts/rent-escrow/src/test.rs` (Create)
- `contracts/rent-escrow/src/lib.rs` (Modify to include `mod test;`)

**Test Requirements**  
- At least one passing dummy test.

---

## Stage 2: Error Handling & Constants (6-10)

### [Issue #6] Errors: Define Initialization Guard Errors
**Description**  
Add `AlreadyInitialized` and `NotInitialized` variants to a `#[contracterror]` enum.

**Requirements**  
- Define `pub enum Error`.
- Assign unique integer codes to variants.

**Acceptance Criteria**  
- Enum compiles in `lib.rs`.

**Files to Create/Modify**  
- `contracts/rent-escrow/src/lib.rs` (Modify)

**Test Requirements**  
- N/A

---

### [Issue #7] Errors: Define Payment Validation Errors
**Description**  
Add `InvalidAmount` and `InsufficientFunding` to the `Error` enum.

**Requirements**  
- Unique naming and codes.

**Acceptance Criteria**  
- Errors can be used in `Result` returns.

**Files to Create/Modify**  
- `contracts/rent-escrow/src/lib.rs` (Modify)

**Test Requirements**  
- N/A

---

### [Issue #8] Errors: Define Access Control Errors
**Description**  
Add `Unauthorized` and `Expired` variants to the `Error` enum.

**Requirements**  
- Unique codes.

**Acceptance Criteria**  
- Errors are defined and mapped.

**Files to Create/Modify**  
- `contracts/rent-escrow/src/lib.rs` (Modify)

**Test Requirements**  
- N/A

---

### [Issue #9] Constants: Network Time Constants
**Description**  
Define `const DAY_IN_LEDGERS: u32 = 17280` for time-based logic.

**Requirements**  
- Use accurate approximation for 5-second ledger times.

**Acceptance Criteria**  
- Constant is available for contract use.

**Files to Create/Modify**  
- `contracts/rent-escrow/src/lib.rs` (Modify)

**Test Requirements**  
- N/A

---

### [Issue #10] Constants: Minimum Rent Threshold
**Description**  
Define `const MIN_RENT: i128 = 100` to prevent micro-escrow spam.

**Requirements**  
- Amount should be in stroops/token-units.

**Acceptance Criteria**  
- Constant is enforced in future logic.

**Files to Create/Modify**  
- `contracts/rent-escrow/src/lib.rs` (Modify)

**Test Requirements**  
- N/A

---

## Stage 3: Data Structures & Storage Keys (11-15)

### [Issue #11] Storage: Define Base Keys
**Description**  
Add `Landlord` and `RentAmount` keys to the `DataKey` enum.

**Requirements**  
- Use `#[contracttype]`.

**Acceptance Criteria**  
- Enum works with storage accessors.

**Files to Create/Modify**  
- `contracts/rent-escrow/src/lib.rs` (Modify)

**Test Requirements**  
- N/A

---

### [Issue #12] Storage: Define Roommate Keys
**Description**  
Add `Shares` and `Contributions` keys to the `DataKey` enum.

**Requirements**  
- Used for mapping roommate addresses.

**Acceptance Criteria**  
- Keys are ready for `Map` storage.

**Files to Create/Modify**  
- `contracts/rent-escrow/src/lib.rs` (Modify)

**Test Requirements**  
- N/A

---

### [Issue #13] Storage: Define Metadata Keys
**Description**  
Add `Deadline` and `RentToken` keys to the `DataKey` enum.

**Requirements**  
- Consistent naming.

**Acceptance Criteria**  
- Keys are ready for persistence.

**Files to Create/Modify**  
- `contracts/rent-escrow/src/lib.rs` (Modify)

**Test Requirements**  
- N/A

---

### [Issue #14] Types: Define Roommate State Struct
**Description**  
Create a `RoommateState` struct with `expected` and `paid` fields.

**Requirements**  
- Use `i128` for amounts.
- Derive `Clone` and `Debug`.

**Acceptance Criteria**  
- Struct is marked with `#[contracttype]`.

**Files to Create/Modify**  
- `contracts/rent-escrow/src/lib.rs` (Modify)

**Test Requirements**  
- N/A

---

### [Issue #15] Types: Define Escrow Status Enum
**Description**  
Create a `Status` enum (Open, Funded, Released, Refunded).

**Requirements**  
- Map to simple integers for storage efficiency.

**Acceptance Criteria**  
- Enum is marked with `#[contracttype]`.

**Files to Create/Modify**  
- `contracts/rent-escrow/src/lib.rs` (Modify)

**Test Requirements**  
- N/A

---

## Stage 4: Initialization Logic (16-20)

### [Issue #16] Init: `initialize` Signature
**Description**  
Define the public `initialize` function signature with correct arguments.

**Requirements**  
- Function within `#[contractimpl]` block.

**Acceptance Criteria**  
- Accepts `landlord`, `total`, `deadline`, and `token_address`.

**Files to Create/Modify**  
- `contracts/rent-escrow/src/lib.rs` (Modify)

**Test Requirements**  
- N/A

---

### [Issue #17] Init: Validation - Zero Address Guard
**Description**  
Add logic to verify the landlord address is not the contract itself.

**Requirements**  
- Compare `landlord` with `env.current_contract_address()`.

**Acceptance Criteria**  
- Reverts if check fails.

**Files to Create/Modify**  
- `contracts/rent-escrow/src/lib.rs` (Modify)

**Test Requirements**  
- Test passing an invalid address reverts.

---

### [Issue #18] Init: Validation - Positive Rent Check
**Description**  
Logic to ensure the `total_rent` is greater than `MIN_RENT`.

**Requirements**  
- Check against constant from Issue #10.

**Acceptance Criteria**  
- Fails for small or negative amounts.

**Files to Create/Modify**  
- `contracts/rent-escrow/src/lib.rs` (Modify)

**Test Requirements**  
- Test initializing with 0 rent fails.

---

### [Issue #19] Init: Storage Persistence
**Description**  
Implement the code to save landlord and amount into persistent storage.

**Requirements**  
- Use `env.storage().persistent()`.

**Acceptance Criteria**  
- State is saved successfully.

**Files to Create/Modify**  
- `contracts/rent-escrow/src/lib.rs` (Modify)

**Test Requirements**  
- N/A

---

### [Issue #20] Init: Test Case - Success Path
**Description**  
Write a unit test verifying that `initialize` sets the state correctly.

**Requirements**  
- Use `env.storage().persistent().get`.

**Acceptance Criteria**  
- Test passes `cargo test`.

**Files to Create/Modify**  
- `contracts/rent-escrow/src/test.rs` (Modify)

**Test Requirements**  
- Verify `landlord` equal to input `landlord`.

---

## Stage 5: Roommate Configuration (21-25)

### [Issue #21] Setup: `add_roommate` Interface
**Description**  
Implement function for the landlord to add roommate addresses and shares.

**Requirements**  
- Callable by landlord.
- Input: `user: Address, share: i128`.

**Acceptance Criteria**  
- Only callable by the landlord address.

**Files to Create/Modify**  
- `contracts/rent-escrow/src/lib.rs` (Modify)

**Test Requirements**  
- Test non-landlord call fails.

---

### [Issue #22] Logic: Share Sum Validation
**Description**  
Ensure the sum of roommate shares does not exceed `total_rent`.

**Requirements**  
- Keep running total or check sum.

**Acceptance Criteria**  
- Reverts if math is incorrect.

**Files to Create/Modify**  
- `contracts/rent-escrow/src/lib.rs` (Modify)

**Test Requirements**  
- Test adding shares above total fails.

---

### [Issue #23] Getter: Landlord Lookup
**Description**  
Implement `fn get_landlord(e: Env) -> Address`.

**Requirements**  
- Read from persistent storage.

**Acceptance Criteria**  
- Returns correct address.

**Files to Create/Modify**  
- `contracts/rent-escrow/src/lib.rs` (Modify)

**Test Requirements**  
- Verify output matches initial landlord.

---

### [Issue #24] Getter: Total Amount Lookup
**Description**  
Implement `fn get_total(e: Env) -> i128`.

**Requirements**  
- Read from persistent storage.

**Acceptance Criteria**  
- Returns correct amount.

**Files to Create/Modify**  
- `contracts/rent-escrow/src/lib.rs` (Modify)

**Test Requirements**  
- Verify output matches initial amount.

---

### [Issue #25] Getter: Deadline Lookup
**Description**  
Implement `fn get_deadline(e: Env) -> u64`.

**Requirements**  
- Read from persistent storage.

**Acceptance Criteria**  
- Returns correct timestamp.

**Files to Create/Modify**  
- `contracts/rent-escrow/src/lib.rs` (Modify)

**Test Requirements**  
- Verify output matches initial deadline.

---

## Stage 6: Contribution Logic (26-30)

### [Issue #26] Deposit: `contribute` Signature
**Description**  
Define the public `contribute(from: Address, amount: i128)` function.

**Requirements**  
- Use `require_auth()`.

**Acceptance Criteria**  
- Properly marked with `require_auth()`.

**Files to Create/Modify**  
- `contracts/rent-escrow/src/lib.rs` (Modify)

**Test Requirements**  
- N/A

---

### [Issue #27] Validation: Roommate Membership check
**Description**  
Logic to verify the caller is actually a registered roommate.

**Requirements**  
- Check if key exists in roommate map.

**Acceptance Criteria**  
- Reverts for unauthorized accounts.

**Files to Create/Modify**  
- `contracts/rent-escrow/src/lib.rs` (Modify)

**Test Requirements**  
- Test stranger call fails.

---

### [Issue #28] Token: Transfer Integration
**Description**  
Implement the `token::Client` transfer from user to contract.

**Requirements**  
- Use `token::Client::new(&e, &token_addr)`.

**Acceptance Criteria**  
- Tokens move successfully on-chain.

**Files to Create/Modify**  
- `contracts/rent-escrow/src/lib.rs` (Modify)

**Test Requirements**  
- Verify contract balance increment.

---

### [Issue #29] Logic: Update Paid Balance
**Description**  
Increment the `paid` field in the roommate's contribution map.

**Requirements**  
- Update `RoommateState`.

**Acceptance Criteria**  
- State reflects the new deposit.

**Files to Create/Modify**  
- `contracts/rent-escrow/src/lib.rs` (Modify)

**Test Requirements**  
- Verify `get_balance` output.

---

### [Issue #30] Event: `Contribution` Emission
**Description**  
Emit an event including the roommate and amount deposited.

**Requirements**  
- Use `env.events().publish`.

**Acceptance Criteria**  
- Event appears in transaction logs.

**Files to Create/Modify**  
- `contracts/rent-escrow/src/lib.rs` (Modify)

**Test Requirements**  
- Verify event in test logs.

---

## Stage 7: Escrow & Release (31-35)

### [Issue #31] Logic: Calculate Total Funded
**Description**  
Helper to sum all current roommate contributions.

**Requirements**  
- Iterative loop or cached total.

**Acceptance Criteria**  
- Correctly identifies if the goal is met.

**Files to Create/Modify**  
- `contracts/rent-escrow/src/lib.rs` (Modify)

**Test Requirements**  
- Logic check for different states.

---

### [Issue #32] Release: `release` Status Guard
**Description**  
Ensure `release()` only works if `is_fully_funded` is true.

**Requirements**  
- Guard check at start of function.

**Acceptance Criteria**  
- prevents premature payout.

**Files to Create/Modify**  
- `contracts/rent-escrow/src/lib.rs` (Modify)

**Test Requirements**  
- Test calling `release` while underfunded fails.

---

### [Issue #33] Release: Transfer to Landlord
**Description**  
Logic to move the full contract balance to the landlord.

**Requirements**  
- Use `token_client.transfer`.

**Acceptance Criteria**  
- Landlord receives funds.

**Files to Create/Modify**  
- `contracts/rent-escrow/src/lib.rs` (Modify)

**Test Requirements**  
- Verify landlord balance increment.

---

### [Issue #34] Event: `AgreementReleased`
**Description**  
Publish event when the total rent is paid out.

**Requirements**  
- Include amount.

**Acceptance Criteria**  
- Event shows full funding was achieved.

**Files to Create/Modify**  
- `contracts/rent-escrow/src/lib.rs` (Modify)

**Test Requirements**  
- Verify event metadata.

---

### [Issue #35] Test: full Flow Scenario
**Description**  
End-to-end test: init -> contribute x3 -> release.

**Requirements**  
- Full multi-user simulation.

**Acceptance Criteria**  
- Full cycle completes successfully.

**Files to Create/Modify**  
- `contracts/rent-escrow/src/test.rs` (Modify)

**Test Requirements**  
- All steps pass.

---

## Stage 8: Expiry & Refund (36-40)

### [Issue #36] Refund: `claim_refund` Signature
**Description**  
Implement function for individual roommates to reclaim deposits.

**Requirements**  
- Check caller auth.

**Acceptance Criteria**  
- Enforces `require_auth()`.

**Files to Create/Modify**  
- `contracts/rent-escrow/src/lib.rs` (Modify)

**Test Requirements**  
- N/A

---

### [Issue #37] Validation: Deadline Verification
**Description**  
Ensure refunds are only available after the deadline.

**Requirements**  
- Use `env.ledger().timestamp()`.

**Acceptance Criteria**  
- Reverts if called too early.

**Files to Create/Modify**  
- `contracts/rent-escrow/src/lib.rs` (Modify)

**Test Requirements**  
- Test calling refund before deadline fails.

---

### [Issue #38] Logic: Individual Token Refund
**Description**  
Transfer the roommate's `paid` amount back to them.

**Requirements**  
- `token_client.transfer`.

**Acceptance Criteria**  
- User receives their money back.

**Files to Create/Modify**  
- `contracts/rent-escrow/src/lib.rs` (Modify)

**Test Requirements**  
- Verify roommate balance reset.

---

### [Issue #39] State: Zeroing Balances
**Description**  
Set the roommate's `paid` balance to `0` after refund.

**Requirements**  
- Prevents re-entrancy / double refund.

**Acceptance Criteria**  
- map updated correctly.

**Files to Create/Modify**  
- `contracts/rent-escrow/src/lib.rs` (Modify)

**Test Requirements**  
- Verify second call fails with 0 balance error.

---

### [Issue #40] Polish: Storage TTL Extension
**Description**  
implement persistent storage TTL extension so the agreement doesn't expire.

**Requirements**  
- Use `env.storage().persistent().extend_ttl`.

**Acceptance Criteria**  
- Storage state is preserved.

**Files to Create/Modify**  
- `contracts/rent-escrow/src/lib.rs` (Modify)

**Test Requirements**  
- N/A

---

## Stage 9: Frontend Polish (Issues 41–44)

### [Issue #41] Wallet: Fund Testnet Button Not Wired Up
**Description**  
The "Fund Testnet" quick-action button on the wallet page (`app/wallet/page.tsx`, line 120) renders with no `onClick` handler, so clicking it does nothing. A `FundTestnetButton` component already exists in `components/wallet/FundTestnetButton.tsx` and handles the Friendbot funding flow — the inline button should be replaced with it.

**Requirements**  
- Remove the inert `<button>` at lines 119–126 of `app/wallet/page.tsx`.  
- Import and render `<FundTestnetButton publicKey={walletData?.address ?? ""} />` in its place.  
- The button must only be visible when `walletData?.network === "testnet"` (condition is already present).

**Acceptance Criteria**  
- Clicking "Fund Testnet" on the wallet page triggers the Friendbot request and shows toast feedback.  
- The button does not appear on mainnet.

**Files to Create/Modify**  
- `app/wallet/page.tsx` (Modify)

**Test Requirements**  
- Verify clicking the button triggers the funding flow; confirm it is absent when network is not testnet.

---

### [Issue #42] History: "Latest First" Sort Button Has No Handler
**Description**  
The sort button in `components/history/TransactionList.tsx` (line 103) renders the label "Latest First" but has no `onClick` handler — clicking it does nothing. The transaction list should toggle between newest-first and oldest-first order, and the button label should reflect the current sort direction.

**Requirements**  
- Add a `sortOrder` state (`"desc" | "asc"`, default `"desc"`) to `TransactionList`.  
- Wire the button's `onClick` to toggle `sortOrder` between `"desc"` and `"asc"`.  
- Update the button label to read **"Latest First"** when `sortOrder === "desc"` and **"Oldest First"** when `"asc"`.  
- Sort `filteredTransactions` (inside its existing `useMemo`) by `transaction.timestamp` according to `sortOrder` before returning.

**Acceptance Criteria**  
- Clicking the button reverses the transaction list order.  
- The button label reflects the active sort direction.

**Files to Create/Modify**  
- `components/history/TransactionList.tsx` (Modify)

**Test Requirements**  
- Render with mock transactions; click sort button; confirm list order inverts and label changes.

---

### [Issue #43] History: Retry Button Silently Redirects to Create Escrow When contractId Is Missing
**Description**  
In `components/history/TransactionCard.tsx` (lines 151–167), the "Retry" button for failed transactions falls back to `router.push("/escrow/create")` when `transaction.contractId` is absent. This silently starts a brand-new escrow instead of retrying the failed one, which is confusing and destructive. The button should only appear when a `contractId` is available to navigate to.

**Requirements**  
- Wrap the entire retry `<button>` in a conditional: only render it when `transaction.status === "failed" && transaction.contractId`.  
- Remove the `else` branch that redirects to `/escrow/create`.  
- Add `aria-label={`Retry transaction for escrow ${transaction.contractId}`}` to the button.

**Acceptance Criteria**  
- Failed transactions without a `contractId` do not show a Retry button.  
- Failed transactions with a `contractId` show the button, and clicking it navigates to `/escrow/{contractId}`.

**Files to Create/Modify**  
- `components/history/TransactionCard.tsx` (Modify)

**Test Requirements**  
- Render a failed card without `contractId`; confirm no Retry button.  
- Render a failed card with `contractId`; confirm Retry navigates correctly.

---

### [Issue #44] Escrow: Demo Mode Warning Only Shown at Final Review Step
**Description**  
`components/escrow/CreateEscrowForm.tsx` (lines 626–630) shows a "Demo mode is active" notice only at Step 4 (the final review), after the user has already filled out all three preceding steps. Users who are not in demo mode may not notice this until they are about to submit. A prominent banner should be shown at Step 1 so contributors know from the start that transactions will not execute on-chain.

**Requirements**  
- At the top of the Step 1 section, add a dismissible amber banner when `contractClient` is `null` / `undefined`.  
- The banner must include an info icon and the text: *"Demo mode: transactions will not be executed on-chain. Results are simulated only."*  
- The existing Step 4 inline note may remain as a secondary reminder.

**Acceptance Criteria**  
- When `contractClient` is not provided, the amber banner is visible as soon as Step 1 renders.  
- When `contractClient` is provided, the banner does not render.

**Files to Create/Modify**  
- `components/escrow/CreateEscrowForm.tsx` (Modify)

**Test Requirements**  
- Render form without `contractClient`; confirm banner appears on Step 1.  
- Render form with `contractClient`; confirm banner is absent.
