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

function createBoite(name,params){
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
	var rayon   = params.rayon || 0.25 ;
	var color = params.color || 0xffaaaa ;
	var nameTex  = params.texture || null ;

	var geo  = new THREE.SphereGeometry(rayon,8,8) ;
	var mat  = new THREE.MeshStandardMaterial({color:color}) ;
	var mesh = new THREE.Mesh(geo,mat) ;

	return mesh ;
}

function chargerObj(name,repertoire,nameObj,nameMtl){
			var mtlLoader = new THREE.MTLLoader() ;
			var objLoader = new THREE.OBJLoader() ;
			var groupe    = new THREE.Group() ;
			groupe.name = name ;
			mtlLoader.setTexturePath(repertoire);
			mtlLoader.setPath(repertoire);
			mtlLoader.load(nameMtl, function (materials) {

    				materials.preload();

    				objLoader.setMaterials(materials);
    				objLoader.setPath(repertoire);
    				objLoader.load(nameObj, function (object) {
        				groupe.add(object);
					object.name = name ;
					return groupe ;

    				});

			});

			return groupe ;

}
