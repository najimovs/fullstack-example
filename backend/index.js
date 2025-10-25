import path from "node:path"
import { fileURLToPath } from "node:url"
import express from "express"
import cookieParser from "cookie-parser"
import helmet from "helmet"
import cors from "cors"
import rateLimit from "express-rate-limit"
import morgan from "morgan"
import jwt from "jsonwebtoken"
import multer from "multer"
import { nanoid as randomPassword, customAlphabet } from "nanoid"
import { query } from "./db.js"

const __dirname = path.dirname( fileURLToPath( import.meta.url ) )

// console.log( await query( "delete from assets" ) )
console.log( await query( "select * from users" ) )
// query( 'update users set is_admin = true where id = 4' )
// console.log( await query( `UPDATE users SET email = $1`, 'najimovsbox@gmail.com' ) )
// await query( `alter table users add column is_admin boolean default false` )

const PORT = process.env.PORT || 3_000
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const JWT_SECRET = process.env.JWT_SECRET

const nanoid = customAlphabet( "abcdefghijklmnopqrstuvwxyz", 16 )
const app = express()

/*
	Parses incoming JSON payloads from HTTP requests (e.g., POST/PUT data)
	and makes them available in req.body as JavaScript objects.
*/
app.use( express.json() )

/*
	Parses cookies attached to the client request,
	making them available in req.cookies for further processing.
*/
app.use( cookieParser() )

/*
	Adds various security-related HTTP headers to responses,
	protecting the app from common web vulnerabilities (e.g., XSS, clickjacking).
*/
app.use( helmet() )

/*
	Enables Cross-Origin Resource Sharing (CORS) with credentials support,
	allowing the server to accept requests from different origins
	and include cookies/auth headers in both requests and responses.
*/
app.use( cors( {
	credentials: true,
	origin: "http://localhost:3001",
} ) )

/*
	Rate limiting middleware to prevent abuse and brute-force attacks.
	Limits each IP to 100 requests per 15-minute window.
*/
app.use( rateLimit( {
	windowMs: 15 * 60 * 1_000, // 15 minutes
	max: 100, // Max 100 requests per IP
	message: "Too many requests, please try again later."
} ) )

/*
	HTTP request logger middleware with a custom format,
	logging method, URL, status code, response time, client IP, and user agent
*/
app.use( morgan( ":method :url :status :response-time ms [:remote-addr :user-agent]" ) )

/*
	File uploading middleware
*/

const storage = multer.diskStorage( {
	destination: ( req, file, cb ) => {

		cb( null, "assets/" )
	},
	filename: ( req, file, cb ) => {

		const id = nanoid()
		const filename = id + path.extname( file.originalname )
		const { name, description } = req.body

		query( `insert into assets(file_path, user_id, resource_path, name, description) values($1, $2, $3, $4, $5)`, filename, req.user.id, id, name, description )

		cb( null, filename )
	},
} )

const upload = multer( { storage } )

/*
	Protect routes
*/

async function privateRoute( req, res, next ) {

	if ( !req.cookies || !req.cookies.session_id ) {

		return res.status( 401 ).send( { error: "Unauthorized" } )
	}

	try {

		const payload = jwt.verify( req.cookies.session_id, JWT_SECRET )

		const [ user ] = await query( `select id, is_admin from users where email = $1`, payload.email )

		if ( !user ) {

			return res.status( 401 ).send( { error: "Unauthorized" } )
		}

		req.user = user

		next()
	}
	catch( error ) {

		return res.status( 401 ).send( { error: "Unauthorized" } )
	}
}

// ---ROUTES---

app.get( "/dashboard/assets", privateRoute, async ( req, res ) => {

	if ( req.user.is_admin ) {

		res.send( await query( `select * from assets` ) )
	}
	else {

		res.status( 403 ).end()
	}
} )

app.get( "/view/:resource_path", async ( req, res ) => {

	const { resource_path } = req.params

	let rows = []

	try {

		rows = await query( `select * from assets where resource_path = $1`, resource_path )

		if ( !rows.length ) {

			res.status( 404 ).end()

			return
		}
	}
	catch( error ) {

		res.status( 503 ).end()
		return
	}

	const filePath = path.join( __dirname, "assets", rows[ 0 ].file_path )

	return res.sendFile( filePath, err => {

		if ( err ) {

			res.status( 500 ).send( "Error sending file" )
		}
	} )
} )

app.post( "/upload", [ privateRoute, upload.single( "file" ) ], async ( req, res ) => {

	if ( !req.file ) {

		return res.status( 400 ).send( { message: "No file uploaded!" } )
	}

	const [ asset ] = await query( `select * from assets where id = (select max(id) from assets)` )

	res.status( 201 ).send( asset )
} )

app.get( "/assets", async ( req, res ) => {

	res.send( await query( `select name, resource_path from assets` ) )
} )

app.get( "/health", ( req, res ) => res.send( {
	status: "ok",
	timestamp: new Date().toISOString(),
} ) )

app.get( "/some-data", privateRoute, async ( req, res ) => {

	res.send( { some: "Data" } )
} )

// Sign-in with Google
app.post( "/auth/google", async ( req, res ) => {

	if ( !req.body || !req.body.token ) {

		res.status( 400 ).end()

		return
	}

	const { token } = req.body

	const response = await fetch( `https://oauth2.googleapis.com/tokeninfo?id_token=${ token }` )

	if ( !response.ok ) {

		res.status( 401 ).end()

		return
	}

	const payload = await response.json()

	if ( payload.aud !== GOOGLE_CLIENT_ID ) {

		res.status( 401 ).end()

		return
	}

	const [ user ] = await query( `select id from users where email = $1`, payload.email )

	if ( !user ) {

		await query( `insert into users (email, password) values ($1, $2)`, payload.email, randomPassword() )
	}

	const JWT_TOKEN = jwt.sign( {
		email: payload.email,
	}, JWT_SECRET, {
		expiresIn: "7d",
	} )

	res.cookie( "session_id", JWT_TOKEN, {
		maxAge: 1_000 * 60 * 60 * 24 * 7,
		secure: false,
		httpOnly: true,
	} )

	res.status( 201 ).send( {
		name: payload.name,
		email: payload.email,
		profile_picture: payload.picture,
	} )
} )

// Run the server
app.listen( PORT, "0.0.0.0", () => console.info( `Server ready at: ${ PORT }` ) )
