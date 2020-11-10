// JavaScript source code

function Boids(name, data, sim) {
	Actor.call(this, name, data, sim);
	this.kc = 10;
	this.ks = 10;
	this.ka = 10;

	this.kc = this.kc / (this.kc + this.ks + this.ka);
	this.ks = this.kc / (this.kc + this.ks + this.ka);
	this.ka = this.kc / (this.kc + this.ks + this.ka);
	assert(this.kc + this.ks + this.ka == 1.0);

	this.maxSpeed = 0.1;
	this.speed = new THREE.Vector3(0,0,0);
	this.acceleration = new THREE.Vector3(0, 0, 0);
}
Boids.prototype = Object.create(Actor.prototype) ;
Boids.prototype.constructor = Boids;

Boids.prototype.update = function(dt) {
	let Fc = this.cohesion();
	let Fs = this.separation();
	let Fa = this.alignement();
	this.acceleration = Fc * this.kc + Fs * this.ks + Fa * this.ka;
	this.speed.add(this.acceleration * dt);
	this.position.add(this.speed * dt);
}

Boids.prototype.cohesion = function() {
	let G = 0;
	/*
	for (let i = 0; i < this.entities_in_minbus.look_for_actors("Boids",verify_focus=false); ++i) {
		G += this.entities[i].position;
	}*/
	let i = 0;
	this.look_for_actors("Boids", verify_focus = false).forEach(
		e => {G += e[0].position;i++}
	);
	G /= i;
	let Vd = this.maxSpeed * G;
	let Fc = min(this.maxForce,(Vd-this.speed).length())*
		(Vd-this.speed)/((Vd-this.speed).length());
	return Fc;
}

Boids.prototype.separation = function() {
	let Fs = new Vector3(0, 0, 0);
	for (let i = 0; i < this.entities_in_focus.length; ++i) {
		Fs.add((this.entities_in_focus[i].position - this.position) /
			(this.entities_in_focus[i].position - this.position).lenght);
	}
	Fs /= i;
	return Fs;
}

Boids.prototype.alignement = function() {
	let Vm = new Vector3(0, 0, 0);
	for (let i = 0; i < this.entities_in_nimbus.length; ++i) {
		Vm.add(this.entities_in_nimbus[i].speed);
	}
	let k = 1;
	let Fa = k*(Vm/i-this.speed);
	return Fa;
}




