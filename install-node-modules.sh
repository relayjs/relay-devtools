#!/bin/bash

set -eu

ROOT_DIR="$(hg root)"
DEBUGGER_DATA_DIR="$ROOT_DIR/xplat/relay/debugger"
INSTALL_NODE_MODULES="$ROOT_DIR/xplat/third-party/yarn/install-node-modules.sh"

cd "$DEBUGGER_DATA_DIR"
"$INSTALL_NODE_MODULES" "$@"
