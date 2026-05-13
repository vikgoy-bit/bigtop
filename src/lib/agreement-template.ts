// Big Top Self Storage – customer storage agreement.
// Mirrors the template we host in Storeganise so the version users sign on the
// site is exactly the same document. Tokens are filled in at render time.

export type AgreementTokens = {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    phone: string;
  };
  unit: {
    name: string;
    type: string;
  };
  startDate: string;
  rental: {
    price: string;
  };
  signatureDate: string;
};

const TEMPLATE_HTML = `
<h1>Self Storage Agreement</h1>

<h2>Customer information</h2>
<table>
  <tbody>
    <tr><th>Name</th><td>{{user.firstName}} {{user.lastName}}</td></tr>
    <tr><th>Email</th><td>{{user.email}}</td></tr>
    <tr><th>Address</th><td>{{user.address}}</td></tr>
    <tr><th>Phone</th><td>{{user.phone}}</td></tr>
  </tbody>
</table>

<h2>Storage details</h2>
<table>
  <tbody>
    <tr><th>Unit number</th><td>{{unit.name}}</td></tr>
    <tr><th>Unit type</th><td>{{unit.type}}</td></tr>
    <tr><th>Start date</th><td>{{startDate}}</td></tr>
    <tr><th>Storage fee per month</th><td>{{rental.price}}</td></tr>
  </tbody>
</table>

<h2>Conditions of agreement</h2>
<p><em>(A copy in a larger font size is available upon request.)</em></p>
<p>These are the terms and conditions on which We supply Our services to You,
and explain the rights, obligations and responsibilities of all parties.</p>

<h3>Definitions</h3>
<p><strong>"Access Hours":</strong> 08:00hrs to 20:00hrs Mon–Sun.</p>
<p><strong>"Agreement":</strong> these Conditions, Self Storage Agreement and BIGProtect Addendum.</p>
<p><strong>"Facility":</strong> premises owned/operated by Facility Operator.</p>
<p><strong>"Property/Goods":</strong> items stored by You in Your allocated Unit.</p>
<p><strong>"Replacement Value":</strong> current cost of replacing Property as new (exceptions apply for aged/motorised vehicles, irreplaceable items/antiques evaluated at market value, and physical replacement cost of documents excluding data value).</p>
<p><strong>"Maximum Replacement Value":</strong> total max Replacement Value of all Property at any time.</p>
<p><strong>"Loss/Damage":</strong> identifiable physical destruction/damage caused by wilful acts, omissions, default, theft by forcible entry.</p>
<p><strong>"Storage Costs":</strong> costs stated on Agreement plus BIGProtect Charges if applicable.</p>
<p><strong>"BIGProtect Charges":</strong> additional charges for BIGProtect.</p>
<p><strong>"We/Us/Our":</strong> Facility Operator, employees, agents.</p>
<p><strong>"You/Your":</strong> named customer.</p>

<h3>1. Commencement</h3>
<p>1.1. This Agreement comes into existence when We receive Your signed Declaration, Storage Costs payment, and notify You of order acceptance. The Storage Period begins on the agreed date.</p>

<h3>2. Our services to You</h3>
<p>2.1. Subject to up-to-date payments and Conditions:
(a) We provide a lockable, segregated Unit;
(b) You are licensed to store Goods only in that Unit;
(c) We maintain a safe Facility;
(d) We make reasonable efforts to protect Property from Loss/Damage.</p>
<p>2.2. No lease or tenancy is created; We retain control of the Facility.</p>
<p>2.3. Additional services (e.g., delivery) require separate terms/charges.</p>

<h3>3. Cost</h3>
<p>3.1. Deposit is payable on signing and refunded within 21 days of termination (minus deductions for unpaid fees, repairs, etc.).</p>
<p>3.2. You must pay:
(a) Storage Costs/BIGProtect Charges in advance on the Due Date. Unidentified payments or failure to pay may lead to enforcement (Conditions 4.1–4.5);
(b) Late Payment Fees;
(c) debt collection/enforcement costs;
(d) taxes/VAT;
(e) Cleaning/repair fees (Condition 6.7).</p>
<p>3.3. Payments may be applied to Your oldest debts across multiple accounts. Part payments do not prevent enforcement action.</p>

<h3>4. Default – right to sell or dispose of Goods</h3>
<p>4.1. If payments ("Debt") are overdue, We may:
(a) deny access/overlock the Unit;
(b) move Goods and charge costs;
(c) apply the Deposit to Debt and sell/dispose of Goods.</p>
<p>4.2. Abandoned Goods left post-termination may be sold/disposed of; Storage Costs continue until disposal.</p>
<p>4.3. Before sale, We will send written notice to pay/collect. If ignored, We will sell Goods at market value.</p>
<p>4.4. Proceeds cover costs then Debt; You owe any remaining balance within 7 days. Excess funds will be returned or held without interest.</p>
<p>4.5. Unsaleable/damaged/dangerous Goods, or those containing personal data, may be disposed of immediately without prior approval.</p>
<p>4.6. Property unattended in common areas is treated as abandoned.</p>

<h3>5. Access</h3>
<p>5.1. Access is during posted Access Hours (subject to unnotified temporary changes).</p>
<p>5.2. Extended access is available if agreed and paid for.</p>
<p>5.3. Only You/Your Agents may access; ID may be required.</p>
<p>5.4. Access may be refused for unpaid debts or safety/security risks.</p>
<p>5.5. Leaving keys with non-Agents is at Your risk.</p>
<p>5.6. We may enter/break locks:
(a) with 7 days' notice for repairs;
(b) without prior notice for emergencies/safeguarding;
(c) if prohibited use/items are suspected;
(d) by law/police/authorities;
(e) to relocate/sell/dispose of Goods.</p>

<h3>6. General conditions</h3>
<p>6.1. You must lock the Unit; We are not responsible for unlocked Units. No padlocks on Our overlocking position.</p>
<p>6.2. You must secure external Facility gates/doors when required.</p>
<p>6.3. <strong>Excluded Items (strictly prohibited):</strong> perishable food, living creatures, lithium-ion batteries &gt;160Wh (unless built-in), portable chargers/power banks, &gt;5 E-vehicles (unless batteries removed), &gt;10 items with built-in batteries (unless agreed), combustibles/flammables, firearms/explosives, chemicals/toxins/radioactives, odorous/fuming items, illegal/stolen/unsafe goods, environmentally harmful items, currency/securities, items of purely sentimental/unassessable value, contaminated goods.</p>
<p>6.4. Items with built-in batteries must be defect-free, unstacked, ventilated, and stored at lowest charge.</p>
<p>6.5. The Unit is for storage only. No offices/living, no nuisances/noise, no unattended charging, no alterations/painting, no utility connections, no damage, no obstruction.</p>
<p>6.6. No portable heaters.</p>
<p>6.7. Units must be kept clean; cleaning/repair costs apply for damage/refuse.</p>
<p>6.8. Act respectfully, report defects, follow directions.</p>
<p>6.9. We may relocate You to another Unit with 14 days' notice (or immediately for emergencies), paying agreed removal costs.</p>
<p>6.10. You must ensure Unit suitability; periodic inspections (every 3 months for external units) are strongly recommended.</p>
<p>6.11. Unit sizes are approximate.</p>
<p>6.12. We may refuse storage for safety risks.</p>
<p>6.13. Notify Us of contact changes within 48 hours.</p>
<p>6.14. You warrant You own the Goods or act legally for the owner.</p>

<h3>7. Risk and responsibility</h3>
<p>7.1. Our liability starts when Your Unit is locked and ends upon removal.</p>
<p>7.2. <strong>Restricted Liability:</strong> We are only liable for Loss/Damage caused by Our negligence, up to £100 per event. You MUST insure Goods for Maximum Replacement Value.</p>
<p>7.3. <strong>BIGProtect:</strong> Alternatively, accept enhanced liability by paying BIGProtect Charges.</p>
<p>7.4. Liability for death/injury from Our negligence is not limited.</p>
<p>7.5. Liability restrictions apply to all contract/tort claims.</p>
<p>7.6. <strong>Excluded Liabilities:</strong> We exclude liability for mysterious disappearance, damage discovered post-removal, loss of access, consequential business loss, moths/vermin (unless external), natural leakage/vice, mould/rust/weather damage, electronic derangement, pair/set value loss, sentimental value, storage cost reimbursement (unless services unfulfilled), law non-compliance, Your acts/omissions/poor packing, Excluded Items, and contract breaches.</p>
<p>7.7. We are not liable for events outside Our control (Force Majeure, terrorism, pandemics, etc.).</p>
<p>7.8. You fully indemnify Us against claims arising from Your Unit use, breaches, or enforcement.</p>
<p>7.9–7.10. You must comply with all laws; We may report/dispose of items breaching regulations.</p>

<h3>8. Personal information</h3>
<p>8.1. We process Data per UK GDPR/Data Protection Act 2018 (see Privacy Notice).</p>
<p>8.2. With consent, Data is used for feedback/marketing.</p>
<p>8.3. Data may be passed to claims agents if necessary.</p>

<h3>9. Communications and notice</h3>
<p>9.1. Minor notifications sent via email/SMS/social media are effective in 1 hour (or immediately for emergencies).</p>
<p>9.2. Significant notices must be written (hand, post, email). Deemed received: upon hand delivery, 1 day post-email, 48 hours post-mailing. Notices are sent to the last known address or Alternative Contact Person (ACP).</p>

<h3>10. Where Your Property is lost or damaged</h3>
<p>10.1. Claim via Your insurers first.</p>
<p>10.2. If Loss/Damage occurs:
(10.2.1) Manned Facility: notify Us before removing Goods;
(10.2.2) Unmanned Facility: email admin@bigtopselfstorage.com immediately with descriptions/photos BEFORE removing Goods.</p>
<p>10.3. Written details must be provided within 7 days.</p>
<p>10.4. Return claim forms promptly.</p>
<p>10.5. No liability accepted if notification requirements are ignored.</p>
<p>10.6. If We do not respond, contact Our claims agent (RCS).</p>
<p>10.7–10.9. Prevent further damage, avoid touching vermin/mould-damaged goods, and retain damaged Property for inspection.</p>
<p>10.10. Cooperate with investigations.</p>
<p>10.11. BIGProtect claims have additional requirements.</p>
<p>10.12. Fraudulent/exaggerated claims will be rejected, BIGProtect cancelled, and costs recovered.</p>

<h3>11. Cancelling or ending the Agreement</h3>
<p>11.1. Remote contracts have a 14-day Cooling-off Period (pro-rata refunds apply if storage was used).</p>
<p>11.2. Either party may terminate with written notice (minimum days as per Agreement). We may terminate immediately for illegal acts/breaches. Goods must be removed and Unit cleaned by the Termination Date.</p>
<p>11.3. Examine Goods carefully upon removal.</p>
<p>11.4. Termination does not affect accrued rights, outstanding debts, or legal responsibilities.</p>

<h3>12. Other important terms</h3>
<p>12.1. We may vary terms/prices with 28 days' written notice.</p>
<p>12.2. This document is the entire agreement; no third-party rights (Contracts Act 1999); invalid clauses are severed; rights cannot be transferred by You; We may transfer Our rights; joint customers are jointly and severally liable.</p>
<p>12.3. Governed by English law; disputes subject to Courts of England and Wales. Parties must attempt mediation before commencing legal proceedings (except emergency relief).</p>

<h3>Signature</h3>
<p><strong>Signed by:</strong> {{user.firstName}} {{user.lastName}}</p>
<p><strong>Date:</strong> {{signatureDate}}</p>
`;

function get(obj: unknown, path: string): string {
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return "";
    }
  }
  return cur == null ? "" : String(cur);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function renderAgreementHtml(tokens: AgreementTokens): string {
  return TEMPLATE_HTML.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_m, path) =>
    escapeHtml(get(tokens, path)),
  );
}

export function renderAgreementText(tokens: AgreementTokens): string {
  const html = TEMPLATE_HTML.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_m, path) =>
    get(tokens, path),
  );
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<\/(p|div|h[1-6]|li|tr|table)>/gi, "\n")
    .replace(/<br\s*\/?>(?!$)/gi, "\n")
    .replace(/<th[^>]*>/gi, "")
    .replace(/<td[^>]*>/gi, "  ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
