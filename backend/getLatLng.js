
export async function getLatLng({place}) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY; // Your API Key
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(place)}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    } else {
      throw new Error("No location found for the given address.");
    }
  } catch (error) {
    console.error("Error in getLatLng:", error);
    return { error: 'unable to fetch lat and lng' };;
  }
}
