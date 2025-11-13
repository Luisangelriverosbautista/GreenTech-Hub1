@echo off
soroban config network add --global testnet --rpc-url https://soroban-testnet.stellar.org:443 --network-passphrase "Test SDF Network ; September 2015"
soroban contract deploy --wasm target/wasm32-unknown-unknown/release/insignia.wasm --network testnet --source GD4VJFVZPYACIVSG6NPJ6EM6GDMZP2STK5HAJJTVLELGOEVNELQ7HKS4
pause