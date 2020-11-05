// JavaScript source code

function Pheromone(name,data,sim){
	Actor.call(this,name,data,sim) ;

	this.age   = data.age   || 100 ;
	var color = data.color || 0xaa0000 ;
	var radius = data.radius || 1;

	var sph = createSphere(name,{radius:radius, color:color}) ;
	sph.material.transparent = true;

	this.setObject3d(sph) ;
}
Pheromone.prototype = Object.create(Actor.prototype) ;
Pheromone.prototype.constructor = Pheromone;

Pheromone.prototype.update = function(dt){
	this.age = this.age - dt;
	console.log(this.name + ':' + this.age);
	this.object3d.material.opacity = this.age/25;
	if(this.age <= 0) {
		this.delete();
	}
}


function Pheromones(sim) {
	this.pheromones = [];
	this.sim = sim;
}
Pheromones.prototype = Object.create(Actor.prototype) ;
Pheromones.prototype.constructor = Pheromones;

//Pheromones.counter = 0;

Pheromones.prototype.update = function(dt)
{
	pheromones.forEach(p => p.update(dt));
}

Pheromones.prototype.create_pheromone = function(data) {
	counter ++;
	var name = "Pheromone_" + counter;
	data.age = 20+(Math.random()-0.5)*5
	this.pheromones.add(Pheromone(name, data, this.sim));
}