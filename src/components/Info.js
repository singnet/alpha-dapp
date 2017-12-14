import React from 'react'

const Info = ({ url,account, contractAddress, accountBalance, escrowBalance }) => (
  <div className="row">
    <div className="col-md-9 m-auto">
      <h3>
        Your account: <b>{account}</b>
      </h3>
      <h3>
        Job Contract: <b><a target="_blank" href={url}> {contractAddress || "0x"} </a></b>
      </h3>
    </div>
    <div className="col-md-3">
      <h3>
        Your balance <b> {accountBalance.toString() || "0"} AGI</b>
      </h3>
      <h3>
        Escrow <b> {escrowBalance.toString() || "0"} AGI</b>
      </h3>
    </div>
  </div>
)

export default Info