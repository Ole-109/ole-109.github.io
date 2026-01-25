import geopandas as gpd
from shapely.ops import unary_union
from shapely.geometry import Polygon, LineString

# load prefectures
prefs = gpd.read_file("prefectures_filtered.geojson")

# load coastline lines
coast = gpd.read_file("coastline_filtered.geojson")

# create land polygon by polygonizing lines
from shapely.ops import polygonize

merged_lines = unary_union(coast.geometry)
land_polygons = list(polygonize(merged_lines))
land_union = unary_union(land_polygons)  # union all to a single land polygon

# intersect each prefecture with land polygon
prefs["geometry"] = prefs.geometry.map(lambda g: g.intersection(land_union))

# save result
prefs.to_file("prefectures_land_only.geojson", driver="GeoJSON")
print("Done. Prefectures clipped to land.")
