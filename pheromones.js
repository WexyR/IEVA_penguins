// JavaScript source code

function Pheromones(name,data,sim){
	Actor.call(this,name,data,sim) ;

	var age   = data.age || 100 ;
	var color = data.color || 0x00ff00 ;

	var sph = createSphere(name,{rayon:rayon, color:color}) ;
	sph.material.transparent = true;

	this.setObject3d(sph) ;
}
Pheromones.prototype = Object.create(Actor.prototype) ;
Pheromones.prototype.constructor = Pheromones;

Pheromones.prototype.update = function(dt){
	this.age -= dt;
	this.Object3d.material.opacity = 1 - this.age/100;
	if(this.age <= 0) {
		this.delete();
	}
}

