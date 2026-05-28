import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useRouterState, L as Link } from "../_libs/tanstack__react-router.mjs";
const NAV_ITEMS = [
  { to: "/", label: "Analyse" },
  { to: "/history", label: "History" }
];
function Navbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-40 w-full border-b border-slate-200 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:border-slate-800 dark:bg-slate-950/85 dark:supports-[backdrop-filter]:bg-slate-950/70", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "nav",
    {
      "aria-label": "Primary",
      className: "mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: "/",
            className: "font-bold tracking-tight text-lg text-slate-900 dark:text-white",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": "true", children: "🐛" }),
              " BugBuddy"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "flex items-center gap-1 sm:gap-2", children: NAV_ITEMS.map((item) => {
          const isActive = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          return /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Link,
            {
              to: item.to,
              className: [
                "relative inline-flex items-center px-3 py-2 text-sm font-medium transition-colors duration-200",
                isActive ? "text-blue-700 dark:text-blue-400" : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              ].join(" "),
              children: [
                item.label,
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: [
                      "absolute inset-x-2 -bottom-px h-0.5 rounded-full transition-colors duration-200",
                      isActive ? "bg-blue-600 dark:bg-blue-400" : "bg-transparent"
                    ].join(" ")
                  }
                )
              ]
            }
          ) }, item.to);
        }) })
      ]
    }
  ) });
}
const LANGUAGES = ["Java", "Python", "JavaScript"];
const SAMPLE_ERRORS = [
  {
    language: "Java",
    errorText: 'java.lang.NullPointerException: Cannot invoke "String.length()" because "name" is null\n	at com.bugbuddy.UserService.greet(UserService.java:42)',
    aiExplanation: "A NullPointerException was raised because the `name` parameter passed into `UserService.greet` was null when the runtime attempted to invoke `length()` on it. In Java, dereferencing a null reference always triggers this exception. The most likely root cause is an upstream caller (controller or test) forgetting to populate the `name` field before invoking the service method.",
    suggestedFix: 'public String greet(String name) {\n    Objects.requireNonNull(name, "name must not be null");\n    return "Hello, " + name + "! Length=" + name.length();\n}'
  },
  {
    language: "Python",
    errorText: 'Traceback (most recent call last):\n  File "app.py", line 17, in <module>\n    total = sum(values) / len(values)\nZeroDivisionError: division by zero',
    aiExplanation: "Python raised a ZeroDivisionError because `len(values)` evaluated to zero, meaning the `values` list was empty at the point of the average calculation. Dividing by zero is undefined and Python guards against it at runtime.",
    suggestedFix: 'if not values:\n    raise ValueError("values must not be empty")\ntotal = sum(values) / len(values)'
  },
  {
    language: "JavaScript",
    errorText: "TypeError: Cannot read properties of undefined (reading 'map')\n    at Dashboard (Dashboard.tsx:24:18)",
    aiExplanation: "React rendered `Dashboard` before the asynchronously-loaded `items` prop had resolved, so `items` was `undefined` when `.map` was called on it. Array methods cannot be invoked on `undefined`, hence the TypeError.",
    suggestedFix: "const rows = (items ?? []).map((item) => (\n  <Row key={item.id} item={item} />\n));"
  },
  {
    language: "Java",
    errorText: "org.springframework.dao.DataIntegrityViolationException: could not execute statement; SQL [n/a]; constraint [uk_user_email]",
    aiExplanation: "A persistence attempt violated the unique constraint `uk_user_email` on the `users` table. Hibernate translated the underlying SQL exception into a `DataIntegrityViolationException`. The repository tried to insert a user whose email already exists in the database.",
    suggestedFix: 'if (userRepository.existsByEmail(dto.getEmail())) {\n    throw new ConflictException("Email already registered");\n}\nuserRepository.save(user);'
  },
  {
    language: "Python",
    errorText: `django.db.utils.OperationalError: (1045, "Access denied for user 'app'@'localhost' (using password: YES)")`,
    aiExplanation: "Django could not authenticate against MySQL using the credentials in `DATABASES['default']`. Either the password is wrong, the user does not have privileges on the target database, or the host portion of the user grant does not match the connecting host.",
    suggestedFix: "# settings.py\nDATABASES = {\n    'default': {\n        'ENGINE': 'django.db.backends.mysql',\n        'NAME': os.environ['DB_NAME'],\n        'USER': os.environ['DB_USER'],\n        'PASSWORD': os.environ['DB_PASSWORD'],\n        'HOST': os.environ.get('DB_HOST', '127.0.0.1'),\n    }\n}"
  },
  {
    language: "JavaScript",
    errorText: "UnhandledPromiseRejectionWarning: FetchError: request to https://api.example.com/v1/users failed, reason: connect ECONNREFUSED",
    aiExplanation: "Node attempted to open a TCP connection to `api.example.com` but the remote host actively refused it. The promise returned by `fetch` rejected and was never `.catch`-ed, surfacing as an unhandled rejection warning. The downstream service is likely down or blocked by a firewall.",
    suggestedFix: "try {\n  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });\n  if (!res.ok) throw new Error(`HTTP ${res.status}`);\n  return await res.json();\n} catch (err) {\n  logger.error({ err }, 'users API unreachable');\n  throw new ServiceUnavailableError('users API');\n}"
  },
  {
    language: "Java",
    errorText: "java.util.ConcurrentModificationException\n	at java.base/java.util.ArrayList$Itr.checkForComodification(ArrayList.java:1042)",
    aiExplanation: "An ArrayList was structurally modified (an element added or removed) while it was being iterated via its iterator. The fail-fast iterator detected the modification count mismatch and threw `ConcurrentModificationException` to prevent undefined behavior.",
    suggestedFix: "Iterator<Item> it = items.iterator();\nwhile (it.hasNext()) {\n    Item item = it.next();\n    if (item.isExpired()) {\n        it.remove();\n    }\n}"
  },
  {
    language: "Python",
    errorText: "ModuleNotFoundError: No module named 'requests'",
    aiExplanation: "Python could not find the `requests` package on `sys.path`. Either the dependency has not been installed into the active interpreter / virtualenv, or the script is running under a different Python than the one where `requests` is installed.",
    suggestedFix: "python -m pip install requests\n# or with Poetry\npoetry add requests"
  },
  {
    language: "JavaScript",
    errorText: `SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON`,
    aiExplanation: "The frontend called `response.json()` on an HTTP response whose body was actually HTML (typically a 404 page or a dev-server fallback). The JSON parser hit `<` as the first non-whitespace character and aborted.",
    suggestedFix: "const res = await fetch('/api/data');\nconst ct = res.headers.get('content-type') ?? '';\nif (!ct.includes('application/json')) {\n  throw new Error(`Expected JSON, got ${ct}`);\n}\nreturn res.json();"
  },
  {
    language: "Java",
    errorText: "java.lang.OutOfMemoryError: Java heap space",
    aiExplanation: "The JVM exhausted its configured maximum heap. Either the workload genuinely needs more memory than `-Xmx` allows, or the application is leaking references (caches without bounds, listeners never unregistered, growing static collections).",
    suggestedFix: "# Increase heap and enable a heap dump on OOM for diagnostics\njava -Xms512m -Xmx2g \\\n     -XX:+HeapDumpOnOutOfMemoryError \\\n     -XX:HeapDumpPath=/var/log/app/heapdump.hprof \\\n     -jar app.jar"
  },
  {
    language: "Python",
    errorText: "KeyError: 'user_id'",
    aiExplanation: "A dictionary lookup `d['user_id']` was performed on a dict that did not contain the `user_id` key. Python raises `KeyError` rather than returning a default. The caller is assuming a field that the producer did not supply.",
    suggestedFix: `user_id = payload.get('user_id')
if user_id is None:
    raise ValidationError("user_id is required")`
  },
  {
    language: "JavaScript",
    errorText: "Error: Hydration failed because the initial UI does not match what was rendered on the server.",
    aiExplanation: "The HTML produced during server-side rendering does not match what React rendered on the client during hydration. Common causes: rendering `Date.now()` / `Math.random()` at module scope, reading `window`/`localStorage` during render without a guard, or conditionally rendering based on user-agent.",
    suggestedFix: "const [mounted, setMounted] = useState(false);\nuseEffect(() => setMounted(true), []);\nif (!mounted) return null; // render client-only content after hydration\nreturn <ClientOnlyWidget />;"
  }
];
function buildRecord(index, isCached) {
  const base = SAMPLE_ERRORS[index % SAMPLE_ERRORS.length];
  const createdAt = new Date(Date.now() - index * 1e3 * 60 * 37).toISOString();
  return {
    id: index + 1,
    ...base,
    isCached,
    createdAt
  };
}
const MOCK_DATASET = Array.from(
  { length: 47 },
  (_, i) => buildRecord(i, i % 4 === 0)
);
function mockAnalyze(req) {
  const match = SAMPLE_ERRORS.find(
    (s) => s.language === req.language && req.errorText.toLowerCase().includes(s.errorText.split("\n")[0].slice(0, 12).toLowerCase())
  ) ?? SAMPLE_ERRORS.find((s) => s.language === req.language) ?? SAMPLE_ERRORS[0];
  const isCached = Math.random() < 0.35;
  return {
    id: Math.floor(Math.random() * 1e5) + 1e3,
    errorText: req.errorText,
    language: req.language,
    aiExplanation: match.aiExplanation,
    suggestedFix: match.suggestedFix,
    isCached,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
function mockPaginate(page, size, query) {
  const q = (query ?? "").trim().toLowerCase();
  const filtered = q ? MOCK_DATASET.filter(
    (r) => r.errorText.toLowerCase().includes(q) || r.aiExplanation.toLowerCase().includes(q) || r.language.toLowerCase().includes(q)
  ) : MOCK_DATASET;
  const totalElements = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));
  const safePage = Math.min(Math.max(0, page), totalPages - 1);
  const start = safePage * size;
  const content = filtered.slice(start, start + size);
  return {
    content,
    page: safePage,
    size,
    totalElements,
    totalPages
  };
}
const API_BASE_URL = "http://localhost:8080";
class ServiceUnavailableError extends Error {
  constructor(message = "AI Triage Service temporarily unavailable") {
    super(message);
    this.name = "ServiceUnavailableError";
  }
}
function isNetworkUnreachable(err) {
  if (err instanceof TypeError) return true;
  if (err instanceof DOMException && err.name === "AbortError") return true;
  if (err instanceof Error) {
    const m = err.message.toLowerCase();
    return m.includes("failed to fetch") || m.includes("networkerror") || m.includes("load failed") || m.includes("econnrefused");
  }
  return false;
}
async function safeFetch(input, init) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3500);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
async function analyzeBug(req) {
  try {
    const res = await safeFetch(`${API_BASE_URL}/api/bugs/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(req)
    });
    if (res.status === 503) {
      throw new ServiceUnavailableError();
    }
    if (!res.ok) {
      throw new Error(`Analyze failed: HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    if (err instanceof ServiceUnavailableError) throw err;
    if (isNetworkUnreachable(err)) {
      await new Promise((r) => setTimeout(r, 650));
      return mockAnalyze(req);
    }
    throw err;
  }
}
async function fetchBugHistory(page, size = 10) {
  try {
    const res = await safeFetch(`${API_BASE_URL}/api/bugs?page=${page}&size=${size}`);
    if (!res.ok) throw new Error(`History failed: HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    if (isNetworkUnreachable(err)) {
      await new Promise((r) => setTimeout(r, 250));
      return mockPaginate(page, size);
    }
    throw err;
  }
}
async function searchBugs(query, page = 0, size = 10) {
  try {
    const url = `${API_BASE_URL}/api/bugs/search?q=${encodeURIComponent(query)}`;
    const res = await safeFetch(url);
    if (!res.ok) throw new Error(`Search failed: HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      const totalPages = Math.max(1, Math.ceil(data.length / size));
      const safePage = Math.min(Math.max(0, page), totalPages - 1);
      return {
        content: data.slice(safePage * size, safePage * size + size),
        page: safePage,
        size,
        totalElements: data.length,
        totalPages
      };
    }
    return data;
  } catch (err) {
    if (isNetworkUnreachable(err)) {
      await new Promise((r) => setTimeout(r, 250));
      return mockPaginate(page, size, query);
    }
    throw err;
  }
}
function Spinner({ className, label = "Loading" }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "svg",
    {
      className: ["animate-spin", className ?? "h-4 w-4"].join(" "),
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      viewBox: "0 0 24 24",
      role: "status",
      "aria-label": label,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "circle",
          {
            className: "opacity-25",
            cx: "12",
            cy: "12",
            r: "10",
            stroke: "currentColor",
            strokeWidth: "4"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "path",
          {
            className: "opacity-90",
            fill: "currentColor",
            d: "M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          }
        )
      ]
    }
  );
}
function ErrorBanner({ message, onDismiss }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      role: "alert",
      "aria-live": "assertive",
      className: "flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "svg",
          {
            className: "mt-0.5 h-5 w-5 flex-shrink-0",
            viewBox: "0 0 20 20",
            fill: "currentColor",
            "aria-hidden": "true",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "path",
              {
                fillRule: "evenodd",
                d: "M18 10A8 8 0 11.999 9.999 8 8 0 0118 10zM9 5a1 1 0 012 0v5a1 1 0 11-2 0V5zm1 9a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z",
                clipRule: "evenodd"
              }
            )
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "flex-1 font-medium", children: message }),
        onDismiss && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: onDismiss,
            className: "rounded-md p-1 text-red-700 transition-colors hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-900/40",
            "aria-label": "Dismiss alert",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-4 w-4", viewBox: "0 0 20 20", fill: "currentColor", "aria-hidden": "true", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 10-1.06-1.06L10 8.94 6.28 5.22z" }) })
          }
        )
      ]
    }
  );
}
export {
  ErrorBanner as E,
  LANGUAGES as L,
  Navbar as N,
  ServiceUnavailableError as S,
  Spinner as a,
  analyzeBug as b,
  fetchBugHistory as f,
  searchBugs as s
};
