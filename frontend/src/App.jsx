import "@app/css/main.css"
import { Routes, Route } from "react-router"
import Home from "@pages/Home"
import Upload from "@pages/Upload"
import GLBView from "@pages/GLBView"

export default function App() {

	return (<>
		<Routes>
			<Route path="/" element={ <Home /> }/>
			<Route path="/upload" element={ <Upload /> }/>
			<Route path="/:glbID" element={ <GLBView /> }/>
		</Routes>
	</>)
}
