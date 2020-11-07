//var video = document.getElementById( 'video' ); // video element in the parent of the canvas element used to draw content
var projScreen;
var clock = new Clock();
var time = 0;
var rotation = Math.degToRad(15);
	
function initialize() {
	let camera = scene.camera;
  	//camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 1000);
  	camera.position.set(2, 1, 2).setLength(15);	
	
    var video = document.createElement('video');
	var id = "video";
	video.id = id;
	video.crossOrigin = "anonymous";	
    video.src = "https://threejs.org/examples/textures/sintel.ogv";
	
	program.division.appendChild(video);
	video = program.video;
    video.volume = 0;

    video.autoplay = true;
	video.style.width= "1px";
	video.style.height = "auto";
	video.style.position = "absolute";
	video.preload = 'auto';
	video.autoload = true;
	video.setAttribute('playsinline', 'true');
	video.loop = true;
    video.muted = true;
	video.play(); 
    var videoTex = new VideoTexture(video);
    videoTex.needsUpdate = true;
	/*var videoMaterial = program.getMaterialByName("video_material");
	videoMaterial.emissiveMap = videoTex;
	videoMaterial.emissive.setHex(0xFFFFFF);*/
	/*var videoTex = program.getTextureByName("sintel");
	videoTex.needsUpdate = true;*/
	var projCamera = new PerspectiveCamera(35, 1.2, 0.01, 10 );
	projCamera.position.set( 0, 0, 9 );
	projCamera.updateMatrixWorld();

	var helper = new CameraHelper( projCamera );
	scene.add( helper );
	var shaderMaterial = new ShaderMaterial({
		  uniforms: {
			baseColor: {value: new Color(0xcccccc)},
			cameraMatrix: { type: 'm4', value: projCamera.matrixWorldInverse },
			projMatrix: { type: 'm4', value: projCamera.projectionMatrix },
			texture: {value: videoTex }
		  },
		  vertexShader: [

			"varying vec4 vWorldPos;",

			"void main() {",

				"vWorldPos = modelMatrix * vec4(position, 1.0);",
				"gl_Position = projectionMatrix * viewMatrix * vWorldPos;",

			"}"

		].join( "\n" ),
		  fragmentShader: [

		"uniform vec3 baseColor;",
		"uniform sampler2D texture;",
		"uniform mat4 cameraMatrix;",
		"uniform mat4 projMatrix;",
		"varying vec4 vWorldPos;",

		"void main() {",

			"vec4 texc = projMatrix * cameraMatrix * vWorldPos;",
			"vec2 uv = texc.xy / texc.w / 2.0 + 0.5;",

			"vec3 color = ( max( uv.x, uv.y ) <= 1. && min( uv.x, uv.y ) >= 0. ) ? texture2D(texture, uv).rgb : vec3(1.0);",
			"gl_FragColor = vec4(baseColor * color, 1.0);",			

		"}"

		].join( "\n" ),
		  side: DoubleSide
		});
	projScreen = new Mesh(new BoxBufferGeometry(16, 9, 2), shaderMaterial);
	//projScreen = new THREE.Mesh(new THREE.BoxBufferGeometry(16, 9, 2), videoMaterial);
	projScreen.position.z = -2;
	var boxGeom = new BoxBufferGeometry(16, 9, 2, 16, 9, 2);
	var gridBoxGeom = GridBoxGeometry(boxGeom);
	var grid = new LineSegments(gridBoxGeom, new LineBasicMaterial({color: 0x777777}));
	projScreen.add(grid);
	scene.add(projScreen);	
}

function update() {
	time += clock.getDelta();
	projScreen.rotation.y = Math.sin(time * 0.314) * rotation;
	projScreen.rotation.x = Math.cos(time * 0.54) * rotation;
	projScreen.position.z = Math.sin(time * 0.71) * 4 - 2;
	projScreen.position.y = Math.cos(time * 0.44) * 2;
}

function GridBoxGeometry(geometry, independent) {
  if (!(geometry instanceof BoxBufferGeometry)) {
    console.log("GridBoxGeometry: the parameter 'geometry' has to be of the type BoxBufferGeometry");
    return geometry;
  }
  independent = independent !== undefined ? independent : false;

  let newGeometry = new BoxBufferGeometry();
  let position = geometry.attributes.position;
  newGeometry.attributes.position = independent === false ? position : position.clone();

  let segmentsX = geometry.parameters.widthSegments || 1;
  let segmentsY = geometry.parameters.heightSegments || 1;
  let segmentsZ = geometry.parameters.depthSegments || 1;

  let startIndex = 0;
  let indexSide1 = indexSide(segmentsZ, segmentsY, startIndex);
  startIndex += (segmentsZ + 1) * (segmentsY + 1);
  let indexSide2 = indexSide(segmentsZ, segmentsY, startIndex);
  startIndex += (segmentsZ + 1) * (segmentsY + 1);
  let indexSide3 = indexSide(segmentsX, segmentsZ, startIndex);
  startIndex += (segmentsX + 1) * (segmentsZ + 1);
  let indexSide4 = indexSide(segmentsX, segmentsZ, startIndex);
  startIndex += (segmentsX + 1) * (segmentsZ + 1);
  let indexSide5 = indexSide(segmentsX, segmentsY, startIndex);
  startIndex += (segmentsX + 1) * (segmentsY + 1);
  let indexSide6 = indexSide(segmentsX, segmentsY, startIndex);

  let fullIndices = [];
  fullIndices = fullIndices.concat(indexSide1);
  fullIndices = fullIndices.concat(indexSide2);
  fullIndices = fullIndices.concat(indexSide3);
  fullIndices = fullIndices.concat(indexSide4);
  fullIndices = fullIndices.concat(indexSide5);
  fullIndices = fullIndices.concat(indexSide6);

  newGeometry.setIndex(fullIndices);

  function indexSide(x, y, shift) {
    let indices = [];
    for (let i = 0; i < y + 1; i++) {
      let index11 = 0;
      let index12 = 0;
      for (let j = 0; j < x; j++) {
        index11 = (x + 1) * i + j;
        index12 = index11 + 1;
        let index21 = index11;
        let index22 = index11 + (x + 1);
        indices.push(shift + index11, shift + index12);
        if (index22 < ((x + 1) * (y + 1) - 1)) {
          indices.push(shift + index21, shift + index22);
        }
      }
      if ((index12 + x + 1) <= ((x + 1) * (y + 1) - 1)) {
        indices.push(shift + index12, shift + index12 + x + 1);
      }
    }
    return indices;
  }
  return newGeometry;
}
