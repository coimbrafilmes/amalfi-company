#!/usr/bin/env bash
# Amalfi — Marco's render helper
# Generates BOTH PDF and HTML from a markdown output file using project CSS.
#
# Usage:
#   ./render.sh path/to/listing.md
#
# Output: same directory, same basename, with .pdf and .html added.
# Requires: md-to-pdf installed globally (`npm install -g md-to-pdf`).

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "ERROR: missing markdown file path"
  echo "Usage: $0 path/to/file.md"
  exit 1
fi

INPUT="$1"

if [ ! -f "$INPUT" ]; then
  echo "ERROR: file not found: $INPUT"
  exit 1
fi

if ! command -v md-to-pdf &> /dev/null; then
  echo "ERROR: md-to-pdf not installed. Run: npm install -g md-to-pdf"
  exit 1
fi

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
CSS_PATH="$SCRIPT_DIR/../assets/listing.css"

BASENAME="${INPUT%.md}"
DOC_TITLE="$(basename "$BASENAME") — Amalfi Amazon"

echo "→ Rendering: $INPUT"
echo "  CSS: $CSS_PATH"

# Build args as an array so paths with spaces survive
COMMON_ARGS=(
  --document-title "$DOC_TITLE"
)

if [ -f "$CSS_PATH" ]; then
  COMMON_ARGS+=( --stylesheet "$CSS_PATH" )
else
  echo "  WARNING: CSS not found — using default styling"
fi

# PDF generation
md-to-pdf "$INPUT" \
  "${COMMON_ARGS[@]}" \
  --pdf-options '{"format":"A4","margin":{"top":"18mm","bottom":"18mm","left":"16mm","right":"16mm"},"printBackground":true}'

# HTML generation (intermediate, browseable)
md-to-pdf "$INPUT" \
  "${COMMON_ARGS[@]}" \
  --as-html

echo "✓ Done: $BASENAME.pdf"
echo "✓ Done: $BASENAME.html"
