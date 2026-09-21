// Three.js hero visual, isolated in its own module so a slow/blocked CDN
// never holds up the rest of the page (js/site.js runs independently as a
// classic script with no external dependency). Uses a dynamic import
// wrapped in try/catch; on any failure the canvas is simply hidden and the
// CSS radial-gradient background in .hero carries the section instead.

async function initHero3D() {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;

  let THREE;
  try {
    THREE = await import("https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js");
  } catch (err) {
    canvas.style.display = "none";
    return;
  }

  try {
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 9);

    const green = new THREE.Color(0x23a866);
    const gold = new THREE.Color(0xd9ac3d);
    const teal = new THREE.Color(0x2fb3c9);

    const group = new THREE.Group();
    scene.add(group);

    // Central faceted core
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.1, 1),
      new THREE.MeshStandardMaterial({ color: green, flatShading: true, roughness: 0.45, metalness: 0.25, emissive: 0x0c2a17, emissiveIntensity: 0.4 })
    );
    group.add(core);

    const wire = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.5, 1),
      new THREE.MeshBasicMaterial({ color: gold, wireframe: true, transparent: true, opacity: 0.35 })
    );
    group.add(wire);

    // Orbiting satellite shards
    const satellites = [];
    const shardGeo = new THREE.OctahedronGeometry(0.32, 0);
    const shardColors = [green, gold, teal];
    for (let i = 0; i < 14; i++) {
      const mat = new THREE.MeshStandardMaterial({ color: shardColors[i % 3], flatShading: true, roughness: 0.5, metalness: 0.2 });
      const mesh = new THREE.Mesh(shardGeo, mat);
      const radius = 3.6 + Math.random() * 2.2;
      const angle = (i / 14) * Math.PI * 2;
      const height = (Math.random() - 0.5) * 3;
      mesh.userData = { radius, angle, height, speed: 0.08 + Math.random() * 0.12, spin: 0.5 + Math.random() };
      mesh.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
      group.add(mesh);
      satellites.push(mesh);
    }

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(5, 6, 6);
    scene.add(key);
    const rim = new THREE.PointLight(0xd9ac3d, 1.2, 20);
    rim.position.set(-6, -3, 4);
    scene.add(rim);

    let mouseX = 0, mouseY = 0;
    window.addEventListener("pointermove", (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
    }
    window.addEventListener("resize", resize);
    resize();

    const clock = new THREE.Clock();
    let raf;
    function animate() {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      group.rotation.y = t * 0.12;
      core.rotation.x = t * 0.15;
      wire.rotation.y = -t * 0.08;
      satellites.forEach((s) => {
        const u = s.userData;
        const a = u.angle + t * u.speed;
        s.position.set(Math.cos(a) * u.radius, u.height + Math.sin(t * 0.6 + u.angle) * 0.4, Math.sin(a) * u.radius);
        s.rotation.x += 0.01 * u.spin;
        s.rotation.y += 0.015 * u.spin;
      });
      camera.position.x += (mouseX * 1.4 - camera.position.x) * 0.03;
      camera.position.y += (-mouseY * 1.0 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    }
    animate();

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else animate();
    });
  } catch (err) {
    canvas.style.display = "none";
  }
}

initHero3D();
