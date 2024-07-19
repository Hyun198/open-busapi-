const fetchBusLocation = async () => {
    try {
        const url = `http://apis.data.go.kr/6410000/buslocationservice/getBusLocationList?serviceKey=${serviceKey}&routeId=232000009`
        const response = await axios.get(url, {
            headers: {
                'Content-Type': 'text/xml; charset=utf-8'
            },
            responseType: 'text'
        });

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(response.data, 'text/xml');
        const busLocationList = xmlDoc.getElementsByTagName('busLocationList');
        if (busLocationList.length === 0) {
            throw new Error('No bus location info item found');
        }

        const busLocation = busLocationList[0];
        const busLoc = {
            endBus: busLocation.getElementsByTagName('endBus')[0].textContent,
            lowPlate: busLocation.getElementsByTagName('lowPlate')[0].textContent,
            plateNo: busLocation.getElementsByTagName('plateNo')[0].textContent,
        }
        console.log('busLoc', busLoc);

    } catch (error) {
        console.error(error);
    }

}