-- Find a suburb from a latlng
SELECT name
FROM suburbs
WHERE ST_CONTAINS(
  geometry,
  ST_SRID(POINT(152.9867547, -27.3955513), 4326)
)
;

-- Find a postcode from a latlng
SELECT postcode
FROM postcodes
WHERE ST_CONTAINS(
  geometry,
  ST_SRID(POINT(152.9867547, -27.3955513), 4326)
)
;

-- Find the suburbs that intersect a postcode
SELECT
  suburbs.name,
  postcodes.postcode
FROM postcodes
INNER JOIN suburbs
  ON ST_INTERSECTS(postcodes.geometry, suburbs.geometry)
WHERE postcode = '4053'
ORDER BY suburbs.name ASC
;
