import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';
import { useStore } from '../store/useStore';

const GITHUB_RAW = 'https://raw.githubusercontent.com/Aadisehgal/Aadi/main/assets/avatars';

const avatarFiles: Record<string, string> = {
  aria: `${GITHUB_RAW}/aria.glb`,
  luna: `${GITHUB_RAW}/luna.glb`,
  nova: `${GITHUB_RAW}/nova.glb`,
  vega: `${GITHUB_RAW}/vega.glb`,
  zara: `${GITHUB_RAW}/zara.glb`,
};

export function Avatar3D() {
  const { currentEmotion, isSpeaking, selectedAvatar = 'aria' } = useStore();
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    webViewRef.current?.injectJavaScript(`
      if (window.setEmotion) window.setEmotion('${currentEmotion}');
      if (window.setSpeaking) window.setSpeaking(${isSpeaking});
      true;
    `);
  }, [currentEmotion, isSpeaking]);

  const html = `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { margin:0; background:#0f0f1a; overflow:hidden; }
  canvas { width:100vw; height:100vh; display:block; }
  #status { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
    color:#fff; font-family:sans-serif; font-size:14px; text-align:center; }
</style>
</head>
<body>
<div id="status">Loading avatar...</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script>
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 100);
camera.position.set(0, 1.5, 3);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x0f0f1a, 1);
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(0, 5, 5);
scene.add(dirLight);

let mixer, model, morphMesh;
let speaking = false;
let emotion = 'neutral';
let lipValue = 0;

// Load GLTFLoader via script
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js';
script.onload = () => {
  const loader = new THREE.GLTFLoader();
  loader.load(
    '${avatarFiles[selectedAvatar as keyof typeof avatarFiles] || avatarFiles.aria}',
    (gltf) => {
      model = gltf.scene;
      model.scale.set(1.5, 1.5, 1.5);
      model.position.set(0, -1, 0);
      scene.add(model);
      mixer = new THREE.AnimationMixer(model);
      if (gltf.animations.length > 0) {
        mixer.clipAction(gltf.animations[0]).play();
      }
      model.traverse((child) => {
        if (child.isMesh && child.morphTargetInfluences) {
          morphMesh = child;
        }
      });
      document.getElementById('status').style.display = 'none';
    },
    (progress) => {
      const pct = Math.round(progress.loaded / progress.total * 100);
      document.getElementById('status').innerText = 'Loading... ' + pct + '%';
    },
    (err) => {
      document.getElementById('status').innerText = 'Avatar load failed';
    }
  );
};
document.head.appendChild(script);

window.setEmotion = function(e) { emotion = e; };
window.setSpeaking = function(s) { speaking = s; };

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);
  if (morphMesh && morphMesh.morphTargetInfluences) {
    if (speaking) {
      lipValue = Math.sin(Date.now() * 0.01) * 0.5 + 0.5;
    } else {
      lipValue *= 0.8;
    }
    const influences = morphMesh.morphTargetInfluences;
    if (influences.length > 0) influences[0] = lipValue;
  }
  if (model) model.rotation.y = Math.sin(Date.now() * 0.001) * 0.05;
  renderer.render(scene, camera);
}
animate();
</script>
</body>
</html>`;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html }}
        style={styles.webview}
        originWhitelist={['*']}
        javaScriptEnabled
        allowFileAccess
        allowUniversalAccessFromFileURLs
        mixedContentMode="always"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: 300, height: 350 },
  webview: { flex: 1, backgroundColor: 'transparent' },
});

export default Avatar3D;
