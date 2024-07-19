import axios from 'axios';
import { useState } from 'react';

//노선 정보 항목조회 (첫차, 막차,  배차시간)
const serviceKey = process.env.REACT_APP_API_KEY;

const useBusInfo = () => {
    const [busInfo, setBusInfo] = useState(null);
    const [error, setError] = useState(null);


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

    return { busInfo, error, fetchBusCodeInfo }
}

export default useBusInfo;