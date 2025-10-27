import { useEffect, useState } from "react"
import { NavLink } from "react-router"

export default function () {

	const [ assets, setAssets ] = useState( [] )

	useEffect( () => {

		fetch( "http://localhost:3000/dashboard/assets", { credentials: "include" } )
		.then( response => response.json() )
		.then( json => setAssets( json ) )
		.catch( error => console.log( error ) )

	}, [] )

	return <>
		<h1>Assets</h1>
		<ul>
			{ assets.map( asset => <li key={ asset.id }>
				<NavLink to={ "/" + asset.resource_path }>{ asset.name }</NavLink>
			</li> ) }
		</ul>
	</>
}
