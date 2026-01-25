import geopandas as gpd

# --- settings ---
INPUT_FILE = "prefectures_land_only_clean.geojson"
OUTPUT_FILE = "prefectures_land_only_closed.geojson"

# minimum area in square meters (1 km²)
MIN_AREA = 10_000_000

# --- load data ---
gdf = gpd.read_file(INPUT_FILE)

# project to metric CRS (meters)
gdf_m = gdf.to_crs(epsg=3857)

# explode multipolygons into single parts
gdf_m = gdf_m.explode(index_parts=False)

# remove tiny geometries
gdf_m = gdf_m[gdf_m.geometry.area >= MIN_AREA]

# --- tiny positive buffer closes gaps (0.5 meters for EPSG:3857) ---
gdf_m['geometry'] = gdf_m.geometry.buffer(0.5)  # expand slightly
gdf_m['geometry'] = gdf_m.geometry.buffer(-0.5)  # shrink back

# project back to WGS84 for Leaflet
gdf_cleaned = gdf_m.to_crs(epsg=4326)

# save cleaned & closed polygons
gdf_cleaned.to_file(OUTPUT_FILE, driver="GeoJSON")

print("Done. Exploded, filtered, and closed polygons saved.")
