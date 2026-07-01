#!/bin/bash
# Daily Lorcana price refresh — appends new TCGplayer snapshots into
# app/data/price-history.json. Installed as a cron job (see README).
# cron runs with a bare environment, so paths are explicit.

export PATH="/Users/songkarn/.nvm/versions/node/v20.19.3/bin:/usr/bin:/bin:/usr/sbin:/sbin"
PROJECT="/Users/songkarn/Desktop/card_mania"

cd "$PROJECT" || exit 1
echo "[$(date '+%Y-%m-%d %H:%M:%S')] price update start"
node scripts/build-price-history.mjs --append
echo "[$(date '+%Y-%m-%d %H:%M:%S')] price update done"
