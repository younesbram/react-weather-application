import React, { useCallback } from 'react';
import { useState, useEffect } from 'react';
import _ from 'lodash';

import Weather from './components/Weather';
import LoadingIndicator from './UI/LoadingIndicator';

import './app.css';

function App() {
  const [data, setData] = useState(null);
  const [place, setPlace] = useState(null);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  //todo
  const debouncedHandleSearch = useCallback(_.debounce((e) => {
    setSearch(e.target.value);
  }, 5), []);


  const handleSearch = useCallback((e) => {
    setSearch(e.target.value);
  }, []);


  const geoHandler = useCallback(() => {
    setSearch('');
    setIsLoading(true);
    try {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setLocation(`${latitude},${longitude}`);
      });
    } catch (error) {
      // handle error
    }
  }, []);

  const fetchData = useCallback(
    async (search, location, parameters = {}) => {
      const options = {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': '0173291af0msh62b3ca25953f210p13d732jsn66b4d9f97708',
          'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com',
        },
      };
      const queryString = new URLSearchParams({
        ...parameters,
        q: search || location,
      }).toString();
      const currentUrl = `https://weatherapi-com.p.rapidapi.com/current.json?${queryString}`;
      const forecastUrl = `https://weatherapi-com.p.rapidapi.com/forecast.json?${queryString}`;
      try {
        const [currentResponse, forecastResponse] = await Promise.all([
          fetch(currentUrl, options),
          fetch(forecastUrl, options),
        ]);
        const currentResponseData = await currentResponse.json();
        const forecastResponseData = await forecastResponse.json();
        return {
          current: currentResponseData.current,
          location: currentResponseData.location,
          forecast: forecastResponseData.forecast,
        };
      } catch (error) {
        // handle error 
      }
    },
    []
  );

  useEffect(() => {
    if (search || location) {
      setIsLoading(true);
      fetchData(search, location).then((responseData) => {
        setPlace(responseData.location);
        setData(responseData.current);
        setIsLoading(false);
      });
    }
  }, [location, search, fetchData]);

  let display = data ? (
    <Weather place={place} data={data} />
  ) : (
    <p>no data found 😬</p>
  ); return (
    <>
      <div className="container">
        <h1>WEATHER APPLICATION</h1>
        <div className="search-sec">
          <input
            type="text"
            value={search}
            placeholder="Search by City..."
            onChange={debouncedHandleSearch}
          />

        </div>
        <div>
          <p>or</p>
        </div>
        <div>
          <button onClick={geoHandler}>Find me!
          </button>
        </div>
        <br />
        <br />
        {isLoading && <LoadingIndicator />}
        {display}
      </div>
      <span className="credit">@younesbram/github</span>
    </>
  );
}

export default App;