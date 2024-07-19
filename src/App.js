import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import useBusInfo from './hooks/useBusInfo';
import useBusRouteList from './hooks/useBusRouteList';
function App() {
  const serviceKey = process.env.REACT_APP_API_KEY;

  const [keyword, setKeyword] = useState("");
  const [routeId, setRouteId] = useState(null);
  const keywordInput = useRef(null);

  const { busInfo, fetchBusCodeInfo } = useBusInfo();
  const { stations, fetchBusRoute } = useBusRouteList()

  const handleSearch = () => {
    setKeyword(keywordInput.current.value);

  }

  //버스 노선정보 조회
  const fetchBusCode = async (keyword) => {
    let url = `http://apis.data.go.kr/6410000/busrouteservice/getBusRouteList?serviceKey=${serviceKey}&keyword=${keyword}`;

    try {
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'text/xml; charset=utf-8'
        },
        responseType: 'text'
      });

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(response.data, 'text/xml');
      const busRouteLists = xmlDoc.getElementsByTagName('busRouteList');

      for (let i = 0; i < busRouteLists.length; i++) {
        const regionName = busRouteLists[i].getElementsByTagName('regionName')[0].textContent;
        if (regionName.includes('김포')) {
          const routeId = busRouteLists[i].getElementsByTagName('routeId')[0].textContent;
          return routeId;
        }
      }
    } catch (error) {
      console.error('Error fetching bus code:', error);

    }
  };



  useEffect(() => {
    const getBusCode = async () => {
      if (keyword) {
        const routeId = await fetchBusCode(keyword);
        if (routeId) {
          setRouteId(routeId);
        }
      }
    };
    getBusCode();
  }, [keyword]);

  useEffect(() => {
    if (routeId) {
      fetchBusCodeInfo(routeId);
      fetchBusRoute(routeId);
    }
  }, [routeId, fetchBusCodeInfo, fetchBusRoute]);


  return (
    <div>
      Homepage

      <input type="text" placeholder='검색할 버스 번호' ref={keywordInput} />
      <button onClick={handleSearch}>Search</button>
      {keyword && <p>입력된 키워드: {keyword}</p>}
      {busInfo ? (
        <div>
          <p><strong>Region Name:</strong> {busInfo.regionName}</p>
          <p><strong>Up First Time:</strong> {busInfo.upFirstTime}</p>
          <p><strong>Up Last Time:</strong> {busInfo.upLastTime}</p>
          <p><strong>Down First Time:</strong> {busInfo.downFirstTime}</p>
          <p><strong>Down Last Time:</strong> {busInfo.downLastTime}</p>
          <p><strong>Peek Alloc:</strong> {busInfo.peekAlloc}</p>
          <p><strong>Non-Peek Alloc:</strong> {busInfo.nPeekAlloc}</p>
          <p><strong>Company Tel:</strong> {busInfo.companyTel}</p>
        </div>
      ) : (
        <p>Loading bus information...</p>
      )}
      {stations.length > 0 && (
        <div>
          <h2>Stations</h2>
          <ul>
            {stations.map(station => (
              <li key={station.stationId}>
                <strong>ID:</strong> {station.stationId} <strong>Name:</strong> {station.stationName}
              </li>
            ))}
          </ul>
        </div>
      )}


    </div>

  );
}

export default App;
