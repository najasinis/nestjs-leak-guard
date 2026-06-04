---
name: False Positive report
about: The scanner flagged code that is actually safe
labels: false-positive
---

## Pattern that triggered

<!-- e.g. missing-tenant-filter -->

## Code that was flagged (minimal example)

```typescript
// paste the code that was incorrectly flagged
```

## Why this code is safe

<!-- Explain why this is not a real issue. -->

## Expected behavior

<!-- The scanner should not flag this code because... -->

## Workaround (if any)

<!-- Did you use a disable marker? Does it work? -->

```typescript
// nestjs-leak-guard-disable-next-line <pattern-id>
// your code
```
