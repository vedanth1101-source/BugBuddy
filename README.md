# 🐛 BugBuddy

An AI-powered developer tool that turns a raw stack trace into a plain-English
explanation and a concrete suggested fix. Paste an error, pick the language, and
BugBuddy returns a diagnosis backed by Google's Gemini 2.5 Flash — with a
MySQL result cache in front so the same error never pays for the AI twice.

- **Frontend:** React 19 + TanStack Start on Vercel
- **Backend:** Spring Boot 3.5 / Java 21 on Railway, MySQL

---

## What it does

1. You paste a Java, Python, or JavaScript stack trace and submit.
2. The backend checks a MySQL cache for an exact match on that error text.
   - **Cache hit** → the stored analysis is returned in under ~50ms, with no AI call.
   - **Cache miss** → the error is sent to Gemini 2.5 Flash, the response is
     parsed, persisted, and returned.
3. Every triage is saved to a searchable history.

## Why it's built this way

- **Cache ahead of the model.** Gemini calls cost money and latency. An
  exact-match lookup on the error text means a repeated error is answered from
  the database, not the API — most real error streams are highly repetitive.
- **Servlet-level CORS, not `@CrossOrigin`.** The cross-origin config lives in a
  `CorsFilter` bean (`WebConfig`) that runs early in the filter chain, ahead of
  Spring MVC. A controller-level `@CrossOrigin` annotation sat too late in the
  chain to resolve the preflight conflict this app hit.
- **Two-layer payload guard.** A 5,000-character limit is enforced independently
  on both the client and the server, so the server never trusts the client to
  have checked.
- **Cost protection on the one endpoint that spends money.** `POST /api/bugs/analyze`
  is the only endpoint that can reach Gemini, so it is the only one that is rate
  limited (per-IP) and can be gated behind an optional API key.

## Tech stack

| Layer | Choice |
|---|---|
| Backend | Java 21, Spring Boot 3.5 (Web, Data JPA, Validation) |
| Database | MySQL (H2 in-memory for tests) |
| AI | Google Gemini 2.5 Flash via REST |
| Frontend | React 19, TanStack Start & Router, TanStack Query, TypeScript |
| Styling | Tailwind CSS v4, Radix UI |
| Build | Maven (backend), Vite (frontend) |
| Hosting | Railway (backend), Vercel (frontend) |

## API

Base path: `/api`

| Method | Path | Description |
|---|---|---|
| `POST` | `/bugs/analyze` | Triage an error. Rate-limited; optionally API-key gated. `201` new, `200` cache hit, `400` invalid, `429` rate limited, `401` missing key |
| `GET` | `/bugs` | Paginated triage history |
| `GET` | `/bugs/search?q=` | Full-text search over past errors |
| `GET` | `/bugs/{id}` | Fetch one triage |
| `DELETE` | `/bugs/{id}` | Delete a triage |

## Running locally

### Backend (port 8080)

Requires Java 21, Maven, and a MySQL instance. Configuration is entirely
environment-driven — no credential is ever committed.

```bash
export MYSQLHOST=localhost MYSQLPORT=3306 MYSQLDATABASE=bugbuddy
export MYSQLUSER=root MYSQLPASSWORD=yourpassword
export GEMINI_API_KEY=your_gemini_key
mvn spring-boot:run
```

| Variable | Purpose | Default |
|---|---|---|
| `MYSQLHOST` / `MYSQLPORT` / `MYSQLDATABASE` | Database connection | `localhost` / `3306` / `bugbuddy` |
| `MYSQLUSER` / `MYSQLPASSWORD` | Database credentials | `root` / `password` |
| `GEMINI_API_KEY` | Google Gemini API key (required for live analysis) | — |
| `BUGBUDDY_API_KEY` | If set, `POST /bugs/analyze` requires `X-API-Key` | disabled |
| `bugbuddy.rate-limit.requests-per-minute` | Per-IP limit on analyze | `10` |
| `PORT` | Server port | `8080` |

### Frontend (port 5173)

```bash
cd frontend
npm install
npm run dev
```

Point the frontend at a backend with `VITE_API_BASE_URL` (defaults to the
deployed Railway URL). The production build targets Vercel's Build Output API:

```bash
npm run build      # emits .vercel/output
```

## Tests

```bash
mvn test
```

17 tests across a `@WebMvcTest` controller slice and Mockito service unit
tests, covering the cache hit/miss paths, the server-side payload-size
rejection, request validation, and 404 handling.

## License

MIT
