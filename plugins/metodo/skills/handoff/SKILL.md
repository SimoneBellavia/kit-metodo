---
name: handoff
description: Compact the current conversation into a handoff document for another agent to pick up.
argument-hint: "What will the next session be used for?"
disable-model-invocation: true
---

Write a handoff document summarising the current conversation so a fresh agent can continue the work.
This is the single standard for every project: never use a project-level copy of this skill.

The next session reads the handoff on its own at the first message (rule in `~/.claude/CLAUDE.md`), so the user
does not paste anything. Never write a ready-to-paste prompt.

## Where to save it

Handoffs must persist across sessions: never use the OS temp directory or the scratchpad.

1. If the project's `CLAUDE.md` (or a file it links) says where handoffs go, follow it exactly — including
   whether it is a single file to overwrite (e.g. `handoff.md`) or a dated file in a folder
   (e.g. `Claude/handoff/`).
2. Otherwise: `Claude/handoff/AAAA-MM-GG-<argomento>.md` if the project has a `Claude/` folder,
   else `handoff/AAAA-MM-GG-<argomento>.md` at the project root.

If the target is a single file to overwrite, read it first and carry over every item of "In sospeso" and
"Da chiedere a inizio sessione" that this session did not close: there is no other copy. The handoff belongs to the
folder, not to the topic: save there even if the session was about something else, without asking.

Then make sure the project's `CLAUDE.md` points to where the handoffs are (file table or "stato del lavoro"
section), so the next session finds them. If there is no `CLAUDE.md`, don't create one: just tell the user where the file is.

## What to write

- Write in Italian (the user's language).
- Structure, in this order, with these exact headings (`~/.claude/CLAUDE.md` looks for "Da chiedere a inizio
  sessione" by name); write "niente" under an empty one:
  1. **Riassunto della sessione**: a general narrative of what happened and why, enough for a fresh agent to have
     real context (not just a checklist).
  2. **Deciso**: decisions taken with the user, each with its reason.
  3. **In sospeso**: everything left open (answers awaited, things to remember, to-dos), in order of urgency.
  4. **Prossimi passi**, in order.
  5. **Da chiedere a inizio sessione**: the updates the next agent must ask the user for (answers awaited,
     results, decisions), as a short list.
  6. **Skill suggerite**: skills the next agent should invoke.
- Length: as long as the session needs, at most **150 lines**: it is read whole into the main context at every
  restart, so every extra line is paid in every session.
- Do not duplicate content already captured in other artifacts (CLAUDE.md, guides, plans, source-of-truth files,
  PRDs, issues, commits): reference them by path or URL instead.
- Redact sensitive information: API keys, passwords, personally identifiable information (e.g. document numbers, email).
- If the user passed arguments, treat them as what the next session will focus on and tailor the doc accordingly.

## Check before delivering

- The title has the session date; all dates are absolute with the weekday ("mer 14/10"), never "domani" or "lunedì".
- Every open item of the previous handoff is carried over or marked as closed.
- Data from source-of-truth files is referenced by path, not copied.
- No document numbers, email, keys or passwords.
- Headings identical to the list above; within the length limit.

Fix what fails and check again; deliver only when everything passes.

## After writing

Tell the user the file path and that they can simply open a new session and write anything: the handoff is read
automatically at the first message.

Prove di questa skill: [prove.md](prove.md).
