// ======================================================================================================================
// Implémentation de la classe qui permet un contrôle interactif de la caméra virtuelle
// ======================================================================================================================

var ControleurCamera = function(object){
	this.object    = object ; 

	this.position  = new THREE.Vector3(1,1.7,5) ; 

	this.angle     = 0.0 ; 
	this.direction = new THREE.Vector3(1,0,0) ; 
	this.cible     = new THREE.Vector3(2,1.7,5) ; 

	this.vitesse   = 2.0 ; 

	this.vitesseAngulaireMax = 0.05 ;
	this.tauxRotation      = 0.0  ;
	 

	this.plusHaut  = false ; 
	this.plusBas   = false ; 
	this.enAvant   = false ; 
	this.enArriere = false ; 
	this.aGauche   = false ; 
	this.aDroite   = false ; 
}


ControleurCamera.prototype.update = function(dt){

	if(this.plusHaut)
		this.position.y += this.vitesse * dt ; 

	if(this.plusBas)
		this.position.y -= this.vitesse * dt ; 

	if(this.aGauche)
		this.angle += 0.05; //this.vitesseAngulaireMax * this.tauxRotation ; 


	if(this.aDroite)
		this.angle -= 0.05 ; //this.vitesseAngulaireMax * this.tauxRotation ; 

	if(this.enAvant){
		this.position.x +=  this.vitesse * dt * Math.cos(this.angle) ; 
		this.position.z += -this.vitesse * dt * Math.sin(this.angle) ;  
	}

	if(this.enArriere){
		this.position.x -=  this.vitesse * dt * Math.cos(this.angle) ; 
		this.position.z -= -this.vitesse * dt * Math.sin(this.angle) ;  
	}
	
	this.object.position.copy(this.position) ; 

	this.direction.set(Math.cos(this.angle),0.0,-Math.sin(this.angle)) ; 
	

	if(mouseClicked) {
		this.object.position.set(ext.x,ext.y,ext.z);
		this.position.set(ext.x,ext.y,ext.z);
		this.cible.set(origin.x,origin.y,origin.z);
		this.direction.set(origin.x-ext.x,origin.y-ext.y,origin.z-ext.z) ; 
		this.angle = -Math.atan2(this.direction.z,this.direction.x);

		mouseClicked = false ; 

	} else {
		this.cible.set(this.position.x + Math.cos(this.angle), 
						this.position.y, 
						this.position.z - Math.sin(this.angle))	
		 
	} ;

	this.object.lookAt(this.cible) ; 

	
}


ControleurCamera.prototype.keyUp = function(event){
	switch(event.keyCode){
		case 33 : // HAUT
			this.plusHaut = false ; 
			break ; 
		case 34 : // BAS
			this.plusBas = false ;
			break ; 
		case 37 : // GAUCHE
			this.aGauche = false ; 
			break ; 
		case 38 : // HAUT
			this.enAvant = false ;
			break ; 
		case 39 : // DROITE
			this.aDroite = false ;
			break ; 
		case 40 : // BAS
			this.enArriere = false ;
			break ; 
	}
}



ControleurCamera.prototype.keyDown = function(event){
	//mouseClicked=false;
	console.log("KEYDOWN") ; 
	switch(event.keyCode){
		case 33 : // HAUT
			this.plusHaut = true ; 
			break ; 
		case 34 : // BAS
			this.plusBas = true ;
			break ; 
		case 37 : // GAUCHE
			this.aGauche = true ; 
			break ; 
		case 38 : // HAUT
			this.enAvant = true ;
			break ; 
		case 39 : // DROITE
			this.aDroite = true ;
			break ; 
		case 40 : // BAS
			this.enArriere = true ;
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

  if(mdx >  1 && mx > 0) {this.aDroite = true ;  this.aGauche = false} else
  if(mdx < -1 && mx < 0){this.aDroite = false ; this.aGauche = true} else
  {this.aDroite = false ; this.aGauche = false};
  */
  /*
  if(event.movementX > 5){
    controls.aDroite = true ;
    controls.aGauche = false ;
  } else if(event.movementX < -5){
    controls.aDroite = false ;
    controls.aGauche = true ;
  } 
  */
   
}

ControleurCamera.prototype.mouseDown = function(event){
	event.preventDefault() ; 
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

