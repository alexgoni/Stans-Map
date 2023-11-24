import "@/styles/globals.css";
import { RecoilRoot } from "recoil";
import * as Cesium from "cesium";
import Layout from "@/components/module/Layout";

export default function App({ Component, pageProps }) {
  // In offline, you can delete this
  Cesium.Ion.defaultAccessToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlZDQzNjhhZS00NDE1LTRiYzUtOWY2My02NDQ4OThiMDhjY2QiLCJpZCI6MTYyNDk2LCJpYXQiOjE2OTI5NDMzMDh9.RTB-QjPBrgslrSeAWuVlHT5yxZdFRLPNlCBmBQrRH9o";

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
