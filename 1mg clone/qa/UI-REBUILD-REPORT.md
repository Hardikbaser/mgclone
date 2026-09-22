# UI rebuild report

## Implementation

The existing Next.js App Router application and CSS Modules were preserved. The active homepage, three-row header, navigation, local fonts, promotional banners, health concerns, catalogue cards, filters, product details, cart drawer, login and signup presentation were replaced. The Products navigation tab is removed; the catalogue remains accessible through search, Medicines and product links.

Labs, doctors, Ayurveda, Cancer Care, Care Plan, partnerships and corporate wellness now have reference-based layouts. Checkout retains its working form and payment logic with shared typography and chrome. Reports, pharmacist and consultation screens use the shared replacement workflow styles. Help, orders and demo legal-information routes support the new navigation.

Shared components: ReferenceHeader, SiteChrome, ProductCard, PartnershipPage and CartDrawer. The obsolete OneMgLocationHeader/OneMgProductCard components and declarations, unused reference-pages stylesheet and workflow stylesheet were removed after checking references. The old homepage sections and active global styling were replaced.

Local assets include supplied reference imagery, corrected image paths, Poppins fonts and the two authentication illustrations. The public reference sites informed layout; no private Tata 1mg APIs or Anakin services were introduced. Page content uses this application's catalogue and existing demo data. Visual parity is close in the implemented sections, not a pixel-for-pixel reproduction of every reference section.

## Routes

| URL | Source | Function and dependencies | Presentation |
| --- | --- | --- | --- |
| / | app/page.tsx | Products API, carousel, service links | Reference homepage |
| /products | app/products/page.tsx | Products API; search, category, brand, sort, pagination | Catalogue sidebar/grid |
| /products/[id] | app/products/[id]/page.tsx | Product details and cart APIs | Product image/details/purchase panel |
| /login | app/login/page.tsx | Login/register APIs, session, cart | Supplied two-column screenshots |
| /signup | app/signup/page.tsx | Redirect to signup mode | Shared auth presentation |
| /verify-email | app/verify-email/page.tsx | Email verification API | Shared status card |
| /checkout | app/checkout/page.tsx | Account address, cart, orders, payment APIs | Shared header/font and existing checkout form |
| /orders | app/orders/page.tsx | Orders API | Shared account cards |
| /labs | app/labs/page.tsx | Existing local test data and demo scheduling | Reference lab hero, needs, test cards |
| /doctors | app/doctors/page.tsx | Existing local doctors and demo scheduling | Reference hero, filters, doctors, FAQ |
| /consultation/[id] | app/consultation/[id]/page.tsx | Existing consultation/Jitsi flow | Shared workflow styles |
| /profile/reports | app/profile/reports/page.tsx | Existing local reports | Shared workflow styles |
| /admin/pharmacist | app/admin/pharmacist/page.tsx | Existing local prescription workflow | Shared workflow styles |
| /dashboard | app/dashboard/page.tsx | Redirect home | Shared homepage |
| /ayurveda | app/ayurveda/page.tsx | Local herb imagery, catalogue links | Reference herb rows |
| /cancer-care | app/cancer-care/page.tsx | Local reference imagery/service links | Pink hero, resource sections |
| /care-plan | app/care-plan/page.tsx | Informational benefits, existing service links | Family hero, benefits, FAQ |
| /partnerships | app/partnerships/page.tsx | Informational navigation | Floral reference hero |
| /partnerships/corporate-wellness | app/partnerships/corporate-wellness/page.tsx | Informational navigation | Blue corporate reference hero |
| /help | app/help/page.tsx | Service navigation | Shared information cards |
| /terms | app/terms/page.tsx | Demo information | Shared information layout |
| /privacy | app/privacy/page.tsx | Demo information | Shared information layout |

## Backend and database

Express and PostgreSQL remain the runtime architecture. The product lookup previously used one parameter as both UUID and text, causing HTTP 500. It now selects the ID or slug column according to the supplied identifier, retaining parameterized values and the existing endpoint contract. The backend was restarted from this project directory after its watcher failed to reload changes.

The database initially contained no products. The project's existing 24 seed products were inserted with conflict-ignore behavior; existing records were not overwritten. No reference business data was scraped. A temporary verified QA account, cart and saved address were created for testing and removed afterward.

No MongoDB/Mongoose runtime imports were found during the audit. MongoDB removal changes already existed in the working tree. This work does not establish that historical MongoDB records were migrated: no historical database comparison was performed. Unrelated existing working-tree edits were preserved.

## Checks actually performed

- `npm.cmd run build`: passed, including TypeScript and static route generation.
- `npm.cmd run lint`: zero errors, 20 remaining raw-image optimization warnings.
- Chrome desktop screenshots of the homepage, products, login/signup, labs, doctors, Ayurveda, Care Plan, Cancer Care and partnership layouts; mobile checks for homepage, auth, products, product details, labs, Cancer Care, Care Plan and corporate wellness; tablet homepage check. Reference and local screenshots are in this directory.
- No page-wide overflow was reported by those layout checks. No runtime exceptions were reported in the successful local captures.
- Mobile menu and header search interaction passed. Login-to-signup switch passed. A combined auth-step browser automation attempt stalled; it is not counted as a passed check.
- HTTP checks of 65 local image URLs collected from the inspected pages: all successful. Offscreen lazy images were checked by URL as well.
- `node scripts/api-smoke.cjs`: health, unauthenticated cart rejection, product search, ascending-price sorting, UUID and slug details, missing-product 404, login, current user, cart add/quantity/read/remove, saved-address write/read, order retrieval, logout and subsequent authentication rejection all passed.

## Remaining limits

- Screenshot OTP copy was adapted to the existing email/password authentication contract. SMS OTP was not implemented.
- Live registration email delivery, real payment execution, a paid order, authenticated checkout browser submission and video-call connectivity were not tested. No emails or payments were sent by these checks.
- Labs and doctor scheduling remain the project's local demo flows. Care Plan purchasing and corporate onboarding have no backing service and are informational.
- Historical MongoDB data migration is unverified.
- Next.js emits its existing middleware-to-proxy deprecation warning. Raw local images generate 20 optimization warnings, with no lint errors.
- Some reference content and lower-page sections are simplified to fit the application's available data; the result is not an exact full-site clone.

## Start the correct project

Working directory for both commands:

```powershell
Set-Location 'C:\Users\admin\Desktop\1mg clone_1\mgclone\1mg clone'
```

Frontend in one terminal:

```powershell
npm.cmd run dev
```

Backend in another terminal:

```powershell
npm.cmd run backend:dev
```

Frontend: http://localhost:3000 . API health: http://localhost:5000/api/health . Both were running at handoff; do not start duplicate instances. If the browser still displays an old page, verify port 3000 belongs to this folder, then hard-refresh. Production frontend requires `npm.cmd run build` followed by `npm.cmd start`.
