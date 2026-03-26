#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env};

/// Storage key definitions for persistent contract state.
///
/// Each variant maps to a unique slot in the Soroban persistent storage trie.
/// Using a `#[contracttype]` enum guarantees type-safe, collision-free keys.
///
/// - `DataKey::Landlord` - stores the landlord's `Address`
/// - `DataKey::Amount`   - stores the escrowed amount as `i128`
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Landlord,
    Amount,
}

#[contract]
pub struct RentEscrowContract;

#[contractimpl]
impl RentEscrowContract {
    /// Initialize the escrow contract.
    ///
    /// Persists `landlord` and `amount` to ledger storage so that the values
    /// survive across invocations and ledger closes.
    ///
    /// # Arguments
    /// * `env`      - The Soroban environment handle.
    /// * `landlord` - The `Address` of the landlord who controls the escrow.
    /// * `amount`   - The escrowed amount in stroops (i128).
    pub fn initialize(env: Env, landlord: Address, amount: i128) {
        landlord.require_auth();

        // Persist landlord address to ledger storage.
        env.storage().persistent().set(&DataKey::Landlord, &landlord);

        // Persist escrow amount to ledger storage.
        env.storage().persistent().set(&DataKey::Amount, &amount);
    }

    /// Update the escrow amount. Only callable by the stored landlord.
    pub fn set_amount(env: Env, caller: Address, new_amount: i128) {
        caller.require_auth();
        let landlord: Address = env.storage()
            .persistent()
            .get(&DataKey::Landlord)
            .expect("landlord not set");
        assert_eq!(caller, landlord, "only the landlord can update the amount");
        env.storage().persistent().set(&DataKey::Amount, &new_amount);
    }

    /// Placeholder - retrieval logic added in the next commit.
    pub fn get_landlord(_env: Env) -> Address {
        panic!("not implemented")
    }

    /// Placeholder - retrieval logic added in the next commit.
    pub fn get_amount(_env: Env) -> i128 {
        0
    }
}
