// app/page.tsx — SSR wrapper
// Loads the real app client-side only so genlayer-js never runs on the server
// and wallet extensions (MetaMask etc.) never conflict with it on load.

import dynamic from "next/dynamic";

const App = dynamic(() => import("./App"), { ssr: false });

export default function Page() {
  return <App />;
}