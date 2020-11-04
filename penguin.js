
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

	var repertoire = data.path + "/" ;
	var fObj       = data.obj + ".obj" ;
	var fMtl       = data.mtl + ".mtl" ;


	this.name = name;
	this.data = data;
	this.sim = sim;
	this.state = penguin_states.IDLE;

	let obj = chargerObj(name,repertoire,fObj,fMtl) ;
	// let obj = createSphere(name) ;
	this.setObject3d(obj) ;

	this.target = null;
	this.speed = 0.03;

	this.hunger = 0;
	this.hunger_grow_factor = 1/45; //every 45s, 50% to go eat



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
	// console.log(this.sim.horloge) ;

	var t = this.sim.horloge  ;

	this.update_state_machine(t);


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
			this.delete_target();
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
			return
		}
	}


	if(this.target == null || t >= this.IDLE_t0+this.IDLE_duration){ //reached the target or timeout

		if(Math.random()<this.hunger){ //randomly start to eat
			this.state = penguin_states.EAT;
			this.EAT_initialized = false;
		} else {
			this.IDLE_t0 = t;
			this.IDLE_duration = 10; // set timeout to 10sec
			this.target = this.look_for_actor("grass");
		}

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
		this.target = this.look_for_actor("grass");
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

Penguin.prototype.look_for_actor = function(actor_name){

	let grass = [];
	for (let i=0; i<this.sim.actors.length; ++i){
		if(this.sim.actors[i].name.substring(0,actor_name.length) == actor_name){

			if(this.inNimbusOf(this.sim.actors[i]) && this.canFocus(this.sim.actors[i])){
				grass.push(this.sim.actors[i]);
			}
		}
	}
	if(grass.length > 0){
		const random = Math.floor(Math.random() * grass.length);

		target = grass[random];

	} else {
		target = null;
	}
	return target
}

Penguin.prototype.delete_target = function(){
	if(this.target != null){
		for (let i=0; i<this.sim.actors.length; ++i){
			if(this.sim.actors[i] === this.target){
				let removed = this.sim.actors.splice(i, 1)[0];
				removed.setVisible(false);
				removed.update();
				i--;
			}
		}
		//this.sim.actors = this.sim.actors.filter(function(value, index, arr){ return value !== this.target;})
	}
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
