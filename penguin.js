
const penguin_states = {
	"IDLE":0,
	"EAT":1,
	"FLEE":2
}
Object.freeze(penguin_states);


function Penguin(name,data,sim){

	data = {path:"assets/obj/pingouin",obj:"penguin",mtl:"penguin"};
	console.log(data);
	Actor.call(this,name,data,sim) ;

	var directory = data.path + "/" ;
	var fObj       = data.obj + ".obj" ;
	var fMtl       = data.mtl + ".mtl" ;

	console.log(this.name);

	this.state = penguin_states.IDLE;

	let obj = loadObj(name,directory,fObj,fMtl) ;
	// let obj = createSphere(name) ;
	this.setObject3d(obj) ;

	this.target = null;
	this.speed = 0.03;

	this.hunger = 0;
	this.hunger_grow_factor = 1/25; //every 25s, 50% to go eat

	this.pheromones = new Pheromones(sim);
	this.lastPheromone = 0;

	//t0 and random durations for behaviors
	this.IDLE_t0 = 0;
	this.IDLE_duration = 0;
	this.EAT_t0 = 0;
	this.EAT_duration = 0;
	this.EAT_initialized = false;
	this.FLEE_t0 = 0;



}

Penguin.prototype = Object.create(Actor.prototype) ;
Penguin.prototype.constructor = Penguin ;


Penguin.prototype.update = function(dt){
	// console.log(this.sim.clock) ;

	var t = this.sim.clock  ;

	this.update_state_machine(t);
	this.pheromones.update(dt);
	if (t - this.lastPheromone > 0.5) {
		this.pheromones.create_pheromone({ radius: 0.4, position:this.object3d.position.clone(), color:0xff0000});
		this.lastPheromone = t;
	}

	this.hunger += Math.random()*this.hunger_grow_factor*dt;
	// console.log(this.hunger);

	switch(this.state){
		case penguin_states.IDLE:
			this.idle_behavior(dt);
			break;

		case penguin_states.EAT:
			this.eat_behavior(dt);
			break;

		case penguin_states.FLEE:
			this.flee_behavior(dt);
			break;

	}
}


Penguin.prototype.update_state_machine = function(t){
	switch(this.state){
		case penguin_states.IDLE:
			this.idle_stm_update(t);
			break;

		case penguin_states.EAT:
			this.eat_stm_update(t);
			break;

		case penguin_states.FLEE:
			this.flee_stm_update(t);
			break;

	}
}

Penguin.prototype.idle_behavior = function(dt){
	if(this.target != null){
		if(this.object3d.position.distanceTo(this.target.object3d.position) <= 0.5){
			this.target=null;
		} else {
			this.move();
		}
	}
}

Penguin.prototype.eat_behavior = function(dt){
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

Penguin.prototype.flee_behavior = function(dt){
	this.move(1);
}


Penguin.prototype.idle_stm_update = function(t){
	let user = this.look_for_actor("user");
	if(user != null){
		if(user.inNimbusOf(this)){
			this.state = penguin_states.FLEE;
			return;
		}
	}
	// nearest pheromone that is not mine
	let others_pheromone = this.look_for_actor("Pheromone", "nearest", actor_info => actor_info.parent !== this.pheromones);

	if(this.target == null || t >= this.IDLE_t0+this.IDLE_duration){ //reached the target or timeout

		if(Math.random()<this.hunger){ //randomly start to eat
			this.state = penguin_states.EAT;
			this.EAT_initialized = false;
		} else if (others_pheromone !== null){
			this.target = others_pheromone;
		} else {
			this.IDLE_t0 = t;
			this.IDLE_duration = 10; // set timeout to 10sec
			this.target = this.look_for_actor("grass");
		}

	} else if(others_pheromone !== null) {
		this.target = others_pheromone;
	}
}

Penguin.prototype.eat_stm_update = function(t){

	let user = this.look_for_actor("user");
	if(user != null){
		if(user.inNimbusOf(this)){
			this.state = penguin_states.FLEE;
			return
		}
	}

	if(this.EAT_initialized){ //first loop?
		if(this.target == null) { //reached the target and ate it
			this.state = penguin_states.IDLE;
		} else if(t >= this.EAT_t0+this.EAT_duration) { //timeout
			this.EAT_initialized = false; //force new initialization
		} //else stay in same state
	} else {
		this.EAT_t0 = t;
		this.EAT_duration = 10; // set timeout to 10sec
		this.target = this.look_for_actor("grass", "weighted"); //nearest grass
		this.EAT_initialized = true;
	}
}

Penguin.prototype.flee_stm_update = function(dt){
	let user = this.look_for_actor("user");
	if(user != null){
		if(user.inNimbusOf(this)){
			this.target = user;
			return;
		}
	}
	this.state = penguin_states.IDLE;
	this.target = null;

}




Penguin.prototype.move = function(to_or_awayFrom=0, target=this.target){
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

		this.object3d.translateZ(this.speed);
	}
}
