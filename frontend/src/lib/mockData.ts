import type { BugAnalysis, AnalyzeRequest, PaginatedBugs } from "./types";

/**
 * Deterministic mock dataset used as a transparent fallback when the
 * Spring Boot API at localhost:8080 cannot be reached from the Lovable
 * cloud preview (mixed-content / sandbox boundary).
 *
 * Once the project is exported and the API is reachable, the real
 * network response replaces these objects without any UI change.
 */

const LANGUAGES = ["Java", "Python", "JavaScript"] as const;

const SAMPLE_ERRORS: ReadonlyArray<Omit<BugAnalysis, "id" | "createdAt" | "isCached">> = [
  {
    language: "Java",
    errorText:
      "java.lang.NullPointerException: Cannot invoke \"String.length()\" because \"name\" is null\n\tat com.bugbuddy.UserService.greet(UserService.java:42)",
    aiExplanation:
      "A NullPointerException was raised because the `name` parameter passed into `UserService.greet` was null when the runtime attempted to invoke `length()` on it. In Java, dereferencing a null reference always triggers this exception. The most likely root cause is an upstream caller (controller or test) forgetting to populate the `name` field before invoking the service method.",
    suggestedFix:
      "public String greet(String name) {\n    Objects.requireNonNull(name, \"name must not be null\");\n    return \"Hello, \" + name + \"! Length=\" + name.length();\n}",
  },
  {
    language: "Python",
    errorText:
      "Traceback (most recent call last):\n  File \"app.py\", line 17, in <module>\n    total = sum(values) / len(values)\nZeroDivisionError: division by zero",
    aiExplanation:
      "Python raised a ZeroDivisionError because `len(values)` evaluated to zero, meaning the `values` list was empty at the point of the average calculation. Dividing by zero is undefined and Python guards against it at runtime.",
    suggestedFix:
      "if not values:\n    raise ValueError(\"values must not be empty\")\ntotal = sum(values) / len(values)",
  },
  {
    language: "JavaScript",
    errorText:
      "TypeError: Cannot read properties of undefined (reading 'map')\n    at Dashboard (Dashboard.tsx:24:18)",
    aiExplanation:
      "React rendered `Dashboard` before the asynchronously-loaded `items` prop had resolved, so `items` was `undefined` when `.map` was called on it. Array methods cannot be invoked on `undefined`, hence the TypeError.",
    suggestedFix:
      "const rows = (items ?? []).map((item) => (\n  <Row key={item.id} item={item} />\n));",
  },
  {
    language: "Java",
    errorText:
      "org.springframework.dao.DataIntegrityViolationException: could not execute statement; SQL [n/a]; constraint [uk_user_email]",
    aiExplanation:
      "A persistence attempt violated the unique constraint `uk_user_email` on the `users` table. Hibernate translated the underlying SQL exception into a `DataIntegrityViolationException`. The repository tried to insert a user whose email already exists in the database.",
    suggestedFix:
      "if (userRepository.existsByEmail(dto.getEmail())) {\n    throw new ConflictException(\"Email already registered\");\n}\nuserRepository.save(user);",
  },
  {
    language: "Python",
    errorText:
      "django.db.utils.OperationalError: (1045, \"Access denied for user 'app'@'localhost' (using password: YES)\")",
    aiExplanation:
      "Django could not authenticate against MySQL using the credentials in `DATABASES['default']`. Either the password is wrong, the user does not have privileges on the target database, or the host portion of the user grant does not match the connecting host.",
    suggestedFix:
      "# settings.py\nDATABASES = {\n    'default': {\n        'ENGINE': 'django.db.backends.mysql',\n        'NAME': os.environ['DB_NAME'],\n        'USER': os.environ['DB_USER'],\n        'PASSWORD': os.environ['DB_PASSWORD'],\n        'HOST': os.environ.get('DB_HOST', '127.0.0.1'),\n    }\n}",
  },
  {
    language: "JavaScript",
    errorText:
      "UnhandledPromiseRejectionWarning: FetchError: request to https://api.example.com/v1/users failed, reason: connect ECONNREFUSED",
    aiExplanation:
      "Node attempted to open a TCP connection to `api.example.com` but the remote host actively refused it. The promise returned by `fetch` rejected and was never `.catch`-ed, surfacing as an unhandled rejection warning. The downstream service is likely down or blocked by a firewall.",
    suggestedFix:
      "try {\n  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });\n  if (!res.ok) throw new Error(`HTTP ${res.status}`);\n  return await res.json();\n} catch (err) {\n  logger.error({ err }, 'users API unreachable');\n  throw new ServiceUnavailableError('users API');\n}",
  },
  {
    language: "Java",
    errorText:
      "java.util.ConcurrentModificationException\n\tat java.base/java.util.ArrayList$Itr.checkForComodification(ArrayList.java:1042)",
    aiExplanation:
      "An ArrayList was structurally modified (an element added or removed) while it was being iterated via its iterator. The fail-fast iterator detected the modification count mismatch and threw `ConcurrentModificationException` to prevent undefined behavior.",
    suggestedFix:
      "Iterator<Item> it = items.iterator();\nwhile (it.hasNext()) {\n    Item item = it.next();\n    if (item.isExpired()) {\n        it.remove();\n    }\n}",
  },
  {
    language: "Python",
    errorText:
      "ModuleNotFoundError: No module named 'requests'",
    aiExplanation:
      "Python could not find the `requests` package on `sys.path`. Either the dependency has not been installed into the active interpreter / virtualenv, or the script is running under a different Python than the one where `requests` is installed.",
    suggestedFix:
      "python -m pip install requests\n# or with Poetry\npoetry add requests",
  },
  {
    language: "JavaScript",
    errorText:
      "SyntaxError: Unexpected token '<', \"<!DOCTYPE \"... is not valid JSON",
    aiExplanation:
      "The frontend called `response.json()` on an HTTP response whose body was actually HTML (typically a 404 page or a dev-server fallback). The JSON parser hit `<` as the first non-whitespace character and aborted.",
    suggestedFix:
      "const res = await fetch('/api/data');\nconst ct = res.headers.get('content-type') ?? '';\nif (!ct.includes('application/json')) {\n  throw new Error(`Expected JSON, got ${ct}`);\n}\nreturn res.json();",
  },
  {
    language: "Java",
    errorText:
      "java.lang.OutOfMemoryError: Java heap space",
    aiExplanation:
      "The JVM exhausted its configured maximum heap. Either the workload genuinely needs more memory than `-Xmx` allows, or the application is leaking references (caches without bounds, listeners never unregistered, growing static collections).",
    suggestedFix:
      "# Increase heap and enable a heap dump on OOM for diagnostics\njava -Xms512m -Xmx2g \\\n     -XX:+HeapDumpOnOutOfMemoryError \\\n     -XX:HeapDumpPath=/var/log/app/heapdump.hprof \\\n     -jar app.jar",
  },
  {
    language: "Python",
    errorText:
      "KeyError: 'user_id'",
    aiExplanation:
      "A dictionary lookup `d['user_id']` was performed on a dict that did not contain the `user_id` key. Python raises `KeyError` rather than returning a default. The caller is assuming a field that the producer did not supply.",
    suggestedFix:
      "user_id = payload.get('user_id')\nif user_id is None:\n    raise ValidationError(\"user_id is required\")",
  },
  {
    language: "JavaScript",
    errorText:
      "Error: Hydration failed because the initial UI does not match what was rendered on the server.",
    aiExplanation:
      "The HTML produced during server-side rendering does not match what React rendered on the client during hydration. Common causes: rendering `Date.now()` / `Math.random()` at module scope, reading `window`/`localStorage` during render without a guard, or conditionally rendering based on user-agent.",
    suggestedFix:
      "const [mounted, setMounted] = useState(false);\nuseEffect(() => setMounted(true), []);\nif (!mounted) return null; // render client-only content after hydration\nreturn <ClientOnlyWidget />;",
  },
];

function buildRecord(index: number, isCached: boolean): BugAnalysis {
  const base = SAMPLE_ERRORS[index % SAMPLE_ERRORS.length];
  const createdAt = new Date(Date.now() - index * 1000 * 60 * 37).toISOString();
  return {
    id: index + 1,
    ...base,
    isCached,
    createdAt,
  };
}

export const MOCK_DATASET: ReadonlyArray<BugAnalysis> = Array.from(
  { length: 47 },
  (_, i) => buildRecord(i, i % 4 === 0),
);

export function mockAnalyze(req: AnalyzeRequest): BugAnalysis {
  const match =
    SAMPLE_ERRORS.find(
      (s) =>
        s.language === req.language &&
        req.errorText
          .toLowerCase()
          .includes(s.errorText.split("\n")[0].slice(0, 12).toLowerCase()),
    ) ??
    SAMPLE_ERRORS.find((s) => s.language === req.language) ??
    SAMPLE_ERRORS[0];

  const isCached = Math.random() < 0.35;

  return {
    id: Math.floor(Math.random() * 100000) + 1000,
    errorText: req.errorText,
    language: req.language,
    aiExplanation: match.aiExplanation,
    suggestedFix: match.suggestedFix,
    isCached,
    createdAt: new Date().toISOString(),
  };
}

export function mockPaginate(page: number, size: number, query?: string): PaginatedBugs {
  const q = (query ?? "").trim().toLowerCase();
  const filtered = q
    ? MOCK_DATASET.filter(
        (r) =>
          r.errorText.toLowerCase().includes(q) ||
          r.aiExplanation.toLowerCase().includes(q) ||
          r.language.toLowerCase().includes(q),
      )
    : MOCK_DATASET;

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
    totalPages,
  };
}

export { LANGUAGES };
