import { useEffect, useState } from "react";

export default function App() {
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");

  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [name, setName] = useState("");

  const [feelslikeTemp, setFeelsLikeTemp] = useState("");
  const [text, setText] = useState("");

  const [precip, setPrecip] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [windSpeed, setWindSpeed] = useState(null);

  const [futureTemperatures, setFutureTemperatures] = useState([]);

  useEffect(
    function () {
      async function fetchData() {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });

          setLat(position.coords.latitude);
          setLon(position.coords.longitude);

          const key = "f63c614a48014fc58c880600230611";
          if (lat !== "" && lon !== "") {
            const res = await fetch(
              `https://api.weatherapi.com/v1/current.json?key=${key}&q=${lat},${lon}`
            );
            const data = await res.json();

            if (data.location) {
              const { country, region, name } = data.location;
              setCountry(country);
              setRegion(region);
              setName(name);
            }

            if (data.current) {
              const {
                feelslike_c,
                condition: { text },
                precip_mm,
                humidity,
                wind_kph,
              } = data.current;
              setFeelsLikeTemp(Math.round(feelslike_c));
              setText(text);

              const percentagePrecip = Math.round((precip_mm / 100) * 100);
              setPrecip(percentagePrecip);

              setHumidity(humidity);
              setWindSpeed(wind_kph);
            }
          }
        } catch (error) {
          console.error("Error fetching geolocation or weather data:", error);
        }
      }

      fetchData();
    },
    [lat, lon]
  );

  useEffect(
    function () {
      async function fetchForecastData() {
        try {
          const key = "f63c614a48014fc58c880600230611";

          if (lat !== "" && lon !== "") {
            const forecastRes = await fetch(
              `https://api.weatherapi.com/v1/forecast.json?key=${key}&q=${lat},${lon}&days=5` // Adjust the number of days as needed
            );
            const forecastData = await forecastRes.json();

            if (forecastData.forecast && forecastData.forecast.forecastday) {
              const temperatures = forecastData.forecast.forecastday.map(
                (day) => ({
                  date: day.date,
                  maxTempC: day.day.maxtemp_c,
                  minTempC: day.day.mintemp_c,
                })
              );
              setFutureTemperatures(temperatures);
            }
          }
        } catch (error) {
          console.error("Error fetching forecast data:", error);
        }
      }

      fetchForecastData();
    },
    [lat, lon]
  );

  return (
    <div className="container">
      <div className="weather-side">
        <div className="weather-gradient"></div>
        <div className="date-container">
          <h2 className="date-dayname">{country}</h2>
          <span className="date-day">{region}</span>
          <i className="location-icon" data-feather="map-pin"></i>
          <span className="location">{name}</span>
        </div>
        <div className="weather-container">
          <i className="weather-icon" data-feather="sun"></i>
          <h1 className="weather-temp">{feelslikeTemp}°C</h1>
          <h3 className="weather-desc">{text}</h3>
        </div>
      </div>

      <div className="info-side">
        <div className="today-info-container">
          <div className="today-info">
            <div className="precipitation">
              <span className="title">PRECIPITATION</span>
              <span className="value">
                {precip !== null ? `${precip} %` : "N/A"}
              </span>
              <div className="clear"></div>
            </div>
            <div className="humidity">
              <span className="title">HUMIDITY</span>
              <span className="value">{humidity} %</span>
              <div className="clear"></div>
            </div>
            <div className="wind">
              <span className="title">WIND</span>
              <span className="value">{windSpeed} km/h</span>
              <div className="clear"></div>
            </div>
          </div>
        </div>
        <div className="week-container">
          <ul className="week-list">
            {futureTemperatures.map((dayData) => (
              <li key={dayData.date}>
                <span className="day-name">{dayData.date}</span>
                <span className="day-temp">{`${dayData.maxTempC}°C`}</span>
              </li>
            ))}
            <div className="clear"></div>
          </ul>
        </div>
      </div>
    </div>
  );
}
