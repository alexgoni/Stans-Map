import "@/styles/globals.css";
import { RecoilRoot } from "recoil";
import dynamic from "next/dynamic";

export default function App({ Component, pageProps }) {
  return (
    <RecoilRoot>
      <Component {...pageProps} />
    </RecoilRoot>
  );
}

// export default dynamic(() => Promise.resolve(App), {
//   ssr: false,
// });
