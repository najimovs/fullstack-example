import "@app/css/main.css"

window.onload = () => {

	const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

	google.accounts.id.initialize( {
		client_id: GOOGLE_CLIENT_ID,
		callback: handleCredentialResponse,
		auto_select: false,
	} )

	google.accounts.id.renderButton(
		document.getElementById( "g_id_signin" ),
		{
			theme: "outline",
			size: "large",
		}
	)
}

function handleCredentialResponse( response ) {

	const jwt = response.credential
	const payload = parseJWT( jwt )

	console.log( jwt )

	//

	const h1 = document.getElementById( "user_name" )
	const img = document.getElementById( "user_photo" )

	h1.textContent = payload.given_name
	img.src = payload.picture
}

function parseJWT( token ) {

	const base64Url = token.split( "." )[ 1 ]
	const base64 = base64Url.replace( /-/g, "+" ).replace( /_/g, "/" )
	const jsonPayload = decodeURIComponent(
		atob( base64 )
			.split( "" )
			.map( c => "%" + ( "00" + c.charCodeAt( 0 ).toString( 16 ) ).slice( - 2 ) )
			.join( "" )
	)

	return JSON.parse( jsonPayload )
}
