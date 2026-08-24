import { useEffect, useState } from "react";

export interface WeatherData {
  temp: number | null;
  condition: string;
  cityName: string;
  locality: string;
  humidity: number | null;
  windSpeed: number | null;
  weatherCode: number | null;
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
}

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData>({
    temp: null,
    condition: "",
    cityName: "",
    locality: "",
    humidity: null,
    windSpeed: null,
    weatherCode: null,
    loading: true,
    error: null,
    permissionDenied: false,
  });

  const fetchWeatherForCoords = async (lat: number, lon: number) => {
    setWeather((prev) => ({ ...prev, loading: true, error: null, permissionDenied: false }));
    try {
      // Reverse geocode to get real location city name
      let city = "";
      let locality = "";
      try {
        const geoRes = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
        );
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          city = geoData.city || geoData.locality || geoData.principalSubdivision || "Current Location";
          locality = geoData.locality || geoData.city || "";
        }
      } catch (e) {
        city = "Current Location";
      }

      // Fetch real-time weather from Open-Meteo
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`
      );
      if (!res.ok) throw new Error("Failed to fetch weather");
      const data = await res.json();

      if (data?.current) {
        const code = data.current.weather_code ?? 0;
        let cond = "Clear Sky";
        if (code >= 1 && code <= 3) cond = "Partly Cloudy";
        else if (code >= 45 && code <= 48) cond = "Foggy";
        else if (code >= 51 && code <= 67) cond = "Rainy";
        else if (code >= 71 && code <= 77) cond = "Snowy";
        else if (code >= 80 && code <= 82) cond = "Showers";
        else if (code >= 95) cond = "Thunderstorm";

        setWeather({
          temp: Math.round(data.current.temperature_2m),
          condition: cond,
          cityName: city || "Current Location",
          locality: locality,
          humidity: Math.round(data.current.relative_humidity_2m),
          windSpeed: Math.round(data.current.wind_speed_10m),
          weatherCode: code,
          loading: false,
          error: null,
          permissionDenied: false,
        });
      }
    } catch (err: any) {
      setWeather((prev) => ({
        ...prev,
        loading: false,
        error: err?.message || "Weather fetch failed",
      }));
    }
  };

  const requestLocation = () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setWeather((prev) => ({
        ...prev,
        loading: false,
        error: "Geolocation not supported",
      }));
      return;
    }

    setWeather((prev) => ({ ...prev, loading: true, permissionDenied: false }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchWeatherForCoords(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        setWeather((prev) => ({
          ...prev,
          loading: false,
          permissionDenied: true,
          error: "Location permission denied",
        }));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  return { ...weather, requestLocation };
}
