import React from 'react'

const ListOfAgents = ({ agents, onHire }) => (
  <table className="table table-hover">
    <thead>
      <tr>
        <th>Agent</th>
        <th>Service Offering</th>
        <th>Price per Unit (COGS)</th>
        <th>-</th>
      </tr>
    </thead>
    <tbody>
      {
        Array.isArray(agents) && agents.map((currentAgent,index) => (
          <tr key={index}>
            <td>{currentAgent.name}</td>
            <td>{currentAgent.service}</td>
            <td>{currentAgent.price}</td>
            <td>
              <button
                className="btn btn-primary"
                type="sumbit"
                onClick={onHire}
              >
                HIRE
              </button>
            </td>
          </tr>
        ))
      }
    </tbody>
  </table>
)

export default ListOfAgents