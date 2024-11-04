await download( 'qld', 'qld-suburb-locality-boundaries-psma-administrative-boundaries', 'ckan_6bedcb55_1b1f_457b_b092_58e88952e9f0' );
await download( 'nsw', 'nsw-suburb-locality-boundaries-psma-administrative-boundaries', 'ckan_91e70237_d9d1_4719_a82f_e71b811154c6' );
await download( 'act', 'act-suburb-locality-boundaries-geoscape-administrative-boundaries', 'ckan_0257a9da_b558_4d86_a987_535c775cf8d8' );
await download( 'vic', 'vic-suburb-locality-boundaries-psma-administrative-boundaries', 'ckan_af33dd8c_0534_4e18_9245_fc64440f742e' );
await download( 'sa', 'sa-suburb-locality-boundaries-psma-administrative-boundaries', 'ckan_bcfcfc9a_7c8d_479a_9bdf_b95ca66ad29a' );
await download( 'wa', 'wa-suburb-locality-boundaries-psma-administrative-boundaries', 'ckan_6a0ec945_c880_4882_8a81_4dbcb85e74e5' );
await download( 'nt', 'nt-suburb-locality-boundaries-psma-administrative-boundaries', 'ckan_12eca357_6bad_4130_9c47_eaaf4c11e039' );
await download( 'tas', 'tas-suburb-locality-boundaries-psma-administrative-boundaries', 'ckan_8bd7b6c1_1258_4df5_a98f_b6706e87de1e' );

async function download( state: string, slug: string, typeName: string ) {
	const url = `https://data.gov.au/geoserver/${slug}/wfs?` + new URLSearchParams( {
		'request': 'GetFeature',
		typeName,
		'outputFormat': 'json',
		'srsName': 'EPSG:4326',
	} );

	console.log( `Downloading ${url}` );

	const response = await fetch( url );

	if ( !response.ok || !response.body ) {
		console.error( `Failed to download ${state}` );
		return;
	}

	await Deno.writeFile( `./data/${state}.geojson`, response.body );
}
