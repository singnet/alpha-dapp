import React from 'react'

const Results = ({ result, predictions, confidences }) => {
  // if (Array.isArray(predictions) || predictions.length === 0) return <h3>No Results found </h3>
  return (
    <table className="table table-hover container">
      <thead>
        <tr>
          <th>Predictions</th>
          <th>Confidences</th>
        </tr>
      </thead>
      <tbody>
        {
          Array.isArray(predictions) &&
          Array.isArray(confidences) &&
          predictions[0].map((prediction, index) => (
            <tr key={index}>
              <td>{prediction}</td>
              <td>{confidences[0][index]}</td>
            </tr>
          ))
        }
      </tbody>
    </table>
  )
}
export default Results