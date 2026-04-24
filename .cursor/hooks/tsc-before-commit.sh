#!/bin/bash
set -euo pipefail

input_json="$(cat)"
command="$(
  printf '%s' "$input_json" | python3 -c 'import json, sys; print(json.load(sys.stdin).get("command", ""))'
)"

if [[ ! "$command" =~ git[[:space:]]+commit ]]; then
  printf '%s\n' '{"permission":"allow"}'
  exit 0
fi

tmp_output="$(mktemp)"
cleanup() {
  rm -f "$tmp_output"
}
trap cleanup EXIT

if npx tsc --noEmit -p tsconfig.json >"$tmp_output" 2>&1; then
  printf '%s\n' '{"permission":"allow"}'
  exit 0
fi

python3 - "$tmp_output" <<'PY'
import json
import pathlib
import sys

output_path = pathlib.Path(sys.argv[1])
raw_output = output_path.read_text(encoding="utf-8", errors="replace").strip()
excerpt_lines = raw_output.splitlines()[-80:] if raw_output else []
excerpt = "\n".join(excerpt_lines) if excerpt_lines else "TypeScript typecheck failed with no output."

payload = {
    "permission": "deny",
    "user_message": "TypeScript の型チェックに失敗したため commit を中止しました。",
    "agent_message": (
        "tsc --noEmit が失敗しました。型エラーを修正し、"
        "`npx tsc --noEmit -p tsconfig.json` が成功することを確認してから "
        "commit を再実行してください。\n\n"
        f"{excerpt}"
    ),
}

print(json.dumps(payload, ensure_ascii=False))
PY
