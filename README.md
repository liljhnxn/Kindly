# Kindly

> **Small Requests. Real Help.**

Kindly is a Web3 community mutual aid platform built on the **Botchain Testnet**. It enables community members to request assistance with small tasks (education, tech, design, personal assistance, and neighborhood tasks) and allows peers to volunteer and help—with 100% of the state stored immutably on-chain.

---

## ✦ Key Architectural Principles

- **Exactly ONE Webpage**: Built using Next.js App Router as a seamless single-page application (`app/page.tsx`). Modals and in-page sections handle all user workflows—no additional routes or pages exist.
- **Exactly ONE Smart Contract**: All business logic, storage, and state transitions reside entirely within `contracts/Kindly.sol`.
- **Zero Backend & Zero Database**: Directly interfaces with the Botchain Testnet using `wagmi` and `viem`. No private servers, centralized databases, or indexing relays.
- **No Tokens, No NFTs, No Payments**: Pure social mutual aid and community cooperation.
- **Real Blockchain Interactions**: Real MetaMask wallet connection, custom Botchain network detection/switching, gas estimations, and on-chain event listening.
- **Distinctive Human-Centric Design**: Steers away from generic purple/blue crypto dashboards, embracing a warm ivory background, deep forest green accents, terracotta highlights, and elegant serif typography.

---

## ✦ Network Details: Botchain Testnet

| Parameter | Value |
| :--- | :--- |
| **Network Name** | Botchain Testnet |
| **Chain ID** | `968` |
| **Native Currency** | BOHR |
| **RPC Endpoint** | `https://rpc.bohr.life` |
| **Block Explorer** | [https://scan.bohr.life](https://scan.bohr.life) |

---

## ✦ Smart Contract Architecture (`contracts/Kindly.sol`)

The `Kindly.sol` contract manages help requests through an explicit state machine:

### States
- `Open` (0): Request created, waiting for a volunteer.
- `InProgress` (1): A volunteer has stepped up to help.
- `Completed` (2): Requester has confirmed the task was fulfilled.
- `Cancelled` (3): Requester cancelled the request while still open.

### Core Functions
1. `createRequest(string title, string description, string category)`: Creates a new help request, emits `RequestCreated`.
2. `volunteer(uint256 requestId)`: Assigns the caller as the volunteer. Enforces:
   - Request must be `Open`.
   - Requesters cannot volunteer for their own request.
   - Prevents duplicate volunteering.
   - Emits `VolunteerAssigned`.
3. `completeRequest(uint256 requestId)`: Marks request completed. Enforces:
   - Only original requester can complete.
   - A volunteer must be assigned (`InProgress`).
   - Prevents completing cancelled or already completed requests.
   - Emits `RequestCompleted`.
4. `cancelRequest(uint256 requestId)`: Cancels request. Enforces:
   - Only original requester can cancel.
   - Must be in `Open` state (cannot cancel once a volunteer has committed).
   - Emits `RequestCancelled`.
5. Read Functions:
   - `getAllRequests()`: Returns full list of all requests on-chain.
   - `getRequest(uint256 requestId)`: Retrieves single request by ID.
   - `getTotalRequests()`: Total requests created.
   - `getCompletedRequestsCount()`: Total acts of kindness completed.

---

## ✦ Project Structure

```text
Kindly/
├── contracts/
│   └── Kindly.sol              # The single Solidity smart contract
├── test/
│   └── Kindly.test.js          # Hardhat test suite (16 passing tests)
├── scripts/
│   └── deploy.js               # Botchain deployment script
├── app/
│   ├── layout.tsx              # Root layout & providers
│   ├── page.tsx                # The single webpage
│   └── globals.css             # Design tokens & styles
├── components/
│   ├── Navbar.tsx              # Header, MetaMask connect & network switch
│   ├── Hero.tsx                # Hero section with live on-chain stats
│   ├── ExploreRequests.tsx     # Filterable request cards
│   ├── CreateRequestModal.tsx  # Create request modal with validation
│   ├── RequestDetailsModal.tsx # Full request details & contextual actions
│   ├── MyRequests.tsx          # Personal dashboard (Created & Volunteered)
│   ├── Footer.tsx              # Footer with network & contract links
│   └── Providers.tsx           # Wagmi & React Query providers
├── config/
│   ├── chain.ts                # Botchain Testnet chain configuration
│   ├── contract.ts             # Contract ABI, types & constants
│   └── wagmi.ts                # Wagmi configuration
├── hardhat.config.js           # Hardhat config for Solidity 0.8.20 & Botchain
├── tailwind.config.ts          # Custom color palette (Ivory, Forest, Terracotta)
├── .env.example                # Example environment variables
└── package.json                # Dependencies and scripts
```

---

## ✦ Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MetaMask browser extension installed

### 2. Installation
```bash
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in the variables:
```env
BOTCHAIN_RPC_URL=https://rpc.bohr.life
NEXT_PUBLIC_RPC_URL=https://rpc.bohr.life
NEXT_PUBLIC_CHAIN_ID=968
NEXT_PUBLIC_KINDLY_CONTRACT_ADDRESS=0x...
PRIVATE_KEY=your_private_key_for_deployment
```

---

## ✦ Testing the Smart Contract

Run the comprehensive unit test suite:
```bash
npx hardhat test
```

The test suite validates:
- [x] Initial contract state
- [x] Request creation with valid fields
- [x] Rejection of empty title, description, or category
- [x] Volunteer assignment and state transition to `InProgress`
- [x] Self-volunteering prevention (requester cannot volunteer)
- [x] Duplicate volunteering prevention (cannot take already-assigned request)
- [x] Request completion by requester
- [x] Unauthorized completion attempts (strangers or volunteers cannot complete)
- [x] Inability to complete without an assigned volunteer
- [x] Inability to complete an already completed request
- [x] Request cancellation by requester
- [x] Prevention of cancellation by non-requesters
- [x] Prevention of volunteering on cancelled requests
- [x] Prevention of cancelling once a volunteer has committed
- [x] Ordering and validity of `getAllRequests()`

---

## ✦ Deploying to Botchain Testnet

Deploy the contract to Botchain Testnet:
```bash
npx hardhat run scripts/deploy.js --network botchain
```

The script will:
1. Deploy `Kindly.sol` to Botchain Testnet (Chain ID 968).
2. Output the deployed contract address and explorer link.
3. Automatically export deployment info to `config/deployedAddress.json`.

After deploying, add the contract address to your `.env` file:
```env
NEXT_PUBLIC_KINDLY_CONTRACT_ADDRESS=<DEPLOYED_CONTRACT_ADDRESS>
```

---

## ✦ Running the Frontend

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Connect MetaMask to **Botchain Testnet**:
- If MetaMask is connected to another network, Kindly will display a prompt to switch directly to Botchain Testnet with one click.
- Create help requests, explore community tasks, volunteer, and track your contributions!

---

## ✦ Production Build

Build and start the optimized production application:
```bash
npm run build
npm run start
```

