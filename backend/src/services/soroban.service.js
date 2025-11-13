const SorobanClient = require('soroban-client');

class SorobanService {
  constructor() {
    // TODO: Initialize with proper network URL from env
    this.server = new SorobanClient.Server('https://soroban-testnet.stellar.org');
  }

  async initializeWallet() {
    throw new Error('Not implemented: initializeWallet');
  }

  async createDonation(projectId, amount) {
    throw new Error('Not implemented: createDonation');
  }

  async getDonationHistory(projectId) {
    throw new Error('Not implemented: getDonationHistory');
  }

  async getWalletBalance(address) {
    throw new Error('Not implemented: getWalletBalance');
  }

  async executeTransaction(contractId, method, params) {
    throw new Error('Not implemented: executeTransaction');
  }
}

const sorobanService = new SorobanService();

module.exports = {
  sorobanService
};