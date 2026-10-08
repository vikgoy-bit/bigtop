#!/bin/bash
# Installs agent-browser (used by the google-flights skill) in Claude Code cloud sessions.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

AGENT_BROWSER_VERSION="0.38.2"

if [ "$(agent-browser --version 2>/dev/null)" != "agent-browser ${AGENT_BROWSER_VERSION}" ]; then
  npm install -g "agent-browser@${AGENT_BROWSER_VERSION}" --no-fund --no-audit --loglevel=error
fi

# Reuse the preinstalled Chromium instead of downloading another one.
if [ -n "${CLAUDE_ENV_FILE:-}" ] && [ -x /opt/pw-browsers/chromium ]; then
  echo 'export AGENT_BROWSER_EXECUTABLE_PATH=/opt/pw-browsers/chromium' >> "$CLAUDE_ENV_FILE"
fi
