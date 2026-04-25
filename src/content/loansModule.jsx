/**
 * Loans Module - FRD v1.0 Aligned Content
 * Module 1: Home Loan Lifecycle — 11 sequenced topics
 * Topics: What is Loan → Types → Home Loan Overview → Eligibility → EMI → Documentation →
 *         Loan Processing → Disbursement → Repayment → Tax Benefits → Module Assessment
 */

export const loansModule = {
  id: 'loans_module_1',
  title: 'Types of Loans',
  description: 'Master the home loan lifecycle — from product knowledge to disbursement and tax benefits',
  instructorName: 'Ria',
  instructorRole: 'Your AI Career Coach',
  instructorMessage: 'Hello! I am Ria, your AI Career Coach. Let\'s master the complete home loan lifecycle together.',
  topics: [

    // ── Topic 1: What is a Loan ───────────────────────────────────────────────
    {
      id: 'what_is_loan',
      moduleId: 'loans_module_1',
      number: 1,
      title: 'What is a Loan?',
      type: 'lesson',
      content: `A loan is money borrowed today with a promise to return it in small, manageable installments over time — along with interest. Think of it as a bridge between "I need this" and "I have this."

In banking, every loan has four core components:

**Principal** — the original amount borrowed. If you take ₹10 lakh to buy a car, that ₹10 lakh is your principal.

**Interest** — the cost of borrowing. Banks and NBFCs earn by charging interest on the principal. Interest is expressed as an annual rate — for example, 8.5% per annum.

**Tenure** — the repayment period. Home loans typically run 10–30 years. Personal loans are shorter — 1–5 years.

**Collateral** — an asset pledged as security. Home loans and car loans are *secured* — the property or vehicle is the collateral. Personal loans and credit cards are *unsecured* — no collateral, higher interest.

In India, loans are provided by:
- **Scheduled Commercial Banks** (SBI, HDFC, ICICI) — regulated by RBI
- **NBFCs** (Bajaj Finserv, Muthoot) — regulated by RBI, slightly higher rates
- **HFCs** (Housing Finance Companies) like LIC HFL, PNB Housing — specialized home loan lenders regulated by NHB

As a BFSI professional, you are not just selling a loan. You are helping customers make the most important financial decision of their lives. Your job is to match the right product to the right customer — responsibly.`,
      nextTopicId: 'types_of_loans',
      cta: 'Types of Loans →',
      estimatedMinutes: 5,
    },

    // ── Topic 2: Types of Loans ───────────────────────────────────────────────
    {
      id: 'types_of_loans',
      moduleId: 'loans_module_1',
      number: 2,
      title: 'Types of Loans',
      type: 'cards',
      content: `Every customer you meet has a dream — a home, a vehicle, a business, an education. Your job is to match their dream to the right loan product. Let's explore the six major loan types you'll work with in BFSI.`,
      cards: [
        {
          id: 'home_loan',
          title: 'Home Loan',
          description: 'Long-term loan (10–30 years) to purchase, construct, or renovate a residential property. Secured against the property. Interest rates: 8.5–9.5%. LTV: up to 90% for loans under ₹30L. The largest ticket-size loan in retail banking — average ₹40–60L. Key players: SBI, HDFC, LIC HFL, PNB Housing.',
        },
        {
          id: 'personal_loan',
          title: 'Personal Loan',
          description: 'Unsecured loan (1–5 years) for any personal purpose — medical, travel, wedding, or emergency. No collateral required. Interest: 11–24% (higher due to unsecured nature). Quick disbursal — often within 24–48 hours. Eligibility based on income, credit score, and employer type.',
        },
        {
          id: 'auto_loan',
          title: 'Auto / Vehicle Loan',
          description: 'Loan to purchase a new or used car or two-wheeler. Secured against the vehicle (RC transferred to lender). Tenure: 1–7 years. LTV: up to 90% for new vehicles, 70–80% for used. Foreclosure allowed after 6–12 months. Two-wheeler loans have higher interest than car loans.',
        },
        {
          id: 'education_loan',
          title: 'Education Loan',
          description: 'Loan to fund higher education — domestic or abroad. Covers tuition, hostel, books. Moratorium period: course duration + 6–12 months. Interest subsidy available for economically weaker sections under government schemes. Secured (for loans above ₹7.5L), unsecured below. Priority sector lending category.',
        },
        {
          id: 'business_loan',
          title: 'Business / MSME Loan',
          description: 'Loan for business expansion, working capital, or equipment purchase. Offered as term loan (fixed repayment) or overdraft (flexible). For MSMEs — MUDRA scheme under Pradhan Mantri Mudra Yojana (PMMY). LTV depends on asset pledged. Key assessment: business vintage, turnover, and profitability.',
        },
        {
          id: 'gold_loan',
          title: 'Gold Loan',
          description: 'Instant loan against gold jewellery as collateral. Fastest disbursal — often within 30 minutes. LTV: up to 75% of gold market value (RBI cap). Tenure: 3 months to 2 years. Used for emergencies, agriculture, and short-term needs. Key players: Muthoot Finance, Manappuram, banks. Interest: 9–18%.',
        },
      ],
      nextTopicId: 'home_loan_overview',
      cta: 'Home Loan Overview →',
      estimatedMinutes: 8,
    },

    // ── Topic 3: Home Loan Overview ───────────────────────────────────────────
    {
      id: 'home_loan_overview',
      moduleId: 'loans_module_1',
      number: 3,
      title: 'Home Loan Overview',
      type: 'lesson',
      content: `The home loan is the flagship product in retail banking. As a BFSI sales professional, this is the product you will pitch most. Let's understand its structure deeply.

**Loan-to-Value (LTV) Ratio — RBI Mandates**

LTV is the maximum percentage of the property value a bank can lend. The RBI has capped LTV as follows:

| Loan Amount | Max LTV |
|-------------|---------|
| Up to ₹30 lakh | 90% |
| ₹30 lakh – ₹75 lakh | 80% |
| Above ₹75 lakh | 75% |

Example: For a ₹50L property, the bank lends up to ₹40L (80%). The customer must bring ₹10L as down payment.

**Interest Rate Types**

*Fixed Rate* — Interest rate stays constant for the loan tenure. Predictable EMI. Slightly higher than floating. Good when rates are expected to rise.

*Floating Rate* — Interest rate changes with the market benchmark. Two benchmarks:

- **MCLR (Marginal Cost of Funds-based Lending Rate)** — Internal bank benchmark reset periodically. Most bank home loans were linked to MCLR before 2019.
- **RLLR (Repo-Linked Lending Rate)** — External benchmark directly linked to RBI's repo rate. Mandatory for new floating rate home loans since October 2019. More transparent and customer-friendly.

**Spread Calculation**

Bank's home loan rate = RLLR + Spread

Example: RLLR = 8.15%, Spread = 0.35% → Customer rate = 8.50%

The spread is set by the bank based on the customer's credit profile. Better CIBIL score = lower spread = lower rate for the customer.

**Key Takeaway:** When selling a home loan, always explain LTV (so customers plan their down payment), and always explain how the rate is benchmarked — it builds trust and reduces post-disbursal complaints.`,
      nextTopicId: 'eligibility_criteria',
      cta: 'Eligibility Criteria →',
      estimatedMinutes: 7,
    },

    // ── Topic 4: Eligibility Criteria ─────────────────────────────────────────
    {
      id: 'eligibility_criteria',
      moduleId: 'loans_module_1',
      number: 4,
      title: 'Eligibility Criteria',
      type: 'lesson',
      content: `Before sanctioning a home loan, lenders assess whether the customer can repay it. This is called **credit appraisal** — and it rests on four pillars.

**Pillar 1: Income Assessment**

Lenders calculate the customer's *net monthly income* (NMI) — take-home salary for salaried customers, or average net profit for self-employed.

The rule of thumb: Monthly EMI should not exceed **50–55% of NMI** for most banks.

Example: Customer earns ₹80,000/month. Maximum EMI eligibility = ₹40,000–₹44,000/month.

**Pillar 2: FOIR (Fixed Obligation to Income Ratio)**

FOIR = (All existing monthly EMIs + Proposed new EMI) ÷ Gross Monthly Income × 100

Example:
- Gross income: ₹1,00,000
- Existing EMIs: ₹15,000 (car loan)
- Proposed home loan EMI: ₹35,000
- FOIR = (15,000 + 35,000) ÷ 1,00,000 = 50%

Most banks allow FOIR up to 50–55%. If FOIR exceeds the bank's limit, the loan is rejected or the amount is reduced.

**Pillar 3: Age Criteria**

Minimum age: 21 years (salaried), 25 years (self-employed).
Maximum age at loan maturity: 60–65 years (salaried), 70 years (self-employed/professional).

A 55-year-old customer can get a maximum 10-year loan. A 25-year-old can get up to 30 years.

**Pillar 4: Employment Type & CIBIL**

- *Salaried* (government/PSU preferred > MNC > private) — stability matters
- *Self-employed* — needs 2+ years of business vintage and ITR
- *CIBIL threshold*: Most banks require minimum 700–750. Below 650 = high chance of rejection.

**Pro Tip:** As a sales officer, always pre-qualify the customer before applying. A rejected application hurts the customer's CIBIL score (hard enquiry) and your conversion rate.`,
      nextTopicId: 'emi_calculation',
      cta: 'EMI Calculation →',
      estimatedMinutes: 8,
    },

    // ── Topic 5: EMI Calculation ──────────────────────────────────────────────
    {
      id: 'emi_calculation',
      moduleId: 'loans_module_1',
      number: 5,
      title: 'EMI Calculation',
      type: 'lesson',
      content: `EMI — Equated Monthly Installment — is the fixed amount a borrower pays each month. Understanding EMI calculation is essential for every BFSI professional.

**The EMI Formula**

EMI = P × r × (1 + r)ⁿ ÷ [(1 + r)ⁿ − 1]

Where:
- **P** = Principal loan amount
- **r** = Monthly interest rate = Annual rate ÷ 12 ÷ 100
- **n** = Total number of monthly installments (tenure in months)

**Worked Example**

Loan: ₹40 lakh | Rate: 9% per annum | Tenure: 20 years

- r = 9 ÷ 12 ÷ 100 = 0.0075
- n = 20 × 12 = 240 months
- EMI = 40,00,000 × 0.0075 × (1.0075)²⁴⁰ ÷ [(1.0075)²⁴⁰ − 1]
- EMI ≈ ₹35,989/month

**Amortization: How EMI is Split**

In early months, most of the EMI goes toward interest. Over time, the principal component grows.

Month 1: Interest = ₹30,000 | Principal = ₹5,989
Month 120: Interest ≈ ₹18,000 | Principal ≈ ₹18,000
Month 240: Interest = ₹270 | Principal = ₹35,719

**Impact of Prepayment**

If the customer pays ₹5L extra in Year 3:
- Outstanding principal reduces immediately
- EMI stays same, but tenure reduces by 2–3 years
- Customer saves lakhs in interest

**Reducing vs Flat Rate**

*Reducing balance rate* (standard for banks): Interest calculated on outstanding principal each month. Actual cost = stated rate.

*Flat rate* (some NBFCs/vehicle loans): Interest calculated on original principal for full tenure. Actual effective rate ≈ 1.8× the flat rate.

**Key selling point:** When a customer says "NBFC charges only 7% flat," help them compare apples to apples — show the effective rate.`,
      nextTopicId: 'documentation_kyc',
      cta: 'Documentation & KYC →',
      estimatedMinutes: 8,
    },

    // ── Topic 6: Documentation & KYC ─────────────────────────────────────────
    {
      id: 'documentation_kyc',
      moduleId: 'loans_module_1',
      number: 6,
      title: 'Documentation & KYC',
      type: 'cards',
      content: `Documentation is where many home loan applications get stuck. As a sales officer, your ability to collect complete and accurate documents on the first visit directly impacts your processing speed and customer satisfaction. Different documents are required for salaried vs self-employed customers.`,
      cards: [
        {
          id: 'kyc_docs',
          title: 'KYC Documents (All Customers)',
          description: 'Identity Proof: Aadhaar card, PAN card (mandatory), passport, voter ID, driving licence. Address Proof: Aadhaar, utility bill (not older than 3 months), rental agreement, passport. Passport-size photographs (2–4 copies). PAN card is mandatory for all loan applications above ₹50,000 — no exceptions.',
        },
        {
          id: 'salaried_docs',
          title: 'Salaried Customer Documents',
          description: 'Latest 3 months salary slips. Form 16 or ITR for last 2 years. Bank statements for last 6 months (salary account). Employment certificate or appointment letter. If in private sector: 2 years in current employment or 3 years total employment. Government employees may have relaxed norms.',
        },
        {
          id: 'self_employed_docs',
          title: 'Self-Employed Documents',
          description: 'ITR with computation for last 2–3 years (with CA seal). Audited P&L and Balance Sheet for last 2 years (if turnover > ₹1Cr). Business proof: GST registration, shop act, partnership deed, or incorporation certificate. Business bank statements for last 12 months. Business vintage minimum 2 years for most banks.',
        },
        {
          id: 'property_docs',
          title: 'Property Documents',
          description: 'Sale Agreement / Allotment Letter. Title deed / Sale deed (chain of documents for last 30 years). Approved building plan from local authority. NOC from builder / society. Property tax receipts (last 3 years). Encumbrance Certificate (EC) showing no existing loans on property. Occupancy Certificate (OC) for ready-to-move properties.',
        },
        {
          id: 'noc_requirements',
          title: 'NOC & Special Requirements',
          description: 'Builder NOC: Confirming no lien on the property and builder has no outstanding dues. Society NOC: For resale flats — confirming membership transfer is allowed. RERA registration: Mandatory for under-construction projects post 2017. Non-agricultural land certificate in some states. Legal clearance report prepared by bank\'s empanelled advocate.',
        },
        {
          id: 'checklist_tip',
          title: 'Field Pro Tip',
          description: 'Always carry a pre-printed document checklist for both salaried and self-employed customers. At the first meeting, go through it item by item. Collect self-attested photocopies + original documents for verification. Incomplete applications cause delays — every delay is a risk of losing the customer to a competitor. Speed of documentation = speed of sanction.',
        },
      ],
      nextTopicId: 'loan_processing',
      cta: 'Loan Processing →',
      estimatedMinutes: 7,
    },

    // ── Topic 7: Loan Processing ──────────────────────────────────────────────
    {
      id: 'loan_processing',
      moduleId: 'loans_module_1',
      number: 7,
      title: 'Loan Processing',
      type: 'lesson',
      content: `Once documents are collected, the loan enters processing. Understanding this pipeline helps you set correct expectations with customers and troubleshoot delays.

**Stage 1: Application Submission & Login**

The loan officer submits the application to the credit team with all documents. A Login ID is generated. Processing fee is collected (0.25–1% of loan amount). Timeline: Day 0–1.

**Stage 2: Credit Appraisal**

The credit team reviews:
- Income documents — verifies stability and continuity
- CIBIL report — pulled fresh (hard enquiry); checks score, history, and ongoing EMIs
- FOIR calculation — confirms repayment capacity
- De-duplication — checks if customer has existing applications at other banks

Decision: Eligible / Conditionally Eligible / Rejected. Timeline: 2–4 business days.

**Stage 3: Legal Verification**

Bank's empanelled lawyer examines:
- Title chain — confirms seller has clear ownership
- Encumbrance certificate — no existing mortgages on property
- Property tax dues — cleared
- RERA compliance — for under-construction properties

Legal clearance is critical — banks will not disburse without it. Timeline: 5–10 days.

**Stage 4: Technical Valuation**

Bank's empanelled valuer visits the property and prepares a valuation report:
- Market value of property
- Construction quality assessment
- LTV calculation based on approved value (not agreement value — whichever is lower)

Example: Agreement value ₹60L, valuer assesses ₹52L → LTV calculated on ₹52L.

**Stage 5: Credit Decisioning & Sanction**

Credit committee reviews all reports and issues:
- **Sanction Letter** — specifying approved amount, rate, tenure, and conditions
- Validity: typically 6 months from sanction date

**Total Processing Turnaround:** 7–15 business days for complete documentation. Incomplete docs = significant delay.`,
      nextTopicId: 'disbursement',
      cta: 'Disbursement Process →',
      estimatedMinutes: 7,
    },

    // ── Topic 8: Disbursement Process ─────────────────────────────────────────
    {
      id: 'disbursement',
      moduleId: 'loans_module_1',
      number: 8,
      title: 'Disbursement Process',
      type: 'lesson',
      content: `Disbursement is when the bank actually releases the loan funds. It's not always a single lump sum — the method depends on the type of property.

**Full Disbursement**

For ready-to-move-in properties (resale flats, completed projects):
- Full loan amount released in one transaction
- Transferred directly to the seller's account via RTGS/NEFT
- Customer starts paying full EMI from the next month

**Part Disbursement (Under-Construction)**

For properties under construction:
- Funds released in tranches linked to construction stages
- Typical stages: Foundation → Slab → Brickwork → Plastering → Finishing
- Bank's technical team visits and certifies each stage before releasing the next tranche

**Pre-EMI vs Full EMI**

During construction, when only partial disbursement has happened:

*Pre-EMI* (Interest Servicing):
- Customer pays only interest on the disbursed amount each month
- Example: ₹10L disbursed at 9% → Monthly pre-EMI = ₹7,500
- Full EMI starts only after complete disbursement or possession

*Full EMI from Day 1*:
- Some banks allow customers to start full EMI from the first disbursement
- Principal repayment begins immediately → lower overall interest cost
- Better option for customers who can afford it

**Escrow Account**

For large projects (builders), the bank may insist on disbursement into an escrow account — jointly controlled by bank and builder. This protects buyers in case the builder defaults.

**Disbursement Checklist**

Before releasing funds, the bank collects:
- Registered Sale Agreement / Sale Deed
- Insurance policy (HLPP or property insurance)
- Post-dated cheques or NACH mandate for EMI
- Demand Draft to the seller / builder
- Customer's margin money (down payment) proof

**Your role:** Follow up with the customer to complete all disbursement formalities quickly. Any delay post-sanction risks rate changes or customer drop-off.`,
      nextTopicId: 'repayment_foreclosure',
      cta: 'Repayment & Foreclosure →',
      estimatedMinutes: 7,
    },

    // ── Topic 9: Repayment & Foreclosure ──────────────────────────────────────
    {
      id: 'repayment_foreclosure',
      moduleId: 'loans_module_1',
      number: 9,
      title: 'Repayment & Foreclosure',
      type: 'lesson',
      content: `After disbursement, the customer enters the repayment phase. As a BFSI professional, you need to help customers manage their loan effectively — including when they want to exit early.

**Standard Repayment**

EMIs are collected via NACH (National Automated Clearing House) — auto-debit from the customer's salary/savings account on a fixed date each month.

If EMI bounces: Customer incurs a bounce charge (₹500–1000), and a late payment fee. After 3 consecutive defaults → account becomes NPA (Non-Performing Asset) → credit score drops → legal action possible.

**Prepayment**

Customers can pay extra money anytime to reduce their outstanding principal.

- *Part prepayment*: Pay a lump sum (minimum usually ₹10,000–50,000). The bank reduces tenure or EMI accordingly.
- *Full prepayment*: Pay off the entire outstanding loan before tenure ends

**Prepayment Charges**

As per RBI guidelines (2012):
- **Floating rate home loans**: No prepayment penalty — not allowed by banks
- **Fixed rate home loans**: Banks may charge up to 2–3% on the outstanding amount

This is a key selling point: "If you ever get a windfall — bonus, sale of asset — you can prepay our floating rate loan without any charges."

**Foreclosure (Full Early Closure)**

When a customer closes the loan completely:
1. Customer requests foreclosure statement
2. Bank provides outstanding principal + accrued interest + any charges
3. Customer pays via RTGS
4. Bank issues:
   - NOC (No Objection Certificate)
   - Original title documents returned
   - Lien on property removed (registered at sub-registrar)

**Balance Transfer**

Customer can transfer their home loan to another bank offering a lower interest rate.

Process: New bank sanctions → pays off old bank → old bank releases documents → new bank registers mortgage.

Charges: Processing fee at new bank (0.25–0.5%). Time: 2–4 weeks.

**Switching Lenders — When to Advise:**
If a customer's current rate is 50+ basis points higher than market rate, a balance transfer saves significant money over the remaining tenure. Always calculate the break-even period (processing fees recovered via savings).`,
      nextTopicId: 'tax_benefits',
      cta: 'Tax Benefits →',
      estimatedMinutes: 8,
    },

    // ── Topic 10: Tax Benefits ────────────────────────────────────────────────
    {
      id: 'tax_benefits',
      moduleId: 'loans_module_1',
      number: 10,
      title: 'Tax Benefits',
      type: 'lesson',
      content: `Tax benefits are a powerful home loan selling tool — they reduce the effective cost of borrowing. Every BFSI sales professional must know these by heart.

**Section 80C — Principal Repayment**

Deduction: Up to **₹1.5 lakh per year** on principal repaid during the year.

Key conditions:
- Only for the EMI's principal component (not interest)
- Property must not be sold within 5 years of possession (else deduction reverses)
- Available for under-construction properties only after possession

Example: Annual principal repaid = ₹1.8L → Tax deduction = ₹1.5L (cap). Tax saved = ₹46,800 (for 31.2% tax bracket).

**Section 24(b) — Interest Payment**

Deduction: Up to **₹2 lakh per year** on interest paid on a self-occupied property.

Key conditions:
- For self-occupied property only; no cap for let-out property
- Construction must be completed within 5 years from loan disbursement
- For under-construction property: Pre-EMI interest can be claimed in 5 equal installments after possession

Example: Annual interest paid = ₹3.6L → Tax deduction = ₹2L. Tax saved = ₹62,400 (31.2% bracket).

**Section 80EEA — First-Time Buyers**

Additional deduction: Up to **₹1.5 lakh per year** (over and above Section 24b).

Conditions:
- First-time home buyer (no other residential property in name)
- Property stamp duty value ≤ ₹45 lakh
- Loan sanctioned between 1 April 2019 – 31 March 2022

This benefit was specifically for affordable housing buyers.

**Total Maximum Annual Tax Benefit**

| Section | Max Deduction | Max Tax Saved (30% bracket) |
|---------|--------------|----------------------------|
| 80C (principal) | ₹1,50,000 | ₹46,800 |
| 24(b) (interest) | ₹2,00,000 | ₹62,400 |
| 80EEA (first-time) | ₹1,50,000 | ₹46,800 |
| **Total** | **₹5,00,000** | **₹1,56,000** |

**Sales Angle:** "Your ₹40L home loan at 9% costs ₹3.6L in interest annually. After the ₹2L deduction under Section 24(b), your effective post-tax cost is just ₹1.6L — that's an effective rate of about 6.2%." This reframe significantly improves affordability perception.`,
      nextTopicId: 'module_assessment',
      cta: 'Module Assessment →',
      estimatedMinutes: 8,
    },

    // ── Topic 11: Module Assessment ───────────────────────────────────────────
    {
      id: 'module_assessment',
      moduleId: 'loans_module_1',
      number: 11,
      title: 'Module Assessment',
      type: 'knowledge_test',
      content: 'Comprehensive assessment covering all 10 topics of Module 1 — Home Loan Lifecycle. Minimum 70% (11/15) required to pass. You have 20 minutes.',
      questions: [
        {
          id: 'q1',
          question: 'A customer wants a home loan for a property valued at ₹60 lakh. As per RBI LTV norms, what is the maximum loan amount the bank can sanction?',
          options: ['₹54 lakh (90%)', '₹48 lakh (80%)', '₹45 lakh (75%)', '₹42 lakh (70%)'],
          correctAnswer: 1,
          explanation: 'For loan amounts between ₹30 lakh and ₹75 lakh, RBI mandates a maximum LTV of 80%. So 80% of ₹60L = ₹48 lakh.',
        },
        {
          id: 'q2',
          question: 'What does FOIR stand for and what is the typical maximum FOIR allowed by most banks?',
          options: [
            'Fixed Obligation to Income Ratio — 50–55%',
            'Financial Obligation Interest Rate — 60%',
            'Fixed Output Interest Ratio — 45%',
            'Final Obligation Income Report — 70%',
          ],
          correctAnswer: 0,
          explanation: 'FOIR = Fixed Obligation to Income Ratio. It measures total monthly EMI obligations as a percentage of gross income. Most banks cap this at 50–55%.',
        },
        {
          id: 'q3',
          question: 'A customer has a gross monthly income of ₹1 lakh, existing car loan EMI of ₹12,000, and is applying for a home loan with proposed EMI of ₹38,000. What is their FOIR?',
          options: ['38%', '50%', '12%', '62%'],
          correctAnswer: 1,
          explanation: 'FOIR = (₹12,000 + ₹38,000) ÷ ₹1,00,000 × 100 = 50%. This is within the 50–55% threshold.',
        },
        {
          id: 'q4',
          question: 'Under which RBI mandate are floating rate home loans linked to RLLR since October 2019?',
          options: [
            'External Benchmark Lending Rate (EBLR) mandate',
            'MCLR rationalization circular',
            'Base Rate elimination notice',
            'Priority Sector Lending directive',
          ],
          correctAnswer: 0,
          explanation: 'The RBI mandated linking of floating rate home loans to an external benchmark (RLLR = Repo-Linked Lending Rate) from October 2019 onwards under the EBLR framework.',
        },
        {
          id: 'q5',
          question: 'A customer takes a ₹30L loan at 9% per annum for 20 years. Which formula correctly calculates the monthly EMI?',
          options: [
            'P × r × (1+r)^n ÷ [(1+r)^n − 1] where r = 9/1200 and n = 240',
            'P × R × T ÷ 100 where R = 9 and T = 20',
            'P ÷ n + P × r where r = 9/100',
            'P × (1 + r)^n where r = 0.09',
          ],
          correctAnswer: 0,
          explanation: 'The standard EMI formula is P × r × (1+r)^n ÷ [(1+r)^n − 1]. Here r = monthly rate = 9 ÷ 12 ÷ 100 = 0.0075, and n = 240 months.',
        },
        {
          id: 'q6',
          question: 'What is the maximum tax deduction allowed under Section 24(b) for interest paid on a self-occupied home loan?',
          options: ['₹1 lakh', '₹1.5 lakh', '₹2 lakh', '₹3 lakh'],
          correctAnswer: 2,
          explanation: 'Section 24(b) allows a maximum deduction of ₹2 lakh per year on home loan interest for a self-occupied property.',
        },
        {
          id: 'q7',
          question: 'A customer with a ₹50L floating rate home loan asks if they will be charged for prepaying ₹5 lakh. What is the correct answer?',
          options: [
            'Yes, 2% of prepaid amount = ₹10,000',
            'Yes, 3% = ₹15,000',
            'No — RBI prohibits prepayment charges on floating rate home loans',
            'Depends on the bank policy',
          ],
          correctAnswer: 2,
          explanation: 'As per RBI circular (2012), banks and HFCs cannot levy prepayment charges on floating rate home loans. This is a consumer protection rule.',
        },
        {
          id: 'q8',
          question: 'During loan processing, a bank valuer assesses a property at ₹52L, but the Sale Agreement states ₹60L. On which value will the bank calculate LTV?',
          options: [
            'On ₹60L (agreement value)',
            'On ₹52L (valuer\'s assessed value)',
            'Average of both = ₹56L',
            'Customer can choose either',
          ],
          correctAnswer: 1,
          explanation: 'Banks calculate LTV on the lower of agreement value or valuer\'s assessed value. This prevents inflated valuations from being used to extract higher loans.',
        },
        {
          id: 'q9',
          question: 'What document does a customer receive from the bank after fully repaying (foreclosing) their home loan?',
          options: [
            'Form 16 and sanction letter',
            'NOC and original title documents',
            'Bank statement and closure confirmation',
            'Encumbrance Certificate',
          ],
          correctAnswer: 1,
          explanation: 'Upon full loan repayment, the bank issues an NOC (No Objection Certificate) and returns all original property title documents. The mortgage lien is also removed.',
        },
        {
          id: 'q10',
          question: 'A first-time home buyer purchases an affordable house (stamp duty value ₹42L) in 2020. Which additional section allows an extra ₹1.5L interest deduction?',
          options: ['Section 80C', 'Section 80D', 'Section 80EEA', 'Section 80G'],
          correctAnswer: 2,
          explanation: 'Section 80EEA provides an additional ₹1.5 lakh deduction on interest for first-time buyers where property stamp duty value ≤ ₹45L, for loans sanctioned between April 2019–March 2022.',
        },
        {
          id: 'q11',
          question: 'A customer purchasing an under-construction flat asks when they will start paying full EMI. What is correct?',
          options: [
            'Full EMI starts from the date of loan sanction',
            'Full EMI starts after complete disbursement or possession; until then only pre-EMI (interest) is charged',
            'Full EMI starts immediately for under-construction properties',
            'No EMI until registration of property',
          ],
          correctAnswer: 1,
          explanation: 'For under-construction properties, customers typically pay pre-EMI (interest only on disbursed amount) during construction. Full EMI begins after complete disbursement or possession.',
        },
        {
          id: 'q12',
          question: 'An NBFC offers a vehicle loan at "7% flat rate." A bank offers the same at "13% reducing balance." Which is actually cheaper?',
          options: [
            'NBFC at 7% flat — clearly lower',
            'Bank at 13% reducing — after converting flat rate, effective rate is ~12.6%',
            'Both are the same',
            'Cannot be compared',
          ],
          correctAnswer: 1,
          explanation: '7% flat rate ≈ 12.6–13% reducing balance effective rate (flat rate × ~1.8). So the bank\'s 13% reducing is roughly equivalent to the NBFC\'s 7% flat. Always convert to compare.',
        },
        {
          id: 'q13',
          question: 'What is an Encumbrance Certificate (EC) and why is it required in home loan processing?',
          options: [
            'A property valuation certificate from a government valuer',
            'A document confirming the property has no existing loans or legal claims registered against it',
            'The builder\'s NOC confirming construction is as per approved plan',
            'A tax clearance certificate from the local municipality',
          ],
          correctAnswer: 1,
          explanation: 'An EC is issued by the sub-registrar\'s office and shows all registered transactions on a property for a specified period. It confirms the property is free from any existing mortgage, lien, or legal dispute.',
        },
        {
          id: 'q14',
          question: 'Under Section 80C, a customer repays ₹2.2 lakh as principal on their home loan in a financial year. What is their maximum allowable deduction?',
          options: ['₹2.2 lakh', '₹1.5 lakh', '₹2 lakh', '₹1 lakh'],
          correctAnswer: 1,
          explanation: 'Section 80C allows a maximum deduction of ₹1.5 lakh per year regardless of actual principal repaid. The excess (₹70,000 in this case) cannot be claimed.',
        },
        {
          id: 'q15',
          question: 'A salaried customer earning ₹80,000/month wants the maximum home loan possible. Their existing EMI is ₹8,000. Bank uses 50% FOIR and 9% rate for 20 years. What is their maximum eligible EMI?',
          options: ['₹40,000', '₹32,000', '₹48,000', '₹24,000'],
          correctAnswer: 1,
          explanation: 'Maximum allowable EMI = 50% of ₹80,000 = ₹40,000. Minus existing EMI of ₹8,000 = ₹32,000 available for new home loan EMI.',
        },
      ],
      nextTopicId: null,
      cta: 'Module Complete!',
      estimatedMinutes: 20,
    },

  ],
};

/**
 * Helper to get all topics in order
 */
export const getAllTopics = () => loansModule.topics;

/**
 * Helper to get a specific topic by ID
 */
export const getTopicById = (topicId) => {
  return loansModule.topics.find((topic) => topic.id === topicId);
};

/**
 * Helper to get next topic
 */
export const getNextTopic = (currentTopicId) => {
  const currentTopic = getTopicById(currentTopicId);
  if (!currentTopic || !currentTopic.nextTopicId) return null;
  return getTopicById(currentTopic.nextTopicId);
};

/**
 * Helper to check if topic is a knowledge test
 */
export const isKnowledgeTest = (topicId) => {
  const topic = getTopicById(topicId);
  return topic && topic.type === 'knowledge_test';
};

/**
 * Helper to get knowledge test questions
 */
export const getKnowledgeTestQuestions = (topicId) => {
  const topic = getTopicById(topicId);
  return topic && topic.type === 'knowledge_test' ? topic.questions : [];
};
