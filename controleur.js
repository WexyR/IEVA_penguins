// ======================================================================================================================
// Implémentation de la classe qui permet un contrôle interactif de la caméra virtuelle
// ======================================================================================================================

var ControleurCamera = function(object){
	this.object    = object ;

	this.position  = new THREE.Vector3(1,1.7,5) ;

	this.angle     = 0.0 ;
	this.direction = new THREE.Vector3(1,0,0) ;
	this.target     = new THREE.Vector3(2,1.7,5) ;

	this.speed   = 2.0 ;

	this.maxAngularSpeed = 0.05 ;
	this.rotationRatio      = 0.0  ;


	this.toTop  = false ;
	this.toBottom   = false ;
	this.toFront   = false ;
	this.toBack = false ;
	this.toLeft   = false ;
	this.toRight   = false ;
}


ControleurCamera.prototype.update = function(dt){

	if(this.toTop)
		this.position.y += this.speed * dt ;

	if(this.toBottom)
		this.position.y -= this.speed * dt ;

	if(this.toLeft)
		this.angle += 0.05; //this.maxAngularSpeed * this.rotationRatio ;


	if(this.toRight)
		this.angle -= 0.05 ; //this.maxAngularSpeed * this.rotationRatio ;

	if(this.toFront){
		this.position.x +=  this.speed * dt * Math.cos(this.angle) ;
		this.position.z += -this.speed * dt * Math.sin(this.angle) ;
	}

	if(this.toBack){
		this.position.x -=  this.speed * dt * Math.cos(this.angle) ;
		this.position.z -= -this.speed * dt * Math.sin(this.angle) ;
	}

	this.object.position.copy(this.position) ;

	this.direction.set(Math.cos(this.angle),0.0,-Math.sin(this.angle)) ;


	if(mouseClicked) {
		this.object.position.set(ext.x,ext.y,ext.z);
		this.position.set(ext.x,ext.y,ext.z);
		this.target.set(origin.x,origin.y,origin.z);
		this.direction.set(origin.x-ext.x,origin.y-ext.y,origin.z-ext.z) ;
		this.angle = -Math.atan2(this.direction.z,this.direction.x);

		mouseClicked = false ;

	} else {
		this.target.set(this.position.x + Math.cos(this.angle),
						this.position.y,
						this.position.z - Math.sin(this.angle))

	} ;

	this.object.lookAt(this.target) ;


}


ControleurCamera.prototype.keyUp = function(event){
	switch(event.keyCode){
		case 33 : // HAUT
			this.toTop = false ;
			break ;
		case 34 : // BAS
			this.toBottom = false ;
			break ;
		case 37 : // GAUCHE
			this.toLeft = false ;
			break ;
		case 38 : // HAUT
			this.toFront = false ;
			break ;
		case 39 : // DROITE
			this.toRight = false ;
			break ;
		case 40 : // BAS
			this.toBack = false ;
			break ;
	}
}



ControleurCamera.prototype.keyDown = function(event){
	//mouseClicked=false;
	console.log("KEYDOWN") ;
	switch(event.keyCode){
		case 33 : // HAUT
			this.toTop = true ;
			break ;
		case 34 : // BAS
			this.toBottom = true ;
			break ;
		case 37 : // GAUCHE
			this.toLeft = true ;
			break ;
		case 38 : // HAUT
			this.toFront = true ;
			break ;
		case 39 : // DROITE
			this.toRight = true ;
			break ;
		case 40 : // BAS
			this.toBack = true ;
			break ;
	}
}

var mouse     = new THREE.Vector2() ;
var raycaster = new THREE.Raycaster() ;
var mouseClicked = false ;
var world = null ;
var origin = new THREE.Vector3() ;
var ext = new THREE.Vector3() ;



var mx, my, mdx, mdy ;

ControleurCamera.prototype.mouseMove = function(event){
  /*
  event.preventDefault() ;
  mx  = (event.clientX/window.innerWidth)*2-1 ;
  my  = (-event.clientY/window.innerHeight)*2+1 ;
  mdx = event.movementX ;
  mdy = event.movementY ;

  if(mdx >  1 && mx > 0) {this.toRight = true ;  this.toLeft = false} else
  if(mdx < -1 && mx < 0){this.toRight = false ; this.toLeft = true} else
  {this.toRight = false ; this.toLeft = false};
  */
  /*
  if(event.movementX > 5){
    controls.toRight = true ;
    controls.toLeft = false ;
  } else if(event.movementX < -5){
    controls.toRight = false ;
    controls.toLeft = true ;
  }
  */

}

ControleurCamera.prototype.mouseDown = function(event){
	event.preventDefault() ;
	return;
	mouse.x = (event.clientX/window.innerWidth)*2-1 ;
	mouse.y = (-event.clientY/window.innerHeight)*2+1 ;
	raycaster.setFromCamera(mouse,camera) ;
	var intersects = raycaster.intersectObjects(scene.children,true) ;
	if(intersects.length>0){
		pointeur.position.set(intersects[0].point.x,intersects[0].point.y,+intersects[0].point.z) ;
		mouseClicked = true ;
		world  = intersects[0].object.matrixWorld;
		origin = new THREE.Vector3(0,0,0) ;
		ext    = new THREE.Vector3(0,0,2) ;
		origin.applyMatrix4(world) ;
		ext.applyMatrix4(world) ;

	}
}
