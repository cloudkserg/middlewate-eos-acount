class ClaimResponse {
  constructor (claim) {
    this.data = {
      id: claim.id,
      userId: claim.userId,
      address: claim.address,
      status: claim.status,
      result: claim.result,
      eosAddress: claim.eosAddress,
      eosOwnerKey: claim.eosOwnerKey,
      eosActiveKey: claim.eosActiveKey,
      blockchain: claim.blockchain,
      startBlock: claim.startBlock,
      endBlock: claim.endBlock,
      amount: claim.amount,
      requiredAmount: claim.requiredAmount,
      timestamp: claim.timestamp
    };
  }

}
module.exports = ClaimResponse;
