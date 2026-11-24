#!/usr/bin/env python3
"""Controllo di qualità del vault. Solo libreria standard, nessuna dipendenza.

Legge ogni nota del vault tranne sources/ e workspace/ (materiale grezzo o di
lavoro) e verifica sei regole:

  1. Frontmatter completo: title, summary, tags, status, created, updated.
  2. Corpo (il testo dopo il frontmatter) di al massimo 300 righe.
  3. Almeno 3 wikilink in uscita, unici, verso note che esistono. I link verso
     le note indice (tag "index") non contano, e le note indice sono esenti.
     Nei vault piccoli il minimo scende al numero di altre note vere che
     esistono (con 1 sola nota vera il minimo è 0, con 2 è 1, da 4 in su è 3),
     perché non si può linkare ciò che non c'è.
  4. Zero link rotti: ogni [[bersaglio]] punta a una nota che esiste nel vault
     (anche in sources/ e workspace/).
  5. Zero orfane: ogni nota ha almeno un link in entrata, tranne le note indice.
  6. Tutto il grafo controllato è un'unica componente connessa.

La radice del vault è la cartella sopra scripts/, quindi lo script funziona
da qualunque cartella lo si lanci.

Uso (dalla radice del vault):
  Windows:  py scripts/quality_gate.py
  Mac:      python3 scripts/quality_gate.py
"""

import os
import re
import sys
from collections import defaultdict

VAULT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP_DIRS = {"sources", "workspace"}
IGNORE_DIRS = {".git", ".obsidian", ".claude", "scripts", "_showcase"}
REQUIRED_KEYS = ["title", "summary", "tags", "status", "created", "updated"]
MAX_BODY_LINES = 300
MIN_LINKS = 3

WIKILINK_RE = re.compile(r"\[\[([^\[\]]+?)\]\]")
KEY_RE = re.compile(r"^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$")


def rel(path):
    return os.path.relpath(path, VAULT_ROOT).replace("\\", "/")


def find_all_md_files():
    """Tutti i file .md del vault, in qualunque cartella."""
    files = []
    for dirpath, dirnames, filenames in os.walk(VAULT_ROOT):
        dirnames[:] = [d for d in dirnames if d not in IGNORE_DIRS]
        for f in filenames:
            if f.lower().endswith(".md"):
                files.append(os.path.join(dirpath, f))
    return files


def is_scanned(path):
    """True se il file è da controllare (non è in sources/ né in workspace/)."""
    relpath = rel(path)
    parts = relpath.split("/")
    if len(parts) == 1:
        return True  # file in radice, per esempio _index.md
    return parts[0] not in SKIP_DIRS


def parse_frontmatter(text):
    """Restituisce (chiavi, tag, indice della prima riga del corpo)."""
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return {}, [], 0
    end_idx = None
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            end_idx = i
            break
    if end_idx is None:
        return {}, [], 0
    keys = {}
    tags = []
    for line in lines[1:end_idx]:
        m = KEY_RE.match(line)
        if not m:
            continue
        key, val = m.group(1), m.group(2).strip()
        keys[key] = val
        if key == "tags":
            inner = val.strip()
            if inner.startswith("[") and inner.endswith("]"):
                inner = inner[1:-1]
            tags = [t.strip() for t in inner.split(",") if t.strip()]
    return keys, tags, end_idx + 1


def extract_targets(text):
    """Bersagli dei wikilink presenti in tutto il testo del file."""
    targets = []
    for m in WIKILINK_RE.findall(text):
        t = m.split("|")[0].split("#")[0].strip()
        if t:
            targets.append(t)
    return targets


def basename_noext(path):
    return os.path.splitext(os.path.basename(path))[0]


class Note:
    def __init__(self, path):
        self.path = path
        self.relpath = rel(path)
        with open(path, "r", encoding="utf-8-sig") as fh:
            self.text = fh.read()
        self.keys, self.tags, self.body_start = parse_frontmatter(self.text)
        lines = self.text.splitlines()
        self.body_lines = lines[self.body_start:]
        self.raw_targets = extract_targets(self.text)
        self.unique_targets = sorted(set(self.raw_targets))
        self.name = basename_noext(path)
        self.is_index = "index" in self.tags


def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except AttributeError:
        pass

    all_paths = find_all_md_files()
    notes_by_name = {}
    for p in all_paths:
        n = Note(p)
        notes_by_name[n.name] = n

    scanned = {name: n for name, n in notes_by_name.items() if is_scanned(n.path)}

    # Link in entrata, contati su tutto il vault (qualunque file verso qualunque file).
    inbound = defaultdict(set)
    for n in notes_by_name.values():
        for t in n.unique_targets:
            if t in notes_by_name:
                inbound[t].add(n.name)

    errors = {i: [] for i in range(1, 7)}

    # Regola 1: frontmatter completo
    for name, n in sorted(scanned.items()):
        missing = [k for k in REQUIRED_KEYS if not n.keys.get(k, "").strip()]
        if missing:
            errors[1].append(f"{n.relpath}: mancano {', '.join(missing)}")

    # Regola 2: corpo di al massimo 300 righe
    for name, n in sorted(scanned.items()):
        count = len(n.body_lines)
        if count > MAX_BODY_LINES:
            errors[2].append(f"{n.relpath}: {count} righe di corpo (> {MAX_BODY_LINES})")

    # Regola 3: almeno 3 link in uscita verso note vere e non indice (indici esenti).
    # Il minimo non supera il numero di altre note vere controllate (vault piccoli).
    real_count = sum(1 for n in scanned.values() if not n.is_index)
    for name, n in sorted(scanned.items()):
        if n.is_index:
            continue
        needed = min(MIN_LINKS, real_count - 1)
        valid = [
            t for t in n.unique_targets
            if t in notes_by_name and not notes_by_name[t].is_index
        ]
        if len(valid) < needed:
            found = ", ".join(f"[[{t}]]" for t in valid) if valid else "nessuno"
            errors[3].append(
                f"{n.relpath}: {len(valid)}/{needed} bersagli validi (indici esclusi), trovati: {found}"
            )

    # Regola 4: zero link rotti
    for name, n in sorted(scanned.items()):
        broken = [t for t in n.unique_targets if t not in notes_by_name]
        if broken:
            links = ", ".join(f"[[{t}]]" for t in broken)
            errors[4].append(f"{n.relpath}: link rotti -> {links}")

    # Regola 5: zero orfane (indici esenti)
    for name, n in sorted(scanned.items()):
        if n.is_index:
            continue
        if len(inbound.get(name, set())) == 0:
            errors[5].append(f"{n.relpath}: nessun link in entrata")

    # Regola 6: una sola componente connessa sul grafo controllato (non orientato)
    adjacency = defaultdict(set)
    for name in scanned:
        adjacency[name]  # il nodo esiste anche se isolato
    for name, n in scanned.items():
        for t in n.unique_targets:
            if t in scanned:
                adjacency[name].add(t)
                adjacency[t].add(name)

    visited = set()
    components = []
    for name in scanned:
        if name in visited:
            continue
        stack = [name]
        comp = set()
        while stack:
            cur = stack.pop()
            if cur in comp:
                continue
            comp.add(cur)
            stack.extend(adjacency[cur] - comp)
        visited |= comp
        components.append(comp)

    if len(components) > 1:
        components.sort(key=len, reverse=True)
        main_comp = components[0]
        for comp in components[1:]:
            members = ", ".join(sorted(scanned[m].relpath for m in comp))
            errors[6].append(
                f"isola separata dal cluster principale ({len(main_comp)} note): {members}"
            )

    rule_titles = {
        1: "Regola 1: frontmatter incompleto",
        2: "Regola 2: corpo oltre 300 righe",
        3: "Regola 3: meno di 3 wikilink validi in uscita",
        4: "Regola 4: link rotti",
        5: "Regola 5: note orfane",
        6: "Regola 6: grafo non in un'unica componente connessa",
    }

    total = sum(len(v) for v in errors.values())
    if total == 0:
        print("OK, 0 errori")
        return 0

    for i in range(1, 7):
        if not errors[i]:
            continue
        print(rule_titles[i])
        for line in errors[i]:
            print(f"  - {line}")
        print()

    print(f"Totale errori: {total} su {len(scanned)} note controllate "
          f"({len(notes_by_name) - len(scanned)} escluse: sources/ e workspace/)")
    return 1


if __name__ == "__main__":
    sys.exit(main())
