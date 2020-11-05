// ======================================================================================================================
// Fonctions utilitaires pour créer des objects graphiques 3d spécifiques aux projets à développer
// ======================================================================================================================

function createGround(name,params){
	params = params || {} ;
	var x       = params.x || 100.0 ;
	var z       = params.z || 100.0 ;
	var color = params.color || 0xaaaaaa ;
	var nameTex  = params.texture || null ;

	var geo = new THREE.PlaneGeometry(x,z) ;
	var mat = new THREE.MeshStandardMaterial({color:color}) ;
	var mesh = new THREE.Mesh(geo,mat) ;
	mesh.rotation.x = -Math.PI / 2.0 ;
	return mesh ;
}

function createBox(name,params){
	params = params || {} ;
	var width    = params.width    || 0.25 ;
	var height    = params.height    || 0.25 ;
	var depth = params.depth || 0.25 ;
	var color = params.color || 0xffaaaa ;
	var nameTex  = params.texture || null ;

	var geo  = new THREE.BoxGeometry(width,height,depth) ;
	var mat  = new THREE.MeshStandardMaterial({color:color}) ;
	var mesh = new THREE.Mesh(geo,mat) ;

	return mesh ;
}


function createSphere(name,params){
	params = params || {} ;
	var radius   = params.radius || 0.25 ;
	var color = params.color || 0xffaaaa ;
	var nameTex  = params.texture || null ;

	var geo  = new THREE.SphereGeometry(radius,8,8) ;
	var mat  = new THREE.MeshStandardMaterial({color:color}) ;
	var mesh = new THREE.Mesh(geo,mat) ;

	return mesh ;
}

function loadObj(name,directory,nameObj,nameMtl){
			var mtlLoader = new THREE.MTLLoader() ;
			var objLoader = new THREE.OBJLoader() ;
			var group    = new THREE.Group() ;
			group.name = name ;
			mtlLoader.setTexturePath(directory);
			mtlLoader.setPath(directory);
			mtlLoader.load(nameMtl, function (materials) {

    				materials.preload();

    				objLoader.setMaterials(materials);
    				objLoader.setPath(directory);
    				objLoader.load(nameObj, function (object) {
        				group.add(object);
					object.name = name ;
					return group ;

    				});

			});

			return group ;

}
