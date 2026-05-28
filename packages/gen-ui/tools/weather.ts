import { Effect, Schema } from "effect"
import { HttpClient, HttpClientRequest } from "effect/unstable/http"
import * as Tool from "opencode/tool/tool"

export const Parameters = Schema.Struct({
  location: Schema.String.annotate({
    description: "City name or location to get weather for (e.g. 'London', 'New York', 'Tokyo')",
  }),
  units: Schema.Literals(["metric", "imperial"])
    .annotate({
      description: "Temperature units: metric (Celsius) or imperial (Fahrenheit). Defaults to metric.",
      default: "metric",
    })
    .pipe(Schema.optional, Schema.withDecodingDefault(Effect.succeed("metric" as const))),
})

export interface WeatherMetadata {
  location: string
  temperature: number
  feels_like: number
  humidity: number
  description: string
  icon: string
  wind_speed: number
  units: "metric" | "imperial"
}

export const WeatherTool = Tool.define(
  "get_weather",
  Effect.gen(function* () {
    const http = yield* HttpClient.HttpClient

    return {
      description:
        "Get the current weather for a location. Returns temperature, humidity, wind speed, and conditions. Use this when the user asks about weather.",
      parameters: Parameters,
      execute: (params: Schema.Schema.Type<typeof Parameters>, _ctx: Tool.Context) =>
        Effect.gen(function* () {
          const unitParam = params.units === "imperial" ? "u" : "m"
          const url = `https://wttr.in/${encodeURIComponent(params.location)}?format=j1&${unitParam}`

          const request = HttpClientRequest.get(url).pipe(
            HttpClientRequest.setHeaders({
              "User-Agent": "opencode-gen-ui/1.0",
              Accept: "application/json",
            }),
          )

          const response = yield* http.execute(request)
          // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
          // Safe: response.json returns Effect<unknown> and is typed correctly from the HTTP client library
          const json: unknown = yield* (response.json as Effect.Effect<unknown>)

          const current = json.current_condition?.[0]
          const area = json.nearest_area?.[0]

           if (!current) {
             return {
               title: `Weather for ${params.location}`,
               output: `Could not fetch weather data for "${params.location}". Please check the location name.`,
               metadata: {
                 location: params.location,
                 temperature: 0,
                 feels_like: 0,
                 humidity: 0,
                 description: "Unable to fetch",
                 icon: "🌡️",
                 wind_speed: 0,
                 units: params.units,
               },
             }
           }

          const tempC = parseInt(current.temp_C)
          const feelsC = parseInt(current.FeelsLikeC)
          const temp = params.units === "imperial" ? Math.round((tempC * 9) / 5 + 32) : tempC
          const feels = params.units === "imperial" ? Math.round((feelsC * 9) / 5 + 32) : feelsC

          const description = current.weatherDesc?.[0]?.value ?? "Unknown"
          const humidity = parseInt(current.humidity)
          const windKmph = parseInt(current.windspeedKmph)
          const windSpeed = params.units === "imperial" ? Math.round(windKmph * 0.621) : windKmph
          const locationName =
            area?.areaName?.[0]?.value && area?.country?.[0]?.value
              ? `${area.areaName[0].value}, ${area.country[0].value}`
              : params.location

          const weatherCode = parseInt(current.weatherCode ?? "113")
          const icon = weatherCodeToIcon(weatherCode)

          const metadata: WeatherMetadata = {
            location: locationName,
            temperature: temp,
            feels_like: feels,
            humidity,
            description,
            icon,
            wind_speed: windSpeed,
            units: params.units,
          }

          const unitLabel = params.units === "imperial" ? "°F" : "°C"
          const windUnit = params.units === "imperial" ? "mph" : "km/h"
          const output = `Weather in ${locationName}: ${description}, ${temp}${unitLabel} (feels like ${feels}${unitLabel}), humidity ${humidity}%, wind ${windSpeed} ${windUnit}.`

          return {
            title: `Weather: ${locationName}`,
            output,
            metadata,
          }
        }).pipe(Effect.orDie),
    }
  }),
)

function weatherCodeToIcon(code: number): string {
  if (code === 113) return "☀️"
  if (code === 116) return "⛅"
  if (code === 119 || code === 122) return "☁️"
  if ([143, 248, 260].includes(code)) return "🌫️"
  if ([176, 263, 266, 281, 284, 293, 296, 299, 302, 305, 308, 353, 356, 359].includes(code)) return "🌧️"
  if ([179, 182, 185, 227, 230, 311, 314, 317, 320, 323, 326, 329, 332, 335, 338, 350, 362, 365, 368, 371, 374, 377].includes(code)) return "❄️"
  if ([200, 386, 389, 392, 395].includes(code)) return "⛈️"
  return "🌡️"
}