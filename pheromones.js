// JavaScript source code
var counter = 0;
function Pheromone(name,data,sim, parent){
	Actor.call(this,name,data,sim) ;


	this.age   = data.age ||10;
	this.max_age = this.age;
	let color = data.color || 0xff00ff;
	let radius = data.radius || 0.5;
	this.parent = parent;

	let sph = createSphere(name,{radius:radius, color:color}) ;
	sph.material.transparent = true;
	sph.material.opacity = 1;
	this.setObject3d(sph) ;

	this.todiscard = false;
	// console.log(this.name + ':' + this.age);
}
Pheromone.prototype = Object.create(Actor.prototype) ;
Pheromone.prototype.constructor = Pheromone;

Pheromone.prototype.update = function(dt){
	this.age -= dt;
	//console.log(this.name + ':' + this.age);
	this.object3d.material.opacity = this.age/this.max_age;
	let scale_factor = 30;
	this.object3d.geometry.scale(1-dt/scale_factor,1-dt/scale_factor,1-dt/scale_factor);
	if(this.age <= 0) {
		this.delete();
		this.todiscard = true;
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
		if(this.pheromones[i].todiscard){
			this.pheromones.splice(i, 1);
		}else{
			this.pheromones[i].update(dt);
		}
	}
	//this.pheromones.forEach(p => p.update(dt));
}

Pheromones.prototype.create_pheromone = function(data) {

	//console.log(name,data.position);
	data.age = 20 + (Math.random() - 0.5) * 5;
	let phe = new Pheromone("Pheromone", data, this.sim, this);
	phe.setPosition(data.position.x,0.2,data.position.z);
	this.sim.addActor(phe);
	this.pheromones.push(phe);
	counter ++;
}
