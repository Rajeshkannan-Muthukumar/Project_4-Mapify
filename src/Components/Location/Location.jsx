
import React, { useEffect, useState, useRef } from 'react';
import haversine from 'haversine-distance';
import playsong from "../../assets/song.mp3"; // Ensure this path is correct

const Location = () => {
    const audioRef = useRef(new Audio(playsong));
    const [userlocation, setuserlocation] = useState({ latitude: 0, longitude: 0 });
    const [searcharea, setsearcharea] = useState("");
    const [destinationlocation, setdestinationlocation] = useState({ lat: 0, lon: 0 });
    const [distance, setdistance] = useState(0);
    const [error, setError] = useState('');
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
                alert('No results found, Enter Station  name correctly');
                setsearcharea("")
            }
        } catch (error) {
            console.error('Geocoding API error:', error);
            alert('Error retrieving coordinates. Please try again.');
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
        const totaldistance = traveldistance(lat1, lon1, lat2, lon2).toFixed(4);
        console.log(totaldistance);
        setdistance(totaldistance);
        if (totaldistance <= 50) {
            audioRef.current.play();
            console.log("Ring");
        }
    };
    const stop = () => {
        audioRef.current.currentTime = 0;
        audioRef.current.pause();
        console.log("Not Ring");
        setuserlocation({ latitude: 0, longitude: 0 });
        setdistance(0);
        setsearcharea("")
    };
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm transform transition-transform duration-300 ease-in-out hover:scale-105">
                <h1 className="text-2xl font-bold mb-4 text-center">Mapify</h1>
                <input
                    type="text"
                    onChange={searchinputhandler}
                    className="border border-gray-300 rounded px-4 py-2 w-full mb-4"
                    placeholder="Search destination"
                    value={searcharea}
                />
                <button
                    onClick={searchdestinationhandler}
                    className="bg-blue-500 text-white py-2 px-4 rounded w-full mb-4 transform transition-transform duration-300 ease-in-out hover:scale-105"
                >
                    Go
                </button>
                <div className="text-gray-700 mb-2">Current latitude: {userlocation.latitude.toFixed(4)}</div>
                <div className="text-gray-700 mb-4">Current longitude: {userlocation.longitude.toFixed(4)}</div>
                <h3 className="text-lg font-semibold mb-4">{distance} km to go</h3>
                <button
                    onClick={stop}
                    className="bg-red-500 text-white py-2 px-4 rounded w-full transform transition-transform duration-300 ease-in-out hover:scale-105"
                >
                    Stop Alarm
                </button>
            </div>
        </div>
    );
};

export default Location;
