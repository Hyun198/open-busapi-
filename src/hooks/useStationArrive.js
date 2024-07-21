import React, { useState } from 'react'
import axios from 'axios'

const serviceKey = process.env.REACT_APP_API_KEY;

const useStationArrive = () => {

    const [arrivals, setArrivals] = useState([]);

    const fetchArrive = async (stationId) => {
        try {
            const url = `http://apis.data.go.kr/6410000/busarrivalservice/getBusArrivalList?serviceKey=${serviceKey}&stationId=${stationId}`
            const response = await axios.get(url, {
                headers: {
                    'Content-Type': 'text/xml; charset=utf-8'
                },
                responseType: 'text'
            });


            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(response.data, 'text/xml');

            const busArriveLists = xmlDoc.getElementsByTagName('busArrivalList')
            if (busArriveLists.length === 0) {
                throw new Error('No bus arrive data');
            }

            const arrivalData = [];
            for (let i = 0; i < busArriveLists.length; i++) {
                const busArrival = busArriveLists[i];
                const routeId = busArrival.getElementsByTagName('routeId')[0].textContent;
                const routeNumber = await fetchRouteNumber(routeId);

                arrivalData.push({
                    stationId: busArrival.getElementsByTagName('stationId')[0].textContent,
                    routeId,
                    routeNumber,
                    locationNo1: busArrival.getElementsByTagName('locationNo1')[0].textContent,
                    predictTime1: busArrival.getElementsByTagName('predictTime1')[0].textContent,
                    remainSeatCnt1: busArrival.getElementsByTagName('remainSeatCnt1')[0].textContent,
                });
            }

            setArrivals(arrivalData);
        } catch (error) {
            console.error(error);
        }
    }

    const fetchRouteNumber = async (routeId) => {
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
            const routeNumber = xmlDoc.getElementsByTagName('routeName')[0].textContent;
            console.log(routeNumber);
            return routeNumber;
        } catch (error) {
            console.error('Error fetching route number:', error);
            return null;
        }
    }

    return { arrivals, fetchArrive };
}

export default useStationArrive