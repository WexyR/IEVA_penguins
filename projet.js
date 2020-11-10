
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
	rock.setPosition(-5,0.75,5) ;
	rock.object3d.material.transparent = true;
	rock.object3d.material.opacity=0.7;
	this.addActor(rock) ;
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
