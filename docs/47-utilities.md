# Utilities

Asok provides several built-in utilities to simplify common tasks in web development, all accessible via the `asok.utils` package.

## Humanize

The `asok.utils.humanize` module helps convert data into a friendly, readable format.

```python
from asok.utils import humanize

# Relative time
humanize.time_ago("2023-10-15T10:00:00Z")  # "3 days ago"

# File sizes
humanize.file_size(1048576)               # "1.0 MB"

# Thousands separators
humanize.intcomma(1500000)                # "1,500,000"

# Successive durations
humanize.duration(125)                    # "2m 5s"
```

## HTML Minification

Used automatically in production to reduce bundle sizes.

```python
from asok.utils.minify import minify_html

clean_html = minify_html("<div>  <span>  Hello  </span>  </div>")
# Result: "<div><span>Hello</span></div>"
```

## CSS & JS Scoping

These utilities are used internally by the [Asok Component system](24-reactive-components.md) but can be used manually.

### `scope_css(content, page_id)`
Prefixes all CSS selectors (except those inside `:global()`) with a specific page ID.

### `scope_js(content)`
Wraps JavaScript content in an Immediately Invoked Function Expression (IIFE) to prevent variable leakage.

## Image Optimization

Asok can optimize images by converting them to WebP.

```python
from asok.utils.image import optimize_image

# Converts source.jpg to source.jpg.webp
optimize_image("src/partials/images/source.jpg") 
```

## Geography & Countries

The `asok.Countries` utility (also available as `asok.utils.geo.Countries`) provides exhaustive metadata for 249 countries and territories.

```python
from asok import Countries

# 1. Get all countries
all_countries = Countries.all()

# 2. Get specific country (ISO code)
japan = Countries.get("JP")
# { 'iso': 'JP', 'name': 'Japan', 'flag': '🇯🇵', 'currency': 'JPY', ... }

# 3. Power Search (search by name, capital, continent, or currency)
euro_countries = Countries.search("Europe")
euro_countries = Countries.search("EUR")

# 4. Haversine Distance
dist = Countries.distance(48.85, 2.35, 40.71, -74.00, unit="km")
# Result: ~5837 km (Paris to NYC)

# 5. Static Maps Generator
map_url = Countries.static_map(48.8566, 2.3522, zoom=12, provider="osm")
# Returns a URL to a static map image from OpenStreetMap
```

### Static Maps Providers
Supported providers for `static_map()`:
- `osm` (OpenStreetMap - Default)
- `google` (Requires a Google Maps API Key configured in your env)

---
[← Previous: Developer Toolbar (Asok Console)](46-developer-toolbar.md) | [Documentation](README.md) | [Next: Component API Reference →](48-component-api.md)
