// JavaScript source code
var counter = 0;
function Pheromone(name,data,sim){
	Actor.call(this,name,data,sim) ;

	this.age   = data.age   || 100 ;
	let color = data.color || 0xff00ff ;
	let radius = data.radius || 1;

	let sph = createSphere(name,{radius:radius, color:color}) ;
	sph.material.transparent = true;
	sph.material.opacity = 1;
	this.setObject3d(sph) ;
	console.log(this.name + ':' + this.age);
}
Pheromone.prototype = Object.create(Actor.prototype) ;
Pheromone.prototype.constructor = Pheromone;

Pheromone.prototype.update = function(dt){
	this.age -= dt;
	//console.log(this.name + ':' + this.age);
	this.object3d.material.opacity = this.age/25;
	let scale_factor = 30;
	this.object3d.geometry.scale(1-dt/scale_factor,1-dt/scale_factor,1-dt/scale_factor);
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


Pheromones.prototype.update = function(dt)
{
	for (let i = 0; i < this.pheromones.length; ++i) {
		this.pheromones[i].update(dt);
	}
	//this.pheromones.forEach(p => p.update(dt));
}

Pheromones.prototype.create_pheromone = function(data) {
	let name = "Pheromone_" + counter;
	//console.log(name,data.position);
	data.age = 20 + (Math.random() - 0.5) * 5;
	let phe = new Pheromone(name, data, this.sim);
	phe.setPosition(data.position.x,0.2,data.position.z);
	this.pheromones.push(phe);
	counter ++;
}