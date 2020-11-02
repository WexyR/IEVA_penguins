
const penguin_states = {
	"IDLE":0,
	"EAT":1,
	"FLEE":2
}
Object.freeze(penguin_states);


function Penguin(name,data,sim){

	data = {path:"assets/obj/pingouin",obj:"penguin",mtl:"penguin"};
	console.log(data);
	Acteur.call(this,name,data,sim) ;

	var repertoire = data.path + "/" ;
	var fObj       = data.obj + ".obj" ;
	var fMtl       = data.mtl + ".mtl" ;


	this.name = name;
	this.data = data;
	this.sim = sim;
	this.state = penguin_states.IDLE;

	let obj = chargerObj(name,repertoire,fObj,fMtl) ;
	// let obj = creerSphere(name) ;
	this.setObjet3d(obj) ;

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

Penguin.prototype = Object.create(Acteur.prototype) ;
Penguin.prototype.constructor = Penguin ;


Penguin.prototype.actualiser = function(dt){
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
			this.idle_behavior(dt);
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
		if(this.objet3d.position.distanceTo(this.target.objet3d.position) <= 0.5){
			this.target=null;
		} else {
			let direction = this.target.objet3d.position.clone();
			direction.setComponent(1, 0);
			this.objet3d.lookAt(direction);

			this.objet3d.translateZ(this.speed);
		}
	}
}

Penguin.prototype.eat_behavior = function(dt){
	if(this.target != null){
		if(this.objet3d.position.distanceTo(this.target.objet3d.position) <= 0.5){
			//eat the target
			this.delete_target();
			this.target=null;
			this.hunger = 0;
		} else { //move towards target
			let direction = this.target.objet3d.position.clone();
			direction.setComponent(1, 0);
			this.objet3d.lookAt(direction);

			this.objet3d.translateZ(this.speed);
		}
	}
}

Penguin.prototype.flee_behavior = function(dt){

}


Penguin.prototype.idle_stm_update = function(t){

	if(this.target == null || t >= this.IDLE_t0+this.IDLE_duration){ //reached the target or timeout

		if(Math.random()<this.hunger){ //randomly start to eat
			this.state = penguin_states.EAT;
			this.EAT_initialized = false;
		} else {
			this.IDLE_t0 = t;
			this.IDLE_duration = 10; // set timeout to 10sec
			this.update_target();
		}

	}
}

Penguin.prototype.eat_stm_update = function(t){
	if(this.EAT_initialized){ //first loop?
		if(this.target == null) { //reached the target and ate it
			this.state = penguin_states.IDLE;
		} else if(t >= this.EAT_t0+this.EAT_duration) { //timeout
			this.EAT_initialized = false; //force new initialization
		} //else stay in same state
	} else {
		this.EAT_t0 = t;
		this.EAT_duration = 10; // set timeout to 10sec
		this.update_target();
		this.EAT_initialized = true;
	}
}

Penguin.prototype.flee_stm_update = function(dt){

}

Penguin.prototype.update_target = function(){

	let grass = [];
	for (let i=0; i<this.sim.acteurs.length; ++i){
		if(this.sim.acteurs[i].nom.substring(0,5) == "herbe"){

			if(this.inNimbusOf(this.sim.acteurs[i]) && this.canFocus(this.sim.acteurs[i])){
				grass.push(this.sim.acteurs[i]);
			}
		}
	}
	if(grass.length > 0){
		const random = Math.floor(Math.random() * grass.length);

		this.target = grass[random];

	} else {
		this.target = null;
	}
}

Penguin.prototype.delete_target = function(){
	if(this.target != null){
		for (let i=0; i<this.sim.acteurs.length; ++i){
			if(this.sim.acteurs[i] === this.target){
				let removed = this.sim.acteurs.splice(i, 1)[0];
				removed.setVisible(false);
				removed.actualiser();
				i--;
			}
		}
		//this.sim.acteurs = this.sim.acteurs.filter(function(value, index, arr){ return value !== this.target;})
	}
}
