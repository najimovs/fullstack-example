import { useEffect } from "react"

export default function () {

	useEffect( () => {

		fetch( "http://localhost:3000/dashboard/assets", { credentials: "include" } )
		.then( response => response.json() )
		.then( json => console.log( json ) )
		.catch( error => console.log( error ) )

	}, [] )

	return <>Assets</>
}
