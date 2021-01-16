

function Boids(name,data,sim){

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

  this.avoidance_distance = 5;
  this.alignment_strength = 0.5;
  this.cohesion_strength = 0.3;
  this.avoidance_strength = 0.4;
  this.rotation_speed = 10;

  this.direction = new THREE.Vector3(0, 0, 0);
	this.random_target_time = 0;
	this.random_target_last_time = 0;


}

Boids.prototype = Object.create(Actor.prototype) ;
Boids.prototype.constructor = Boids ;


Boids.prototype.update = function(dt){
	// console.log(this.sim.clock) ;

	var t = this.sim.clock  ;

	this.update_state_machine(t);
	this.pheromones.update(dt);
	if (t - this.lastPheromone > 0.5) {
		this.pheromones.create_pheromone({ radius: 0.4, position:this.object3d.position.clone() });
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


Boids.prototype.update_state_machine = function(t){
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

Boids.prototype.idle_behavior = function(dt){
  let sensed_b = this.look_for_actors("boids", verify_focus=false)[0];
  let sensed_w = this.look_for_actors("boids", verify_focus=false)[1];
  let seen_b = this.look_for_actors("boids", verify_focus=true)[0];
  let seen_w = this.look_for_actors("boids", verify_focus=true)[1];
	let rocks = this.look_for_actors("rock", verify_focus=true)[0]
	let user = this.look_for_actor("user")
  //console.log(sensed_b, seen_b, seen_w);

  let alignment = new THREE.Vector3(0, 0, 0);
  let cohesion = new THREE.Vector3(0, 0, 0);
  let avoidance = new THREE.Vector3(0, 0, 0);

  // alignment force
  for(i=0;i<seen_b.length;i++){
    alignment.add(seen_b[i].object3d.rotation.clone().toVector3().sub(this.object3d.rotation.toVector3()).multiplyScalar(seen_w[i]));
  }

  for(i=0;i<sensed_b.length;i++){
      if (this.object3d.position.distanceTo(sensed_b[i].object3d.position.clone()) > this.avoidance_distance){
        // cohesion force

        cohesion.add(sensed_b[i].object3d.position.clone().sub(this.object3d.position).multiplyScalar(sensed_w[i]));

      } else {
        // avoidance force
        let weight = (this.avoidance_distance - sensed_b[i].object3d.position.clone().distanceTo(this.object3d.position))**2;
        avoidance.sub(sensed_b[i].object3d.position.clone().sub(this.object3d.position).multiplyScalar(weight));

      }
  }

	for(i=0; i<rocks.length; i++){
		if (this.object3d.position.distanceTo(rocks[i].object3d.position.clone()) < this.avoidance_distance){

			// avoidance force
			let weight = (this.avoidance_distance - rocks[i].object3d.position.clone().distanceTo(this.object3d.position))**4;
			avoidance.sub(rocks[i].object3d.position.clone().sub(this.object3d.position).multiplyScalar(weight));

		}
	}



  alignment.normalize();
  cohesion.normalize();
  avoidance.normalize();


  //console.log(al_cum_weights, co_cum_weights, av_cum_weights);
  let cov = new THREE.Vector3(0, 0, 0)
	if(this.object3d.position.x>8){
			avoidance.add(new THREE.Vector3(-2, 0, 0));
	} else if  (this.object3d.position.x<-8){
			avoidance.add(new THREE.Vector3(2, 0, 0));
	} else if(this.object3d.position.z>8){
			avoidance.add(new THREE.Vector3(0, 0, -2));
	} else if  (this.object3d.position.z<-8){
			avoidance.add(new THREE.Vector3(0, 0, 2));
	}
	if(user != null){
		if (this.object3d.position.distanceTo(user.object3d.position.clone()) < this.avoidance_distance){

			// avoidance force
			avoidance.sub(user.object3d.position.clone().sub(this.object3d.position).normalize().multiplyScalar(4));

		}
	}

  cov.add(avoidance.clone().multiplyScalar(this.avoidance_strength))
  cov.add(alignment.clone().multiplyScalar(this.alignment_strength))
  cov.add(cohesion.clone().multiplyScalar(this.cohesion_strength))

  cov.normalize();

  if(cov.length()> 0.01){
    //console.log(this.object3d.position, cov, sensed_b);
    target = new THREE.Vector3(0, 0, 0);
		target.add(cov).sub(this.direction);
		target.normalize();
		target.multiplyScalar(this.rotation_speed*dt);
		target.add(this.direction);
		target.normalize();
    target.setComponent(1, 0);
		this.direction = target.clone();
		target.add(this.object3d.position);
    this.object3d.lookAt(target);
  } else {
		this.random_target_time += dt;
		if (this.random_target_time>this.random_target_last_time + 0.5){
			console.log("I'm lost :'(");
			this.random_target_last_time = this.random_target_time;
			let others_pheromone = this.look_for_actor("Pheromone", "nearest", actor_info => actor_info.parent !== this.pheromones);
			if(others_pheromone != null){
				target = others_pheromone;
			}else{
				target = this.look_for_actor("grass", "weighted");
			}
			if(target == null){
				target = new THREE.Vector3(0, 0, 0);
				this.object3d.lookAt(target);
			} else {
				this.direction = target.object3d.position.clone().sub(this.object3d.position);
				//this.direction.normalize();
				this.object3d.lookAt(target);

			}

		}
	}
  this.object3d.translateZ(this.speed);
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
	// let user = this.look_for_actor("user");
	// if(user != null){
	// 	if(user.inNimbusOf(this)){
	// 		this.state = penguin_states.FLEE;
	// 		return;
	// 	}
	// }
	// nearest pheromone that is not mine
	// let others_pheromone = this.look_for_actor("Pheromone", "nearest", actor_info => actor_info.parent !== this.pheromones);
  let others_pheromone = null;
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

Boids.prototype.eat_stm_update = function(t){

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

Boids.prototype.flee_stm_update = function(dt){
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
    this.direction = direction.clone().sub(this.object3d.position);
		// this.direction.normalize();
		this.object3d.translateZ(this.speed);
	}
}
