import React, { useCallback, useEffect } from 'react'
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF, OverlayViewF, OVERLAY_MOUSE_TARGET } from '@react-google-maps/api';

const containerStyle = { height: '80vh', width: '100%' };
const apiKey = "AIzaSyAvN9XsMfNUiAcD6hzW9V8u4fFFVy2_XBs"; // Your API Key


const options = {
  streetViewControl: false,
  mapTypeControl: false
  // keyBoardShortcuts: false
}

function Map({center, zoom, places}) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey
  })


  const [map, setMap] = React.useState(null)

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  useEffect(() => {
    if (map && places && places.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      places.forEach(async(place) => {
        
        bounds.extend(new window.google.maps.LatLng(place.lat, place.lng));
        bounds.extend(new window.google.maps.LatLng(place.lat+0.02, place.lng+0.02));
        bounds.extend(new window.google.maps.LatLng(place.lat-0.02, place.lng-0.02));
      });
  
      map.fitBounds(bounds);
    }
  }, [map, places]);

  return isLoaded ? (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={options}
      >
        {/* Array ot InfoWindow mapped */}
        {
          places.map((p, i) => (
            <InfoWindowF key={i} position={p}>
              <div className="max-w-xs">
                <h1 className="text-black">{p.text}</h1>
              </div>
            </InfoWindowF>  
          ))
        }

      </GoogleMap>
  ) : <></>
}

export default React.memo(Map)