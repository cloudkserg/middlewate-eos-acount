/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Kirill Sergeev <cloudkserg11@gmail.com>
*/
class NotCreatedEvent {
  constructor (claim) {
    this.data = {
      claimId: claim._id,
      reason: claim.reason
    };
  }
}

module.exports = NotCreatedEvent;
