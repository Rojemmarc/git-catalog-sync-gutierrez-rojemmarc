Catalog Sync — Workflow Log

Repository: git-catalog-sync-gutierrez-rojemmarc
Author: Rojemmarc Gutierrez (gutierrez.rojemmarc)

This document walks through how three simulated contributors (Clone A, Clone B, Clone C) diverged on feature/late-fee-policy and were reconciled step by step, plus the answers to the required reflection questions.

Task 1 — Push a change from Clone A

Added a 1-day grace period to calculateLateFee in Clone A, committed, and pushed successfully.

Show Image
Task 2 — Diverge from Clone B, and get rejected

In Clone B (which had not fetched Clone A's push), changed the fee calculation to round instead of truncate. Commit succeeded, but the push was rejected because the remote branch had moved.

Show Image
Task 3 — Reconcile with a merge

In Clone B, fetched and merged origin/feature/late-fee-policy. Resolved the conflict so both the grace period (Clone A) and rounding (Clone B) survive together, confirmed tests pass, and pushed.

Show Image
Task 4 — Bring in the third contributor, and get rejected again

In Clone C (still at the original starting state), added a $20 maximum fee cap. Commit succeeded, but the push was rejected — the branch had moved twice since Clone C last saw it.

Show Image
Task 5 — Reconcile a three-way merge

In Clone C, fetched and merged. This conflict combined all three contributors' work at once: grace period, rounding, and the $20 cap. Resolved so all three behaviors survive together, confirmed tests pass, and pushed.

Show Image
Task 6 — Diverge a third time, reconcile with a rebase

Back in Clone A (which had not fetched since Task 1), added a $1 minimum fee. Commit succeeded, push was rejected again. Resolved this time with git fetch + git rebase instead of merge. Resolved the conflict so all four behaviors survive, continued the rebase, and pushed with no force required.

Show Image
Task 7 — Merge into main, tag, and push

Merged feature/late-fee-policy into main (fast-forward), pushed main, tagged the final commit v1.0-synced, and pushed the tag.

Show Image
Reflection Questions
1. Walk through the final calculateLateFee function and name which contributor's change is responsible for each part.
javascript
function calculateLateFee(daysLate, ratePerDay) {
  if (daysLate <= 1) {
    return 0;
  }
  const fee = Math.round(daysLate * ratePerDay);
  return Math.min(Math.max(fee, 1), 20);
}
if (daysLate <= 1) { return 0; } — Clone A, Task 1: the 1-day grace period. If the loan is late by one day or less, no fee is charged at all.
Math.round(daysLate * ratePerDay) — Clone B, Task 2/3: rounds the fee to the nearest whole number instead of truncating it downward with Math.floor.
Math.max(fee, 1) — Clone A, Task 6: enforces a $1 minimum fee once a fee is actually owed.
Math.min(..., 20) — Clone C, Task 4/5: caps the fee at a $20 maximum, applied last so it overrides even the minimum if the raw fee is very high.
2. Compare Task 3's two-way conflict to Task 5's three-way conflict — what got harder with a third line of work?

In Task 3, there were only two versions of the function to reconcile — Clone A's grace period on one side and Clone B's rounding change on the other. I could read both sides side by side and see immediately how they fit together.

In Task 5, the conflict wasn't a clean two-way split anymore: one side of the conflict already contained two combined behaviors (grace period + rounding, from the Task 3 merge that had already landed on the remote), and the other side had Clone C's single independent change (the cap). Reconciling it meant I couldn't just glance at both sides and combine them — I had to trace which piece of logic came from which contributor and think carefully about the correct order of operations for three separate rules instead of two, so nothing got silently dropped or duplicated. It also meant a mistake here would have hidden the fact that two earlier contributors' work was already combined, making it easier to accidentally lose one of them.

3. What's the actual difference between how you resolved Task 5 (merge) and Task 6 (rebase)?

In Task 5, git merge created a new merge commit with two parents. The conflict resolution lives inside that single merge commit, and the original commit history of both branches stays exactly as it happened — nothing is rewritten, and the divergence and the reconciliation are both visible in the log.

In Task 6, git rebase didn't create a merge commit at all. Instead, it rewrote my divergent commit (Add $1 minimum fee) so it gets replayed on top of the latest remote history, as if I had made that change last, after everything else. This gave my commit a new SHA and a new parent, and kept the project history linear with no merge commit. The conflict-resolution work itself — figuring out how to combine the competing changes — was similar in both cases, but merge preserves history as it actually happened while rebase rewrites it to look like it happened in a different order.

4. If this were a real team of three, what one process change would have prevented all three rejected pushes?

Pulling (fetch + merge or rebase) immediately before starting any new work, and pushing small changes frequently instead of working in isolation for a stretch before syncing. All three rejections happened for the same underlying reason: each clone started its change from a copy of the branch that was already stale, without checking whether anyone else had pushed first. A habit of running git pull right before beginning any new change — and pushing as soon as a change is ready, rather than batching up more work — would have surfaced each conflict immediately, in small isolated pieces, instead of letting divergent work pile up across multiple contributors at once.

Step 3 — Save
Press Ctrl+S in VS Code after pasting.

Step 4 — Verify and commit

powershell
git add WORKFLOW.md screenshots/
git commit -m "Add WORKFLOW.md with reflection answers and screenshots - gutierrez.rojemmarc"
git push