export async function fetchPlots() {
  const response = await fetch('http://localhost:5000/api/plots');
  const data = await response.json();
  return data;
}
