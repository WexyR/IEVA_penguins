
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
			if(this.target==null || this.objet3d.position.distanceTo(this.target.objet3d.position) <= 0.5){
				this.update_target(t);
			}
			if(this.target != null){
				let direction = this.target.objet3d.position.clone();
				direction.setComponent(1, 0);
				this.objet3d.lookAt(direction);

				this.objet3d.translateZ(this.speed);
			}
			break;

		case penguin_states.EAT:
			break;

		case penguin_states.FLEE:
			break;

	}
}


Penguin.prototype.update_state_machine = function(t){
	switch(this.state){
		case penguin_states.IDLE:
			if(t >= this.IDLE_t0+this.IDLE_duration){
				this.IDLE_t0 = t;
				this.IDLE_duration = Math.random()*10;
				this.update_target(t);
			}
			break;

		case penguin_states.EAT:
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

Penguin.prototype.update_target = function(t){

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
