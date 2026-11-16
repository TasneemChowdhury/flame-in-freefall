# Flame in Freefall — Frontend

The React/Vite dashboard prototype for exploring NASA microgravity combustion research and its relevance to fire safety in crewed space environments.

## Run locally

From the `client` directory:

```bash
npm install
npm run dev
```

The interface can load investigation data from the backend. SI cross-synthesis uses the configured API when available and falls back to a deterministic prototype response otherwise.

## Prototype behavior

- Search investigations by name, project, safety focus, fuel, hardware, and tags.
- Filter by prevention, detection, or suppression.
- Select an investigation to see its brief and fire-safety context.
- Use the cross-experiment SI synthesis tool in the comparison matrix.

Relevance scores and research summaries are prototype content, not NASA-published rankings or official interpretations.
