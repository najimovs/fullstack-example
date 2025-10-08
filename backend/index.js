import express from "express"
import cookieParser from "cookie-parser"
import helmet from "helmet"
import cors from "cors"

const PORT = process.env.PORT || 3_000

const app = express()

// Setup middlewares
app.use( express.json() )
app.use( cookieParser() )
app.use( helmet() )
app.use( cors( {
	credentials: true,
} ) )

// Setup routes
app.get( "/health", ( req, res ) => res.send( {
	status: "ok",
	timestamp: new Date().toISOString(),
} ) )

// Run
app.listen( PORT, "0.0.0.0", () => console.info( `Server ready at: ${ PORT }` ) )
