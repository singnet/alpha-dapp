import React from 'react'
import QRCode from 'qrcode.react'

const Info = ({ url, account, contractAddress, accountBalance, escrowBalance }) => (
  <div className="row">
    <div className="col-md-6 m-auto">
      <h2>Your account</h2>
      <a className="btn btn-success" href="https://vulpemventures.github.io/faucet-erc20/" target="_blank">Get  Kovan AGI</a>
      <p>Balance <b> {(Number(accountBalance)/100000000).toString() || "0"} AGI</b></p>
      <QRCode value={account} />
      <br />
      <b>{account}</b>
    </div>
    <div className="col-md-6">
    {
      contractAddress && (
        <div>
          <h2>Escrow</h2>
          <p>Balance <b> {(Number(escrowBalance)/100000000).toString() || "0"} AGI</b></p>
          <QRCode value={contractAddress} />
          <br />
          <b><a target="_blank" href={url}> {contractAddress}</a></b>
        </div>
      )
    }
    </div>
    <br />
  </div>
)

export default Info