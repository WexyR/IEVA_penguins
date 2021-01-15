
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
	var user = new User("user", {}, this);
	this.addActor(user);


	var tux0 = new Boids("Boids0", {}, this);
	tux0.setPosition(0,0,0);
	this.addActor(tux0) ;
	var tux1 = new Boids("Boids1", {}, this);
	tux1.setPosition(1,0,0);
	this.addActor(tux1) ;
	var tux2 = new Boids("Boids2", {}, this);
	tux0.setPosition(1,0,1);
	this.addActor(tux2) ;
	var tux3 = new Boids("Boids3", {}, this);
	tux0.setPosition(0,0,1);
	this.addActor(tux3) ;

	maplength = 11;

	for (j=-maplength; j<=maplength; j++){
		for (i=-maplength; i<=maplength; i++){
			if(noise.perlin2(i/10, j/10)<=0){
				var hij = new Grass("grass"+((i+maplength)+(2*maplength+1)*(j+maplength)),{color:0xaaff55},this) ;
				//console.log("grass"+((i+maplength)+(2*maplength+1)*(j+maplength)));
				hij.setPosition(i,0,j) ;
				hij.matrixAutoUpdate  = false;
				this.addActor(hij) ;
			}
		}
	}

	var nbRocks = 3
	for (i=0;i<nbRocks;++i){
		var width = getRandomArbitrary(1,3);
		var depth = getRandomArbitrary(1,3);
		var height = getRandomArbitrary(0.5,2);
		var x = getRandomArbitrary(-maplength,maplength)
		var y = getRandomArbitrary(-maplength,maplength)
		var rock = new Rock("rock"+i,{width:width,depth:depth,height:height,color:0xffaa22},this);
		
		rock.setPosition(x,0,y) ;
		//rock.object3d.material.transparent = true;
		//rock.object3d.material.opacity=0.7;
		this.addActor(rock) ;
	}

	var wallN = new Rock("rockWallN",{width:0.1,depth:2*(maplength+1),height:0.5,color:0xa00000},this);
	wallN.setPosition(maplength+1,0,0);
	this.addActor(wallN);

	var wallW = new Rock("rockWallW",{width:2*(maplength+1),depth:0.1,height:0.5,color:0xa00000},this);
	wallW.setPosition(0,0,maplength+1);
	this.addActor(wallN);

	var wallS = new Rock("rockWallS",{width:0.1,depth:2*(maplength+1),height:0.5,color:0xa00000},this);
	wallS.setPosition(-maplength-1,0,0);
	this.addActor(wallS);

	var wallE = new Rock("rockWallE",{width:2*(maplength+1),depth:0.1,height:0.5,color:0xa00000},this);
	wallE.setPosition(0,0,-maplength-1);
	this.addActor(wallE);

	console.log(this.actors);
}


// ========================================================================================================

function User(name,data,sim){
	Actor.call(this,name,data,sim) ;
	let obj = createSphere(name, {radius:0, color:0x000000}); //useless object only for position
	this.setObject3d(obj);
}

User.prototype = Object.create(Actor.prototype) ;
User.prototype.constructor = User ;

User.prototype.update = function(dt){
	let pos = this.sim.controller.position;
	this.setPosition(pos.x, 0, pos.z);
	// console.log(this.object3d.position);
}


// La classe décrivant les touffes d'grass
// =======================================

function Grass(name,data,sim){
	Actor.call(this,name,data,sim) ;

	var radius   = data.radius || 0.25 ;
	var color = data.color || 0x00ff00 ;

	var sph = createSphere(name,{radius:radius, color:color}) ;
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

	var box = createBox(name,{width:l, height:h, depth:p, color:color}) ;
	this.setObject3d(box) ;
}
Rock.prototype = Object.create(Actor.prototype) ;
Rock.prototype.constructor = Rock ;
