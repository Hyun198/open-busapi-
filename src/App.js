import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import useBusInfo from './hooks/useBusInfo';
import useBusRouteList from './hooks/useBusRouteList';
import useStationArrive from './hooks/useStationArrive';
function App() {
  const serviceKey = process.env.REACT_APP_API_KEY;

  const [keyword, setKeyword] = useState("");
  const [routeId, setRouteId] = useState(null);


  const [selectedStation, setSelectedStation] = useState(null);

  const keywordInput = useRef(null);

  const { busInfo, fetchBusCodeInfo } = useBusInfo();
  const { stations, fetchBusRoute } = useBusRouteList()
  const { arrivals, fetchArrive } = useStationArrive();

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

  const handleStationClick = async (stationId, stationName) => {
    setSelectedStation({ stationId, stationName });
    await fetchArrive(stationId);
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
      fetchBusCodeInfo(routeId); //버스 노선 정보
      fetchBusRoute(routeId); // keyword 노선의 경유 정류장들
    }
  }, [routeId]);


  return (
    <div>
      Homepage

      <input type="text" placeholder='검색할 버스 번호' ref={keywordInput} />
      <button onClick={handleSearch}>Search</button>
      {keyword && <p>입력된 키워드: {keyword}</p>}
      {busInfo ? (
        <div>
          <h2>버스 노선 정보</h2>
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
        <div className="station-list">
          <h2>Stations</h2>
          <ul>
            {stations.map((station) => (
              <li key={station.stationId} onClick={() => handleStationClick(station.stationId, station.stationName)}>
                <strong>ID:</strong> {station.stationId} <strong>Name:</strong> {station.stationName}
              </li>
            ))}
          </ul>
        </div>
      )}
      {arrivals.length > 0 && (
        <div className="bus-arrive">
          <h2>Bus Arrivals for {selectedStation.stationName}</h2>
          <ul>
            {arrivals.map((arrival, index) => (
              <li key={index}>
                <strong>버스 번호:</strong> {arrival.routeNumber} <strong>Location No:</strong> {arrival.locationNo1} <strong>Predict Time:</strong> {arrival.predictTime1} <strong>Remain Seat Count:</strong> {arrival.remainSeatCnt1}
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>

  );
}

export default App;
