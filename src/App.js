import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {

  let serviceKey = process.env.REACT_APP_API_KEY;
  let keyword = 52;
  //버스 노선정보 조회
  const fetchBusCode = async (keyword) => {
    //52번 버스  나중에 사용자 입력값이 될거임.

    let url = `http://apis.data.go.kr/6410000/busrouteservice/getBusRouteList?serviceKey=${serviceKey}&keyword=${keyword}`;

    try {
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'text/xml; charset=utf-8'
        },
        responseType: 'document'
      });

      // XML Document를 가져왔습니다.
      const xmlDoc = response.data;
      const busRouteLists = xmlDoc.getElementsByTagName('busRouteList');
      for (let i = 0; i < busRouteLists.length; i++) {
        const regionName = busRouteLists[i].getElementsByTagName('regionName')[0].textContent;
        if (regionName.includes('김포')) {
          const routeId = busRouteLists[i].getElementsByTagName('routeId')[0].textContent
          return routeId;
        }
      }
    }
    catch (error) {
      console.error('Error fetching bus code:', error);
    }
  }



  //노선 정보 항목조회 (첫차, 막차,  배차시간)
  const fetchBusCodeInfo = async (busCode) => {
    let routeId = busCode;
    try {
      let url = ` http://apis.data.go.kr/6410000/busrouteservice/getBusRouteInfoItem?serviceKey=${serviceKey}&routeId=${routeId}`
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'text/xml; charset=utf-8'
        },
        responseType: 'document'
      });

      const xmlDoc = response.data;
      const busRouteInfo = xmlDoc.getElementsByTagName('busRouteInfoItem')[0];

      const regionName = busRouteInfo.getElementsByTagName('regionName')[0].textContent;
      const upFirstTime = busRouteInfo.getElementsByTagName('upFirstTime')[0].textContent;
      const upLastTime = busRouteInfo.getElementsByTagName('upLastTime')[0].textContent;
      const downFirstTime = busRouteInfo.getElementsByTagName('downFirstTime')[0].textContent;
      const downLastTime = busRouteInfo.getElementsByTagName('downLastTime')[0].textContent;
      const peekAlloc = busRouteInfo.getElementsByTagName('peekAlloc')[0].textContent;
      const nPeekAlloc = busRouteInfo.getElementsByTagName('nPeekAlloc')[0].textContent;
      const companyTel = busRouteInfo.getElementsByTagName('companyTel')[0].textContent;

      console.log(`Region Name: ${regionName}`);
      console.log(`Up First Time: ${upFirstTime}`);
      console.log(`Up Last Time: ${upLastTime}`);
      console.log(`Down First Time: ${downFirstTime}`);
      console.log(`Down Last Time: ${downLastTime}`);
      console.log(`Peek Alloc: ${peekAlloc}`);
      console.log(`Non-Peek Alloc: ${nPeekAlloc}`);
      console.log(`Company Tel: ${companyTel}`);

    } catch (error) {
      console.error('error 버스 항복조회', error);
    }
  }


  const busCode = fetchBusCode(keyword);
  fetchBusCodeInfo(busCode);

  return (
    <div>
      Homepage
    </div>

  );
}

export default App;
