var camera, scene, renderer;

var geometry, mesh;

//The material the wires are made of
var wire_material;
//The material the elliptical cylinders are made of
var ellipse1_material, ellipse2_material, ellipse3_material, ellipse4_material;
//The material the circular cylinders are made of
var circular1_material, circular2_material, circular3_material, circular4_material;
//The material the cube are made of
var cube1_material, cube2_material, cube3_material, cube4_material;

//Group used to save the all the objects affected by the primary axis rotation
var primary_segment = new THREE.Object3D();		
//Group used to save the all the objects affected by the secondary axis rotation
var secondary_segment = new THREE.Object3D();		
//Group used to save the all the objects affected by the tertiary axis rotation
var tertiary_segment = new THREE.Object3D();									

//Variable used to determine which camera is active
var which_camera = 1, changed_camera = true;

//Variables used to determine if the primary axis of the mobile is rotating and its direction
var primary_rotation_clock = false, primary_rotation_counterclock = false;
//Variables used to determine if the secondary axis of the mobile is rotating and its direction
var secondary_rotation_clock = false, secondary_rotation_counterclock = false;
//Variables used to determine if the tertiary axis of the mobile is rotating and its direction
var tertiary_rotation_clock = false, tertiary_rotation_counterclock = false;

//Flags used to change the position of the mobile
var move_left = false, move_up = false, move_right = false, move_down = false;	

//Constants used in the solids construction
const THICKNESS = 0.2;							//The thickness of the objects in the mobile
const WIRE_THICKNESS = 0.02;					//The thickness of the wires in the mobile
const WIRE_VERTICAL = 2.5;						//The height of the vertical wires
const WIRE_HORIZONTAL = 18;						//The height of the horizontal wires
 
//Array with the size of each solid from flat eliptical cylinders to flat cubes
var solids_sizes = [1, 1.125, 1.25, 1.375, 1.35, 1.6, 1.6, 1.35, 2, 1.7, 1.4, 1.1]; 

//Array with the size of each solid from flat eliptical cylinders to flat cubes
var solids_colors = [0x0e6b0e, 0x149414, 0x2EB62C, 0x57C84D, 0x2AF598, 0x1BD7BB, 0x14C9CB, 0x08B3E5, 0x7AD7F0, 0x92DFF3, 0xB7E9F7, 0xDBF3FA]; 

//Array with the materials of the solids
var solids_materials = [];

//Array with the x position of the vertical wires that will have rotation
var rotation_wires_posX = [];

//====Function used to create the wires of the mobile====
function createWire(x, y, z, size, angle, n){

	geometry = new THREE.CylinderGeometry(WIRE_THICKNESS, WIRE_THICKNESS, size,32);

	mesh = new THREE.Mesh( geometry, wire_material );

	mesh.position.set(x, y, z);

	//Rotating the cylinder for its axis to be x axis instead of the y axis
	mesh.rotation.z += angle;

	if(n<3)
		primary_segment.add(mesh);
	else if(n>=3 && n<7)
		secondary_segment.add(mesh);
	else 
		tertiary_segment.add(mesh);
}

//====Function used to create a flat elliptical cylinder====
function createFlatEllipticalCylinder(x, y, size, material) {
    'use strict'

	var path = new THREE.Shape();
	path.absellipse(x,y,size/1.75,size,0, Math.PI*2, false,0);
	var extrudeSettings = {
		steps: 1,
		depth: 0,
		bevelEnabled: true,
		bevelThickness: THICKNESS/2,
		bevelSize: 0,
		bevelOffset: 0,
		bevelSegments: 1
	};
	geometry = new THREE.ExtrudeGeometry( path, extrudeSettings );

	mesh = new THREE.Mesh( geometry, material );

	primary_segment.add(mesh);
}

//====Function used to create a flat circular cylinder====
function createFlatCircularCylinder(x, y, z, size, material) {
    'use strict'

	geometry = new THREE.CylinderGeometry(size, size, THICKNESS,32);

	mesh = new THREE.Mesh(geometry, material);

	mesh.position.set(x, y, z);

	//Rotating the cylinder for its axis to be z axis instead of the y axis
	mesh.rotation.x += Math.PI/2;												
    
	secondary_segment.add(mesh);
}

//====Function used to create a flat cube====
function createFlatCube(x, y, z, size, material) {
    'use strict'
	
	geometry = new THREE.CubeGeometry(size, size, THICKNESS);

	mesh = new THREE.Mesh(geometry, material);
	
	mesh.position.set(x, y, z);

	mesh.rotation.z += Math.PI/4;
	
	tertiary_segment.add(mesh);
}

function createSegment(x_middle_pos, height_pos, n){
	if(n==3 || n==7){
		x_middle_pos += rotation_wires_posX[rotation_wires_posX.length-1];
		rotation_wires_posX.push(x_middle_pos);
		x_middle_pos -= rotation_wires_posX[rotation_wires_posX.length-1];
	}
		
	createWire(x_middle_pos, height_pos+WIRE_VERTICAL/2, 0, WIRE_VERTICAL, 0, n);
	createWire(x_middle_pos-0.7*WIRE_HORIZONTAL/2, height_pos, 0, WIRE_HORIZONTAL, Math.PI/2, n);
	createWire(x_middle_pos-1.7*WIRE_HORIZONTAL/2, height_pos-WIRE_VERTICAL/2, 0, WIRE_VERTICAL, 0, n);
}

//====Function used to create all the wires====
function createAll(){
	var height_pos = 0;
	var x_middle_pos = 0;
	var n = 0;

	wire_material = new THREE.MeshBasicMaterial( {color:0xDCDCDC, wireframe:true} );

	ellipse1_material = new THREE.MeshBasicMaterial( {color:solids_colors[0], wireframe:true} );
	solids_materials.push(ellipse1_material);
	ellipse2_material = new THREE.MeshBasicMaterial( {color:solids_colors[1], wireframe:true} );
	solids_materials.push(ellipse2_material);
	ellipse3_material = new THREE.MeshBasicMaterial( {color:solids_colors[2], wireframe:true} );
	solids_materials.push(ellipse3_material);
	ellipse4_material = new THREE.MeshBasicMaterial( {color:solids_colors[3], wireframe:true} );
	solids_materials.push(ellipse4_material);

	circular1_material = new THREE.MeshBasicMaterial( {color:solids_colors[4], wireframe:true} );
	solids_materials.push(circular1_material);
	circular2_material = new THREE.MeshBasicMaterial( {color:solids_colors[5], wireframe:true} );
	solids_materials.push(circular2_material);
	circular3_material = new THREE.MeshBasicMaterial( {color:solids_colors[6], wireframe:true} );
	solids_materials.push(circular3_material);
	circular4_material = new THREE.MeshBasicMaterial( {color:solids_colors[7], wireframe:true} );
	solids_materials.push(circular4_material);

	cube1_material = new THREE.MeshBasicMaterial( {color:solids_colors[8], wireframe:true} );
	solids_materials.push(cube1_material);
	cube2_material = new THREE.MeshBasicMaterial( {color:solids_colors[9], wireframe:true} );
	solids_materials.push(cube2_material);
	cube3_material = new THREE.MeshBasicMaterial( {color:solids_colors[10], wireframe:true} );
	solids_materials.push(cube3_material);
	cube4_material = new THREE.MeshBasicMaterial( {color:solids_colors[11], wireframe:true} );
	solids_materials.push(cube4_material);

	//First 3 wires (2 vertical 1 horizontal) for the first solid
	createWire(0, 16.5, 0, WIRE_VERTICAL, 0, n);
	createWire(-0.7*WIRE_HORIZONTAL/2, 16.5-WIRE_VERTICAL/2, 0, WIRE_HORIZONTAL, Math.PI/2, n);
	createWire(-1.7*WIRE_HORIZONTAL/2, 16.5-WIRE_VERTICAL, 0, WIRE_VERTICAL, 0, n);
	x_middle_pos = 0.3*WIRE_HORIZONTAL/2;
	height_pos = 16.5-(3/2)*WIRE_VERTICAL;
	
	rotation_wires_posX.push(0);
	var translated = rotation_wires_posX[rotation_wires_posX.length-1];

	//While used to create all the other segments of the mobile being each segment 3 wires and the solid
	while(n<10){

		createSegment(x_middle_pos-translated,height_pos,n);
		
		if(n <= 3)
			createFlatEllipticalCylinder(x_middle_pos-WIRE_HORIZONTAL-translated, height_pos - solids_sizes[n]/2, solids_sizes[n], solids_materials[n]);

		else if(n > 3 && n <= 7)
			createFlatCircularCylinder(x_middle_pos-WIRE_HORIZONTAL-translated, height_pos - solids_sizes[n]/2, 0, solids_sizes[n], solids_materials[n]);
		
		else
			createFlatCube(x_middle_pos-WIRE_HORIZONTAL-translated, height_pos - solids_sizes[n]/2, 0, solids_sizes[n], solids_materials[n]); 
		
		translated = rotation_wires_posX[rotation_wires_posX.length-1];
		x_middle_pos = x_middle_pos + 0.3*WIRE_HORIZONTAL/2;
		height_pos = height_pos-WIRE_VERTICAL;	
		n++;
	}
	
	createFlatCube(x_middle_pos-WIRE_HORIZONTAL-translated, height_pos - solids_sizes[n]/2, 0, solids_sizes[n], solids_materials[n]);
	n++;

	createWire(x_middle_pos-translated,height_pos+WIRE_VERTICAL/2,0,WIRE_VERTICAL,0,n);
	createFlatCube(x_middle_pos-translated, height_pos - solids_sizes[n]/2, 0, solids_sizes[n], solids_materials[n]);

	primary_segment.add(secondary_segment);
	primary_segment.add(tertiary_segment);

	secondary_segment.position.x = rotation_wires_posX[1];
	secondary_segment.add(tertiary_segment);

	tertiary_segment.position.x = rotation_wires_posX[2]-rotation_wires_posX[1];

	scene.add(primary_segment);
}

//====Function used to create the camera====
function createCamera() {
	'use strict';
	
	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 100);
	camera.position.x = 0;
	camera.position.y = 0;
	camera.position.z = 52.5;
	camera.lookAt(scene.position);
}

//====Function used to create the scene====
function createScene() {
	'use strict';
	
	scene = new THREE.Scene();
	
	//scene.add(new THREE.AxisHelper(10));

	createAll();
}

//====Function used to render the scene====
function render() {
	'use strict';

	renderer.render(scene, camera);
}

//====Function used to resize the window====
function onResize() {
	'use strict';
	
	renderer.setSize(window.innerWidth, window.innerHeight);
	
	if (window.innerHeight > 0 && window.innerWidth > 0) {
		camera.aspect = renderer.getSize().width / renderer.getSize().height;
		camera.updateProjectionMatrix();
	}
}

//====Function used to handle the event of a key being pressed====
function onKeyDown(e) {
	'use strict';
	
	switch (e.keyCode) {
		case 49: //1 (Activating camera in the z axis (view from the front))
			if(which_camera != 1)
				changed_camera = true;
			which_camera = 1;
			break;
			
		case 50: //2 (Activating camera in the y axis (view from above))
			if(which_camera != 2)
				changed_camera = true;
			which_camera = 2;
			break;

		case 51: //3 (Activating camera in the x axis (view from the right lateral))
			if(which_camera != 3)
				changed_camera = true;
			which_camera = 3;
			break;	

		case 52: //4 (Switch between wireframe and solid)	
			wire_material.wireframe = !wire_material.wireframe;
			solids_materials.forEach(function (material){
				material.wireframe = !material.wireframe;
			});
			break;

		case 81: //q
		case 113: //Q
			//Activate the rotation of the primary branch clockwise
			primary_rotation_clock = true;
			break;

		case 87: //w
		case 119: //W
			//Activate the rotation of the primary branch counterclockwise
			primary_rotation_counterclock = true;
			break;
		
		case 65: //a
		case 97: //A
			//Activate the rotation of the secondary branch clockwise
			secondary_rotation_clock = true;
			break;

		case 68: //d
		case 100: //D
			//Activate the rotation of the secondary branch counterclockwise
			secondary_rotation_counterclock = true;
			break;

		case 90: //z
		case 122: //Z
			//Activate the rotation of the tertiary branch clockwise
			tertiary_rotation_clock = true;
			break;

		case 67: //c
		case 99: //C
			//Activate the rotation of the tertiary branch counterclockwise
			tertiary_rotation_counterclock = true;
			break;

		case 37: //(left arrow)
			move_left = true;
			break;
			
		case 38: //(up arrow)
			move_up = true;
			break;

		case 39: //(right arrow)
			move_right = true;
			break;

		case 40: //(down arrow)
			move_down = true;
			break;
	}
}

//====Function used to handle the event of a key being released====
function onKeyUp(e) {
	'use strict';
	
	switch (e.keyCode) {

		case 81: //q
		case 113: //Q
			//Deactivates the clockwise rotation of the primary branch 
			primary_rotation_clock = false;
			break;

		case 87: //w
		case 119: //W
			//Deactivates the counterclockwise rotation of the primary branch 
			primary_rotation_counterclock = false;
			break;
		
		case 65: //a
		case 97: //A
			//Deactivates the rotation of the secondary branch clockwise
			secondary_rotation_clock = false;
			break;

		case 68: //d
		case 100: //D
			//Deactivates the rotation of the secondary branch counterclockwise
			secondary_rotation_counterclock = false;
			break;


		case 90: //z
		case 122: //Z
			//Deactivates the rotation of the tertiary branch clockwise
			tertiary_rotation_clock = false;
			break;

		case 67: //c
		case 99: //C
			//Deactivates the rotation of the tertiary branch counterclockwise
			tertiary_rotation_counterclock = false;
			break;

		case 37: //(left arrow)
			move_left = false;
			break;
			
		case 38: //(up arrow)
			move_up = false;
			break;

		case 39: //(right arrow)
			move_right = false;
			break;

		case 40: //(down arrow)
			move_down = false;
			break;
	}
}

//====Function used to animate the scene====
function animate() {
	'use strict';

	//Switch used to select which camera will be used (default is the camera in the z axis (view from the front))
	switch(which_camera){
		case 1:
			//Camera in the z axis (view from the front)
			camera.position.x = 0;
			camera.position.y = 0;
			camera.position.z = 52.5;
			if(changed_camera){
				camera.lookAt(scene.position);
				changed_camera = false;
			}
			break;
		
		case 2:
			//Camera in the y axis (view from above)
			camera.position.x = 0;
			camera.position.y = 52.5;
			camera.position.z = 0;
			if(changed_camera){
				camera.lookAt(scene.position);
				changed_camera = false;
			}
			break;

		case 3:
			//Camera in the x axis (view from the right lateral)
			camera.position.x = 52.5;
			camera.position.y = 0;
			camera.position.z = 0;
			if(changed_camera){
				camera.lookAt(scene.position);
				changed_camera = false;
			}
			break;
	}

	//Moving the mobile to the left
	if(move_left) 
		scene.position.x -= 0.1;
	
	//Moving the mobile further from the user
	if(move_up) 
		scene.position.z -= 0.1;

	//Moving the mobile to the right
	if(move_right) 
		scene.position.x += 0.1;

	//Moving the mobile closer to the user
	if(move_down) 
		scene.position.z += 0.1;

	//Primary axis of the mobile rotating clockwise
	if(primary_rotation_clock) {
		primary_segment.rotateY(-0.005);
	}

	//Primary axis of the mobile rotating counterclockwise
	if(primary_rotation_counterclock) {
		primary_segment.rotateY(0.005);
	}

	//Secondary axis of the mobile rotating clockwise
	if(secondary_rotation_clock) {
		secondary_segment.rotateY(-0.005);
	}

	//Secondary axis of the mobile rotating counterclockwise
	if(secondary_rotation_counterclock) {
		secondary_segment.rotateY(0.005);
	}

	//Tertiary axis of the mobile rotating clockwise
	if(tertiary_rotation_clock) {
		tertiary_segment.rotateY(-0.005);
	}

	//Tertiary axis of the mobile rotating counterclockwise
	if(tertiary_rotation_counterclock) {
		tertiary_segment.rotateY(0.005);
	}
	
	render();
	
	requestAnimationFrame(animate);
}

//====Function used to initialize the core elements====
function init() {
	'use strict';
	
	renderer = new THREE.WebGLRenderer( {antialias: true } );
	
	renderer.setSize(window.innerWidth, window.innerHeight);
	
	document.body.appendChild(renderer.domElement);
	
	createScene();
	createCamera();
	
	render();
	
	window.addEventListener("resize", onResize);
	window.addEventListener("keydown", onKeyDown);
	window.addEventListener("keyup", onKeyUp);
}