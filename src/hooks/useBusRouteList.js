import axios from 'axios';
import { useState } from 'react';

const serviceKey = process.env.REACT_APP_API_KEY;

const useBusRouteList = () => {
    const [stations, setStations] = useState([]);
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

            const busRouteStationLists = xmlDoc.getElementsByTagName('busRouteStationList')
            if (busRouteStationLists.length === 0) {
                throw new Error('No bus route station data');
            }

            const stationData = Array.from(busRouteStationLists).map(station => {
                const stationId = station.getElementsByTagName('stationId')[0]?.textContent || 'Unknown';
                const stationName = station.getElementsByTagName('stationName')[0]?.textContent || 'Unknown';
                return { stationId, stationName };
            });

            setStations(stationData);
        } catch (error) {
            console.error('error busRouteList', error);
            setError(error.message);
        }

    };
    return { stations, error, fetchBusRoute }
}

export default useBusRouteList;