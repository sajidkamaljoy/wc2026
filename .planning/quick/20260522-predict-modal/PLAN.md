# Quick Task: Make Predictions Option a Modal Dialog

We will replace the inline prediction input widget in the scheduled fixture cards with a beautifully styled "Make a Pick" button and a premium modal dialog containing the prediction controls.

## Proposed Changes

### Frontend Components

#### [NEW] [PredictionModal.tsx](file:///c:/Off%20work/wc2026/components/fixtures/PredictionModal.tsx)
Create a new reusable modal component for match predictions.
- **Glassmorphism Backdrop:** Utilize `backdrop-blur-md` and `bg-slate-950/80` for a premium modal overlays.
- **Scale/Fade Animation:** Apply Tailwind/CSS transitions for opening and closing.
- **Close Triggers:** Close on clicking the backdrop, close button (`x`), or pressing `ESC`.
- **Match Branding:** Display large team flags and names, kickoff countdown, and prediction inputs in a beautifully balanced design.

#### [MODIFY] [PredictionInput.tsx](file:///c:/Off%20work/wc2026/components/fixtures/PredictionInput.tsx)
- Support an `onSave?: (homeScore: number, awayScore: number) => void` callback prop to notify the parent when a pick is saved.
- Remove standard inline borders and adjust layout padding/styling to fit beautifully inside the modal dialog context.

#### [MODIFY] [FixtureCard.tsx](file:///c:/Off%20work/wc2026/components/fixtures/FixtureCard.tsx)
- Replace the inline `<PredictionInput />` rendering.
- If match is scheduled, render a premium action button at the bottom of the card:
  - If no prediction exists: render a "Predict Score" or "Make a Pick" button with a modern border-gradient.
  - If a prediction is already saved: render an "Edit Pick" button displaying the saved scoreline (e.g. `Your Pick: 3 – 1` in sky-400).
- Manage modal state (`isModalOpen`) and keep track of predictions reactively with a local state `localPrediction` updated via the prediction callback, so the UI updates instantly without requiring page reloads!

---

## Verification Plan

### Manual Verification
- Run the Next.js dev server.
- Verify scheduled matches show the prediction action button with correct states (new vs edited).
- Verify clicking the button displays a gorgeous glassmorphic modal overlay.
- Test score adjustment, keyboard `ESC` closer, backdrop clicking closer, and saving a prediction.
- Verify saving a prediction reactively updates the card button state immediately without page reload.
