import json
from pathlib import Path

# change this if your file has a different name
input_path = Path("coastline.geojson")
output_path = input_path.with_name(input_path.stem + "_filtered.geojson")

# load geojson
with input_path.open("r", encoding="utf-8") as f:
    data = json.load(f)

# filter properties
for feature in data.get("features", []):
    props = feature.get("properties", {})

    feature["properties"] = {
        k: v for k, v in {
            "id": props.get("id")
        }.items()
        if v is not None
    }

# write new file
with output_path.open("w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Done. New file created: {output_path.resolve()}")
