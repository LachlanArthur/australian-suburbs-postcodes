const url = 'https://geo.abs.gov.au/arcgis/services/ASGS2021/POA/MapServer/WFSServer?' + new URLSearchParams( {
	'request': 'GetFeature',
	'resulttype': 'results',
	'typeName': 'POA',
	'outputFormat': 'geojson',
	'srsName': 'EPSG:4326',
	'service': 'wfs',
} );

console.log( `Downloading ${url}` );

const response = await fetch( url );

if ( !response.ok ) {
	console.error( `Failed to download postcodes` );
} else {
	let text = await response.text();

	// Fix broken GeoJSON
	text = text.replace( /{"type":"MultiPolygon",}/g, '{"type":"MultiPolygon","coordinates":[]}' );

	await Deno.writeTextFile( `./data/postcodes.geojson`, text );
}
