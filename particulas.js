let scene, camera, renderer, particles;
let particlePositions, particleVelocities, particleColors;
let mouseX = 0, mouseY = 0;
let frameCount = 0, lastTime = 0;

const config = {
    density: window.innerWidth < 768 ? 300 : 600,
    speed: 1.0,
    intensity: 1.0
};

function init() {
    const container = document.getElementById('canvas-container');
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.005);

    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 100;

    renderer = new THREE.WebGLRenderer({ antialias: window.innerWidth > 768 });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 1);
    container.appendChild(renderer.domElement);

    const texture = createParticleTexture();
    createParticleField(texture);

    setupMouse();
    setupResponsive();
    animate();

    console.log('Partículas 3D realistas inicializadas');
}

function createParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 200, 1)');
    gradient.addColorStop(0.7, 'rgba(255, 200, 0, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 140, 0, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
}

function createParticleField(texture) {
    if (particles) scene.remove(particles);

    const count = config.density;
    particlePositions = new Float32Array(count * 3);
    particleVelocities = new Float32Array(count * 3);
    particleColors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const radius = Math.random() * 100 + 50;
        const phi = Math.acos(-1 + (2 * Math.random()));
        const theta = Math.sqrt(count * Math.PI) * phi;

        particlePositions[i3] = radius * Math.cos(theta) * Math.sin(phi);
        particlePositions[i3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
        particlePositions[i3 + 2] = radius * Math.cos(phi);

        particleVelocities[i3] = (Math.random() - 0.5) * 0.2;
        particleVelocities[i3 + 1] = (Math.random() - 0.5) * 0.2;
        particleVelocities[i3 + 2] = (Math.random() - 0.5) * 0.2;

        particleColors[i3] = 1.0;
        particleColors[i3 + 1] = 0.7 + Math.random() * 0.3;
        particleColors[i3 + 2] = 0.0;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.SpriteMaterial({
        map: texture,
        color: 0xFFD700,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthTest: false
    });

    particles = new THREE.Group();
    for (let i = 0; i < count; i++) {
        const sprite = new THREE.Sprite(particleMaterial);
        sprite.position.set(
            particlePositions[i * 3],
            particlePositions[i * 3 + 1],
            particlePositions[i * 3 + 2]
        );
        sprite.scale.set(2, 2, 1);
        particles.add(sprite);
    }

    scene.add(particles);
}

function animate(currentTime = 0) {
    requestAnimationFrame(animate);
    const deltaTime = (currentTime - lastTime) * 0.001;
    lastTime = currentTime;
    frameCount++;

    if (particles) {
        updateParticles();
        particles.rotation.y += 0.001 * config.speed;
        camera.position.x += (mouseX * 20 - camera.position.x) * 0.05;
        camera.position.y += (-mouseY * 20 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);
    }

    renderer.render(scene, camera);
}

function updateParticles() {
    const positions = particlePositions;

    for (let i = 0; i < config.density; i++) {
        const i3 = i * 3;
        positions[i3] += particleVelocities[i3] * config.intensity;
        positions[i3 + 1] += particleVelocities[i3 + 1] * config.intensity;
        positions[i3 + 2] += particleVelocities[i3 + 2] * config.intensity;

        particles.children[i].position.set(
            positions[i3],
            positions[i3 + 1],
            positions[i3 + 2]
        );

        const limit = 200;
        if (Math.abs(positions[i3]) > limit || Math.abs(positions[i3 + 1]) > limit || Math.abs(positions[i3 + 2]) > limit) {
            const radius = Math.random() * 100 + 50;
            const phi = Math.acos(-1 + (2 * Math.random()));
            const theta = Math.sqrt(config.density * Math.PI) * phi;
            positions[i3] = radius * Math.cos(theta) * Math.sin(phi);
            positions[i3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
            positions[i3 + 2] = radius * Math.cos(phi);
            particles.children[i].position.set(
                positions[i3],
                positions[i3 + 1],
                positions[i3 + 2]
            );
        }
    }
}

function setupMouse() {
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });
}

function setupResponsive() {
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth > 768 ? 2 : 1));
        config.density = window.innerWidth < 768 ? 300 : 600;
        createParticleField(createParticleTexture());
    });
}

window.addEventListener('load', init);
