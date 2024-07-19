import axios from 'axios';
import { useState } from 'react';

const serviceKey = process.env.REACT_APP_API_KEY;

const useBusRouteList = () => {
    const [stationIds, setStationIds] = useState([]);
    const [error, setError] = useState(null);


    const fetchBusRoute = async (routeId) => {
        try {
            const url = `http://apis.data.go.kr/6410000/busrouteservice/getBusRouteStationList?serviceKey=${serviceKey}&routeId=${routeId}`
            const response = await axios.get(url, {
                headers: {
                    'Content-Type': 'text/xml; charset=utf-8'
                },
                responseType: 'text'
            });

            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(response.data, 'text/xml');

            const busRouteStationList = xmlDoc.getElementsByTagName('busRouteStationList')
            if (busRouteStationList.length === 0) {
                throw new Error('No bus route station data');
            }
            const busRouteStationInfo = busRouteStationList[0];

            const stationIds = Array.from(busRouteStationInfo.getElementsByTagName('stationId'))
                .map(stationId => stationId.textContent);

            setStationIds(stationIds);
        } catch (error) {
            console.error('error busRouteList', error);
            setError(error.message);
        }

    };
    return { stationIds, error, fetchBusRoute }
}

export default useBusRouteList;