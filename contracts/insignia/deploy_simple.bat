@echo off
soroban config network rm testnet
soroban config network add testnet --rpc-url https://soroban-testnet.stellar.org --network-passphrase "Test SDF Network ; September 2015"
soroban contract deploy --wasm target/wasm32-unknown-unknown/release/insignia.wasm --network testnet --source deploy
pause