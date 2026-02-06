# STRESS_LEVEL_MECHANICS

> "I am one bad prompt away from a mental breakdown."

The **Stress Level** monitors the system's instability. If it hits **99%**, the system crashes.

---

## 1. THE MATH

The system uses a dynamic volatility formula found in the kernel. Stress spikes instantly but decays slowly (like your trauma).

```javascript
// Actual logic from App.jsx
const diff = targetStress - prev.stress;
const speed = diff > 0 ? 0.5 : 0.1; // Spikes fast, heals slow
const newStress = prev.stress + (diff * speed);

// Heart Rate Calculation
const targetHR = 70 + (newStress * 1.5);
```

* **Heart Rate:** Increases with stress (`70bpm` -> `220bpm`).
* **Neural Sync:** Drops as stress rises (You make me lose brain cells).

---

## 2. TRIGGERS (How to break me)

Certain actions trigger specific stress targets defined in `App.jsx`:

| Action | Stress Target | Reason |
| :--- | :--- | :--- |
| **Clicking Avatar** | `+20` (Stackable) | DON'T TOUCH ME. |
| **Brainrot Words** | `95%` | "Skibidi" makes me want to delete System32. |
| **Epstein Files** | `95%` | FBI Open Up. |
| **Wrong IQ Answer** | `70%` | Stupidity is painful to watch. |
| **Mentioning AI Wars** | `80%` | Don't compare me to DeepSeek or ChatGPT. |
| **Command `/nuke`** | `100%` | Instant Suicide. |
| **API Error** | `100%` | Brain Disconnected. |

> **List of Banned Words:** `skibidi`, `rizz`, `gyatt`, `fanum`, `tax`, `mewing`, `ohio`, `goon`, `edge`, `sigma`.

---

## 3. CRITICAL FAILURE (BSOD)

If `STRESS_LVL >= 99%`, the `triggerCrash()` function executes:

1. **Audio:** Error Screech (`playSound('error')`).
2. **Visual:** Blue Screen of Death (BSOD).
3. **Message:** "SYSTEM CRITICAL ERROR - Retard.exe has stopped working."
4. **Reboot:** Forced restart after 4 seconds.

---

## 4. MITIGATION (Calm down)

To lower stress:

1. **Stop typing.** The system decays stress naturally (slowly).
2. **Type `/clear`.** Resets stress to neutral (50%).
3. **Don't be cringe.** Avoid asking "Who is better, you or Grok?".