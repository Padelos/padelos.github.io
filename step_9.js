var gl; 
var canvas; 
var shadersProgram; 
var vertexPositionAttributePointer; 
//var vertexColorAttributePointer;

var verticesTransformUniformPointer;

var modelUniformPointer; 
var perspectiveViewUniformPointer;

var textureCoordinatesAttributePointer;
var uSamplerPointer;

var textureBuffer;
var faceTextureBuffer;

var vertexBuffer;

var angleView = 90; // degrees
var viewDistance = 7;

var requestID = 0;

var rotateAngle = 0.0;
var offsetAngle = 45.0;
var totalZ = 0.0;

var faceTexture;
var skinTexture;
var skyTexture;
var floorTexture;

var boundingRect;
var mouseDown = false;
var aMouseX;
var aMouseY;
var bMouseX;
var bMouseY;
var dX = 0;
var dY = 0;
var totalDX = 0;
var totalDY = 0;


function createRenderingContext(inCanvas) {
	var outContext = null;
	outContext = inCanvas.getContext("webgl");  
	if (!outContext)
		outContext = inCanvas.getContext("experimental-webgl"); 
	if (!outContext) 
			alert("WebGL rendering context creation error.");
	return outContext;
}
     
function createCompileShader(shaderType, shaderSource) {
	var outShader = gl.createShader(shaderType);  
	gl.shaderSource(outShader, shaderSource); 
	gl.compileShader(outShader); 
	if (!gl.getShaderParameter(outShader, gl.COMPILE_STATUS)) { 
		alert( "Shader compilation error. " + gl.getShaderInfoLog(outShader) );
		gl.deleteShader(outShader);
		outShader = null;
	}
	return outShader;
}  

function initShaders() {
	var vertexShaderSource = document.getElementById("vShader").textContent; 
	
	var fragmentShaderSource = document.getElementById("fShader").textContent; 
	
	var vertexShader = createCompileShader(gl.VERTEX_SHADER, vertexShaderSource); 
	
	var fragmentShader = createCompileShader(gl.FRAGMENT_SHADER, fragmentShaderSource); 
	
	shadersProgram = gl.createProgram(); 
	
	gl.attachShader(shadersProgram, vertexShader); 		
	gl.attachShader(shadersProgram, fragmentShader); 	
	gl.linkProgram(shadersProgram); 					
	if (!gl.getProgramParameter(shadersProgram, gl.LINK_STATUS)) {
		alert("Shaders linking error.");
	}
	gl.useProgram(shadersProgram); 
	vertexPositionAttributePointer = gl.getAttribLocation(shadersProgram, "aVertexPosition"); 
	gl.enableVertexAttribArray(vertexPositionAttributePointer); 
	//vertexColorAttributePointer = gl.getAttribLocation(shadersProgram, "aVertexColor"); 
	//gl.enableVertexAttribArray(vertexColorAttributePointer);
	verticesTransformUniformPointer = gl.getUniformLocation(shadersProgram, "uRotationMatrixX");
	
	modelUniformPointer = gl.getUniformLocation(shadersProgram, "uModelTransform"); 
	perspectiveViewUniformPointer = gl.getUniformLocation(shadersProgram, "uPerspectiveViewTransform"); 
	
	textureCoordinatesAttributePointer = gl.getAttribLocation(shadersProgram, "aTextureCoordinates");
	gl.enableVertexAttribArray(textureCoordinatesAttributePointer);
	
	uSamplerPointer = gl.getUniformLocation(shadersProgram, "uSampler");
	
}

function initBuffers() {
	
	var triangleVertices = new Float32Array([
							// Front
							 1.0,  1.0,  1.0, 1.0,	// v0
							-1.0,  1.0,  1.0, 1.0,	// v1
							-1.0, -1.0,  1.0, 1.0,	// v2
							
							 1.0,  1.0,  1.0, 1.0,	// v0
 							-1.0, -1.0,  1.0, 1.0,	// v2
  							 1.0, -1.0,  1.0, 1.0,	// v3
							 
							// Right
							 1.0,  1.0,  1.0, 1.0,	// v0
  							 1.0, -1.0,  1.0, 1.0,	// v3
							 1.0, -1.0, -1.0, 1.0,	// v4
							
							 1.0,  1.0,  1.0, 1.0,	// v0
							 1.0, -1.0, -1.0, 1.0,	// v4
							 1.0,  1.0, -1.0, 1.0,	// v5
							
							// Left
							-1.0,  1.0,  1.0, 1.0,	// v1
							-1.0, -1.0, -1.0, 1.0,	// v7
							-1.0, -1.0,  1.0, 1.0,	// v2
							
							-1.0,  1.0,  1.0, 1.0,	// v1
							-1.0,  1.0, -1.0, 1.0,	// v6
							-1.0, -1.0, -1.0, 1.0,	// v7
							
							// Back
							 1.0,  1.0, -1.0, 1.0,	// v5
							 1.0, -1.0, -1.0, 1.0,	// v4
							-1.0, -1.0, -1.0, 1.0,	// v7
							
							
							 -1.0,  1.0, -1.0, 1.0,	// v6
							 1.0,  1.0, -1.0, 1.0,	// v5
							-1.0, -1.0, -1.0, 1.0,	// v7
							
							// Up
							 1.0,  1.0,  1.0, 1.0,	// v0
							-1.0,  1.0, -1.0, 1.0,	// v6
							-1.0,  1.0,  1.0, 1.0,	// v1
							
							 1.0,  1.0,  1.0, 1.0,	// v0
							 1.0,  1.0, -1.0, 1.0,	// v5
							-1.0,  1.0, -1.0, 1.0,	// v6
							
							// Down
							 1.0, -1.0, -1.0, 1.0,	// v4
  							 1.0, -1.0,  1.0, 1.0,	// v3
 							-1.0, -1.0,  1.0, 1.0,	// v2
							 
							 1.0, -1.0, -1.0, 1.0,	// v4
 							-1.0, -1.0,  1.0, 1.0,	// v2
							-1.0, -1.0, -1.0, 1.0	// v7
						]);
	vertexBuffer = gl.createBuffer(); 
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer); 
	gl.bufferData(gl.ARRAY_BUFFER, triangleVertices, gl.STATIC_DRAW); 
	vertexBuffer.itemSize = 4;  
	vertexBuffer.itemCount = 36; 
	
/*	ΕΤΟΙΜΟ.17. Αντί για τα χρώματα, δημιουργούμε έναν buffer για το texture, 
	τον ενεργοποιούμε, του ετοιμάζουμε δεδομένα σε έναν πίνακα,
	του τα "ταΐζουμε" και καθορίζουμε τις ιδιότητες του, όλα κατά τα γνωστά.
	
	Οι συντεταγμένες που δίνουμε μέσα στον πίνακα είναι τα σημεία της εικόνας texture 
	(σε μορφή συντεταγμένων από 0..1, τα λεγόμενα s,t όπου 0,0 το κάτω αριστερό άκρο της εικόνας και 1,1 το πάνω δεξιά)
	από τα οποία θέλουμε να πάρουν χρώμα οι αντίστοιχες κορυφές στον εκάστοτε buffer κορυφών.
	
	Παρατηρήστε την αντιστοίχιση με τις συντεταμένες των κορυφών του ΠΑΤΩΜΑΤΟΣ ώστε η εικόνα που θα δημιουργηθεί
	στο πάτωμα να "στέκει" σε σχέση με την εικόνα που χρησιμοποιούμε για texture (να μην παραμορφώνεται).

	Ο συμβιβασμός που έχουμε κάνει για τη χρήση κοινού buffer, με κοινό περιεχόμενο για τα 2 είδη αντικειμένων) είναι
	είναι ότι η εικόνα υφής θα παραμορφώνεται στο τετράεδρο, ωστόσο είναι σχετικά ομογενής και (εδώ) το παραβλέπουμε.
*/
	textureBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
	
	// skin
	var textureCoordinates=[
							// front //up
							0.0,0.0,
							1.0,0.0,
							1.0,1.0,
							
							0.0,0.0,
							1.0,1.0,
							0.0,1.0,
							
							// right // left
							0.0,0.0,
							1.0,0.0,
							1.0,1.0,
							
							0.0,0.0,
							1.0,1.0,
							0.0,1.0,
							
							// left // right
							0.0,0.0,
							1.0,1.0,
							1.0,0.0,
							
							0.0,0.0,
							0.0,1.0,
							1.0,1.0,
							
							// back // down
							1.0,1.0,
							0.0,1.0,
							0.0,0.0,
							
							1.0,0.0,
							1.0,1.0,
							0.0,0.0,
							
							// up // front
							0.0,0.0,
							1.0,1.0,
							1.0,0.0,
							
							0.0,0.0,
							0.0,1.0,
							1.0,1.0,
							
							// down // back
							0.0,0.0,
							1.0,0.0,
							1.0,1.0,
							
							0.0,0.0,
							1.0,1.0,
							0.0,1.0,];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),gl.STATIC_DRAW);  
	textureBuffer.itemSize = 2;
	
	faceTextureBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, faceTextureBuffer);
	
	// face
	var faceTextureCoordinates=[
							// front //up
							0.0,0.5,
							0.5,0.5,
							0.5,1.0,
							
							0.0,0.5,
							0.5,1.0,
							0.0,1.0,
							
							// right // left
							0.0,0.0,
							0.5,0.0,
							0.5,0.5,
							
							0.0,0.0,
							0.5,0.5,
							0.0,0.5,
							
							// left // right
							0.5,0.5,
							1.0,1.0,
							1.0,0.5,
							
							0.5,0.5,
							0.5,1.0,
							1.0,1.0,
							
							// back // down
							1.0,1.0,
							0.5,1.0,
							0.5,0.5,
							
							1.0,0.5,
							1.0,1.0,
							0.5,0.5,
							
							// up // front
							0.5,0.0,
							1.0,0.5,
							1.0,0.0,
							
							0.5,0.0,
							0.5,0.5,
							1.0,0.5,
							
							// down // back
							0.0,0.0,
							0.5,0.0,
							0.5,0.5,
							
							0.0,0.0,
							0.5,0.5,
							0.0,0.5,];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(faceTextureCoordinates),gl.STATIC_DRAW);  
	faceTextureBuffer.itemSize = 2;
	
//	ΕΤΟΙΜΟ.18. Δημιουργούμε ένα αντικείμενο texture για το τετράεδρο στην 
//	αντίστοιχη global μεταβλητή που δηλώσαμε	(ΕΤΟΙΜΟ.12)
	faceTexture = gl.createTexture();
//	ΕΤΟΙΜΟ.19. Υποδεικνύουμε την τοποθεσία της εικόνας (χωρίς path εννοείται στο ίδιο directory)
	var faceImageURL = "myFace.jpg";
//	ΕΤΟΙΜΟ.20. Καλούμε αυτήν την custom συνάρτηση που ενημερώνει το texture
//	αφού έχει φορτωθεί η εικόνα (δες μέσα στη συνάρτηση)
	preprocessTextureImage(faceImageURL, faceTexture);
	
//	ΕΤΟΙΜΟ.22. Ομοίως με τα ΕΤΟΙΜΟ.18 - ΕΤΟΙΜΟ.20 για το texture του πατώματος
	skinTexture = gl.createTexture();
	var skinImageURL = "mySkin.jpg";
	preprocessTextureImage(skinImageURL, skinTexture);
	
//	ΒΗΜΑ.2. Προσθέστε τις αντίστοιχες εντολές για το texture του skybox χρησιμοποιώντας την εικόνα sky.jpg
	skyTexture = gl.createTexture();
	var skyImageURL = "mySky.jpg";
	preprocessTextureImage(skyImageURL, skyTexture);
	
	floorTexture = gl.createTexture();
	var floorImageURL = "myFloor.jpg";
	preprocessTextureImage(floorImageURL, floorTexture);
}

//	ΕΤΟΙΜΟ.21. Custom συνάρτηση για σύνδεση αντικειμένου texture με εικόνα και προεπεξεργασία εικόνας
function preprocessTextureImage(imageURL, textureObject) {
// 	21.1. Δημιούργησε ένα νέο αντικείμενο εικόνα
	var imageObject = new Image();
	//	21.2. Όταν φορτώνεται θα τρέχει την παρακάτω (inline ανώνυμη) συνάρτηση
	imageObject.onload = function() {    
		// 21.2.1. ενεργοποιουμε ως τρέχον texture αυτό που δοθηκε σαν παραμετρος
		gl.bindTexture(gl.TEXTURE_2D, textureObject);
		// 21.2.2. αντιστρεφουμε το y γιατι στην εικονα μετραει απο πανω προσ τα κατω 
		// (αν εχει σημασια το πανω-κατω στην υφη μας)		
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		// 21.2.3. αντιγραφουμε την εικονα στο ενεργοποιημενο texture
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageObject);
		// 21.2.4. καθοριζουμε πώς θα γεννιουνται νεα pixels αν χρειαζονται
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		// 21.2.5. καθοριζουμε πώς θα συμπτυσσονται pixels αν χρειαζεται
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
		// 21.2.6. αν αντι για gl.LINEAR στην τελευταια εντολη εχουμε χρησιμοποιησει gl.LINEAR_MIPMAP_NEAREST
		// εννοείται ότι θα έχουμε εναλλακτικες εκδοχες του texture μικροτερης αναλυσης (mipmapping)
		// που θα έχουν δημιουργηθεί με την παρακάτω εντολή generateMipmap. 
		gl.generateMipmap(gl.TEXTURE_2D);
	};
	//	21.3 Φόρτωσε την εικόνα
	imageObject.src = imageURL;	
}
  
function drawScene() { 
	
	var pvMatrix = new Float32Array(16);
	glMatrix.mat4.identity(pvMatrix);
	
	var vMatrix = new Float32Array(16);
	
	var cameraView = [1,1,1];
	viewDistance = readFromTextBox("viewDistance");
	
	var radioChoise = document.getElementById("cameraViewForm").elements["step3"];
	
	for (var i = 0; i < radioChoise.length; i++) {
		if (radioChoise[i].checked) {
			cameraView = cameraCords(radioChoise[i].value);
			//console.log(cameraView);
			//console.log(radioChoise[i].value);
			break;
		}
	}
	
	//cameraView[0] *= viewDistance;
	//cameraView[1] *= viewDistance;
	cameraView[2] *= viewDistance;
	
	cameraView[0] = viewDistance*Math.cos((rotateAngle+offsetAngle+totalDX)*Math.PI/180.0);
	cameraView[1] = viewDistance*Math.sin((rotateAngle+offsetAngle+totalDX)*Math.PI/180.0);
	cameraView[2] += totalZ + totalDY/5;
	console.log("rotateAngle:",rotateAngle);
	console.log("offsetAngle:",offsetAngle);
	console.log("X:",cameraView[0]);
	console.log("Y:",cameraView[1]);
	
	glMatrix.mat4.lookAt(vMatrix,cameraView,[0,0,0],[0,0,1]);

	var pMatrix = new Float32Array(16);
	angleView = readFromTextBox("viewAngle");
	glMatrix.mat4.perspective(pMatrix, angleView*Math.PI/180.0, 1, 0.001, 20000);
	
	glMatrix.mat4.multiply(pvMatrix,pMatrix,vMatrix);

	
	
	gl.uniformMatrix4fv(perspectiveViewUniformPointer, false, pvMatrix);
	
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer); 
	gl.vertexAttribPointer(vertexPositionAttributePointer, vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
	//gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer); 
	//gl.vertexAttribPointer(vertexColorAttributePointer, colorBuffer.itemSize, gl.FLOAT, false, 0, 0);



	drawDog();
}
    
function main() {
	var minDimension = Math.min(window.innerHeight, window.innerWidth);
	canvas = document.getElementById("sceneCanvas");
	//canvas.width = 0.95*minDimension;
	//canvas.height = 0.95*minDimension;
	gl = createRenderingContext(canvas);
	initShaders();
	initBuffers();
	gl.clearColor(0.5, 0.5, 0.5, 1.0);
	
	gl.frontFace(gl.CCW);
	//gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.BACK);
	
	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
	gl.enable(gl.DEPTH_TEST);
	
	boundingRect = canvas.getBoundingClientRect();
	
	drawScene(); 
}

function readFromTextBox(id){
	txt = document.getElementById(id).value; 
	return parseFloat(txt);
}

function cameraCords(token){
	
	switch (token) {
		case "LFT":
			offsetAngle = 45.0;
			return [1, 1, 1];
		case "LFB":
			offsetAngle = 45.0;
			return [1, 1, -1];
		case "LBT":
			offsetAngle = 270.0 + 45.0;
			return [1, -1, 1];
		case "LBB":
			offsetAngle = 270.0 + 45.0;
			return [1, -1, -1];
		case "RFT":
			offsetAngle = 90.0 + 45.0;
			return [-1, 1, 1];
		case "RFB":
			offsetAngle = 90.0 + 45.0;
			return [-1, 1, -1];
		case "RBT":
			offsetAngle = 180.0 + 45.0;
			return [-1, -1, 1];
		case "RBB":
			offsetAngle = 180.0 + 45.0;
			return [-1, -1, -1];
		default:
			offsetAngle = 45.0;
			return [1,1,1];
	}
}

function drawDog(){
	var translationMatrix = new Float32Array(16);
	var scaleMatrix = new Float32Array(16);
	var finalM = new Float32Array(16);
	
	//feet

	glMatrix.mat4.fromScaling(scaleMatrix,[3/2, 5/2, 2/2]);
	
	var x = 4.5; // 6/2 + 3/2
	var y = 5.5; // 6/2 + 5/2
	var z = 1; // 0 + 2/2
	
	//gl.bindBuffer(gl.ARRAY_BUFFER, redColorBuffer);
	//gl.vertexAttribPointer(vertexColorAttributePointer, redColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	// 	ΕΤΟΙΜΟ.24 ΕΝΕΡΓΟΠΟΙΟΥΜΕ ΤΗΝ ΠΡΩΤΗ ΔΙΑΘΕΣΙΜΗ TEXTURE UNIT, ΔΗΛΑΔΗ ΤΗΝ gl.TEXTURE0 (ΜΗΔΕΝ)
	gl.activeTexture(gl.TEXTURE0);
	//	ΕΤΟΙΜΟ.25. ΚΑΙ ΤΗ ΣΥΝΔΕΟΥΜΕ ΜΕ ΤΟ TEXTURE ΠΟΥ ΘΕΛΟΥΜΕ ΕΝΕΡΓΟΠΟΙΩΝΤΑΣ ΤΟ ΚΙ ΑΥΤΟ
	gl.bindTexture(gl.TEXTURE_2D, skinTexture); 
	//  ΕΤΟΙΜΟ.26. ΕΝΗΜΕΡΩΝΟΥΜΕ ΤΟ UNIFORM ΓΙΑ ΤΟ ΠΟΙΑ TEXTURE UNIT ΕΙΝΑΙ ΕΝΕΡΓΟΠΟΙΗΜΕΝΗ, ΣΤΗΝ ΠΡΟΚΕΙΜΕΝΗ ΠΕΡΙΠΤΩΣΗ Η 0
	gl.uniform1i(uSamplerPointer, 0);

	//  ΕΤΟΙΜΟ.27. ΕΝΕΡΓΟΠΟΙΟΥΜΕ ΤΟΝ BUFFER TOY TEXTURE	
	gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
	//  ΕΤΟΙΜΟ.28. ΕΝΗΜΕΡΩΝΟΥΜΕ ΤΟ ΣΧΕΤΙΚΟ ATTRIBUTE
	gl.vertexAttribPointer(textureCoordinatesAttributePointer, textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
	// Τέλος 1ης ομάδας εργασιών τετράεδρου (τετράεδρων)
	
	glMatrix.mat4.fromTranslation(translationMatrix,[-x,-y,z]);
	glMatrix.mat4.multiply(finalM,translationMatrix,scaleMatrix);
	
	gl.uniformMatrix4fv(modelUniformPointer, false, finalM); 
	gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.itemCount);
	
	glMatrix.mat4.fromTranslation(translationMatrix,[x,y,z]);
	glMatrix.mat4.multiply(finalM,translationMatrix,scaleMatrix);
	
	gl.uniformMatrix4fv(modelUniformPointer, false, finalM); 
	gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.itemCount);
	
	glMatrix.mat4.fromTranslation(translationMatrix,[x,-y,z]);
	glMatrix.mat4.multiply(finalM,translationMatrix,scaleMatrix);
	
	gl.uniformMatrix4fv(modelUniformPointer, false, finalM); 
	gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.itemCount);
	
	glMatrix.mat4.fromTranslation(translationMatrix,[-x,y,z]);
	glMatrix.mat4.multiply(finalM,translationMatrix,scaleMatrix);
	
	gl.uniformMatrix4fv(modelUniformPointer, false, finalM); 
	gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.itemCount);
	
	
	// legs
	
	x = 4.5; // 6/2 + 3/2
	y = 4.5; // 6/2 + 3/2
	z = 5; // 2 + 6/2
	
	glMatrix.mat4.fromScaling(scaleMatrix,[3/2, 3/2, 6/2]);
	
	glMatrix.mat4.fromTranslation(translationMatrix,[x,y,z]);
	glMatrix.mat4.multiply(finalM,translationMatrix,scaleMatrix);
	
	gl.uniformMatrix4fv(modelUniformPointer, false, finalM); 
	gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.itemCount);
	
	glMatrix.mat4.fromTranslation(translationMatrix,[-x,y,z]);
	glMatrix.mat4.multiply(finalM,translationMatrix,scaleMatrix);
	
	gl.uniformMatrix4fv(modelUniformPointer, false, finalM); 
	gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.itemCount);
	
	x = 4.5; // 3 + 5 - 3/2
	y = 6.5;
	z = 5; // 2 + 6/2
	
	glMatrix.mat4.fromTranslation(translationMatrix,[x,-y,z]);
	glMatrix.mat4.multiply(finalM,translationMatrix,scaleMatrix);
	
	gl.uniformMatrix4fv(modelUniformPointer, false, finalM); 
	gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.itemCount);
	
	glMatrix.mat4.fromTranslation(translationMatrix,[-x,-y,z]);
	glMatrix.mat4.multiply(finalM,translationMatrix,scaleMatrix);
	
	gl.uniformMatrix4fv(modelUniformPointer, false, finalM); 
	gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.itemCount);
	
	
	// body
	
	x = 0;
	y = 1;
	z = 7.5; // 2 + 6 + 2 - 5/2
	
	//gl.bindBuffer(gl.ARRAY_BUFFER, yellowColorBuffer);
	//gl.vertexAttribPointer(vertexColorAttributePointer, yellowColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	glMatrix.mat4.fromScaling(scaleMatrix,[6/2, 14/2, 5/2]);
	
	glMatrix.mat4.fromTranslation(translationMatrix,[-x,-y,z]);
	glMatrix.mat4.multiply(finalM,translationMatrix,scaleMatrix);
	
	gl.uniformMatrix4fv(modelUniformPointer, false, finalM); 
	gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.itemCount);
	
	// tail
	
	
	x = 0;
	y = -7;
	z = 12.5;
	
	//gl.bindBuffer(gl.ARRAY_BUFFER, redColorBuffer);
	//gl.vertexAttribPointer(vertexColorAttributePointer, redColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	glMatrix.mat4.fromScaling(scaleMatrix,[2/2, 2/2, 5/2]);
	
	glMatrix.mat4.fromTranslation(translationMatrix,[x,y,z]);
	glMatrix.mat4.multiply(finalM,translationMatrix,scaleMatrix);
	
	gl.uniformMatrix4fv(modelUniformPointer, false, finalM); 
	gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.itemCount);
	
	// neck
	
	x = 0;
	y = 4;
	z = 11.5;
	
	//gl.bindBuffer(gl.ARRAY_BUFFER, yellowColorBuffer);
	//gl.vertexAttribPointer(vertexColorAttributePointer, yellowColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	glMatrix.mat4.fromScaling(scaleMatrix,[4/2, 4/2, 3/2]);
	
	glMatrix.mat4.fromTranslation(translationMatrix,[x,y,z]);
	glMatrix.mat4.multiply(finalM,translationMatrix,scaleMatrix);
	
	gl.uniformMatrix4fv(modelUniformPointer, false, finalM); 
	gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.itemCount);
	
	
	
	// head
	
	// 	ΕΤΟΙΜΟ.24 ΕΝΕΡΓΟΠΟΙΟΥΜΕ ΤΗΝ ΠΡΩΤΗ ΔΙΑΘΕΣΙΜΗ TEXTURE UNIT, ΔΗΛΑΔΗ ΤΗΝ gl.TEXTURE0 (ΜΗΔΕΝ)
	gl.activeTexture(gl.TEXTURE1);
	//	ΕΤΟΙΜΟ.25. ΚΑΙ ΤΗ ΣΥΝΔΕΟΥΜΕ ΜΕ ΤΟ TEXTURE ΠΟΥ ΘΕΛΟΥΜΕ ΕΝΕΡΓΟΠΟΙΩΝΤΑΣ ΤΟ ΚΙ ΑΥΤΟ
	gl.bindTexture(gl.TEXTURE_2D, faceTexture); 
	//  ΕΤΟΙΜΟ.26. ΕΝΗΜΕΡΩΝΟΥΜΕ ΤΟ UNIFORM ΓΙΑ ΤΟ ΠΟΙΑ TEXTURE UNIT ΕΙΝΑΙ ΕΝΕΡΓΟΠΟΙΗΜΕΝΗ, ΣΤΗΝ ΠΡΟΚΕΙΜΕΝΗ ΠΕΡΙΠΤΩΣΗ Η 0
	gl.uniform1i(uSamplerPointer, 1);

	//  ΕΤΟΙΜΟ.27. ΕΝΕΡΓΟΠΟΙΟΥΜΕ ΤΟΝ BUFFER TOY TEXTURE	
	gl.bindBuffer(gl.ARRAY_BUFFER, faceTextureBuffer);
	//  ΕΤΟΙΜΟ.28. ΕΝΗΜΕΡΩΝΟΥΜΕ ΤΟ ΣΧΕΤΙΚΟ ATTRIBUTE
	gl.vertexAttribPointer(textureCoordinatesAttributePointer, faceTextureBuffer.itemSize, gl.FLOAT, false, 0, 0);
	// Τέλος 1ης ομάδας εργασιών τετράεδρου (τετράεδρων)
	
	x = 0;
	y = 6; // 3+4
	z = 15;
	
	
	glMatrix.mat4.fromScaling(scaleMatrix,[6/2, 8/2, 4/2]);
	
	glMatrix.mat4.fromTranslation(translationMatrix,[x,y,z]);
	glMatrix.mat4.multiply(finalM,translationMatrix,scaleMatrix);
	
	gl.uniformMatrix4fv(modelUniformPointer, false, finalM); 
	gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.itemCount);
	
	
	
	// ear
	
	// 	ΕΤΟΙΜΟ.24 ΕΝΕΡΓΟΠΟΙΟΥΜΕ ΤΗΝ ΠΡΩΤΗ ΔΙΑΘΕΣΙΜΗ TEXTURE UNIT, ΔΗΛΑΔΗ ΤΗΝ gl.TEXTURE0 (ΜΗΔΕΝ)
	gl.activeTexture(gl.TEXTURE0);
	//	ΕΤΟΙΜΟ.25. ΚΑΙ ΤΗ ΣΥΝΔΕΟΥΜΕ ΜΕ ΤΟ TEXTURE ΠΟΥ ΘΕΛΟΥΜΕ ΕΝΕΡΓΟΠΟΙΩΝΤΑΣ ΤΟ ΚΙ ΑΥΤΟ
	gl.bindTexture(gl.TEXTURE_2D, skinTexture); 
	//  ΕΤΟΙΜΟ.26. ΕΝΗΜΕΡΩΝΟΥΜΕ ΤΟ UNIFORM ΓΙΑ ΤΟ ΠΟΙΑ TEXTURE UNIT ΕΙΝΑΙ ΕΝΕΡΓΟΠΟΙΗΜΕΝΗ, ΣΤΗΝ ΠΡΟΚΕΙΜΕΝΗ ΠΕΡΙΠΤΩΣΗ Η 0
	gl.uniform1i(uSamplerPointer, 0);

	//  ΕΤΟΙΜΟ.27. ΕΝΕΡΓΟΠΟΙΟΥΜΕ ΤΟΝ BUFFER TOY TEXTURE	
	gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
	//  ΕΤΟΙΜΟ.28. ΕΝΗΜΕΡΩΝΟΥΜΕ ΤΟ ΣΧΕΤΙΚΟ ATTRIBUTE
	gl.vertexAttribPointer(textureCoordinatesAttributePointer, textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
	// Τέλος 1ης ομάδας εργασιών τετράεδρου (τετράεδρων)
	
	x = 4;
	y = 3;
	z = 14.5;
	
	//gl.bindBuffer(gl.ARRAY_BUFFER, redColorBuffer);
	//gl.vertexAttribPointer(vertexColorAttributePointer, redColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	glMatrix.mat4.fromScaling(scaleMatrix,[2/2, 2/2, 5/2]);
	
	glMatrix.mat4.fromTranslation(translationMatrix,[x,y,z]);
	glMatrix.mat4.multiply(finalM,translationMatrix,scaleMatrix);
	
	gl.uniformMatrix4fv(modelUniformPointer, false, finalM); 
	gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.itemCount);
	
	glMatrix.mat4.fromTranslation(translationMatrix,[-x,y,z]);
	glMatrix.mat4.multiply(finalM,translationMatrix,scaleMatrix);
	
	gl.uniformMatrix4fv(modelUniformPointer, false, finalM); 
	gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.itemCount);
	
	
	// platform
	
	x = 0;
	y = 0;
	z = -0.1;
	
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, floorTexture);
	gl.uniform1i(uSamplerPointer, 1);
	gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
	gl.vertexAttribPointer(textureCoordinatesAttributePointer, textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	glMatrix.mat4.fromScaling(scaleMatrix,[30/2, 30/2, 0.1]);
	
	glMatrix.mat4.fromTranslation(translationMatrix,[x,y,z]);
	glMatrix.mat4.multiply(finalM,translationMatrix,scaleMatrix);
	
	gl.uniformMatrix4fv(modelUniformPointer, false, finalM); 
	gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.itemCount);
	
	
	// sky box
	
	x = 0.0;
	y = 0.0;
	z = 0.0;
	
	gl.activeTexture(gl.TEXTURE2);
	gl.bindTexture(gl.TEXTURE_2D, skyTexture);
	gl.uniform1i(uSamplerPointer, 2);
	gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
	gl.vertexAttribPointer(textureCoordinatesAttributePointer, textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	glMatrix.mat4.fromScaling(scaleMatrix,[1000/2, 1000/2, 1000/2]);
	
	glMatrix.mat4.fromTranslation(translationMatrix,[x,y,z]);
	glMatrix.mat4.multiply(finalM,translationMatrix,scaleMatrix);
	
	gl.uniformMatrix4fv(modelUniformPointer, false, finalM); 
	gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.itemCount);

}



function startRotate(){
	
	if(requestID == 0)
		requestID = window.requestAnimationFrame(animationStep);
}

function stopRotate(){
	//totalZ = 0.0;
	//rotateAngle = 0.0;
	window.cancelAnimationFrame(requestID);
	requestID = 0;
}


function animationStep() {
	rotateAngle += 1; // degrees
	totalZ += 0.1;   // add to z axis
	drawScene();
	requestID = window.requestAnimationFrame(animationStep);
}





function onPositionChange(event){
	totalZ = 0.0;
	totalDY = 0;
	totalDX = 0;
	rotateAngle = 0.0;
	drawScene();
}

function changeDistance(event) {
	
	document.getElementById("viewDistance").value = parseFloat(event.target.value);
	drawScene();
}

function changeViewAngle(event) {
		
	document.getElementById("viewAngle").value = parseFloat(event.target.value);
	drawScene();
}


function canvasMouseDown(event){
	mouseDown = true;
	bMouseX = event.clientX - boundingRect.left;
	bMouseY = boundingRect.bottom - event.clientY;
	dX = 0;
	dY = 0;
	console.log("mouse down:",mouseDown);
}

function cursorMove(event){
	if(mouseDown){
		aMouseX = event.clientX - boundingRect.left;
		aMouseY = boundingRect.bottom - event.clientY;
	
	
		dX = aMouseX - bMouseX;
		dY = aMouseY - bMouseY;
		console.log("dx:",dX);
		console.log("dy:",dY);
		
		totalDX += dX;
		totalDY += dY;
	
	
		//if(!requestID)
		//	drawScene();

		//console.log("aMouseX:",aMouseX);
		//console.log("aMouseY:",aMouseY);
		//console.log("bMouseX:",bMouseX);
		//console.log("bMouseY:",bMouseY);
	
		bMouseX = aMouseX;
		bMouseY = aMouseY;
		
		if(requestID == 0)
			drawScene();
	}
}


document.addEventListener('DOMContentLoaded', function() {
    const rangeAngleView = document.getElementById('rangeAngleView');

	rangeAngleView.addEventListener('input', changeViewAngle);
	
	const rangeDistanceView = document.getElementById('rangeDistanceView');

	rangeDistanceView.addEventListener('input', changeDistance);
	
	const cameraViewForm = document.getElementById('cameraViewForm');
	
	cameraViewForm.addEventListener('change', onPositionChange);
	
	canvas = document.getElementById("sceneCanvas");
	
	canvas.addEventListener('mousedown',canvasMouseDown);
	window.addEventListener('mouseup',function (event){
		mouseDown = false;
		dX = 0;
		dY = 0;
		//totalDX = 0;
		//totalDY = 0;
		console.log("mouse down:",mouseDown);
	});
	
	
	canvas.addEventListener('mousemove',cursorMove);
	/*
	const startRotate = document.getElementById('startRotate');
	
	startRotate.addEventListener('change', function(event){
		requestID = true;
		while(requestID){
			drawScene();
		}
	});
	
	const stopRotate = document.getElementById('stopRotate');
	
	stopRotate.addEventListener('change', function(event){
		requestID = false;
	});
	*/
  });