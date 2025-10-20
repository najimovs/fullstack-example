import { useParams } from "react-router"
import { GLBView } from "@com/GLBView"

export default function () {

	const { glbID } = useParams()

	return ( <>
		<GLBView modelUrl="/assets/glb/cb.glb" />
	</> )
}
