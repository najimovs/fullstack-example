import { useState, useRef, useEffect } from "react"
import * as THREE from "three"
import { MapControls } from "three/addons/controls/MapControls"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader"

const glbLoader = new GLTFLoader()

export function GLBView( { modelUrl } ) {

	const canvasRef = useRef()

	useEffect( () => {

		fetch( modelUrl, {
			method: "HEAD",
		} ).then( response => {

			if ( response.ok ) {

				run( modelUrl )
			}
			else {

				run()
			}
		} )

		return

		function run( modelUrl ) {

			const scene = new THREE.Scene()
			scene.background = new THREE.Color()

			{
				const path = "/skybox/"

				const format = ".png"
				const urls = [
					path + "px" + format, path + "nx" + format,
					path + "py" + format, path + "ny" + format,
					path + "pz" + format, path + "nz" + format
				]

				const envMap = new THREE.CubeTextureLoader().load( urls )

				scene.background = envMap
				// scene.environment = envMap
			}

			const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10_000 )
			camera.position.set( 100, 100, 100 )
			camera.lookAt( 0, 0, 0 )

			const renderer = new THREE.WebGLRenderer( {
				antialias: true,
				canvas: canvasRef.current,
			} )
			renderer.setPixelRatio( window.devicePixelRatio )
			renderer.setSize( window.innerWidth, window.innerHeight )
			renderer.shadowMap.enabled = true
			renderer.shadowMap.type = THREE.PCFSoftShadowMap

			const controls = new MapControls( camera )
			controls.enableDamping = true
			controls.zoomToCursor = true
			controls.minDistance = 1
			controls.maxPolarAngle = Math.PI / 2 - 0.25
			controls.connect( canvasRef.current )

			window.addEventListener( "resize", () => {

				camera.aspect = window.innerWidth / window.innerHeight
				camera.updateProjectionMatrix()
				renderer.setSize( window.innerWidth, window.innerHeight )
			} )

			//

			const dirLight = new THREE.DirectionalLight( 0xffffff, 1 )
			dirLight.position.set( - 10, 8, - 5 )
			dirLight.castShadow = true
			dirLight.shadow.mapSize.width = 4096
			dirLight.shadow.mapSize.height = 4096
			dirLight.shadow.camera.left = - 100
			dirLight.shadow.camera.right = 100
			dirLight.shadow.camera.top = 100
			dirLight.shadow.camera.bottom = - 100
			dirLight.shadow.camera.far = 1_000
			dirLight.shadow.bias = - 0.0001
			scene.add( dirLight )

			const hemiLight = new THREE.HemisphereLight()
			hemiLight.position.set( 0, 100, 0 )
			scene.add( hemiLight )

			scene.add( new THREE.AmbientLight() )

			if ( modelUrl ) {

				glbLoader.load( modelUrl, ( glb ) => {

					const model = glb.scene

					model.traverse( node => {

						if ( node.isMesh ) {

							node.castShadow = true
							node.receiveShadow = true
						}
					} )

					const box3 = new THREE.Box3().setFromObject( model )
					const max = box3.max.clone().multiplyScalar( 2 )

					camera.position.copy( max )
					controls.minDistance = max.y / 1.5
					controls.maxDistance = max.y * 2
					controls.update()

					scene.add( model )
				} )
			}
			else {

				scene.add( new THREE.Mesh(
					new THREE.SphereGeometry( 20 ),
					new THREE.MeshBasicMaterial( { wireframe: true } ),
				) )
			}

			//

			render()

			function render() {

				controls.update()

				renderer.render( scene, camera )

				requestAnimationFrame( render )
			}
		}
	}, [] )

	return (
		<canvas id="glbView" ref={ canvasRef } />
	)
}
