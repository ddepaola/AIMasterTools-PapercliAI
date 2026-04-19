#!/usr/bin/env python3
"""
Date QA Check — AIMasterTools Content Pipeline

Scans all publishable content files for stale year references.
Run before committing or deploying any content changes.

Usage:
    python3 scripts/date-qa-check.py              # scan everything
    python3 scripts/date-qa-check.py file.html    # scan specific file(s)
    python3 scripts/date-qa-check.py --fix        # auto-fix found in staged/unstaged files

Exit code 0 = clean, 1 = violations found.
"""

import sys
import os
import re
import datetime
from pathlib import Path

CURRENT_YEAR = datetime.datetime.now().year
STALE_YEARS = [str(y) for y in range(2020, CURRENT_YEAR)]

# Extensions to scan
SCAN_EXTENSIONS = {".html", ".md", ".js", ".txt", ".json"}

# Paths to skip
SKIP_DIRS = {".git", "node_modules", ".next", "dist", "build", "__pycache__"}

# Patterns that are OK to keep (historical references, date ranges, etc.)
ALLOWLIST_PATTERNS = [
    re.compile(r"\d{4}-\d{4}"),                          # year ranges like 2025-2026
    re.compile(r"copyright.*\d{4}.*\d{4}", re.I),        # "Copyright 2020-2026"
    re.compile(r"since \d{4}", re.I),                    # "since 2020"
    re.compile(r"founded.*\d{4}", re.I),
    re.compile(r"version.*\d{4}", re.I),
    re.compile(r"#\d{4}"),                               # issue/ticket numbers like #2025
    # Historical event references
    re.compile(r"(launched|released|emerged|introduced|discontinued|dropped|acquired|"
               r"announced|founded|established|opened|closed|trained on|data from).*\d{4}", re.I),
    re.compile(r"\d{4}.*(launched|released|emerged|introduced|discontinued|"
               r"dropped|acquired|announced)", re.I),
    # QA documentation that quotes bad patterns as examples
    re.compile(r'["\u201c\u2018]\d{4}["\u201d\u2019]'),  # "2025" or '2025' in quotes
    re.compile(r"`\d{4}`"),                              # `2025` in code/markdown
    # Commit hashes and ticket identifiers
    re.compile(r"\b[a-f0-9]{7,}\b"),
    # Incident tables and historical logs
    re.compile(r"\|\s*\d{4}-\d{2}"),                    # Markdown table rows with date
]

def is_allowlisted(line: str, year: str) -> bool:
    """Return True if the year occurrence in this line is intentionally historical."""
    for pattern in ALLOWLIST_PATTERNS:
        if pattern.search(line):
            return True
    return False


def scan_file(filepath: Path) -> list[dict]:
    """Scan a single file and return a list of violation dicts."""
    violations = []
    try:
        text = filepath.read_text(encoding="utf-8", errors="replace")
    except Exception as e:
        return [{"file": str(filepath), "line": 0, "col": 0, "text": f"[read error: {e}]", "year": "?"}]

    for lineno, line in enumerate(text.splitlines(), start=1):
        for year in STALE_YEARS:
            if year in line:
                if is_allowlisted(line, year):
                    continue
                col = line.index(year) + 1
                violations.append({
                    "file": str(filepath),
                    "line": lineno,
                    "col": col,
                    "text": line.strip(),
                    "year": year,
                })
    return violations


def scan_tree(root: Path) -> list[dict]:
    """Recursively scan all eligible files under root."""
    violations = []
    for path in sorted(root.rglob("*")):
        if any(skip in path.parts for skip in SKIP_DIRS):
            continue
        if path.is_file() and path.suffix in SCAN_EXTENSIONS:
            violations.extend(scan_file(path))
    return violations


def fix_file(filepath: Path, dry_run: bool = False) -> int:
    """Replace all stale year references with CURRENT_YEAR. Returns number of replacements."""
    try:
        original = filepath.read_text(encoding="utf-8", errors="replace")
    except Exception:
        return 0

    fixed = original
    count = 0
    for year in sorted(STALE_YEARS, reverse=True):  # longest first to avoid partial matches
        new_text = fixed.replace(year, str(CURRENT_YEAR))
        if new_text != fixed:
            count += fixed.count(year)
            fixed = new_text

    if count and not dry_run:
        filepath.write_text(fixed, encoding="utf-8")
    return count


def main():
    args = sys.argv[1:]
    do_fix = "--fix" in args
    targets = [a for a in args if not a.startswith("--")]

    root = Path.cwd()

    if targets:
        paths = []
        for t in targets:
            p = Path(t)
            if p.is_dir():
                paths.extend(p.rglob("*"))
            else:
                paths.append(p)
        paths = [p for p in paths if p.is_file() and p.suffix in SCAN_EXTENSIONS]
    else:
        # Scan full project
        paths = None

    if do_fix:
        print(f"[date-qa] Auto-fixing stale year references (target year: {CURRENT_YEAR})")
        if paths:
            total = sum(fix_file(p) for p in paths)
        else:
            total = sum(fix_file(p) for p in sorted(root.rglob("*"))
                        if p.is_file() and p.suffix in SCAN_EXTENSIONS
                        and not any(s in p.parts for s in SKIP_DIRS))
        print(f"[date-qa] Fixed {total} occurrence(s).")
        return 0

    # Scan mode
    if paths:
        violations = []
        for p in paths:
            violations.extend(scan_file(p))
    else:
        violations = scan_tree(root)

    if not violations:
        print(f"[date-qa] PASS — no stale year references found. Current year: {CURRENT_YEAR}")
        return 0

    print(f"[date-qa] FAIL — {len(violations)} stale year reference(s) found:\n")
    for v in violations:
        print(f"  {v['file']}:{v['line']}:{v['col']}  [{v['year']}]  {v['text'][:100]}")

    print(f"\n[date-qa] Run with --fix to auto-replace all occurrences with {CURRENT_YEAR}.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
