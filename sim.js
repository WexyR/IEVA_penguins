
// ============================================================================================
// Les deux classes de base : Sim et Actor
//
// Une instance de Sim fait évoluer l'état des instances de la classe Actor
// et les restitue
// ===========================================================================================


function Sim(){
	this.renderer   = null ;
	this.scene      = null ;
	this.camera     = null ;
	this.controller = null ;
	this.clock    = 0.0 ;
	this.chrono     = null ;
	this.actors    = [] ;

	this.textureLoader = new THREE.TextureLoader() ;
}

Sim.prototype.init = function(params){
	params = params || {} ;
	var scn = new THREE.Scene() ;
	var rd  = new THREE.WebGLRenderer({antialias:true, alpha:true}) ;
	rd.setSize(window.innerWidth, window.innerHeight) ;
	document.body.appendChild(rd.domElement) ;
	var cam = new THREE.PerspectiveCamera(45.0,window.innerWidth/window.innerHeight,0.1,1000.0) ;
	cam.position.set(5.0,1.7,5.0) ;
	this.controller = new ControllerCamera(cam) ;

	var that = this ;
	window.addEventListener(
			'resize',
			function(){
				that.camera.aspect = window.innerWidth / window.innerHeight ;
				that.camera.updateProjectionMatrix() ;
				that.renderer.setSize(window.innerWidth, window.innerHeight) ;
				  }
				) ;

	// Affectation de callbacks aux événements utilisateur
	document.addEventListener("keyup",    function(e){that.controller.keyUp(e);}    ,false) ;
	document.addEventListener("keydown",  function(e){that.controller.keyDown(e);}  ,false) ;
	document.addEventListener("mousemove",function(e){that.controller.mouseMove(e);},false) ;
	document.addEventListener("mousedown",function(e){that.controller.mouseDown(e);},false) ;

	scn.add(new THREE.AmbientLight(0xffffff,1.0)) ;
	scn.add(new THREE.GridHelper(100,20)) ;

	this.scene    = scn ;
	this.camera   = cam ;
	this.renderer = rd ;

	this.createScene() ;

	this.chrono   = new THREE.Clock() ;
	this.chrono.start() ;

}

// Méthode de création du contenu du monde : à surload
// ======================================================

Sim.prototype.createScene = function(params){}

// Boucle de simulation
// ====================

Sim.prototype.update = function(dt){

	var that     = this ;

	var dt       = this.chrono.getDelta() ;
	this.clock += dt ;

	// Modification de la caméra virtuelle
	// ===================================

	this.controller.update(dt) ;

	// Boucle ACTION
	// =============


	for(var i=0; i<this.actors.length; i++){
		this.actors[i].update(dt) ;
	} ;

	this.renderer.render(this.scene,this.camera) ;

	requestAnimationFrame(function(){that.update();}) ;
}

Sim.prototype.addActor = function(act){
	this.actors.push(act) ;
}

// ===============================================================================================

function Actor(name,data,sim){
	this.name = name + Actor.ID.toString();
	this.object3d = null ;
	this.sim = sim ;
	data = {"focus_distance":5, "nimbus_distance":8} || data;
	this.focus_distance = data.focus_distance; //can see
	this.nimbus_distance = data.nimbus_distance; //can be feeled
	Actor.ID++;

}
Actor.ID = 0;

// Affectation d'une incarnation à un actor
Actor.prototype.setObject3d = function(obj){
	this.object3d = obj ;
	this.sim.scene.add(this.object3d) ;
	//console.log(obj);
}

// Modification de la position de l'actor
Actor.prototype.setPosition = function(x,y,z){
	if(this.object3d){
		this.object3d.position.set(x,y,z) ;
	}
}

// Modification de l'orientation de l'actor
Actor.prototype.setOrientation = function(cap){
	if(this.object3d){
		this.object3d.rotation.y = cap ;
	}
}

// Modification de la visibilité de l'actor
Actor.prototype.setVisible = function(v){
	if(this.object3d){
		this.object3d.visible = v ;
	}
}

Actor.prototype.canFocus = function(other){
	return  this.object3d.position.distanceTo(other.object3d.position) <= this.focus_distance;
}

Actor.prototype.inNimbusOf = function(other){
	return other.object3d.position.distanceTo(this.object3d.position) <= other.nimbus_distance;
}

Actor.prototype.update = function(dt){}

Actor.prototype.look_for_actors = function(actor_name, verify_nimbus=true, verify_focus=true){

	let matches = [];
	let weights = [];
	let total=0;
	for (let i=0; i<this.sim.actors.length; ++i){
		if(this.sim.actors[i].name.substring(0,actor_name.length) == actor_name){

			if((!verify_nimbus || (verify_nimbus && this.inNimbusOf(this.sim.actors[i]))) && (!verify_focus || (verify_focus && this.canFocus(this.sim.actors[i])))){
				matches.push(this.sim.actors[i]);
				let dist = this.object3d.position.distanceTo(this.sim.actors[i].object3d.position);
				let value = 1/(dist*dist); //squared euclidian dist
				total += value;
				weights.push(value);
			}
		}
	}
	let rel_weights = [];
	for (let i=0; i<weights.length; ++i){
		let rel_weight = weights[i]/total;
		rel_weights.push(rel_weight);
	}
	// cum_rel_weights[rel_weights.length -1] = 1 //ceil last value, fix float division approximation
	return [matches, rel_weights];
}

Actor.prototype.look_for_actor = function(actor_name, mode="random", filter_callback=null, verify_nimbus=true, verify_focus=true){
	//mode can be "random", "weighted", "nearest"
	let infos = this.look_for_actors(actor_name, verify_nimbus, verify_focus);

	let matches = [];
	let weights = [];

	// if(actor_name=="Pheromone"){
	// 	console.log(infos[0]);
	// }
	if(filter_callback !== null && infos[0].length !== 0){
		resultmatches = infos[0].filter(filter_callback);
		resultweights = infos[1].filter((v,i) => matches.includes(i+1));
		// resultmatches.forEach((item, i) => {
		// 	matches.push(item);
		// });
		//
		// resultweights.forEach((item, i) => {
		// 	weights.push(item);
		// });
		matches = resultmatches;
		weights = resultweights;

	} else {
		matches = infos[0];
		weights = infos[1]
	}
	// if(actor_name=="Pheromone"){
	// 	console.log(matches);
	// }

	if(matches.length > 0){
		if(mode=="weighted"){

			let cum_weights = [weights[0]];
			for(let i=1; i<weights.length-1; ++i){
				cum_weights.push(cum_weights[i-1]+weights[i]);
			}
			cum_weights.push(1); //fix float division precision

			const random = Math.random();
			let index = 0
			for (index; index<cum_weights.length; ++index){
				if(random <= cum_weights[index]){
					// console.log(index,random, weights[index], random<=weights[index]);
					break;
				}
			}
			// console.log(weights.length, index, random, weights[0], weights[weights.length-1]);
			target = matches[index];
		} else if(mode=="nearest"){
			let max_weight = -1;
			let index = 0
			for (let i=0; i<weights.length; ++i){
				if(max_weight > weights[index]){
					max_weight = weights[index];
					index = i;
				}
			}
			// console.log(weights.length, index, random, weights[0], weights[weights.length-1]);
			target = matches[index];
		} else {
			const random = Math.floor(Math.random() * matches.length);
			target = matches[random];
		}


	} else {
		target = null;
	}
	return target;
}

Actor.prototype.delete = function(){
	for (let i=0; i<this.sim.actors.length; ++i){
		if(this.sim.actors[i] === this){
			let removed = this.sim.actors.splice(i, 1)[0];
			removed.setVisible(false);
			removed.update();
			return;
		}
	}
}
