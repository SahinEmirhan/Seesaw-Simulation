# Seesaw Simulation

Interactive playground physics built with nothing but vanilla HTML, CSS, and JavaScript. Every click on the plank drops a randomly weighted object (1–10 kg), updates the torque balance, and animates the seesaw into its new equilibrium. State is saved in `localStorage`, so the scene survives page refreshes.

> **Live demo:** `https://sahinemirhan.github.io/Seesaw-Simulation/`

---

## Highlights
- Real-time torque calculation (`Σ weight × distance`) with ±30° angle clamp for believable motion.
- MVC architecture: `SeesawModel` (state + physics), `SeesawView` (DOM/CSS/audio), `SeesawController` (event orchestration).
- Smooth CSS-driven tilt animation plus drop sound feedback (`public/sounds/drop.wav`).
- Cursor hover preview of the upcoming weight, including a dashed marker for distance awareness.
- Running log of every drop for quick debugging or narration in the submission video.
- Reset button that clears DOM, state, audio cues, and persists the clean slate.

---

## How It Works
1. **User input** – `mousemove` over the plank previews the currently queued weight; `click` locks it in.
2. **Model update** – `SeesawModel` records the mass on the correct side (or pivot), keeps running totals, and recomputes torque/angle.
3. **View update** – `SeesawView` adds a colored circle at the exact plank coordinate, plays the drop audio, animates the plank tilt, updates the dashboard, and appends a log entry.
4. **Persistence** – the full snapshot (weights, totals, torque, angle, next weight, log) is serialized into `localStorage` under `seesawState`. On load the controller hydrates the scene from that snapshot.

---

## Physics & Design Decisions
- **Torque model** – Net torque is stored as an accumulator (`torque += weight * xCoord`) rather than recalculating the whole set each frame. With every drop we already know the new moment contribution, so this keeps the logic simple and cheap.
- **Angle clamping** – We map torque directly to degrees with a `/10` scaling factor, then clamp to ±30° to avoid cartoonish rotations while keeping the motion readable for the eye.
- **Coordinate system** – `xCoord` is measured in pixels from the pivot (`0` center, negative left, positive right). Before storing we clamp clicks to the physical plank length so no object can float off-plank.
- **Interaction fidelity** – The hover preview (ghost weight + vertical marker) makes distance visible, helping users intentionally balance the board instead of guessing.

---

## File Structure
```
.
├── index.html          # Scene markup, dashboard, and control wiring
├── style.css           # Layout + animations for the board, weights, and log
├── main.js             # Entry point that boots the controller
├── public/
│   └── sounds/drop.wav # Subtle drop effect for tactile feedback
└── src/
    ├── SeesawModel.js       # Physics + persistence
    ├── SeesawView.js        # DOM updates, CSS variables, audio, logs
    └── SeesawController.js  # Event binding and data flow coordination
```

---



## Design Choices & Trade-offs
- **Incremental torque** – Updating net torque in O(1) per drop scales better than re-summing every object (O(n)) as the scene grows, so large piles stay responsive without constant recomputation.
- **Angle easing** – A CSS transition communicates motion clearly without building a heavier physics loop, so the UI remains responsive.
- **Pointer-first input** – Limiting interaction to plank clicks mirrors the brief and avoids extra UI chrome that could distract from the lever mechanic.
- **Weight-driven visuals** – Sizes and colors scale with mass to convey load distribution instantly, even when markers overlap.
- **State storage** – Each state snapshot (weights, totals, torque, logs, next weight) is written straight into `localStorage` so refreshes resurrect the exact scene.

---



## AI Usage
- Core application code was authored manually.
- ChatGPT was consulted for debugging tips, validating architectural decisions, and brainstorming fixes for minor animation glitches.
- This README was produced with AI assistance (ChatGPT via Codex CLI) to summarize the implementation succinctly.

