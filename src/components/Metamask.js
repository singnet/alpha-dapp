import React from 'react'
import logo from '../assets/logo/logo.svg'


const Metamask = () => {
  return (
    <div>
      <header className="App-header text-center">
        <img src={logo} alt="logo" />
      </header>
      <div className="container text-center">
        <h2>Unlock Metamask and select the Kovan testnet</h2>
      </div>
    </div>
  )
}

export default Metamask