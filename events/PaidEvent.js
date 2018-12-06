/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Kirill Sergeev <cloudkserg11@gmail.com>
*/
class PaidEvent {
  constructor (claim) {
    this.data = {
      claimId: claim._id,
      blockchain: claim.blockchain,
      address: claim.address,
      amount: claim.amount,
      requiredAmount: claim.requiredAmount,
      startBlock: claim.startBlock,
      endBlock: claim.endBlock
    };
  }

  
}

module.exports = PaidEvent;
