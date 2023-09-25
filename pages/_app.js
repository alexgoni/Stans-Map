import "@/styles/globals.css";
import * as Cesium from "cesium";

export default function App({ Component, pageProps }) {
  Cesium.Ion.defaultAccessToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5YTY3ZDVhNC0zMThlLTQxZjUtODhmOS04ZmJjZGY4MDM4MDEiLCJpZCI6MTQzNzkxLCJpYXQiOjE2ODU2ODkwNDF9.3RQSwjKyySalcp1nUufcBxUk_hNALFLJ9j-X0-FoEpI";
  return <Component {...pageProps} />;
}
