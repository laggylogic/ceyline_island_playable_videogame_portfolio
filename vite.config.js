import { defineConfig } from "vite";

// Map/assets file patterns that should trigger a full reload so you see changes live
const MAP_ASSET_PATTERNS = [
  /[/\\](ceyline_island|map|ceyline_house)\.(png|json)$/i,
  /[/\\]spritesheet\.png$/i,
];

function mapAssetReloadPlugin() {
  return {
    name: "map-asset-reload",
    configureServer(server) {
      server.watcher.on("change", (path) => {
        if (MAP_ASSET_PATTERNS.some((re) => re.test(path))) {
          server.ws.send({ type: "full-reload", path });
        }
      });
    },
  };
}

export default defineConfig({
  // Use root base in dev so the app loads at http://localhost:5173/
  base: process.env.NODE_ENV === "production" ? "/ceyline_island_portfolio_game/" : "/",
  plugins: [mapAssetReloadPlugin()],
  build: {
    minify: "terser",
  },
});
