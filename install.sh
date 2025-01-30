#!/bin/bash

curl -fsSL https://bun.sh/install | bash

mkdir -p bot

git clone https://github.com/AeroBytesNL/AllDayBot-TS.git bot

cd bot

bun install

echo "Installation complete!"
