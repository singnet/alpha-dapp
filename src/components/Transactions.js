import React from 'react'

const Transactions = ({data}) => (
  <table className="table table-hover">
    <thead>
      <tr>
        <th>From</th>
        <th>Escrow</th>
        <th>Result</th>        
      </tr>
    </thead>
    <tbody>
      {
        Array.isArray(data) && data.map((currentTx,index) => (
          <tr key={index}>
            <td>{currentTx.from}</td>
            <td>{currentTx.to}</td>
            <td>{JSON.stringify(currentTx.result)}</td>
          </tr>
        ))
      }
    </tbody>
  </table>
)

export default Transactions