import React, { useState } from 'react';

function OpinionForm({ pois, onSubmit }) {
  const [formData, setFormData] = useState({
    poi_id: '',
    opinion_data: {
      core: {
        openness: 1,
        conscientiousness: 1,
        extraversion: 1,
        agreeableness: 1,
        neuroticism: 1
      },
      dating: {
        oscar_worthy_actress: false,
        witness_protection: false,
        hole_in_one: false,
        raw_dog: false,
        miss_leading: false,
        grab_and_ghost: { value: false, amount: 0 },
        victim_mentality: false,
        yes_means_no: false,
        catches_flights: false,
        alpha_widow: false
      }
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCoreChange = (trait, value) => {
    setFormData(prevState => ({
      ...prevState,
      opinion_data: {
        ...prevState.opinion_data,
        core: {
          ...prevState.opinion_data.core,
          [trait]: parseInt(value)
        }
      }
    }));
  };

  const handleDatingChange = (trait, value) => {
    setFormData(prevState => ({
      ...prevState,
      opinion_data: {
        ...prevState.opinion_data,
        dating: {
          ...prevState.opinion_data.dating,
          [trait]: trait === 'grab_and_ghost' ? { ...prevState.opinion_data.dating.grab_and_ghost, value } : value
        }
      }
    }));
  };

  const handleGrabAndGhostAmount = (amount) => {
    setFormData(prevState => ({
      ...prevState,
      opinion_data: {
        ...prevState.opinion_data,
        dating: {
          ...prevState.opinion_data.dating,
          grab_and_ghost: { ...prevState.opinion_data.dating.grab_and_ghost, amount: parseInt(amount) }
        }
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Opinion</h2>
      <select name="poi_id" value={formData.poi_id} onChange={handleChange} required>
        <option value="">Select POI</option>
        {pois.map(poi => (
          <option key={poi.id} value={poi.id}>{poi.name}</option>
        ))}
      </select>
      <h3>Core Traits</h3>
      {Object.keys(formData.opinion_data.core).map(trait => (
        <div key={trait}>
          <label>{trait.charAt(0).toUpperCase() + trait.slice(1)}:</label>
          <input 
            type="range" 
            min="1" 
            max="5" 
            value={formData.opinion_data.core[trait]} 
            onChange={(e) => handleCoreChange(trait, e.target.value)} 
          />
          <span>{formData.opinion_data.core[trait]}</span>
        </div>
      ))}
      <h3>Dating Traits</h3>
      {Object.keys(formData.opinion_data.dating).map(trait => (
        <div key={trait}>
          <label>
            <input 
              type="checkbox" 
              checked={trait === 'grab_and_ghost' ? formData.opinion_data.dating[trait].value : formData.opinion_data.dating[trait]} 
              onChange={(e) => handleDatingChange(trait, e.target.checked)} 
            />
            {trait.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </label>
          {trait === 'grab_and_ghost' && formData.opinion_data.dating[trait].value && (
            <input 
              type="number" 
              min="0" 
              max="100000000" 
              value={formData.opinion_data.dating[trait].amount} 
              onChange={(e) => handleGrabAndGhostAmount(e.target.value)} 
            />
          )}
        </div>
      ))}
      <button type="submit">Submit Opinion</button>
    </form>
  );
}

export default OpinionForm;