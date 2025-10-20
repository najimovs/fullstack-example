import { useRef, useEffect } from "react"

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const API_URL = import.meta.env.VITE_API_URL

export default function () {

	const inputRef = useRef()
	const signInRef = useRef()

	useEffect( () => {

		google.accounts.id.initialize( {
			client_id: GOOGLE_CLIENT_ID,
			callback: handleCredentialResponse,
			auto_select: false,
		} )

		google.accounts.id.renderButton(
			signInRef.current,
			{
				theme: "outline",
				size: "large",
			}
		)

		async function handleCredentialResponse( { credential: token } ) {

			const response = await fetch( API_URL + "/auth/google", {
				method: "POST",
				credentials: "include", // omit
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify( { token } ),
			} )

			if ( response.ok ) {

				console.log( await response.json() )
			}
		}

	}, [] )

	return <>
		<div ref={ signInRef }></div>
		<input ref={ inputRef } onChange={ async e => {

			const file = e.target.files[ 0 ]

			const formData = new FormData()
			formData.append( "file", file, file.name )

			try {
				const response = await fetch( API_URL + "/upload", {
					method: "POST",
					credentials: "include",
					body: formData,
				} )
				console.log( response )
			}
			catch( error ) {

				console.error( error )
			}

		} } type="file" />
		<button onClick={ () => inputRef.current.click() }>Upload (.GLB, .GLTF) file</button>
	</>
}
