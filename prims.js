// ======================================================================================================================
// Fonctions utilitaires pour créer des objets graphiques 3d spécifiques aux projets à développer
// ======================================================================================================================

function creerSol(nom,params){
	params = params || {} ;
	var x       = params.x || 100.0 ;
	var z       = params.z || 100.0 ;
	var couleur = params.couleur || 0xaaaaaa ;
	var nomTex  = params.texture || null ;

	var geo = new THREE.PlaneGeometry(x,z) ;
	var mat = new THREE.MeshStandardMaterial({color:couleur}) ;
	var mesh = new THREE.Mesh(geo,mat) ;
	mesh.rotation.x = -Math.PI / 2.0 ;
	return mesh ;
}

function creerBoite(nom,params){
	params = params || {} ;
	var largeur    = params.largeur    || 0.25 ;
	var hauteur    = params.hauteur    || 0.25 ;
	var profondeur = params.profondeur || 0.25 ;
	var couleur = params.couleur || 0xffaaaa ;
	var nomTex  = params.texture || null ;

	var geo  = new THREE.BoxGeometry(largeur,hauteur,profondeur) ;
	var mat  = new THREE.MeshStandardMaterial({color:couleur}) ;
	var mesh = new THREE.Mesh(geo,mat) ;

	return mesh ;
}


function creerSphere(nom,params){
	params = params || {} ;
	var rayon   = params.rayon || 0.25 ;
	var couleur = params.couleur || 0xffaaaa ;
	var nomTex  = params.texture || null ;

	var geo  = new THREE.SphereGeometry(rayon,8,8) ;
	var mat  = new THREE.MeshStandardMaterial({color:couleur}) ;
	var mesh = new THREE.Mesh(geo,mat) ;

	return mesh ;
}

function chargerObj(nom,repertoire,nomObj,nomMtl){
			var mtlLoader = new THREE.MTLLoader() ;
			var objLoader = new THREE.OBJLoader() ;
			var groupe    = new THREE.Group() ;
			groupe.name = nom ;
			mtlLoader.setTexturePath(repertoire);
			mtlLoader.setPath(repertoire);
			mtlLoader.load(nomMtl, function (materials) {

    				materials.preload();

    				objLoader.setMaterials(materials);
    				objLoader.setPath(repertoire);
    				objLoader.load(nomObj, function (object) {
        				groupe.add(object);
					object.name = nom ;
					return groupe ;

    				});

			});

			return groupe ;

}
