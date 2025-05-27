import React, { useEffect, useState } from 'react';
import { fetchPlots } from '../services/api';

function HomePage() {
  const [plots, setPlots] = useState([]);

  useEffect(() => {
    fetchPlots().then(data => setPlots(data));
  }, []);

  return (
    <div>
      <h2>Available Plots</h2>
      <ul>
        {plots.map(plot => (
          <li key={plot.id}>{plot.name} - {plot.location}</li>
        ))}
      </ul>
    </div>
  );
}

export default HomePage;
