#!/usr/bin/env python3
"""Genera _showcase/showcase.md nella radice del vault. Solo libreria standard.

_showcase/showcase.md è una fotografia DERIVATA: solo questo script la scrive.
Si rilancia ogni volta che le note cambiano.

Perimetro: le 9 cartelle di contenuto (self, areas, projects, concepts, docs,
entities, data, code, outputs) più la nota hub _index.md in radice. sources/ e
workspace/ sono escluse, come in scripts/quality_gate.py.

Riporta:
  - il numero di note
  - i wikilink che tengono insieme il grafo (collegamenti unici da nota a nota
    tra le note contate)
  - il numero di componenti connesse (1 = tutto collegato)
  - una tabella con le note per cartella
  - l'elenco degli hub: la nota indice di ogni cartella, con il summary preso
    solo dal suo frontmatter

La radice del vault è la cartella sopra scripts/.

Uso (dalla radice del vault):
  Windows:  py scripts/generate_showcase.py
  Mac:      python3 scripts/generate_showcase.py
"""

import datetime
import os
import re
import sys
from collections import defaultdict

VAULT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_PATH = os.path.join(VAULT_ROOT, "_showcase", "showcase.md")
SKIP_DIRS = {"sources", "workspace"}
IGNORE_DIRS = {".git", ".obsidian", ".claude", "scripts", "_showcase"}
FOLDERS = [
    "self", "areas", "projects", "concepts",
    "docs", "entities", "data", "code", "outputs",
]

WIKILINK_RE = re.compile(r"\[\[([^\[\]]+?)\]\]")
KEY_RE = re.compile(r"^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$")


def rel(path):
    return os.path.relpath(path, VAULT_ROOT).replace("\\", "/")


def parse_frontmatter(text):
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return {}, []
    end_idx = None
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            end_idx = i
            break
    if end_idx is None:
        return {}, []
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
    return keys, tags


def extract_targets(text):
    targets = []
    for m in WIKILINK_RE.findall(text):
        t = m.split("|")[0].split("#")[0].strip()
        if t:
            targets.append(t)
    return sorted(set(targets))


class Note:
    def __init__(self, path, folder):
        self.path = path
        self.relpath = rel(path)
        self.folder = folder  # None per l'hub in radice
        self.name = os.path.splitext(os.path.basename(path))[0]
        with open(path, "r", encoding="utf-8-sig") as fh:
            text = fh.read()
        self.keys, self.tags = parse_frontmatter(text)
        self.summary = self.keys.get("summary", "").strip()
        self.unique_targets = extract_targets(text)
        self.is_index = "index" in self.tags


def find_all_md_files():
    """Ogni .md del vault, per controllare che i link puntino a note esistenti."""
    files = []
    for dirpath, dirnames, filenames in os.walk(VAULT_ROOT):
        dirnames[:] = [d for d in dirnames if d not in IGNORE_DIRS]
        for f in filenames:
            if f.lower().endswith(".md"):
                files.append(os.path.join(dirpath, f))
    return files


def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except AttributeError:
        pass

    all_notes = {}
    for path in find_all_md_files():
        relpath = rel(path)
        parts = relpath.split("/")
        folder = parts[0] if len(parts) > 1 else None
        all_notes[os.path.splitext(os.path.basename(path))[0]] = Note(path, folder)

    scanned = {
        name: n for name, n in all_notes.items()
        if n.folder is None or n.folder not in SKIP_DIRS
    }

    # note per cartella (l'hub in radice resta fuori dalla tabella)
    per_folder = defaultdict(int)
    for n in scanned.values():
        if n.folder is not None:
            per_folder[n.folder] += 1
    root_note = scanned.get("_index")

    # archi: coppie uniche origine -> bersaglio con entrambi i capi in `scanned`
    edges = set()
    adjacency = defaultdict(set)
    for name in scanned:
        adjacency[name]
    for name, n in scanned.items():
        for t in n.unique_targets:
            if t in scanned:
                edges.add((name, t))
                adjacency[name].add(t)
                adjacency[t].add(name)
    total_links = len(edges)

    # componenti connesse (non orientate) sulle note contate
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

    # hub: la nota indice di ogni cartella
    hubs = {}
    for name, n in scanned.items():
        if n.is_index and n.folder in FOLDERS:
            hubs[n.folder] = n

    today = datetime.date.today().isoformat()

    lines = []
    lines.append("<!-- File generato automaticamente da scripts/generate_showcase.py -->")
    lines.append("<!-- È una fotografia DERIVATA: si rigenera, non si scrive a mano. -->")
    lines.append("")
    lines.append("# Showcase del vault")
    lines.append("")
    lines.append(f"Fotografia generata il {today}.")
    lines.append("")
    lines.append(f"- **Note totali**: {len(scanned)} "
                 f"({sum(per_folder.values())} nelle 9 cartelle di contenuto + 1 hub in radice; "
                 f"sources/ e workspace/ escluse)")
    lines.append(f"- **Wikilink totali**: {total_links} (collegamenti unici che tengono insieme il grafo)")
    lines.append(f"- **Componenti connesse**: {len(components)} "
                 f"({'tutto collegato' if len(components) == 1 else 'ATTENZIONE: grafo spezzato'})")
    lines.append("")
    lines.append("## Note per cartella")
    lines.append("")
    lines.append("| Cartella | Note |")
    lines.append("|---|---|")
    for folder in FOLDERS:
        lines.append(f"| {folder} | {per_folder.get(folder, 0)} |")
    lines.append("")
    lines.append("(+ 1 nota hub in radice, `_index.md`, non conteggiata come cartella)")
    lines.append("")
    lines.append("## Hub")
    lines.append("")
    for folder in FOLDERS:
        h = hubs.get(folder)
        if h is None:
            lines.append(f"- {folder}/: nessun indice trovato")
            continue
        summary = h.summary or "(summary assente)"
        lines.append(f"- [[{h.name}]] -- {summary}")
    if root_note is not None:
        summary = root_note.summary or "(summary assente)"
        lines.append(f"- [[{root_note.name}]] -- {summary} *(hub globale, radice del vault)*")
    lines.append("")

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8", newline="\n") as fh:
        fh.write("\n".join(lines).rstrip("\n") + "\n")

    print(f"Scritto {OUTPUT_PATH}")


if __name__ == "__main__":
    sys.exit(main())
