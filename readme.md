# Australian Suburbs & Postcodes

Download datasets from the Australian Government and import them into MySQL.

Uses spatial indexes for fast queries.

```sh
# Start a test MySQL server to put everything in
docker run --rm -d -p 32771:3306 -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=australia -e MYSQL_USER=user -e MYSQL_PASSWORD=secret mysql:8.4

# Download the GeoJSON files
deno run --allow-net --allow-write ./postcodes-download.ts
deno run --allow-net --allow-write ./suburbs-download.ts

# Import the data into MySQL
deno run --allow-net --allow-read ./postcodes-import.ts
deno run --allow-net --allow-read ./suburbs-import.ts
```

### Find a suburb from a latlng
```sql
SELECT name
FROM suburbs
WHERE ST_CONTAINS(
  geometry,
  ST_SRID(POINT(152.9867547, -27.3955513), 4326)
)
```
```
name                                               
-------------------------------------------------- 
EVERTON PARK

1 records fetched in 0.005s [0.001s exec, 0.004s fetch]
```

### Find a postcode from a latlng
```sql
SELECT postcode
FROM postcodes
WHERE ST_CONTAINS(
  geometry,
  ST_SRID(POINT(152.9867547, -27.3955513), 4326)
)
```
```
postcode 
-------- 
4053

1 records fetched in 0.004s [0.001s exec, 0.003s fetch]
```

### Find the suburbs that intersect a postcode
(kinda jank because of tiny overlaps at the edges, but close enough I guess)
```sql
SELECT
  suburbs.name,
  postcodes.postcode
FROM postcodes
INNER JOIN suburbs
  ON ST_INTERSECTS(postcodes.geometry, suburbs.geometry)
WHERE postcode = '4053' -- it's important to pass the postcode as a string
ORDER BY suburbs.name ASC
```
```
name                                               postcode 
-------------------------------------------------- -------- 
ALBANY CREEK                                       4053
ALDERLEY                                           4053
ARANA HILLS                                        4053
ASPLEY                                             4053
BRIDGEMAN DOWNS                                    4053
BUNYA                                              4053
CHERMSIDE WEST                                     4053
ENOGGERA                                           4053
EVERTON HILLS                                      4053
EVERTON PARK                                       4053
GAYTHORNE                                          4053
GORDON PARK                                        4053
GRANGE                                             4053
KEDRON                                             4053
KEPERRA                                            4053
MCDOWALL                                           4053
MITCHELTON                                         4053
STAFFORD                                           4053
STAFFORD HEIGHTS                                   4053

19 records fetched in 0.022s [0.019s exec, 0.003s fetch]
```

## Datasets

- [Suburbs QLD](https://data.gov.au/data/dataset/qld-suburb-locality-boundaries-geoscape-administrative-boundaries)
- [Suburbs NSW](https://data.gov.au/data/dataset/nsw-suburb-locality-boundaries-geoscape-administrative-boundaries)
- [Suburbs ACT](https://data.gov.au/data/dataset/act-suburb-locality-boundaries-geoscape-administrative-boundaries)
- [Suburbs VIC](https://data.gov.au/data/dataset/vic-suburb-locality-boundaries-geoscape-administrative-boundaries)
- [Suburbs TAS](https://data.gov.au/data/dataset/tas-suburb-locality-boundaries-geoscape-administrative-boundaries)
- [Suburbs SA](https://data.gov.au/data/dataset/sa-suburb-locality-boundaries-geoscape-administrative-boundaries)
- [Suburbs WA](https://data.gov.au/data/dataset/wa-suburb-locality-boundaries-geoscape-administrative-boundaries)
- [Suburbs NT](https://data.gov.au/data/dataset/nt-suburb-locality-boundaries-geoscape-administrative-boundaries)
- [Postcodes](https://geo.abs.gov.au/arcgis/rest/services/ASGS2021/POA/MapServer)
