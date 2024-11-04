import ProgressBar from "jsr:@deno-library/progress";
import type { FeatureCollection, MultiPolygon } from 'npm:@types/geojson';
import db from './db.ts';

const file = './data/postcodes.geojson';
const version = '2021';
const codeProperty = `POA_CODE_${version}`;
const nameProperty = `POA_NAME_${version}`;

try {
	await dropTable();
	await createTable();
	await importPostcodes( file );
	await createIndexes();

	console.log( 'Done' );
} catch ( error ) {
	console.error( error );
} finally {
	await db.close();
}

function dropTable() {
	return db.execute( 'DROP TABLE IF EXISTS postcodes' );
}

function createTable() {
	return db.execute(
		`CREATE TABLE IF NOT EXISTS postcodes (
			postcode varchar(4) NOT NULL,
			geometry multipolygon SRID 4326 NOT NULL,
			PRIMARY KEY (postcode)
		)
		ENGINE = INNODB,
		CHARACTER SET utf8mb4,
		COLLATE utf8mb4_0900_ai_ci`
	);
}

async function importPostcodes( file: string ) {
	const progress = new ProgressBar( {
		title: `Importing postcodes`,
		total: 0,
	} );

	try {
		if ( !Deno.statSync( file ).isFile ) {
			throw new Error( `File ${file} does not exist` );
		}

		const geojson = await Deno.readTextFile( file );
		const featureCollection = JSON.parse( geojson ) as FeatureCollection<MultiPolygon>;

		progress.total = featureCollection.features.length;

		let importCount = 0;
		for ( const feature of featureCollection.features ) {
			await progress.render( ++importCount );

			// Just in case
			if ( feature.geometry.type !== 'MultiPolygon' ) {
				await progress.console( `Skipping non-multipolygon postcode ${feature.properties![ codeProperty ]} (${feature.properties![ nameProperty ]})` );
				continue;
			}

			// Some postcodes have no geometry
			if ( feature.geometry.coordinates.length === 0 ) {
				await progress.console( `Skipping empty postcode ${feature.properties![ codeProperty ]} (${feature.properties![ nameProperty ]})` );
				continue;
			}

			const featureGeojson = JSON.stringify( feature.geometry );

			await db.execute(
				`INSERT INTO postcodes (postcode, geometry) VALUES
				(?, ST_GEOMFROMGEOJSON(?))`,
				[
					feature.properties![ codeProperty ],
					featureGeojson,
				]
			);
		}
	} catch ( error ) {
		console.log( '' );
		console.error( error );
	} finally {
		await progress.end();
	}
}

function createIndexes() {
	console.log( 'Generating indexes...' );

	return db.execute( `ALTER TABLE postcodes ADD SPATIAL INDEX IDX_postcodes_geometry (geometry)` );
}
