
// ============================================================================================
// Les deux classes de base : Sim et Acteur
//
// Une instance de Sim fait évoluer l'état des instances de la classe Acteur
// et les restitue
// ===========================================================================================


function Sim(){
	this.renderer   = null ; 
	this.scene      = null ;
	this.camera     = null ; 
	this.controleur = null ; 
	this.horloge    = 0.0 ; 
	this.chrono     = null ; 
	this.acteurs    = [] ; 

	this.textureLoader = new THREE.TextureLoader() ; 
}

Sim.prototype.init = function(params){
	params = params || {} ; 
	var scn = new THREE.Scene() ; 
	var rd  = new THREE.WebGLRenderer({antialias:true, alpha:true}) ;
	rd.setSize(window.innerWidth, window.innerHeight) ; 
	document.body.appendChild(rd.domElement) ; 
	var cam = new THREE.PerspectiveCamera(45.0,window.innerWidth/window.innerHeight,0.1,1000.0) ; 
	cam.position.set(5.0,1.7,5.0) ; 
	this.controleur = new ControleurCamera(cam) ; 

	var that = this ; 
	window.addEventListener(
			'resize',
			function(){
				that.camera.aspect = window.innerWidth / window.innerHeight ;
				that.camera.updateProjectionMatrix() ; 
				that.renderer.setSize(window.innerWidth, window.innerHeight) ; 
				  }
				) ; 

	// Affectation de callbacks aux événements utilisateur
	document.addEventListener("keyup",    function(e){that.controleur.keyUp(e);}    ,false) ; 
	document.addEventListener("keydown",  function(e){that.controleur.keyDown(e);}  ,false) ;
	document.addEventListener("mousemove",function(e){that.controleur.mouseMove(e);},false) ;
	document.addEventListener("mousedown",function(e){that.controleur.mouseDown(e);},false) ;

	scn.add(new THREE.AmbientLight(0xffffff,1.0)) ;
	scn.add(new THREE.GridHelper(100,20)) ; 

	this.scene    = scn ; 
	this.camera   = cam ;
	this.renderer = rd ;    

	this.creerScene() ; 

	this.chrono   = new THREE.Clock() ; 
	this.chrono.start() ; 

}

// Méthode de création du contenu du monde : à surcharger
// ======================================================

Sim.prototype.creerScene = function(params){}

// Boucle de simulation
// ====================

Sim.prototype.actualiser = function(dt){

	var that     = this ; 

	var dt       = this.chrono.getDelta() ; 
	this.horloge += dt ;

	// Modification de la caméra virtuelle
	// ===================================

	this.controleur.update(dt) ; 

	// Boucle ACTION
	// =============

	var n = this.acteurs.length ; 
	for(var i=0; i<n; i++){
		this.acteurs[i].actualiser(dt) ; 
	} ;

	this.renderer.render(this.scene,this.camera) ; 

	requestAnimationFrame(function(){that.actualiser();}) ; 
}

Sim.prototype.addActeur = function(act){
	this.acteurs.push(act) ;
} 

// ===============================================================================================

function Acteur(nom,data,sim){
	this.nom = nom ; 
	this.objet3d = null ; 
	this.sim = sim ; 
}

// Affectation d'une incarnation à un acteur
Acteur.prototype.setObjet3d = function(obj){
	this.objet3d = obj ; 
	this.sim.scene.add(this.objet3d) ; 
}

// Modification de la position de l'acteur
Acteur.prototype.setPosition = function(x,y,z){
	if(this.objet3d){
		this.objet3d.position.set(x,y,z) ; 
	}
}

// Modification de l'orientation de l'acteur
Acteur.prototype.setOrientation = function(cap){
	if(this.objet3d){
		this.objet3d.rotation.y = cap ; 
	}
}

// Modification de la visibilité de l'acteur
Acteur.prototype.setVisible = function(v){
	if(this.objet3d){
		this.objet3d.isVisible = v ;
	}
}


Acteur.prototype.actualiser = function(dt){}
	 
