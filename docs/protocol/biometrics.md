# BIOMETRIC_MONITOR

System continually tracks user biological feedback via `<BiometricMonitor />`.

## METRICS TRACKED
1. **HR_BPM (Heart Rate):** - Normal: 70-90 BPM.
   - Panic: > 110 BPM (Triggers `animate-ping` on icon).
2. **NEURAL_SYNC:** - Connection stability with the hive mind. Drops as stress rises.
3. **STRESS_LVL:** - The most critical metric. Controls system stability.

## CRITICAL_FAILURE (BSOD)
If `STRESS_LVL` hits **99%**, the `triggerCrash()` function is executed.

**Sequence:**
1. Audio: `playSound('error')`.
2. UI: Blue Screen of Death (BSOD) overlay appears.
3. Reboot: System forces a restart after 4 seconds.

> **WARNING:** Do not click the Avatar excessively. Each click adds **+20 Stress**.