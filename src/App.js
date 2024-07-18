import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {

  const [busCode, setBusCode] = useState(null);
  const [busInfo, setBusInfo] = useState(null);
  const [error, setError] = useState(null);

  let serviceKey = process.env.REACT_APP_API_KEY;
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
      setError(error.message);
    }
  };


  //노선 정보 항목조회 (첫차, 막차,  배차시간)
  const fetchBusCodeInfo = async (routeId) => {
    try {
      const url = `http://apis.data.go.kr/6410000/busrouteservice/getBusRouteInfoItem?serviceKey=${serviceKey}&routeId=${routeId}`;
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'text/xml; charset=utf-8'
        },
        responseType: 'text'
      });

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(response.data, 'text/xml');

      const busRouteInfoItems = xmlDoc.getElementsByTagName('busRouteInfoItem');
      if (busRouteInfoItems.length === 0) {
        throw new Error('No bus route info item found');
      }

      const busRouteInfo = busRouteInfoItems[0];

      const busInfo = {
        regionName: busRouteInfo.getElementsByTagName('regionName')[0].textContent,
        upFirstTime: busRouteInfo.getElementsByTagName('upFirstTime')[0].textContent,
        upLastTime: busRouteInfo.getElementsByTagName('upLastTime')[0].textContent,
        downFirstTime: busRouteInfo.getElementsByTagName('downFirstTime')[0].textContent,
        downLastTime: busRouteInfo.getElementsByTagName('downLastTime')[0].textContent,
        peekAlloc: busRouteInfo.getElementsByTagName('peekAlloc')[0].textContent,
        nPeekAlloc: busRouteInfo.getElementsByTagName('nPeekAlloc')[0].textContent,
        companyTel: busRouteInfo.getElementsByTagName('companyTel')[0].textContent,
      };

      setBusInfo(busInfo);
    } catch (error) {
      console.error('Error fetching bus route info:', error);
      setError(error.message);
    }
  };


  useEffect(() => {
    const keyword = '52'; // 사용자 입력값으로 대체 가능
    const getBusCode = async () => {
      const routeId = await fetchBusCode(keyword);

      if (routeId) {
        setBusCode(routeId);
        fetchBusCodeInfo(routeId);
      }
    };

    getBusCode();
  }, []);


  return (
    <div>
      Homepage
      routeId={busCode}
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
    </div>

  );
}

export default App;
