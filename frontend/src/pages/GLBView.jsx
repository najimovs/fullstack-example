import { useParams } from "react-router"
import { GLBView } from "@com/GLBView"

export default function () {

	const { glbID } = useParams()

	return ( <>
		<GLBView modelUrl={ `http://localhost:3000/view/` + glbID } />
	</> )
}
