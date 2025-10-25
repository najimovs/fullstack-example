import { useRef, useState, useEffect } from "react"
import { useNavigate } from "react-router"

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const API_URL = import.meta.env.VITE_API_URL

export default function () {

	const inputRef = useRef()
	const signInRef = useRef()
	const [ name, setName ] = useState( null )
	const [ description, setDescription ] = useState( null )
	const [ file, setFile ] = useState( null )

	const navigate = useNavigate()

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

	async function upload() {

		// TODO: Check inputs

		const formData = new FormData()
		formData.append( "name", name )
		formData.append( "description", description )
		formData.append( "file", file, file.name )

		try {

			const response = await fetch( API_URL + "/upload", {
				method: "POST",
				credentials: "include",
				body: formData,
			} )

			if ( response.ok ) {

				const asset = await response.json()

				navigate( `/${ asset.resource_path }` )
			}
		}
		catch( error ) {

			console.error( error )
		}
	}

	return <>

		<div id="auth-form">
			<div ref={ signInRef }></div>
		</div>

		<div id="upload-form">
			<input
				type="text"
				placeholder="Name"
				onChange={ e => setName( e.target.value ) }
			/>
			<textarea
				placeholder="Description"
				onChange={ e => setDescription( e.target.value ) }
			/>
			<input
				type="file" 
				ref={ inputRef }
				onChange={ e => {

					const file = e.target.files[ 0 ]

					setFile( file )
				} }
			/>
			<button onClick={ () => inputRef.current.click() }>Choose file (.GLB, .GLTF) file</button>
			<button onClick={ upload }>Upload</button>
		</div>
	</>
}
