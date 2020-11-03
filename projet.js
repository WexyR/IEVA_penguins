
// ======================================================================================================================
// Spécialisation des classes Sim et Actor pour un projet particulier
// ======================================================================================================================

// var penguin = require("penguin.js");



function Appli(){
	Sim.call(this) ;
}

Appli.prototype = Object.create(Sim.prototype) ;
Appli.prototype.constructor = Appli ;

Appli.prototype.createScene = function(params){
	params = params || {} ;
	this.scene.add(new THREE.AxesHelper(3.0)) ;
	this.scene.add(createGround()) ;

	var tux = new Penguin("tux1", {}, this);
	this.addActor(tux) ;

	maplength = 10;

	for (j=-maplength; j<=maplength; j++){
		for (i=-maplength; i<=maplength; i++){
			if(noise.perlin2(i/10, j/10)<=0){
				var hij = new Grass("grass"+((i+maplength)+(2*maplength+1)*(j+maplength)),{color:0xaaff55},this) ;
				//console.log("grass"+((i+maplength)+(2*maplength+1)*(j+maplength)));
				hij.setPosition(i,0.2,j) ;
				hij.matrixAutoUpdate  = false;
				this.addActor(hij) ;
			}
		}
	}

	var rock = new Rock("rock",{width:3,depth:2,height:1.5,color:0xffaa22},this);
	rock.setPosition(-5,0.75,5) ;
	this.addActor(rock) ;
}


// ========================================================================================================

function Actor1(name,data,sim){
	Actor.call(this,name,data,sim) ;

	var repertoire = data.path + "/" ;
	var fObj       = data.obj + ".obj" ;
	var fMtl       = data.mtl + ".mtl" ;


	let obj = chargerObj(name,repertoire,fObj,fMtl) ;
	this.setObject3d(obj) ;
}

Actor1.prototype = Object.create(Actor.prototype) ;
Actor1.prototype.constructor = Actor1 ;

Actor1.prototype.update = function(dt){
	console.log(this.sim.horloge) ;
	var t = this.sim.horloge  ;
	this.setOrientation(t) ;
	this.setPosition(2*Math.sin(t),0.0,3*Math.cos(2*t)) ;
}


// La classe décrivant les touffes d'grass
// =======================================

function Grass(name,data,sim){
	Actor.call(this,name,data,sim) ;

	var rayon   = data.rayon || 0.25 ;
	var color = data.color || 0x00ff00 ;

	var sph = createSphere(name,{rayon:rayon, color:color}) ;
	this.setObject3d(sph) ;
}
Grass.prototype = Object.create(Actor.prototype) ;
Grass.prototype.constructor = Grass ;

// La classe décrivant les rocks
// ===============================

function Rock(name,data,sim){
	Actor.call(this,name,data,sim) ;

	var l = data.width || 0.25 ;
	var h = data.height || 1.0 ;
	var p = data.depth || 0.5 ;
	var color = data.color || 0x00ff00 ;

	var box = createBoite(name,{width:l, height:h, depth:p, color:color}) ;
	this.setObject3d(box) ;
}
Rock.prototype = Object.create(Actor.prototype) ;
Rock.prototype.constructor = Rock ;
