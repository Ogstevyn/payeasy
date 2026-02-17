# Stellar & Soroban Setup Guide

This guide will help you set up your environment to develop Smart Contracts for PayEasy.

## Prerequisites

1.  **Rust Toolchain**:
    ```bash
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
    rustup target add wasm32-unknown-unknown
    ```

2.  **Soroban CLI**:
    ```bash
    cargo install --locked soroban-cli
    ```

3.  **Freighter Wallet**:
    Install the [Freighter Browser Extension](https://www.freighter.app/).

---

## Network Configuration

### Futurenet (Testnet)
We use the Stellar Futurenet for development.

1.  **Configure CLI**:
    ```bash
    soroban network add \
      --global futurenet \
      --rpc-url https://rpc-futurenet.stellar.org:443 \
      --network-passphrase "Test SDF Future Network ; October 2022"
    ```

2.  **Create Identity**:
    ```bash
    soroban config identity generate --global alice
    soroban config identity generate --global bob
    ```

3.  **Fund Accounts**:
    ```bash
    soroban config identity fund alice --network futurenet
    soroban config identity fund bob --network futurenet
    ```

---

## Building & Deploying

### 1. Build
Inside `contracts/rent-escrow`:
```bash
soroban contract build
```

### 2. Deploy
```bash
soroban contract deploy \
    --wasm target/wasm32-unknown-unknown/release/rent_escrow.wasm \
    --source alice \
    --network futurenet
```

This will return a **Contract ID** (e.g., `CD...`). Save this!

### 3. Interact
```bash
soroban contract invoke \
    --id <CONTRACT_ID> \
    --source alice \
    --network futurenet \
    -- \
    initialize \
    --landlord alice \
    --total_rent 1000
```
