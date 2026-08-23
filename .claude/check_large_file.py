#!/usr/bin/env python3
"""
Hook PreToolUse — interdit à Claude de lire directement un fichier > LIMIT lignes.
Redirige vers ask-gemini (ou tout autre outil configuré dans REDIRECT_MSG).

Installe dans .claude/settings.json :
  "PreToolUse" sur "Read" et "Bash"
"""

import json
import os
import re
import sys

# ── Configuration ─────────────────────────────────────────────────────────────
LIMIT = 150          # seuil en nombre de lignes
REDIRECT_MSG = (
    'Utilise : ask-gemini --paths {path} --question "<question précise>"'
)
# ─────────────────────────────────────────────────────────────────────────────


def count_lines(path: str) -> int:
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            return sum(1 for _ in f)
    except Exception:
        return 0


def deny(reason: str) -> None:
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason": reason,
        }
    }))
    sys.exit(0)


def main():
    try:
        payload = json.load(sys.stdin)
    except Exception:
        sys.exit(0)

    tool  = payload.get("tool_name", "")
    input_ = payload.get("tool_input", {})

    # ── Read ──────────────────────────────────────────────────────────────────
    if tool == "Read":
        path = input_.get("file_path", "")
        if not path:
            sys.exit(0)
        # Lecture partielle explicite (offset ou limit) → autorisée
        if input_.get("offset") or input_.get("limit"):
            sys.exit(0)
        n = count_lines(path)
        if n > LIMIT:
            deny(
                f"Fichier {os.path.basename(path)} : {n} lignes > {LIMIT}. "
                f"Lecture directe interdite. "
                + REDIRECT_MSG.format(path=path)
            )

    # ── Bash ──────────────────────────────────────────────────────────────────
    elif tool == "Bash":
        cmd = input_.get("command", "")
        if not re.search(r'\b(cat|head|tail|sed|awk)\b', cmd):
            sys.exit(0)
        for token in re.findall(r'[\w./~-]+\.[\w]+', cmd):
            candidate = token if os.path.isabs(token) else os.path.join(os.getcwd(), token)
            if not os.path.isfile(candidate):
                continue
            n = count_lines(candidate)
            if n > LIMIT:
                deny(
                    f"Bash sur {os.path.basename(candidate)} : {n} lignes > {LIMIT}. "
                    f"cat/sed/awk/head/tail interdits sur ce fichier. "
                    + REDIRECT_MSG.format(path=candidate)
                )

    sys.exit(0)


if __name__ == "__main__":
    main()
