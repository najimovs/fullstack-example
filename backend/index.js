import express from "express"
import cookieParser from "cookie-parser"
import helmet from "helmet"
import cors from "cors"
import rateLimit from "express-rate-limit"

const PORT = process.env.PORT || 3_000

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
	origin: [
		"http://localhost:3001",
	],
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

// ---ROUTES---

app.get( "/health", ( req, res ) => res.send( {
	status: "ok",
	timestamp: new Date().toISOString(),
} ) )

// Run the server
app.listen( PORT, "0.0.0.0", () => console.info( `Server ready at: ${ PORT }` ) )
