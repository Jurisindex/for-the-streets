import React from 'react';

function OpinionList({ opinions, onDelete }) {
  const renderOpinionData = (opinionData) => {
    if (!opinionData) return <p>No opinion data available</p>;

    let parsedData;
    try {
      parsedData = typeof opinionData === 'string' ? JSON.parse(opinionData) : opinionData;
    } catch (error) {
      console.error('Error parsing opinion data:', error);
      return <p>Error displaying opinion data</p>;
    }

    return (
      <div>
        <h4>Core Traits:</h4>
        <ul>
          {Object.entries(parsedData.core || {}).map(([trait, value]) => (
            <li key={trait}>{trait}: {value}</li>
          ))}
        </ul>
        <h4>Dating Traits:</h4>
        <ul>
          {Object.entries(parsedData.dating || {}).map(([trait, value]) => (
            <li key={trait}>
              {trait}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="opinion-list">
      <h2>Opinions</h2>
      {opinions.length === 0 ? (
        <p>No opinions found.</p>
      ) : (
        <ul>
          {opinions.map(opinion => (
            <li key={opinion.id} className="opinion-item">
              <h3>Opinion for POI ID: {opinion.poi_id}</h3>
              {renderOpinionData(opinion.opinion_data)}
              <button onClick={() => onDelete(opinion.id)}>Delete Opinion</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default OpinionList;