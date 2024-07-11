import React from 'react';

function PoiList({ pois, onDelete }) {
  return (
    <div className="poi-list">
      <h2>Persons of Interest</h2>
      {pois.length === 0 ? (
        <p>No persons of interest found.</p>
      ) : (
        <ul>
          {pois.map(poi => (
            <li key={poi.id} className="poi-item">
              <h3>{poi.name}</h3>
              <p>ID: {poi.id}</p>
              <p>State: {poi.state}</p>
              <p>Sun Sign: {poi.sun_sign}</p>
              <p>Pluto Sign: {poi.pluto_sign}</p>
              <p>VIP Count: {poi.vip_count}</p>
              <img src={poi.pic_url} alt={poi.name} className="poi-image" />
              <button onClick={() => onDelete(poi.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PoiList;