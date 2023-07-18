import React, { useEffect } from 'react';
import { Map } from 'react-kakao-maps';

const MapContainer = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.src = '//dapi.kakao.com/v2/maps/sdk.js?appkey=a9ab6f24ae29fe6917ba30ea5a988ef2';
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const mapOption = {
    center: new window.kakao.maps.LatLng(33.450701, 126.570667),
    level: 3
  };

  return (
    <>
      <div id="map" style={{ width: '100%', height: '350px' }} />
      {window.kakao && <Map id="map" options={mapOption} />}
    </>
  );
};

export default MapContainer;
