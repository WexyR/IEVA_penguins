
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

	this.focus_distance = 5;
	this.nimbus_distance = 8;

	this.target = null;
	this.speed = 0.03;

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


	switch(this.state){
		case penguin_states.IDLE:
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
			break;

		case penguin_states.EAT:
			if(this.target != null){
				if(this.objet3d.position.distanceTo(this.target.objet3d.position) <= 0.5){
					//eat the target
					this.delete_target();
					console.log("I ate!")
					this.target=null;
				} else { //move towards target
					let direction = this.target.objet3d.position.clone();
					direction.setComponent(1, 0);
					this.objet3d.lookAt(direction);

					this.objet3d.translateZ(this.speed);
				}
			}
			break;

		case penguin_states.FLEE:
			break;

	}
}


Penguin.prototype.update_state_machine = function(t){
	switch(this.state){
		case penguin_states.IDLE:
			if(this.target == null || t >= this.IDLE_t0+this.IDLE_duration){ //reached the target or timeout

				if(Math.random()<0.2){ //randomly start to eat
					this.state = penguin_states.EAT;
					this.EAT_initialized = false;
				} else {
					this.IDLE_t0 = t;
					this.IDLE_duration = 10; // set timeout to 10sec
					this.update_target();
				}

			}
			break;

		case penguin_states.EAT:
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
				console.log("I want to eat.");
			}

			break;

		case penguin_states.FLEE:
			break;

	}
}

Penguin.prototype.inFocus = function(actor){
	return  this.objet3d.position.distanceTo(actor.objet3d.position) <= this.focus_distance;
}

Penguin.prototype.inNimbus = function(actor){
	return this.objet3d.position.distanceTo(actor.objet3d.position) <= this.nimbus_distance;
}

Penguin.prototype.update_target = function(){

	let grass = [];
	for (let i=0; i<this.sim.acteurs.length; ++i){
		if(this.sim.acteurs[i].nom.substring(0,5) == "herbe"){

			if(this.inFocus(this.sim.acteurs[i])){
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
