"""Restore documented image assets at their existing published URL paths."""
import hashlib
import json
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "attach/vendor/paddleclas"
manifest = json.loads((SOURCE / "manifest.json").read_text())
destinations = [ROOT / "output/images/image_aug", ROOT / "output/20-数据科学/images/image_aug"]

for entry in manifest["files"]:
    source = SOURCE / "image_aug" / entry["name"]
    assert hashlib.sha256(source.read_bytes()).hexdigest() == entry["sha256"], source
    for directory in destinations:
        directory.mkdir(parents=True, exist_ok=True)
        target = directory / source.name
        shutil.copyfile(source, target)
        assert target.read_bytes() == source.read_bytes(), target

print(f"Restored {len(manifest['files'])} original images at {len(destinations)} historical URL prefixes.")
