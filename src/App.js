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
    <>
      <nav className="navbar">
        <h2>경기도 버스 노선 조회</h2>
        <div className="search-form">
          <input type="text" className="search-box" placeholder='검색할 버스 번호' ref={keywordInput} />
          <button onClick={handleSearch}>Search</button>
        </div>

      </nav>
      <div className="layout">
        {busInfo ? (
          <div className="bus-route-info">
            <h2>{keyword} 버스 노선 정보</h2>
            <p>Region Name: {busInfo.regionName}</p>
            <p>Up First Time: {busInfo.upFirstTime}</p>
            <p>Up Last Time: {busInfo.upLastTime}</p>
            <p>Down First Time: {busInfo.downFirstTime}</p>
            <p>Down Last Time: {busInfo.downLastTime}</p>
            <p>Peek Alloc: {busInfo.peekAlloc}</p>
            <p>Non-Peek Alloc: {busInfo.nPeekAlloc}</p>
            <p>Company Tel: {busInfo.companyTel}</p>
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


      </div>
      {arrivals.length > 0 && (
        <div className="bus-arrive">
          <h2>Bus Arrivals for {selectedStation.stationName}</h2>
          <ul>
            {arrivals.map((arrival, index) => (
              <li key={index}>
                <strong>버스 번호:</strong> {arrival.routeNumber} <strong>Location No:</strong> {arrival.locationNo1} 정거장 전 <strong>Predict Time:</strong> {arrival.predictTime1}분 후 <strong>Remain Seat Count:</strong> {arrival.remainSeatCnt1} 좌석 남음
              </li>
            ))}
          </ul>
        </div>
      )}
    </>


  );
}

export default App;
