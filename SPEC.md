# KernelPulse - Hardware & CUDA Benchmark Lab

## Project option
Lab booking.

## Goals
- A systems engineer signs in, views target hardware nodes (CPUs, GPUs, embedded boards), and logs or reserves profiling runs.
- An administrator registers compute nodes with wattage limits and reviews all benchmark execution logs.

## Non-goals
- No cloud billing or payment gateway: all compute benchmarking resources are free internal testbenches.
- No email or push notifications: engineers check benchmark statuses directly via the web dashboard or CLI.
- No mobile native application: one responsive web UI that renders cleanly across desktop and mobile browsers.

## Constraints
- Node.js with Express backend, SQLite database, and plain HTML and JavaScript on the frontend.
- Passwords are encrypted with bcrypt and never stored as readable plaintext.

## The model feature
Model: Gemini 2.5 Flash, called from src/services/profiler.js
Input: raw terminal logs, nvprof outputs, or compiler execution summaries uploaded or pasted by the engineer.
Output: extracted runtime metrics (kernel execution ms, memory throughput, wattage) and optimization advice.
When it fails: timeouts, 429 rate limits, or missing API keys leave form fields blank with a warning banner for manual entry; no records are saved without clicking Submit.

## Auth
Local: email and password authentication stored as bcrypt hashes in the database.
Provider: Sign in with Google using OAuth 2.0 authorization-code flow on the server.
Linking: matched on verified Google account email and ID; unverified addresses are never linked to existing accounts.

## MCP tools
| Tool | What it does | Who may call it |
| --- | --- | --- |
| list_hardware_nodes | Lists registered compute targets with their architecture, memory capacity, and wattage envelope. | Any signed-in user |
| query_profiling_runs | Returns historical CPU and CUDA profiling runs for the authenticated session, including execution time and wattage. | Any signed-in user |
| log_benchmark_run | Records new benchmark metrics to the SQLite database, validating that values fit within node wattage limits. | Systems engineer |

## UI
Plain HTML and vanilla JavaScript. Three screens: sign in (/login), hardware nodes list (/nodes), and benchmark run submission form (/runs/new). The checklist lives in docs/UI.md.

## Acceptance criteria
[AC-1] A signed-in engineer who opens /nodes sees only active hardware targets with architecture, memory, and wattage limits.
[AC-2] An engineer who logs a benchmark run exceeding the target node's maximum TDP wattage receives a 409 Conflict error.
[AC-3] An administrator who views /runs sees all recorded runs, while a regular engineer sees only their own benchmarks.
[AC-4] An engineer submitting a benchmark without specifying execution time receives a 422 Unprocessable Entity error.
[AC-5] Signing in with Google using an email that already has a local password account links to that existing record without creating a second user.
[AC-6] With no GEMINI_API_KEY configured, uploading a log leaves form fields editable with a warning banner rather than throwing a 500 error.
[AC-7] The MCP tool log_benchmark_run rejects an invalid hardware ID with the same error message returned by the REST API.
[AC-8] Deleting a profiling run frees the reserved hardware time slot, allowing new benchmark logs to be recorded.

### Slice 1: sign-in and hardware nodes list
[AC-9] A visitor who opens /nodes without signing in is redirected to /login with a 302 redirect.
[AC-10] After signing in with a seeded account, /nodes displays the three seeded hardware targets with name, architecture, memory, and wattage limits formatted in Watts.
[AC-11] Deleting one node row directly in the database and reloading /nodes removes that node from the rendered table.

## Traceability
| Criterion | Test |
| --- | --- |
| [AC-1] | (from Exercise 3) |
| [AC-2] | (from Exercise 3) |
| [AC-3] | (from Exercise 3) |
| [AC-4] | (from Exercise 3) |
| [AC-5] | (from Exercise 3) |
| [AC-6] | (from Exercise 3) |
| [AC-7] | (from Exercise 3) |
| [AC-8] | (from Exercise 3) |
| [AC-9] | (from Exercise 3) |
| [AC-10] | (from Exercise 3) |
| [AC-11] | (from Exercise 3) |

## Spec vs result
Passed: Local sign-in authentication, redirection of unauthenticated requests from /nodes to /login, and dynamic display of seeded hardware nodes from SQLite.
Missed: The agent omitted unit formatting on the wattage column, displaying raw numbers instead of watts.
Changed: [AC-10] was clarified to mandate explicit watt units ("W") in the UI output.