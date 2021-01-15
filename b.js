// JavaScript source code

const boids_states = {
	"IDLE":0,
	"EAT":1,
	"FLEE":2
}
Object.freeze(boids_states);


function Boids(name,data,sim){

	data = {path:"assets/obj/pingouin",obj:"penguin",mtl:"penguin"};
	Actor.call(this,name,data,sim) ;

	var directory = data.path + "/" ;
	var fObj       = data.obj + ".obj" ;
	var fMtl       = data.mtl + ".mtl" ;


	this.name = name;
	this.data = data;
	this.sim = sim;
	this.state = boids_states.IDLE;

	let obj = loadObj(name,directory,fObj,fMtl) ;
	// let obj = createSphere(name) ;
	this.setObject3d(obj) ;

	this.target = null;
	this.oldSpeed = 0.03;

	this.hunger = 0;
	this.hunger_grow_factor = 0; //every 25s, 50% to go eat

	this.pheromones = new Pheromones(sim);
	this.lastPheromone = 0;

	//t0 and random durations for behaviors
	this.IDLE_t0 = 0;
	this.IDLE_duration = 0;
	this.EAT_t0 = 0;
	this.EAT_duration = 0;
	this.EAT_initialized = false;
	this.FLEE_t0 = 0;


	//boids stuff
	this.kc = 1; //cohesion
	console.log(this.kc)
	this.ks = 10; //separation
	this.ka = 1; //alignement


	this.kc = this.kc / (this.kc + this.ks + this.ka);
	console.log("kc : ",this.kc)
	this.ks = this.ks / (this.kc + this.ks + this.ka);
	console.log("ks : ",this.ks)
	this.ka = this.ka / (this.kc + this.ks + this.ka);
	console.log("ka : ",this.ka)
	console.log(this.kc+this.ka+this.ks)
	if(Math.round(this.kc + this.ks + this.ka) != 1.0){
		throw "boids coefs doesn't add up to 1";
	}
	this.maxSpeed = 1;
	this.maxForce = 2;
	this.speed = new THREE.Vector3(Math.random()*2,0,Math.random()*2);
	this.acceleration = new THREE.Vector3(0, 0, 0);

}

Boids.prototype = Object.create(Actor.prototype) ;
Boids.prototype.constructor = Boids ;


Boids.prototype.update = function(dt){

	var t = this.sim.clock  ;

	this.update_state_machine(t);
	this.pheromones.update(dt);
	if (t - this.lastPheromone > 0.5) {
		this.pheromones.create_pheromone({ radius: 1, position:this.object3d.position.clone() });
		this.lastPheromone = t;
	}

	this.hunger += Math.random()*this.hunger_grow_factor*dt;

	switch(this.state){
		case boids_states.IDLE:
			this.idle_behavior(dt);
			break;

		case boids_states.EAT:
			this.eat_behavior(dt);
			break;

		case boids_states.FLEE:
			this.flee_behavior(dt);
			break;

	}
}


Boids.prototype.update_state_machine = function(t){
	switch(this.state){
		case boids_states.IDLE:
			this.idle_stm_update(t);
			break;

		case boids_states.EAT:
			this.eat_stm_update(t);
			break;

		case boids_states.FLEE:
			this.flee_stm_update(t);
			break;

	}
}

Boids.prototype.idle_behavior = function(dt){
	this.updateFlocking(dt);
}

Boids.prototype.eat_behavior = function(dt){
	if(this.target != null){
		if(this.object3d.position.distanceTo(this.target.object3d.position) <= 0.5){
			//eat the target
			this.target.delete();
			this.target=null;
			this.hunger = 0;
		} else { //move towards target
			this.move();
		}
	}
}

Boids.prototype.flee_behavior = function(dt){
	this.move(1);
}


Boids.prototype.idle_stm_update = function(t){
	let user = this.look_for_actor("user");
	if(user != null){
		if(user.inNimbusOf(this)){
			this.state = boids_states.FLEE;
			return;
		}
	}


	if(t >= this.IDLE_t0+this.IDLE_duration){ //timeout

		if(Math.random()<this.hunger){ //randomly start to eat
			this.state = boids_states.EAT;
			this.EAT_initialized = false;
		} else {
			//	add boid comportement here TODO
		}

	}
}

Boids.prototype.eat_stm_update = function(t){

	let user = this.look_for_actor("user");
	if(user != null){
		if(user.inNimbusOf(this)){
			this.state = boids_states.FLEE;
			return
		}
	}

	if(this.EAT_initialized){ //first loop?
		if(this.target == null) { //reached the target and ate it
			this.state = boids_states.IDLE;
		} else if(t >= this.EAT_t0+this.EAT_duration) { //timeout
			this.EAT_initialized = false; //force new initialization
		} //else stay in same state
	} else {
		this.EAT_t0 = t;
		this.EAT_duration = 10; // set timeout to 10sec
		this.target = this.look_for_actor("grass", "nearest"); //nearest grass
		this.EAT_initialized = true;
	}
}

Boids.prototype.flee_stm_update = function(dt){
	let user = this.look_for_actor("user");
	if(user != null){
		if(user.inNimbusOf(this)){
			this.target = user;
			return;
		}
	}
	this.state = boids_states.IDLE;
	this.target = null;

}


Boids.prototype.move = function(to_or_awayFrom=0, target=this.target){
	if(target != null){
		let direction = this.target.object3d.position.clone();
		direction.setComponent(1, 0);

		if(to_or_awayFrom == 1){ //moveAwayFrom target
			let pos = this.object3d.position.clone();
			pos.setComponent(1, 0);
			let pos2 = pos.clone();
			direction = pos.add(direction.negate()).add(pos2);//set symetrical direction
		}

		this.object3d.lookAt(direction);

		this.object3d.translateZ(this.oldSpeed);
	}
}

Boids.prototype.move_to_position = function(to_or_awayFrom=0, target=null){
	if(target != null){
		let direction = target.clone();
		direction.setComponent(1, 0);

		if(to_or_awayFrom == 1){ //moveAwayFrom target
			let pos = this.object3d.position.clone();
			pos.setComponent(1, 0);
			let pos2 = pos.clone();
			direction = pos.add(direction.negate()).add(pos2);//set symetrical direction
		}

		this.object3d.lookAt(direction);

		this.object3d.translateZ(this.oldSpeed);
	}
}
//boids stuff here
Boids.prototype.updateFlocking = function(dt) {
	let Fc = this.cohesion();
	let Fs = this.separation();
	let Fa = this.alignement();
	if (!Fc) return;
	if (!Fs) return;
	if (!Fa) return;
	this.acceleration = new THREE.Vector3(0,0,0);
	this.acceleration.addVectors(Fc.multiplyScalar(this.kc),Fs.multiplyScalar(this.ks));
	this.acceleration.addVectors(Fa.multiplyScalar(this.ka),this.acceleration);
	this.speed.addScaledVector(this.acceleration,dt);
	this.object3d.position.addScaledVector(this.speed,dt);
}

Boids.prototype.cohesion = function() {
	let G = new THREE.Vector3(0, 0,0);
	
	let actors = this.look_for_actors("Boids",verify_focus=false,verify_nimbus=true)
	let i = 0;
	for (; i < actors.length; ++i) {
		let actor = actors[0][i];
		if (actor!=null){
			G.addVectors(G,actor.object3d.position);
		}
	}//*/
	/*let i = 0;
	this.look_for_actors("Boids", verify_focus = false).forEach(
		function(e){
			G += e[0].object3d.getPosition();
			i++;
		}
	);//*/
	if (i==0){
		return new THREE.Vector3(0,0,0);
	}
	G.multiplyScalar(this.maxSpeed/i);

	let tmp = G.clone();
	tmp.subScalar(this.maxSpeed);
	G.sub(this.speed);
	let Fc = G.clone();
	Fc.multiplyScalar(Math.min(this.maxForce,tmp.length())/G.length())
//	let Fc = G * Math.min(this.maxForce,tmp.length())/G.length();
	return Fc.clone();
}

Boids.prototype.separation = function() {
	let Fs = new THREE.Vector3(0, 0, 0);
/*	this.look_for_actors("Boids",verify_focus=true).forEach(
	function(actor){
		Fs+=((actor[0].object3d.position - this.object3d.getPosition()) /
			(actor[0].object3d.getPosition() - this.object3d.getPosition()).lenght);
		++i;
	});//*/
	let actors = this.look_for_actors("Boids",verify_focus=true)
	for (let i = 0; i < actors.length; ++i) {
		let actor = actors[0][i]; 
		if (actor!=null){
		let tmp = new THREE.Vector3(0,0,0);
		tmp.subVectors(actor.object3d.position,this.object3d.position);
		Fs.addScaledVector(tmp,1/tmp.length());}
	}//*/
	Fs.divideScalar(i);
	return Fs.clone();
}

Boids.prototype.alignement = function() {
	let Vm = new THREE.Vector3(0, 0, 0);
	/*this.look_for_actors("Boids", verify_focus = false).forEach(
		e => { Vm.add(e[0].speed);
			++i;
		}
	);//*/
	let actors = this.look_for_actors("Boids",verify_nimbus=true)
	for (let i = 0; i < actors.length; ++i) {
		let actor = actors[0][i];
		if (actor!=null) Vm.add(actor.speed);
	}//*/
	let k = 1;
	Vm.divideScalar(i);
	Vm.subVectors(Vm,this.speed)
	Vm.multiplyScalar(k)
	let Fa = Vm.clone()
//	let Fa = k*(Vm/i-this.speed);
	return Fa.clone();
}
