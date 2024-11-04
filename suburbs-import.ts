import ProgressBar from "jsr:@deno-library/progress";
import type { FeatureCollection } from 'npm:@types/geojson';
import db from './db.ts';

try {
	await dropTable();
	await createTable();

	await importSuburbs( './data/qld.geojson', 'qld', );
	await importSuburbs( './data/nsw.geojson', 'nsw', );
	await importSuburbs( './data/act.geojson', 'act', );
	await importSuburbs( './data/vic.geojson', 'vic', );
	await importSuburbs( './data/sa.geojson', 'sa', );
	await importSuburbs( './data/wa.geojson', 'wa', );
	await importSuburbs( './data/nt.geojson', 'nt', );
	await importSuburbs( './data/tas.geojson', 'tas', );

	await createIndexes();

	console.log( 'Done' );
} catch ( error ) {
	console.error( error );
} finally {
	await db.close();
}

function dropTable() {
	return db.execute( 'DROP TABLE IF EXISTS suburbs' )
}

function createTable() {
	return db.execute(
		`CREATE TABLE suburbs (
			id int NOT NULL AUTO_INCREMENT,
			state enum ('QLD', 'NSW', 'ACT', 'VIC', 'TAS', 'SA', 'WA', 'NT', 'OT') NOT NULL,
			pid varchar(15) NOT NULL,
			name varchar(50) NOT NULL,
			geometry multipolygon SRID 4326 NOT NULL,
			PRIMARY KEY (id)
		)
		ENGINE = INNODB,
		CHARACTER SET utf8mb4,
		COLLATE utf8mb4_0900_ai_ci`
	);
}

async function importSuburbs( file: string, state: string ) {
	const progress = new ProgressBar( {
		title: `Importing ${state} suburbs`,
		total: 0,
	} );

	try {
		if ( !Deno.statSync( file ).isFile ) {
			console.error( `File ${file} does not exist` );
			return;
		}

		const geojson = await Deno.readTextFile( file );
		const featureCollection = JSON.parse( geojson ) as FeatureCollection;

		progress.total = featureCollection.features.length;

		await progress.render( 0 );

		const nameProperty = `${state}_local`.substring( 0, 8 ) + '_2';

		let importCount = 0;
		for ( const feature of featureCollection.features ) {
			await progress.render( ++importCount );

			await db.execute(
				`INSERT INTO suburbs (state, pid, name, geometry) VALUES
				(?, ?, ?, ST_GEOMFROMGEOJSON(?))`,
				[
					state.toUpperCase(),
					feature.properties!.lc_ply_pid,
					feature.properties![ nameProperty ],
					JSON.stringify( feature.geometry ),
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

async function createIndexes() {
	console.log( 'Generating indexes...' );

	await db.execute( `ALTER TABLE suburbs ADD SPATIAL INDEX IDX_suburbs_geometry (geometry)` );
	await db.execute( `ALTER TABLE suburbs ADD UNIQUE INDEX UK_state_pid (state, pid);` );
	await db.execute( `ALTER TABLE suburbs ADD INDEX IDX_suburbs_name (name)` );
	await db.execute( `ALTER TABLE suburbs ADD INDEX IDX_suburbs_state_name (state, name)` );
}
