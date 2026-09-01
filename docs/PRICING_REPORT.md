# Price Data Report — Vetura nga Korea (bestautomarket.com API)

Audited against 100 live cars (multiple samples). All formulas verified to <0.1 EUR.

## 1. The fields the API gives us (per car job)

| Field | Always present? | What it is |
|---|---|---|
| `details.original_price` | Yes (100/100) | The Korean seller's asking price, in **KRW** |
| `buy_now` | Yes (100/100) | Provider's **base price to us, in EUR** (their "buy it now") |
| `profit_amount_eur` | Yes (100/100) | Provider's **explicit profit on this car, in EUR** |
| `price_with_margin_and_kosovo` | Yes (100/100) | Provider's **all-in price**: base + their profit + shipping/import |
| `price_with_margin_no_discount` | Yes (100/100) | Same as above (no discount currently applied — always equal here) |
| `step5` | No (0/100) | Legacy — never present |
| `bid` | No (0/100) | Auction bid — never present in these results |

## 2. How the numbers relate (reverse-engineered, exact)

**A. `buy_now` is a pure KRW→EUR conversion with a fixed factor:**
```
buy_now = details.original_price ÷ 1589.825      (exact, spread 0.0000 across all 100)
```
i.e. every EUR of buy_now corresponds to 1,589.825 KRW as the provider's built-in rate.
The **market** KRW/EUR rate is roughly 1,450–1,600; the provider's factor of 1,589.825
is their internal rate and already bakes in a markup on the true KRW value.

**B. The provider's explicit profit on the car:**
```
profit_amount_eur = max( 0.095 × buy_now + 216.58 , 900 )
```
- 9.5% of the base price, plus a flat €216.58, **minimum €900**.
- Verified max error 0.07 EUR across the full range (€1,400 → €102,000).
- Cheap cars hit the €900 floor (that's why small cars show ~10–20%+ "profit").

**C. The provider's all-in price (what they'd quote you if you bought through them incl. shipping):**
```
price_with_margin_and_kosovo = buy_now + profit_amount_eur + shippingAndImport
```
where `shippingAndImport ≈ 2165 − 0.05 × buy_now`, i.e. roughly **€1,200–2,000**
decreasing slightly for expensive cars (this is their shipping to Kosovo + import handling).

## 3. The three-way split you asked for

```
════════════════════════════════════════════════════════════
A. ORIGINAL PRICE (what the Korean seller asks, in KRW):
   details.original_price                     e.g. 23,500,000 KRW

B. OUR API PROVIDER'S EXTRA → WE DEDUCT THIS:
   providerProfit = profit_amount_eur
     = max(0.095 × buy_now + 216.58, 900)   e.g. BMW 530i → €1,623
   (The buy_now factor 1,589.825 also hides a markup vs market,
    but profit_amount_eur is the clean, explicit amount to strip.)

C. WHAT WE ADD (our own margin + real transport):
   ourMargin = max(buy_now × marginPct%, minMargin)      (config: 15% / €1000)
   shipping  = vehicle-type shipping cost                (config, e.g. €3500 sedan, €4500 SUV)
   + Durrës→Skenderaj transport                           (config, €350)

   OUR FINAL PRICE TO CUSTOMER =
       buy_now (true car cost)
     + ourMargin
     + shipping + shippingToPristina
════════════════════════════════════════════════════════════
```

### Worked example — BMW 5-Series 530i
- `original_price` (KRW) = 23,500,000
- `buy_now` = 14,805 (≈ 23.5M ÷ 1589.8)
- `profit_amount_eur` (what we strip) = **€1,623**
- Provider's all-in `price_with_margin_and_kosovo` = €17,854 (includes their €1,623 profit + ~€1,400 shipping/import)
- **Our calculation (15% margin, €3,500 sedan shipping, €350 Pristina):**
  - base = 14,805
  - ourMargin = max(2,221, 1000) = 2,221
  - final = 14,805 + 2,221 + 3,500 + 350 = **€20,876**

## 4. What "the car price" is
- **True car cost to us = `buy_now`** (the provider's base, already EUR).
- We **do not** recompute from KRW using a hardcoded rate (removed the old `0.000573`); we trust `buy_now`.
- We strip `profit_amount_eur` (provider's margin) — it is shown in the admin as "− Marzha e providerit" and used for transparency, not charged to the customer.

## 5. Current code state (lib/pricing.ts)
- `getCarBasePriceEur(lot)` returns `basePriceEur = buy_now` + `providerProfit` (uses API `profit_amount_eur` when present, else the exact formula above as fallback).
- `calculateFinalPriceWithConfig` / `calculateClientFinalPrice` compute our final price on `buy_now` only, now hardened against missing/NaN margin config (falls back to 15% / €1000).
