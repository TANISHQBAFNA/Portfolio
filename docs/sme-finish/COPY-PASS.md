# Copy pass — make the story match the original screens (Nov 24)
For the cloud agent. Copy only, no layout change. Voice: short, plain, warm. Any copy inside images ≥22px.

## The lead character
The original screens greet **Abdulrahman Al Mansouri** (phone Home, web Dashboard "Good morning, Abdulrahman", Welcome user ID), business **Emaar Consumer vehicles** (phone) / **Emirates Trade FZE** (web), currency **AED**.
**Recommendation: rename the lead from Aisha to Abdulrahman** in all copy. Why: it's his name on every Home screen, so "Aisha" next to "Abdulrahman Al Mansouri" reads as a mistake; renaming the copy costs nothing, editing the Figma originals would undo Tanishk's "use the originals" call. S02 illustrations: if the drawn character is clearly a woman, either swap pronouns only in S02 captions or keep the illustration as "a founder like him" — owner call (I'd swap the illustration later; flagged).
Pronouns: her/she → his/he wherever they refer to the lead.
Team: maker = **Adnan Ali, Finance Manager** (web Approve Payment "Initiated" step); second approver = **Micheal J Davis, CFO** (as spelled in Figma). Payee in the approval flow = **Oliver Davis** (106,211.00 AED, Domestic). Team list on S05 = 4 users (2 active, 2 pending approval).

## Exact replacements
| File:line | Now | Replace with |
|---|---|---|
| cbx300-case.js:13, cbx300-answers.js:18, cbx300-finish.js:4 (comments) | Aisha is a representative example/story. | Abdulrahman is a representative story. |
| cbx300-case.js:360 aria | Aisha grows through three stages | Abdulrahman grows through three stages |
| cbx300-case.js:449 aria | Aisha grows through three worries. | Abdulrahman grows through three worries. |
| cbx300-case.js:32 | Just her, a laptop and a stack of invoices. | Just him, a laptop and a stack of invoices. |
| cbx300-case.js:52 | Eight people, and most of them need her yes. | Four people, and two still wait for his yes. |
| cbx300-finish.js:54 | Eight people. Most of them need her yes. | Four people. Two still wait for his yes. |
| cbx300-finish.js:76 | What can Lina do? | What can Adnan do? |
| cbx300-finish.js:90 | Big calls stay with Aisha. | Big calls stay with Abdulrahman. |
| cbx300-answers.js:74 | Did Client A pay? | Did the client pay? (Ch1 invoices screen is being rebuilt; final client name follows that screen) |
| cbx300-answers.js:102 worry | Can I pay Lina on Friday? | Can I pay Adnan on Friday? |
| cbx300-answers.js:102 does | Friday is marked on the week, with Lina’s salary and a single ‘Covered’ badge that says yes or no. | Friday is marked on the week, with Adnan’s salary and one ‘Covered’ badge that says yes or no. |
| cbx300-answers.js:129 why | Names make it personal: Lina approved, Dev paid. | Names make it personal: Adnan sent it, Micheal approved. |
| cbx300-answers.js:130 gain | Lina runs payments. The big calls stay with Aisha. | Adnan runs payments. The big calls stay with Abdulrahman. |
| cbx300-answers.js:133 kicker | Lina sends it. | Adnan sends it. |
| cbx300-answers.js:134 kicker | Aisha approves it, between meetings. | Abdulrahman approves it, between meetings. |
| cbx300-finish.js:281 note | Lisa Charlie is a demo brand. Aisha is a representative story. All names and amounts are hidden. | Lisa Charlie is a demo brand. Names, businesses and amounts are sample data from the design file. |
| cbx300-answers.js:230 desk avatar label | Aisha | Abdulrahman |
| cbx300-answers.js:246–316 HTML desk mocks | `₹ ——`, `INV ——`, Client A–D, Lina/Dev/Mira/Arjun rows | Remove these HTML mocks once the rebuilt desk PNGs land (step 4). If kept: amounts in AED with real-looking values from the screens (e.g. `106,211.00 AED`, `450,000.00 AED`), people from the screens (Oliver Davis, Adnan Ali, Micheal J Davis, Ahmed Hassan Mohammed). Never `₹`. |
| alt text, all `'CBX300 phone · …'` | ok | keep; add business only if needed |

## Counts to keep true
- S05 team: 4 users (2 active, 2 pending). Don't say eight.
- Pending approvals (web): Single 6, Bulk 1, Service 5, Misc 3; sidebar badge 15. Any copy quoting a count must use these.
- Approved payment: Oliver Davis, 106,211.00 AED.

## Check
`rg -n "Aisha|Lina|Dev\b|Mira|Arjun|₹|Client [A-D]|Eight" assets/js` returns nothing after the pass (except S02 illustration asset names if the owner keeps them). Banned-terms check passes.
