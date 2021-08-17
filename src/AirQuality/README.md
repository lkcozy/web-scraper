# Air Quality Reporter

Get everyday air quality for each city from [World's Air Pollution: Real-time Air Quality Index](https://waqi.info/).

## Getting Started

1. get your token from the [data-platform token](https://aqicn.org/data-platform/token/) page.

```sh
gh secret set AIR_QUALITY_API_TOKEN -b""
```

2. Set target city list.

```sh
gh secret set AIR_QUALITY_CITY_LIST -b"london"
```

## [Air Quality Programmatic APIs](https://aqicn.org/json-api/doc/)

Response Example

```json
{
  "idx": 7397,
  "aqi": 71,
  "time": {
    "v": 1481396400,
    "s": "2016-12-10 19:00:00",
    "tz": "-06:00"
  },
  "city": {
    "name": "Chi_sp, Illinois",
    "url": "https://aqicn.org/city/usa/illinois/chi_sp/",
    "geo": ["41.913600", "-87.723900"]
  },
  "iaqi": {
    "pm25": {
      "v": 71
    }
  },
  "forecast": {
    "daily": {
      "pm25": [
        {
          "avg": 154,
          "day": "2020-06-13",
          "max": 157,
          "min": 131
        },
        {
          "avg": 163,
          "day": "2020-06-14",
          "max": 173,
          "min": 137
        }
      ]
    }
  }
}
```

## Air Quality Index

| AQI | Air Pollution Level | Health Implications | Cautionary Statement (for PM2.5) |
| --- | --- | --- | --- |
| 0 - 50 | Good | Air quality is considered satisfactory, and air pollution poses little or no risk | None |
| 51 -100 | Moderate | Air quality is acceptable; however, for some pollutants there may be a moderate health concern for a very small number of people who are unusually sensitive to air pollution. | Active children and adults, and people with respiratory disease, such as asthma, should limit prolonged outdoor exertion. |
| 101-150 | Unhealthy for Sensitive Groups | Members of sensitive groups may experience health effects. The general public is not likely to be affected. | Active children and adults, and people with respiratory disease, such as asthma, should limit prolonged outdoor exertion. |
| 151-200 | Unhealthy | Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects | Active children and adults, and people with respiratory disease, such as asthma, should avoid prolonged outdoor exertion; everyone else, especially children, should limit prolonged outdoor exertion |
| 201-300 | Very Unhealthy | Health warnings of emergency conditions. The entire population is more likely to be affected. | Active children and adults, and people with respiratory disease, such as asthma, should avoid all outdoor exertion; everyone else, especially children, should limit outdoor exertion. |
| 300+ | Hazardous | Health alert: everyone may experience more serious health effects | Everyone should avoid all outdoor exertion |

```

```
