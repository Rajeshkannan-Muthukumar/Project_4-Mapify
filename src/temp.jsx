
import React, {useEffect,useState,useRef} from 'react';
import haversine from 'haversine-distance';
// import playsong from "../assets/song.mp3"
//import playsong from "../../assets/song.mp3";
// import "./Location.css"
// import "../../index.css";

const Location = () => {
    const audioRef = useRef(new Audio(playsong));
    const [userlocation, setuserlocation] = useState({ latitude: 0, longitude: 0 });
    const [searcharea, setsearcharea] = useState("");
    const [destinationlocation, setdestinationlocation] = useState({ lat: 0, lon: 0 });
    const [distance, setdistance] = useState(0);

    useEffect(() => {
        const geo = navigator.geolocation;
        const watchId = geo.watchPosition(userCoords);

        // Clean up the watchPosition on component unmount
        return () => geo.clearWatch(watchId);
    }, []);

    const userCoords = (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setuserlocation({ latitude, longitude });
        console.log(latitude, longitude);

        // Recalculate the distance whenever the user location changes
        if (destinationlocation.lat !== 0 && destinationlocation.lon !== 0) {
            calculatedistancehandler(latitude, longitude, destinationlocation.lat, destinationlocation.lon);
        }
    };

    const fetchGeocode = async (dlocation) => {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(dlocation)}`;
            
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.length > 0) {
                const { lat, lon } = data[0];
                console.log(lat, lon);
                return { lat, lon };
            } else {
                return null;
            }
        } catch (error) {
            console.error('Geocoding API error:', error);
        }
    };

    const searchinputhandler = (e) => {
        setsearcharea(e.target.value);
    };

    const searchdestinationhandler = async () => {
        const destination = await fetchGeocode(searcharea);
        if (destination) {
            setdestinationlocation(destination);
            calculatedistancehandler(userlocation.latitude, userlocation.longitude, destination.lat, destination.lon);
        }
    };

    const traveldistance = (la1, lo1, la2, lo2) => {
        return haversine({ lat: la1, lng: lo1 }, { lat: la2, lng: lo2 }) / 1000;
    };

    const calculatedistancehandler = (lat1, lon1, lat2, lon2) => {
        const totaldistance = traveldistance(lat1, lon1, lat2, lon2);
        console.log(totaldistance);
        setdistance(totaldistance);
        if(totaldistance<= 7){
            audioRef.current.play();
            console.log("Ring")
        }
    };
    const stop =()=>{
        audioRef.current.currentTime = 0;
        audioRef.current.pause()
        console.log("Not Ring");
        setuserlocation({ latitude: 0, longitude: 0 });
        setdistance(0);

    }

    return (
        <>
            <div >
            <h1>Mapify </h1>
            <input type='text' onChange={searchinputhandler} />
            <button onClick={searchdestinationhandler}>Go</button>
            {/* {<div>{searcharea}</div>} */}
            <div>Current latitude : {userlocation.latitude}</div>
            <div>Current latitude : {userlocation.longitude}</div>
            <h3>{distance} km to go  </h3>
            <button onClick={stop}>Stop Alarm</button>
            </div>
        </>
        

    );
};

export default Location;