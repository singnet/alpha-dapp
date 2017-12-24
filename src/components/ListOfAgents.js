import React from 'react'

const ListOfAgents = ({ agents, onHire }) => (
  <table className="table table-hover mx-auto">
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
        Array.isArray(agents) && agents.map((currentAgent, index) => {
          const {available, name, service, price} = currentAgent
          let buttonText,backgroundColor
          if (available) {
            buttonText = "HIRE"
            backgroundColor = "white"
          } else {
            buttonText = "OFF"
            backgroundColor = "rgba(0,0,0,0.1)"
          }
          return (
            <tr key={index} style={{backgroundColor}}>
              <td>{name}</td>
              <td>{service}</td>
              <td>{price}</td>
              <td>
                <button
                  className="btn btn-primary"
                  disabled={!available}
                  type="sumbit"
                  onClick={() => onHire(currentAgent)}
                >
                  {buttonText}
              </button>
              </td>
            </tr>
          )
        })
      }
    </tbody>
  </table>
)

export default ListOfAgents