# PayEasy Architecture Guide

This document details the technical architecture of PayEasy, a hybrid Web2.5 application for shared rent payments.

## System Overview

PayEasy combines a traditional web stack for social interaction with the Stellar blockchain for financial settlement.

### High-Level Components

1.  **Frontend (Next.js)**: The user-facing application.
    *   **User Interface**: React components styled with Tailwind CSS.
    *   **State Management**: React Context / Hooks.
    *   **Wallet Integration**: `@stellar/freighter-api` for signing transactions.
    *   **Data Fetching**: TRPC or API routes for Supabase overlay; Horizon API for blockchain data.

2.  **Backend / Database (Supabase)**:
    *   **PostgreSQL**: Stores user profiles (linked to public keys), listings, posts, and message history.
    *   **Realtime**: WebSocket channels for instant messaging.
    *   **Storage**: Images for apartment listings and profiles.

3.  **Smart Contract (Soroban)**:
    *   **RentAgreement**: The core contract logic.
    *   **State**: Stores `landlord`, `tenants`, `rent_amount`, `due_date`, `paid_amount`.

---

## Data Flow

### 1. User Registration
*   User connects Freighter Wallet.
*   Frontend signs a "Login" challenge.
*   Supabase creates a User entry with the Public Key as the unique identifier.

### 2. Creating a Listing
*   Landlord posts apartment details (Images, Description, Rent Price) -> Saved in Supabase.
*   Landlord clicks "Enable Payments" -> Deploys a new instance of `RentAgreement` contract on Stellar.
*   Contract ID is saved to the Supabase Listing record.

### 3. Paying Rent
*   Tenant clicks "Pay Share".
*   Frontend constructs a `pay_rent` transaction for the specific Contract ID.
*   Freighter prompts signature.
*   Transaction submitted to Stellar network.
*   **Indexing**: A background worker (or frontend poller) watches the contract for events.
*   Supabase updates the visual status to "Paid".

---

## Database Schema (Proposed)

### `users`
*   `id`: UUID
*   `public_key`: String (Stellar Public Key)
*   `username`: String
*   `avatar_url`: String

### `listings`
*   `id`: UUID
*   `landlord_id`: Foreign Key (`users.id`)
*   `title`: String
*   `description`: Text
*   `monthly_rent_xlm`: BigInt
*   `contract_id`: String (Nullable, populated when blockchain agreement is live)

### `messages`
*   `id`: UUID
*   `sender_id`: Foreign Key (`users.id`)
*   `listing_id`: Foreign Key (`listings.id`)
*   `content`: Text
*   `created_at`: Timestamp

---

## Smart Contract Design

### Storage Keys
*   `Admin`: Address
*   `RentAmount`: i128
*   `Balances`: Map<Address, i128>

### Methods
*   `initialize(admin: Address, amount: i128)`
*   `deposit(from: Address, amount: i128)`
*   `withdraw()`: Only callable by Admin when `contract_balance >= RentAmount`.

---

## Security Considerations

*   **Non-Custodial**: The app never holds user keys.
*   **Trustless**: Rent is locked in the contract; the default PayEasy platform cannot seize funds.
*   **Phishing Protection**: Verification of contract IDs against known listings.
