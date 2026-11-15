# Flame in Freefall — Frontend

The React/Vite dashboard prototype for exploring NASA microgravity combustion research and its relevance to fire safety in crewed space environments.

## Run locally

From the `client` directory:

```bash
npm install
npm run dev
```

The prototype currently uses local sample data in `src/App.jsx`; it does not yet request investigation data or SI responses from the backend.

## Prototype behavior

- Search investigations by name, project, safety focus, fuel, hardware, and tags.
- Filter by prevention, detection, or suppression.
- Select an investigation to see its brief and fire-safety context.
- Try the SI preview, which returns a local placeholder response.

Relevance scores and research summaries are prototype content, not NASA-published rankings or official interpretations. Replace the sample data and placeholder response with the backend/API contract when it is ready.
