import "@/styles/globals.css";
import { RecoilRoot } from "recoil";
import dynamic from "next/dynamic";
import Layout from "@/components/module/Layout";

export default function App({ Component, pageProps }) {
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
