#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env, Map, symbol_short};

const MIN_RENT: i128 = 1;

#[contracttype]
#[derive(Clone, Debug)]
pub struct RoommateState {
    pub expected: i128,
    pub paid: i128,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum Status {
    Open,
    Funded,
    Released,
    Refunded,
}

#[contracttype]
pub enum DataKey {
    Landlord,
    RentAmount,
    Shares,
    Contributions,
    Deadline,
    RentToken,
    Status,
    TotalShares,
}

#[contract]
pub struct RentContract;

#[contractimpl]
impl RentContract {
    pub fn initialize(
        env: Env,
        landlord: Address,
        total_rent: i128,
        deadline: u64,
        token_address: Address,
    ) {
        assert!(
            landlord != env.current_contract_address(),
            "landlord cannot be the contract itself"
        );
        assert!(total_rent >= MIN_RENT, "rent must be positive");

        env.storage().persistent().set(&DataKey::Landlord, &landlord);
        env.storage().persistent().set(&DataKey::RentAmount, &total_rent);
        env.storage().persistent().set(&DataKey::Deadline, &deadline);
        env.storage().persistent().set(&DataKey::RentToken, &token_address);
        env.storage().persistent().set(&DataKey::Status, &Status::Open);
        env.storage().persistent().set(&DataKey::TotalShares, &0i128);

        let empty_map: Map<Address, RoommateState> = Map::new(&env);
        env.storage().persistent().set(&DataKey::Contributions, &empty_map);
    }

    pub fn add_roommate(env: Env, roommate: Address, share: i128) {
        let landlord: Address = env.storage().persistent().get(&DataKey::Landlord).unwrap();
        landlord.require_auth();

        let total_rent: i128 = env.storage().persistent().get(&DataKey::RentAmount).unwrap();
        let total_shares: i128 = env.storage().persistent().get(&DataKey::TotalShares).unwrap();

        assert!(
            total_shares + share <= total_rent,
            "shares exceed total rent"
        );

        let mut contributions: Map<Address, RoommateState> =
            env.storage().persistent().get(&DataKey::Contributions).unwrap();

        contributions.set(
            roommate,
            RoommateState {
                expected: share,
                paid: 0,
            },
        );

        env.storage().persistent().set(&DataKey::Contributions, &contributions);
        env.storage().persistent().set(&DataKey::TotalShares, &(total_shares + share));
    }

    pub fn contribute(env: Env, from: Address, amount: i128) {
        from.require_auth();

        let status: Status = env.storage().persistent().get(&DataKey::Status).unwrap();
        assert!(status == Status::Open, "escrow is not open");

        let mut contributions: Map<Address, RoommateState> =
            env.storage().persistent().get(&DataKey::Contributions).unwrap();

        let mut state = contributions.get(from.clone()).expect("not a registered roommate");

        assert!(
            state.paid + amount <= state.expected,
            "contribution exceeds expected share"
        );

        let token_address: Address = env.storage().persistent().get(&DataKey::RentToken).unwrap();
        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&from, &env.current_contract_address(), &amount);

        state.paid += amount;
        contributions.set(from.clone(), state);
        env.storage().persistent().set(&DataKey::Contributions, &contributions);

        env.events().publish((symbol_short!("contrib"),), (from, amount));

        // Check if fully funded
        let total_rent: i128 = env.storage().persistent().get(&DataKey::RentAmount).unwrap();
        let total_paid: i128 = contributions
            .values()
            .iter()
            .map(|s| s.paid)
            .sum();

        if total_paid >= total_rent {
            env.storage().persistent().set(&DataKey::Status, &Status::Funded);
        }
    }

    pub fn release(env: Env) {
        let status: Status = env.storage().persistent().get(&DataKey::Status).unwrap();
        assert!(status == Status::Funded, "escrow is not fully funded");

        let landlord: Address = env.storage().persistent().get(&DataKey::Landlord).unwrap();
        let token_address: Address = env.storage().persistent().get(&DataKey::RentToken).unwrap();
        let total_rent: i128 = env.storage().persistent().get(&DataKey::RentAmount).unwrap();

        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&env.current_contract_address(), &landlord, &total_rent);

        env.storage().persistent().set(&DataKey::Status, &Status::Released);

        env.events().publish((symbol_short!("released"),), total_rent);
    }

    pub fn refund(env: Env, roommate: Address) {
        let status: Status = env.storage().persistent().get(&DataKey::Status).unwrap();
        assert!(
            status == Status::Open || status == Status::Funded,
            "cannot refund in current state"
        );

        let landlord: Address = env.storage().persistent().get(&DataKey::Landlord).unwrap();
        landlord.require_auth();

        let mut contributions: Map<Address, RoommateState> =
            env.storage().persistent().get(&DataKey::Contributions).unwrap();

        let mut state = contributions.get(roommate.clone()).expect("not a registered roommate");
        let refund_amount = state.paid;

        assert!(refund_amount > 0, "nothing to refund");

        let token_address: Address = env.storage().persistent().get(&DataKey::RentToken).unwrap();
        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&env.current_contract_address(), &roommate, &refund_amount);

        state.paid = 0;
        contributions.set(roommate.clone(), state);
        env.storage().persistent().set(&DataKey::Contributions, &contributions);

        env.events().publish((symbol_short!("refund"),), (roommate, refund_amount));
    }

    pub fn get_landlord(env: Env) -> Address {
        env.storage().persistent().get(&DataKey::Landlord).unwrap()
    }

    pub fn get_total(env: Env) -> i128 {
        env.storage().persistent().get(&DataKey::RentAmount).unwrap()
    }

    pub fn get_deadline(env: Env) -> u64 {
        env.storage().persistent().get(&DataKey::Deadline).unwrap()
    }
}

mod test;
