#!/usr/bin/env python3
import json
import os
import subprocess
from pathlib import Path

CHECKS = ["secret_scanning", "sca", "sast", "iac_scanning", "container_scanning", "dast"]
message = subprocess.check_output(["git", "log", "-1", "--pretty=%B"], text=True)
trailers = {}
for line in message.splitlines():
    if ": " in line:
        key, value = line.split(": ", 1)
        trailers[key] = value
expected = {item for item in trailers.get("Expected-Checks", "").split(",") if item}
selected_raw = json.loads(os.environ.get("SECORCH_CHECKS", "{}"))
selected = {check for check in CHECKS if str(selected_raw.get(check, "run")).lower() != "skip"}
rows = {check: {"expected": check in expected, "selected": check in selected} for check in CHECKS}
report = {
    "sha": subprocess.check_output(["git", "rev-parse", "HEAD"], text=True).strip(),
    "scenario": trailers.get("Secorch-Scenario", "unlabelled"),
    "expected_result": trailers.get("Expected-Result", "pass"),
    "expected_checks": sorted(expected),
    "selected_checks": sorted(selected),
    "exact_match": expected == selected,
    "checks": rows,
}
Path("artifacts").mkdir(exist_ok=True)
Path("artifacts/secorch-evaluation.json").write_text(json.dumps(report, indent=2) + "\n")
print(json.dumps(report, indent=2))
