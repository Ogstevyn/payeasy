#![cfg(test)]

use super::*;
use soroban_sdk::testutils::Address as _;
use soroban_sdk::{token, Address, Env};

fn setup_token(env: &Env, admin: &Address) -> Address {
    let token_address = env.register_stellar_asset_contract(admin.clone());
    token_address
}

fn mint_token(env: &Env, token_address: &Address, to: &Address, amount: i128) {
    let admin_client = token::StellarAssetClient::new(env, token_address);
    admin_client.mint(to, &amount);
}

#[test]
fn test_contribute_requires_auth() {
    let env = Env::default();
    env.mock_all_auths();

    let landlord = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token_address = setup_token(&env, &token_admin);
    let roommate = Address::generate(&env);

    let contract_id = env.register_contract(None, RentContract);
    let client = RentContractClient::new(&env, &contract_id);

    client.initialize(&landlord, &3000, &1000, &token_address);
    client.add_roommate(&roommate, &1000);

    mint_token(&env, &token_address, &roommate, 5000);

    client.contribute(&roommate, &500);

    // Verify the contribution was recorded by checking token balance
    let token_client = token::Client::new(&env, &token_address);
    assert_eq!(token_client.balance(&roommate), 4500);
    assert_eq!(token_client.balance(&contract_id), 500);
}

#[test]
fn test_agreement_released_event() {
    let env = Env::default();
    env.mock_all_auths();

    let landlord = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token_address = setup_token(&env, &token_admin);

    let contract_id = env.register_contract(None, RentContract);
    let client = RentContractClient::new(&env, &contract_id);

    let roommate1 = Address::generate(&env);
    let roommate2 = Address::generate(&env);

    client.initialize(&landlord, &2000, &1000, &token_address);
    client.add_roommate(&roommate1, &1000);
    client.add_roommate(&roommate2, &1000);

    mint_token(&env, &token_address, &roommate1, 5000);
    mint_token(&env, &token_address, &roommate2, 5000);

    client.contribute(&roommate1, &1000);
    client.contribute(&roommate2, &1000);

    client.release();

    // Verify landlord received funds
    let token_client = token::Client::new(&env, &token_address);
    assert_eq!(token_client.balance(&landlord), 2000);
}

#[test]
fn test_individual_token_refund() {
    let env = Env::default();
    env.mock_all_auths();

    let landlord = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token_address = setup_token(&env, &token_admin);

    let contract_id = env.register_contract(None, RentContract);
    let client = RentContractClient::new(&env, &contract_id);

    let roommate = Address::generate(&env);

    client.initialize(&landlord, &3000, &1000, &token_address);
    client.add_roommate(&roommate, &1000);

    mint_token(&env, &token_address, &roommate, 5000);

    client.contribute(&roommate, &800);

    let token_client = token::Client::new(&env, &token_address);
    assert_eq!(token_client.balance(&roommate), 4200);

    // Refund the roommate
    client.refund(&roommate);

    // Verify roommate got money back
    assert_eq!(token_client.balance(&roommate), 5000);
    assert_eq!(token_client.balance(&contract_id), 0);
}

#[test]
fn test_full_flow_scenario() {
    let env = Env::default();
    env.mock_all_auths();

    let landlord = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token_address = setup_token(&env, &token_admin);

    let contract_id = env.register_contract(None, RentContract);
    let client = RentContractClient::new(&env, &contract_id);

    let roommate1 = Address::generate(&env);
    let roommate2 = Address::generate(&env);
    let roommate3 = Address::generate(&env);

    // Step 1: Initialize
    client.initialize(&landlord, &3000, &1000, &token_address);

    // Verify initialization
    assert_eq!(client.get_landlord(), landlord);
    assert_eq!(client.get_total(), 3000);
    assert_eq!(client.get_deadline(), 1000);

    // Step 2: Add roommates
    client.add_roommate(&roommate1, &1000);
    client.add_roommate(&roommate2, &1000);
    client.add_roommate(&roommate3, &1000);

    // Step 3: Mint tokens to roommates
    mint_token(&env, &token_address, &roommate1, 5000);
    mint_token(&env, &token_address, &roommate2, 5000);
    mint_token(&env, &token_address, &roommate3, 5000);

    // Step 4: All three contribute
    client.contribute(&roommate1, &1000);
    client.contribute(&roommate2, &1000);
    client.contribute(&roommate3, &1000);

    let token_client = token::Client::new(&env, &token_address);

    // Verify contributions
    assert_eq!(token_client.balance(&roommate1), 4000);
    assert_eq!(token_client.balance(&roommate2), 4000);
    assert_eq!(token_client.balance(&roommate3), 4000);
    assert_eq!(token_client.balance(&contract_id), 3000);

    // Step 5: Release to landlord
    client.release();

    // Verify landlord received all funds
    assert_eq!(token_client.balance(&landlord), 3000);
    assert_eq!(token_client.balance(&contract_id), 0);
}

