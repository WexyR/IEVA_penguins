
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
	this.controleur = null ;
	this.horloge    = 0.0 ;
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
	this.controleur = new ControleurCamera(cam) ;

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
	document.addEventListener("keyup",    function(e){that.controleur.keyUp(e);}    ,false) ;
	document.addEventListener("keydown",  function(e){that.controleur.keyDown(e);}  ,false) ;
	document.addEventListener("mousemove",function(e){that.controleur.mouseMove(e);},false) ;
	document.addEventListener("mousedown",function(e){that.controleur.mouseDown(e);},false) ;

	scn.add(new THREE.AmbientLight(0xffffff,1.0)) ;
	scn.add(new THREE.GridHelper(100,20)) ;

	this.scene    = scn ;
	this.camera   = cam ;
	this.renderer = rd ;

	this.createScene() ;

	this.chrono   = new THREE.Clock() ;
	this.chrono.start() ;

}

// Méthode de création du contenu du monde : à surcharger
// ======================================================

Sim.prototype.createScene = function(params){}

// Boucle de simulation
// ====================

Sim.prototype.update = function(dt){

	var that     = this ;

	var dt       = this.chrono.getDelta() ;
	this.horloge += dt ;

	// Modification de la caméra virtuelle
	// ===================================

	this.controleur.update(dt) ;

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
	this.name = name ;
	this.object3d = null ;
	this.sim = sim ;
	data = {"focus_distance":5, "nimbus_distance":8} || data;
	this.focus_distance = data.focus_distance; //can see
	this.nimbus_distance = data.nimbus_distance; //can be feeled

}

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
	let total;
	for (let i=0; i<this.sim.actors.length; ++i){
		if(this.sim.actors[i].name.substring(0,actor_name.length) == actor_name){

			if((!verify_nimbus || (verify_nimbus && this.inNimbusOf(this.sim.actors[i]))) && (!verify_focus || (verify_focus && this.canFocus(this.sim.actors[i])))){
				matches.push(this.sim.actors[i]);
				let dist = this.object3d.position.distanceTo(this.sim.actors[i].object3d.position);
				total += dist*dist; //squared euclidian dist
				weights.push(dist*dist);
			}
		}
	}
	let sum = 0;
	let cum_rel_weights = [];
	for (let i=0; i<weights.length; ++i){
		let rel_weight = weights[i]/total;
		sum += rel_weight;
		cum_rel_weights.push(sum);
	}
	return [matches, cum_rel_weights];
}

Actor.prototype.look_for_actor = function(actor_name, nearest=false, verify_nimbus=true, verify_focus=true){

	let infos = this.look_for_actors(actor_name, verify_nimbus, verify_focus);
	let matches = infos[0];
	let weights = infos[1];
	console.log(weights);

	if(matches.length > 0){
		const random = Math.floor(Math.random() * matches.length);

		target = matches[random];

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
