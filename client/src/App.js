import React, { useState, useEffect } from 'react';
import PoiList from './components/PoiList';
import PoiForm from './components/PoiForm';
import OpinionList from './components/OpinionList';
import OpinionForm from './components/OpinionForm';
import './App.css';

function App() {
  const [pois, setPois] = useState([]);
  const [opinions, setOpinions] = useState([]);

  useEffect(() => {
    fetchPois();
    fetchOpinions();
  }, []);

  const fetchPois = async () => {
    try {
      const response = await fetch('/api/poi');
      const data = await response.json();
      setPois(data);
    } catch (error) {
      console.error('Failed to fetch POIs:', error);
    }
  };

  const fetchOpinions = async () => {
    try {
      const response = await fetch('/api/opinions');
      if (!response.ok) {
        throw new Error('Failed to fetch opinions');
      }
      const data = await response.json();
      setOpinions(data);
    } catch (error) {
      console.error('Failed to fetch opinions:', error);
      setOpinions([]); // Set to empty array in case of error
    }
  };

  const addPoi = async (poiData) => {
    try {
      const response = await fetch('/api/poi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(poiData),
      });
      if (!response.ok) {
        throw new Error('Failed to add POI');
      }
      const newPoi = await response.json();
      setPois(prevPois => [...prevPois, newPoi]);
      return newPoi;  // Return the new POI
    } catch (error) {
      console.error('Failed to add POI:', error);
      throw error;  // Re-throw the error to be caught in the form
    }
  };

  const deletePoi = async (id) => {
    try {
      const response = await fetch(`/api/poi/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete POI');
      }
      setPois(pois.filter(poi => poi.id !== id));
      // Also remove related opinions from the state
      setOpinions(opinions.filter(opinion => opinion.poi_id !== id));
    } catch (error) {
      console.error('Failed to delete POI:', error);
    }
  };

  const deleteOpinion = async (id) => {
    try {
      const response = await fetch(`/api/opinions/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete opinion');
      }
      setOpinions(opinions.filter(opinion => opinion.id !== id));
    } catch (error) {
      console.error('Failed to delete opinion:', error);
    }
  };

  const addOpinion = async (opinionData) => {
    try {
      const response = await fetch('/api/opinions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(opinionData),
      });
      const newOpinion = await response.json();
      setOpinions([...opinions, newOpinion]);
    } catch (error) {
      console.error('Failed to add opinion:', error);
    }
  };

  return (
    <div className="App">
      <h1>Street Review</h1>
      <PoiForm onSubmit={addPoi} />
      <PoiList pois={pois} onDelete={deletePoi} />
      <OpinionForm pois={pois} onSubmit={addOpinion} />
      <OpinionList opinions={opinions} onDelete={deleteOpinion} />
    </div>
  );
}

export default App;