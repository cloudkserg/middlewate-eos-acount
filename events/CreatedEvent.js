/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Kirill Sergeev <cloudkserg11@gmail.com>
*/
class CreatedEvent {
  constructor (claim) {
    this.data = {
      claimId: claim._id,
      eosAddress: claim.eosAddress
    };
  }
}

module.exports = CreatedEvent;
