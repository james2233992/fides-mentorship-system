#!/bin/bash
cd "$(dirname "$0")"
export HOST=0.0.0.0
export PORT=3000
npx next dev -H 0.0.0.0 -p 3000