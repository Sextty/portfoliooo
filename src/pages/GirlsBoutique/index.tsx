import GirlsBoutique from "./GirlsBoutique";
import { StoreProvider } from "./store";

// Single lazy entry point so the whole boutique (incl. sql.js) stays out of the main bundle.
export default function GirlsBoutiqueRoute() {
  return (
    <StoreProvider>
      <GirlsBoutique />
    </StoreProvider>
  );
}
