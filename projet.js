
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

	var tux = new Penguin("penguin", {}, this);
	this.addActor(tux) ;

	var tux2 = new Penguin("penguin", {}, this);
	tux2.setPosition(6, 0, 6)
	this.addActor(tux2) ;


	var tux3 = new Boids("boids", {}, this);
	this.addActor(tux3) ;
	tux3.setPosition(13, 0, 13)

	var tux4 = new Boids("boids", {}, this);
	tux4.setPosition(10, 0, 10)
	this.addActor(tux4) ;
	//
	var tux5 = new Boids("boids3", {}, this);
	tux5.setPosition(7, 0, 10)
	this.addActor(tux5) ;

	var tux6 = new Boids("boids4", {}, this);
	tux6.setPosition(10, 0, 13)
	this.addActor(tux6) ;

	var tux7 = new Boids("boids5", {}, this);
	tux7.setPosition(7, 0, 13)
	this.addActor(tux7) ;

	var user = new User("user", {}, this);
	this.addActor(user);

	maplength = 10;

	for (j=-maplength; j<=maplength; j++){
		for (i=-maplength; i<=maplength; i++){
			if(noise.perlin2(i/10, j/10)<=0){
				var hij = new Grass("grass",{color:0xaaff55},this) ;
				//console.log("grass"+((i+maplength)+(2*maplength+1)*(j+maplength)));
				hij.setPosition(i,0.2,j) ;
				hij.matrixAutoUpdate  = false;
				this.addActor(hij) ;
			}
		}
	}


	var rock = new Rock("rock",{width:3,depth:2,height:1.5,color:0xffaa22},this);
	rock.setPosition(0,0.75,0) ;
	rock.object3d.material.transparent = true;
	rock.object3d.material.opacity=0.7;
	this.addActor(rock) ;

	// var wallN = new Rock("rockWallN",{width:0.1,depth:2*(maplength+1),height:0.5,color:0xa00000},this);
	// wallN.setPosition(maplength+1,0,0);
	// this.addActor(wallN);
	//
	// var wallW = new Rock("rockWallW",{width:2*(maplength+1),depth:0.1,height:0.5,color:0xa00000},this);
	// wallW.setPosition(0,0,maplength+1);
	// this.addActor(wallN);
	//
	// var wallS = new Rock("rockWallS",{width:0.1,depth:2*(maplength+1),height:0.5,color:0xa00000},this);
	// wallS.setPosition(-maplength-1,0,0);
	// this.addActor(wallS);
	//
	// var wallE = new Rock("rockWallE",{width:2*(maplength+1),depth:0.1,height:0.5,color:0xa00000},this);
	// wallE.setPosition(0,0,-maplength-1);
	// this.addActor(wallE);


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
