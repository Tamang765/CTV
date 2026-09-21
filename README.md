# UKTV Star Wars Archive

A TypeScript and Preact Connected TV assessment application, designed on a
1920×1080 stage. Browse and search planets, people, starships, vehicles, species,
and films using a D-pad or keyboard. Norigin Spatial Navigation manages focus;
CSS Modules provide component styles.

## Run locally

Requires Node.js 22.12 or later and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. The stage scales down for smaller browser
windows; the design target is 1920×1080.

| Command             | Purpose                                              |
| ------------------- | ---------------------------------------------------- |
| `npm run dev`       | Start the development server                         |
| `npm run lint`      | Check source with ESLint                             |
| `npm run typecheck` | Check TypeScript                                     |
| `npm run build`     | Typecheck and create the production build in `dist/` |
| `npm run check`     | Run lint and the production build                    |
| `npm run preview`   | Preview the production build locally                 |

## API configuration

The only API configuration is `VITE_SWAPI_DEV_BASE`, defaulting to
`https://swapi.dev/api`. To override it, copy `.env.example` to `.env.local`,
change the value, and restart Vite. Vite embeds this public setting at build
time; rebuild after changing it for deployment.

Browsing, Home previews, search, and pagination all use this base. An alternative
base must expose SWAPI-compatible category endpoints and paginated responses
with `count`, `next`, and `results`, and allow browser requests through CORS.
Subsequent requests retain the configured base and original query, taking only
the page number from the API's next link.

## Remote and keyboard controls

| Input                                       | Behavior                                                                                         |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Arrow keys / D-pad                          | Move focus between categories, controls, and records                                             |
| Enter / OK                                  | Activate the focused control or open a record                                                    |
| Escape / BrowserBack                        | Close search or details; otherwise clear an active search, then return from the category to Home |
| Backspace                                   | Delete a character in the search keyboard; act as Back elsewhere                                 |
| Up / Down in details                        | Scroll the attributes and film opening crawl while Back stays focused                            |
| Letters, numbers, space, hyphen, apostrophe | Type into the search keyboard while it is open                                                   |

Select a category, move Right to Search, and press OK to open the on-screen
keyboard. Enter a query and choose **Show results**. Cancel discards edits.
Search is scoped to the selected category and runs on SWAPI when submitted.
Clearing it returns to browsing that category. Back on Home is left to the host.

## Data loading and engineering choices

- Browsing and search load progressively. Focusing a card near the end, focusing
  the more-results control, or scrolling near the bottom requests the next page.
  Every page remains reachable; the header shows loaded records versus the total.
- Initial requests have loading, error, retry, and empty states. A later-page
  failure preserves existing records and provides a retry for that page.
- Requests time out after 15 seconds. Changing category or query cancels obsolete
  work; request-identity checks prevent stale responses replacing current data.
  A single in-flight pagination guard prevents duplicate page requests.
- A small session cache stores the first successful unfiltered page per category.
  Home uses these pages for previews and the API's total for availability counts.
  Search results and subsequent pages are not globally cached. Reloading clears
  the cache; no persistent cache or background refresh is used.
- Preact local state owns screens and search data. Details and search render over
  the browse screen, which stays mounted, so results, scroll position, and DOM
  listeners persist while they are open.
- Norigin owns spatial navigation. Shared focus primitives register controls,
  establish boundaries, synchronize DOM focus, and reveal off-screen items.
  Stable resource IDs restore the originating card after details close.
- HTTP handling, endpoint construction, mapping, and display formatting have
  separate responsibilities. There is no global state store, router framework,
  repository layer, or custom navigation engine.
- Transportation details include name, model, manufacturer, cost in credits,
  length, crew, passengers, and cargo capacity. Two-column attributes accommodate
  longer values; a scrolling hint appears when the detail content overflows.

## Verification and limitations

Use `npm run check`, then check the application in a 1920×1080 browser with the
keyboard. No test files or testing dependencies are included.

Useful browser checks include reaching the final record of a multi-page category,
returning from details to that record, cancelling search, clearing a query and
returning Home, and retrying an initial or later-page network failure. Browser
network throttling helps inspect loading and category changes during a request.
An invalid `?category=` value should display an actionable error.

The target is keyboard-simulated CTV navigation in a modern browser. Physical
TV remote mappings and older TV browser compatibility require device validation.
Category illustrations are shared artwork, not entity-specific photography.
The public SWAPI service determines availability, result counts, and search fields.

## Delivery

The production output is static and can be hosted on a static hosting service.
No public repository or deployment URL has been verified for this workspace;
include the actual links with the assessment submission once published.

## AI assistance

OpenAI Codex assisted with the code review, API consolidation, navigation and
lifecycle fixes, removal of redundant wrappers, readability changes, documentation,
and verification of this revision. This disclosure describes the current revision;
OpenAI assisted with creating the components and CSS.

Images used from last project created by ai
