import { useParams } from "react-router"

export default function () {

	const { glbID } = useParams()

	return <>GLBView { glbID }</>
}
