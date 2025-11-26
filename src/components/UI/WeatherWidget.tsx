import { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, CloudSnow, Wind } from 'lucide-react';

interface WeatherData {
    temp: number;
    condition: string;
    high: number;
    low: number;
    humidity: number;
}

export default function WeatherWidget() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // For now, using mock data. In production, you'd fetch from a weather API
        // like OpenWeatherMap: https://api.openweathermap.org/data/2.5/weather?q=Berlin&units=metric&appid=YOUR_KEY
        const mockWeather: WeatherData = {
            temp: 8,
            condition: 'Cloudy',
            high: 12,
            low: 5,
            humidity: 75
        };

        // Simulate API call
        setTimeout(() => {
            setWeather(mockWeather);
            setLoading(false);
        }, 500);
    }, []);

    const getWeatherIcon = (condition: string) => {
        switch (condition.toLowerCase()) {
            case 'sunny':
            case 'clear':
                return <Sun size={24} />;
            case 'rainy':
            case 'rain':
                return <CloudRain size={24} />;
            case 'snowy':
            case 'snow':
                return <CloudSnow size={24} />;
            case 'windy':
                return <Wind size={24} />;
            default:
                return <Cloud size={24} />;
        }
    };

    if (loading || !weather) {
        return (
            <div className="weather-widget">
                <div className="weather-loading">
                    <Cloud size={20} className="animate-pulse" />
                </div>
            </div>
        );
    }

    const getConditionClass = (condition: string) => {
        const c = condition.toLowerCase();
        if (c.includes('sun') || c.includes('clear')) return 'sunny';
        if (c.includes('rain')) return 'rainy';
        if (c.includes('snow')) return 'snowy';
        if (c.includes('cloud')) return 'cloudy';
        return 'default';
    };

    return (
        <div className={`weather-widget ${getConditionClass(weather.condition)}`}>
            <div className="weather-icon">
                {getWeatherIcon(weather.condition)}
            </div>
            <div className="weather-temp">
                <span className="temp-value">{Math.round(weather.temp)}°</span>
            </div>
        </div>
    );
}
