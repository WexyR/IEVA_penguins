
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
			if(t >= this.IDLE_t0+this.IDLE_duration){
				this.IDLE_t0 = t;
				this.IDLE_duration = Math.random()*10;
				console.log("change direction");
			} else {
				this.setOrientation(this.IDLE_t0) ;
				this.setPosition(2*Math.sin(t),0.0,3*Math.cos(2*t)) ;
				// console.log(2*Math.sin(t),0.0,3*Math.cos(2*t));
				break;
			}


		case penguin_states.EAT:
			break;

		case penguin_states.FLEE:
			break;

	}
}


Penguin.prototype.update_state_machine = function(t){
	switch(this.state){
		case penguin_states.IDLE:
			break;

		case penguin_states.EAT:
			break;

		case penguin_states.FLEE:
			break;

	}
}
