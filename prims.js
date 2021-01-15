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

function createWall(name,params){
	params = params || {};
	let radius = params.radius || 10;
	var roofVertices = [
		new THREE.Vector3(radius, 10, radius),
		new THREE.Vector3(-radius, 10, radius), 
		new THREE.Vector3(-radius, 10, -radius),
		new THREE.Vector3(radius, 10, -radius), 
	];

	var material = new THREE.MeshBasicMaterial({
		color: 0xccffcc,
		side: THREE.DoubleSide
	});

	for (var i = 0; i < roofVertices.length; i++) {
	
	    var v1 = roofVertices[i];
	    var v2 = roofVertices[(i+1)%roofVertices.length];//wrap last vertex back to start
	
	    var wallGeometry = new THREE.Geometry();
	
	    wallGeometry.vertices = [
	        v1,
	        v2,
	        new THREE.Vector3(v1.x, 0, v1.z),
	        new THREE.Vector3(v2.x, 0, v2.z)
	    ];
	
	    //always the same for simple 2-triangle plane
	    wallGeometry.faces = [new THREE.Face3(0, 1, 2), new THREE.Face3(1, 2, 3)];
	
	    wallGeometry.computeFaceNormals();
	    wallGeometry.computeVertexNormals();
	
	    var wallMesh = new THREE.Mesh(wallGeometry, material);
		return wallMesh;
//	    scene.add(wallMesh);
	}
	
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

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}
