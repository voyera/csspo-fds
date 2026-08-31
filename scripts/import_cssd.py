#!/usr/bin/env python3
"""
Import atomique des données CSSD depuis le dépôt d'archive csspo-atip.

Copie les trois JSON extraits dans data/cssd/, enregistre leur SHA-256 et le
commit amont dans data/cssd/provenance.json, puis lance build_data_cssd.py.
Une seule commande fait copie + provenance + génération : pas de copie
manuelle qui dériverait de l'archive.
"""
import hashlib
import json
import shutil
import subprocess
import sys
from datetime import date
from pathlib import Path

SITE = Path(__file__).resolve().parent.parent
ATIP = SITE.parent / "csspo-atip"
SRC = ATIP / "extracted"
DST = SITE / "data" / "cssd"

FILES = ["cssd_fds_raw.json", "cssd_budget_raw.json", "cssd_manifest.json"]


def sha256(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


def git(*args):
    return subprocess.run(["git", "-C", str(ATIP), *args],
                          capture_output=True, text=True).stdout.strip()


def main():
    DST.mkdir(parents=True, exist_ok=True)
    prov = {"importedOn": date.today().isoformat(),
            "upstream": "csspo-atip",
            "upstreamCommit": git("rev-parse", "HEAD") or None,
            "upstreamDirty": bool(git("status", "--porcelain")),
            "files": {}}
    for name in FILES:
        src = SRC / name
        if not src.exists():
            sys.exit(f"introuvable: {src}")
        shutil.copy2(src, DST / name)
        prov["files"][name] = sha256(DST / name)
    (DST / "provenance.json").write_text(json.dumps(prov, ensure_ascii=False, indent=1))
    print(f"importé: {len(FILES)} fichiers → data/cssd/ "
          f"(commit amont {prov['upstreamCommit'] or 'aucun'}"
          f"{', arbre sale' if prov['upstreamDirty'] else ''})")

    r = subprocess.run([sys.executable, str(SITE / "scripts" / "build_data_cssd.py")])
    sys.exit(r.returncode)


if __name__ == "__main__":
    main()
