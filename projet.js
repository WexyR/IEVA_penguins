
// ======================================================================================================================
// Spécialisation des classes Sim et Acteur pour un projet particulier
// ======================================================================================================================

// var penguin = require("penguin.js");



function Appli(){
	Sim.call(this) ;
}

Appli.prototype = Object.create(Sim.prototype) ;
Appli.prototype.constructor = Appli ;

Appli.prototype.creerScene = function(params){
	params = params || {} ;
	this.scene.add(new THREE.AxesHelper(3.0)) ;
	this.scene.add(creerSol()) ;

	var tux = new Penguin("tux1", {}, this);
	this.addActeur(tux) ;

	maplength = 10;

	for (j=-maplength; j<=maplength; j++){
		for (i=-maplength; i<=maplength; i++){
			if(noise.perlin2(i/10, j/10)<=0){
				var hij = new Herbe("herbe"+(i+100*j),{couleur:0xaaff55},this) ;
				hij.setPosition(i,0.2,j) ;
				hij.matrixAutoUpdate  = false;
				this.addActeur(hij) ;
			}
		}
	}
	var herbe1 = new Herbe("herbe1", {}, this) ;
	this.addActeur(herbe1) ;

	var herbe2 = new Herbe("herbe2",{couleur:0xaaff55},this) ;
	herbe2.setPosition(3,2,3) ;
	this.addActeur(herbe2) ;

	var rocher = new Rocher("rocher",{largeur:3,profondeur:2,hauteur:1.5,couleur:0xffaa22},this);
	rocher.setPosition(-5,0.75,5) ;
	this.addActeur(rocher) ;
}


// ========================================================================================================

function Acteur1(nom,data,sim){
	Acteur.call(this,nom,data,sim) ;

	var repertoire = data.path + "/" ;
	var fObj       = data.obj + ".obj" ;
	var fMtl       = data.mtl + ".mtl" ;


	let obj = chargerObj(name,repertoire,fObj,fMtl) ;
	this.setObjet3d(obj) ;
}

Acteur1.prototype = Object.create(Acteur.prototype) ;
Acteur1.prototype.constructor = Acteur1 ;

Acteur1.prototype.actualiser = function(dt){
	console.log(this.sim.horloge) ;
	var t = this.sim.horloge  ;
	this.setOrientation(t) ;
	this.setPosition(2*Math.sin(t),0.0,3*Math.cos(2*t)) ;
}


// La classe décrivant les touffes d'herbe
// =======================================

function Herbe(nom,data,sim){
	Acteur.call(this,nom,data,sim) ;

	var rayon   = data.rayon || 0.25 ;
	var couleur = data.couleur || 0x00ff00 ;

	var sph = creerSphere(nom,{rayon:rayon, couleur:couleur}) ;
	this.setObjet3d(sph) ;
}
Herbe.prototype = Object.create(Acteur.prototype) ;
Herbe.prototype.constructor = Herbe ;

// La classe décrivant les rochers
// ===============================

function Rocher(nom,data,sim){
	Acteur.call(this,nom,data,sim) ;

	var l = data.largeur || 0.25 ;
	var h = data.hauteur || 1.0 ;
	var p = data.profondeur || 0.5 ;
	var couleur = data.couleur || 0x00ff00 ;

	var box = creerBoite(nom,{largeur:l, hauteur:h, profondeur:p, couleur:couleur}) ;
	this.setObjet3d(box) ;
}
Rocher.prototype = Object.create(Acteur.prototype) ;
Rocher.prototype.constructor = Rocher ;
