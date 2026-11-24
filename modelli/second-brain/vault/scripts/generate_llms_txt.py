#!/usr/bin/env python3
"""Genera llms.txt nella radice del vault. Solo libreria standard.

llms.txt è un file DERIVATO: solo questo script lo scrive. Si rilancia ogni
volta che una nota viene aggiunta, rinominata o tolta.

Per ogni cartella di contenuto (nell'ordine fisso qui sotto) elenca ogni nota
.md come "- [[nome-file]] -- summary", dove summary viene solo dal frontmatter
della nota: niente è inventato. sources/ e workspace/ sono materiale grezzo e
non entrano mai.

La radice del vault è la cartella sopra scripts/.

Uso (dalla radice del vault):
  Windows:  py scripts/generate_llms_txt.py
  Mac:      python3 scripts/generate_llms_txt.py
"""

import os
import re
import sys

VAULT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_PATH = os.path.join(VAULT_ROOT, "llms.txt")

FOLDERS = [
    "self", "areas", "projects", "concepts",
    "docs", "entities", "data", "code", "outputs",
]

KEY_RE = re.compile(r"^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$")


def parse_summary(path):
    """Restituisce il valore grezzo di 'summary' nel frontmatter, o None."""
    with open(path, "r", encoding="utf-8-sig") as fh:
        text = fh.read()
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return None
    end_idx = None
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            end_idx = i
            break
    if end_idx is None:
        return None
    for line in lines[1:end_idx]:
        m = KEY_RE.match(line)
        if m and m.group(1) == "summary":
            return m.group(2).strip()
    return None


def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except AttributeError:
        pass

    out_lines = [
        "<!-- File generato automaticamente da scripts/generate_llms_txt.py -->",
        "<!-- È un artefatto DERIVATO: si rigenera da capo, non si modifica a mano. -->",
        "",
    ]

    warnings = []

    for folder in FOLDERS:
        folder_path = os.path.join(VAULT_ROOT, folder)
        out_lines.append(f"## {folder}/")
        if not os.path.isdir(folder_path):
            warnings.append(f"cartella mancante, saltata: {folder}/")
            out_lines.append("")
            continue

        md_files = sorted(
            f for f in os.listdir(folder_path)
            if f.lower().endswith(".md")
        )
        if not md_files:
            out_lines.append("(nessuna nota)")
            out_lines.append("")
            continue

        for f in md_files:
            name = os.path.splitext(f)[0]
            summary = parse_summary(os.path.join(folder_path, f))
            if not summary:
                warnings.append(f"{folder}/{f}: summary assente, nota saltata")
                continue
            out_lines.append(f"- [[{name}]] -- {summary}")
        out_lines.append("")

    with open(OUTPUT_PATH, "w", encoding="utf-8", newline="\n") as fh:
        fh.write("\n".join(out_lines).rstrip("\n") + "\n")

    print(f"Scritto {OUTPUT_PATH}")
    if warnings:
        print("Avvisi:")
        for w in warnings:
            print(f"  - {w}")


if __name__ == "__main__":
    sys.exit(main())
