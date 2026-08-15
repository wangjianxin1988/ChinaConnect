const fs = require("fs");
const p = "src/components/Map/DynamicMap.tsx";
let src = fs.readFileSync(p, "utf8");
// add lang prop to DynamicMapProps and MapSkeleton
let r = src.replace('interface DynamicMapProps {\n  initialLocation: { lat: number; lng: number; name?: string };\n  markers?: MapMarker[];\n  height?: string;\n  showControls?: boolean;\n  showLayerControls?: boolean;\n  onMarkerClick?: (marker: MapMarker) => void;\n  className?: string;\n}', 'interface DynamicMapProps {\n  initialLocation: { lat: number; lng: number; name?: string };\n  markers?: MapMarker[];\n  height?: string;\n  showControls?: boolean;\n  showLayerControls?: boolean;\n  onMarkerClick?: (marker: MapMarker) => void;\n  className?: string;\n  lang?: string;\n}');
src = r;
r = src.replace('function MapSkeleton({ height }: { height?: string }) {', 'function MapSkeleton({ height, lang = "en" }: { height?: string; lang?: string }) {');
src = r;
r = src.replace('<p className="text-sm text-gray-400">Loading map...</p>', '<p className="text-sm text-gray-400">{lang === "ja" ? "地図を読み込み中..." : "Loading map..."}</p>');
src = r;
// wire lang through DynamicMap to MapSkeleton
r = src.replace('export function DynamicMap(props: DynamicMapProps) {\n  const [isMounted, set', 'export function DynamicMap(props: DynamicMapProps) {\n  const { lang } = props;\n  const [isMounted, set');
src = r;
// find where MapSkeleton is rendered and pass lang
r = src.replace(/<MapSkeleton height=\{height \|\| "400px"\} \/>/g, '<MapSkeleton height={height || "400px"} lang={lang} />');
src = r;
r = src.replace(/<MapSkeleton height=\{height \|\| "350px"\} \/>/g, '<MapSkeleton height={height || "350px"} lang={lang} />');
src = r;
fs.writeFileSync(p, src);
console.log("DynamicMap patched:", src.includes('const { lang } = props'), src.includes('地図を読み込み中'));
