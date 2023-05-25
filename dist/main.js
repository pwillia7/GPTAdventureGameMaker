import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
var animationFunction;

var ascene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 10;

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000); 
document.body.appendChild(renderer.domElement);
var light = new THREE.AmbientLight(0x404040); // soft white light
ascene.add(light);


var loader = new FontLoader();

var data;

fetch("mountain.json")
.then(response => response.json())
.then(json => {
 data = json;
 console.log(data.scenes)
 var settings = data.settings;

 document.title = settings.title;

 renderer.setClearColor(settings.backgroundColor);

 loader.load(settings.font,
 function(font) {

 var textGeometry = new TextGeometry("Loading...", {
 font: font,
 size: 1,
 height: 0.1
 });

 // Use MeshPhongMaterial for the text and set the color to white
 var textMaterial = new THREE.MeshPhongMaterial({color: 0xffffff});

 var textMesh = new THREE.Mesh(textGeometry, textMaterial);

 textGeometry.center();

 ascene.add(textMesh);

 renderer.render(ascene, camera);

 // Use the first scene as the default scene
 startGame(data.scenes[0]);

 // Remove the loading text from the scene
 ascene.remove(textMesh);
 }
 );
});

// Use a global variable for the text element
var textElement = document.createElement("div");

textElement.style.position = 'absolute';
textElement.style.top = '10%';
textElement.style.left = '10%';
textElement.style.width = '80%';
textElement.style.height = 'auto';
textElement.style.color = 'white';
textElement.style.backgroundColor = 'black';
textElement.style.borderRadius = '6px';
textElement.style.padding = '10px';
textElement.style.fontFamily = 'monospace';
textElement.style.fontSize = '16px';

document.body.appendChild(textElement);

// Use a global variable for the choices element
var choicesElement = document.createElement("div");

choicesElement.style.position = 'absolute';
choicesElement.style.bottom = '10%';
choicesElement.style.left = '10%';
choicesElement.style.width = '80%';
choicesElement.style.height = '20%';

document.body.appendChild(choicesElement);

function startGame(scene) {
// console.log(ascene)
 // Remove all children from the choices element
 while(choicesElement.firstChild) {
 choicesElement.removeChild(choicesElement.firstChild);
 }

 // Traverse the scene's children
ascene.children.forEach(function (child) {
    // Check if the child object is a light or not
    if (!(child instanceof THREE.Light)) {
      // Remove the child object if it is not a light
      ascene.remove(child);
    }
  });
  

 var text = scene.text;
 var choices = scene.choices;
 var animationCode = scene.animationCode;

 if (animationFunction) {
    ascene.remove(animationFunction.cube);
   }
  
 // Create a function from the animationCode string
 animationFunction = new Function("render","ascene", "THREE", animationCode);
//  console.log(animationFunction);
 // Call the function with the scene parameter
 animationFunction(render, ascene, THREE);
 // Request animation frame
 requestAnimationFrame(render);
 
 // Update the text element content
 textElement.innerHTML = text;

 for (var i = 0; i < choices.length; i++) {

 var choice = choices[i];

 var choiceText = choice.text;
 var nextSceneId = choice.nextScene;
 var choiceButton = document.createElement("button");

 choiceButton.style.width = '100%';
 choiceButton.style.height = '20%';
 choiceButton.style.marginBottom = '10px';
 choiceButton.style.fontFamily = 'monospace';

 
 choiceButton.innerHTML = choiceText;
 
 // Use a custom attribute to store the next scene id
 choiceButton.setAttribute("data-next-scene", nextSceneId);
 
 choiceButton.addEventListener("click", function() {
 
   // Get the next scene id from the custom attribute
   var nextSceneId = this.getAttribute("data-next-scene");
 
   var nextScene = data.scenes.find(scene => scene.id === nextSceneId);
 
   // Pass the next scene as the parameter
   startGame(nextScene);
 });
 
 choicesElement.appendChild(choiceButton);
 
 }

 }

function render () {
 renderer.render(ascene, camera);
}
