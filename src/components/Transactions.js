import React from 'react'

const Transactions = ({ data }) => {
  //  if (Array.isArray(data)) return <h3>No transactions found in your local storage</h3>
  return (
    <table className="table table-hover container">
      <thead>
        <tr>
          <th>From</th>
          <th>Escrow</th>
          <th>Result</th>
        </tr>
      </thead>
      <tbody>
        {
          Array.isArray(data) &&
          data.length > 0 &&
          data.map((currentTx, index) => (
            <tr key={index}>
              <td>{currentTx.from}</td>
              <td>{currentTx.to}</td>
              <td>{currentTx.result ? JSON.stringify(currentTx.result) : "-"}</td>
            </tr>
          ))
        }
      </tbody>
    </table>
  )
}
export default Transactions