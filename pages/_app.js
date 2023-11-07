import "@/styles/globals.css";
import { RecoilRoot } from "recoil";
import * as Cesium from "cesium";
import Layout from "@/components/module/Layout";

export default function App({ Component, pageProps }) {
  // In offline, you can delete this
  Cesium.Ion.defaultAccessToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5YTY3ZDVhNC0zMThlLTQxZjUtODhmOS04ZmJjZGY4MDM4MDEiLCJpZCI6MTQzNzkxLCJpYXQiOjE2ODU2ODkwNDF9.3RQSwjKyySalcp1nUufcBxUk_hNALFLJ9j-X0-FoEpI";

  return (
    <RecoilRoot>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </RecoilRoot>
  );
}

/* ssr off
 export default dynamic(() => Promise.resolve(App), {
   ssr: false,
 }); */
