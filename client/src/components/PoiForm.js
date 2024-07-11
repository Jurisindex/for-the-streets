import React, { useState } from 'react';

function PoiForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    state: '',
    pic_url: '',
    sun_sign: '',
    pluto_sign: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isValidImageUrl = async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (!response.ok) {
        return false;
      }
      const contentType = response.headers.get('Content-Type');
      return contentType.startsWith('image/');
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const isValidImage = await isValidImageUrl(formData.pic_url);
      if (!isValidImage) {
        alert('Please enter a valid URL for an image');
        return;
      }
  
      await onSubmit(formData);
      setFormData({ name: '', state: '', pic_url: '', sun_sign: '', pluto_sign: '' });
    } catch (error) {
      console.error('Error adding POI:', error);
      // Handle error (e.g., show error message to user)
    }
  };

  const astrologicalSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add New Person of Interest</h2>
      <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" required />
      <input name="state" value={formData.state} onChange={handleChange} placeholder="State" required />
      <input name="pic_url" value={formData.pic_url} onChange={handleChange} placeholder="Picture URL" required />
      <select name="sun_sign" value={formData.sun_sign} onChange={handleChange} required>
        <option value="">Select Sun Sign</option>
        {astrologicalSigns.map(sign => (
          <option key={sign} value={sign}>{sign}</option>
        ))}
      </select>
      <select name="pluto_sign" value={formData.pluto_sign} onChange={handleChange} required>
        <option value="">Select Pluto Sign</option>
        {astrologicalSigns.map(sign => (
          <option key={sign} value={sign}>{sign}</option>
        ))}
      </select>
      <button type="submit">Add POI</button>
    </form>
  );
}

export default PoiForm;