# Kindly Whitepaper

**Title:** Kindly: Decentralized On-Chain Mutual Aid Protocol  
**Tagline:** Small Requests. Real Help.  
**Version:** 1.0  
**Network:** Botchain Testnet (Chain ID: `968`)  
**Contract Address:** `0x4e000F7bFf35780C890CdDCBe986013A579a62A9`  
**Explorer:** [https://scan.bohr.life/address/0x4e000F7bFf35780C890CdDCBe986013A579a62A9](https://scan.bohr.life/address/0x4e000F7bFf35780C890CdDCBe986013A579a62A9)  
**GitHub Repository:** [https://github.com/liljhnxn/Kindly](https://github.com/liljhnxn/Kindly)

---

## 1. Executive Summary

In today's hyper-monetized digital economy, communities lack an authentic, trustless, and zero-friction venue for mutual assistance. Asking for small help—whether technical troubleshooting, design feedback, math tutoring, or local community support—often requires navigating algorithmic engagement traps, paid gig platforms laden with fees, or opaque centralized forums prone to spam.

**Kindly** is a decentralized, zero-fee community mutual aid protocol built on the Botchain Testnet. Kindly allows any individual with a Web3 wallet to publish a request for assistance and provides a transparent on-chain medium where peers can volunteer their skills and time. By deliberately eschewing platform fees, governance tokens, and intermediary databases, Kindly creates an immutable, verifiable public record of human altruism and cooperation.

---

## 2. The Problem Statement

1. **Predatory Middlemen & High Platform Fees**: Traditional micro-gig platforms charge 10%–25% platform cuts, transforming small acts of community assistance into transactional extraction.
2. **Accountability & Coordination Gaps**: Traditional community boards (e.g., Discord channels, Reddit forums) suffer from fragmented communication, unfulfilled promises, and lack of accountability regarding who is helping whom.
3. **Data Exploitation & Privacy Invasion**: Centralized mutual aid portals harvest personal telemetry, run ads, and monetize user vulnerabilities.
4. **Crypto Dashboard Fatigue**: Web3 applications often overwhelm casual users with financial speculation, liquidity pools, complex tokens, and predatory gamification.

---

## 3. The Kindly Solution

Kindly offers a radically simplified paradigm: **Pure, Tokenless Social Coordination on the Blockchain.**

- **Immutable Mutual Aid Ledger**: Every help request, volunteer commitment, cancellation, and fulfillment is recorded transparently on Botchain.
- **Strictly Non-Financialized**: Zero platform fees, zero native tokens, and zero financial barriers. Help is offered purely on merit, community goodwill, and reputation.
- **Streamlined Single-Page Architecture**: Operates directly between the user’s browser and the smart contract via Wagmi/Viem. No centralized database, no server relays, and no vendor lock-in.
- **Fair Coordination Rules**: Smart contract state-machine rules enforce fair play:
  - Users cannot volunteer for their own requests.
  - A request can have only one assigned volunteer at a time.
  - Only the original requester can confirm completion or cancel an open request.

---

## 4. Why Botchain?

Kindly chose **Botchain Testnet** (`Chain ID: 968`) because real-time community interaction requires:
- **Fast Block Times**: Rapid transaction confirmation for dynamic volunteering workflows.
- **Negligible Transaction Costs**: Enables users to volunteer and coordinate without prohibitive gas expenses.
- **EVM Compatibility**: Standard Solidity tooling (Hardhat, Viem, Wagmi) allows for verifiable contracts and robust developer ergonomics.

---

## 5. Technical Architecture

Kindly adheres to an uncompromising minimalist architecture:

```
┌────────────────────────────────────────────────────────┐
│                   Kindly Frontend                      │
│      Next.js App Router (TypeScript + Tailwind CSS)     │
│                 [Single Webpage / UI]                  │
└───────────────────────────┬────────────────────────────┘
                            │
               Viem / Wagmi Injected Provider
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                  Botchain Testnet                      │
│             RPC: https://rpc.bohr.life                 │
│                 [Chain ID: 968]                        │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                  Kindly.sol Contract                   │
│      Address: 0x4e000F7bFf35780C890CdDCBe986013A579a   │
│             State: Open -> InProgress -> Completed      │
└────────────────────────────────────────────────────────┘
```

### 5.1 Smart Contract Specification (`Kindly.sol`)
The contract is compiled under Solidity `^0.8.20` with optimizer enabled (200 runs).

#### Structs
```solidity
enum RequestStatus { Open, InProgress, Completed, Cancelled }

struct HelpRequest {
    uint256 id;
    address requester;
    string title;
    string description;
    string category;
    address volunteer;
    uint256 createdAt;
    RequestStatus status;
}
```

#### Core Functions
1. `createRequest(string title, string description, string category)`: Creates an on-chain help ticket in `Open` status.
2. `volunteer(uint256 requestId)`: Assigns the caller as the designated helper and advances status to `InProgress`. Reverts if caller is requester or if request is not `Open`.
3. `completeRequest(uint256 requestId)`: Callable exclusively by the original requester once a volunteer is assigned. Advances status to `Completed`.
4. `cancelRequest(uint256 requestId)`: Callable by the requester while still `Open` (cannot be cancelled once a volunteer has committed).
5. `getAllRequests()`: High-efficiency view function returning all historical and active requests for browser indexing.

---

## 6. User Journeys

```
[Requester] ──> createRequest() ───────> [Status: Open]
                                               │
[Community] ──> volunteer() ───────────────────▼
                                        [Status: InProgress]
                                               │
[Requester] ──> completeRequest() ─────────────▼
                                        [Status: Completed]
```

### Cancellation Path:
If a requester no longer requires help and no volunteer has claimed the request:
```
[Requester] ──> cancelRequest() ────────> [Status: Cancelled]
```

---

## 7. Security and Validation Measures

- **Zero External Dependencies**: Standalone smart contract with no upgradeable proxy risks.
- **Custom Errors**: Emits structured errors (`NotRequester`, `CannotVolunteerForOwnRequest`, `RequestNotOpen`, `CannotCompleteWithoutVolunteer`) to conserve gas and provide transparent revert diagnostics.
- **Input Bounds**: Enforces title lengths between 1 and 120 characters to prevent transaction payload bloat.
- **100% Test Coverage**: Tested against 16 distinct adversarial vectors in Hardhat.

---

## 8. Roadmap

- **Phase 1 (Complete)**: Architecture design, Solidity contract deployment, Hardhat test suite, Next.js frontend, and Botchain Testnet deployment.
- **Phase 2 (Current)**: Community onboarding, hackathon showcase, and peer-to-peer testing.
- **Phase 3**: On-chain soulbound karma badges / non-transferable Proof of Kindness certificates for top community volunteers.
- **Phase 4**: Multi-language localization and optional decentralized messaging (XMTP) for direct helper-requester coordination.

---

## 9. Conclusion

Kindly demonstrates that blockchain utility extends far beyond financial speculation. By leveraging the Botchain network for trustless, transparent, and fee-free community aid, Kindly empowers everyday people to connect, collaborate, and make small acts of kindness count.
