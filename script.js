    // Three.js setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("three-js-container").appendChild(renderer.domElement);

    // Particle system
    const particleCount = 1000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const basePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 100;
      const y = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 100;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      basePositions[i * 3] = x;
      basePositions[i * 3 + 1] = y;
      basePositions[i * 3 + 2] = z;
      colors[i * 3] = 1;
      colors[i * 3 + 1] = 1;
      colors[i * 3 + 2] = 1;
    }

    particles.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particles.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });
    let particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    // Camera positioning
    camera.position.z = 50;

    // Orbit controls
    let isOrbiting = false;
    let angle = 0;

    // Shape control
    let currentShapeIndex = 0;
    const shapes = [
      new THREE.BoxGeometry(0.5, 0.5, 0.5),
      new THREE.SphereGeometry(0.3, 16, 16),
      new THREE.TetrahedronGeometry(0.4),
      new THREE.TorusGeometry(0.3, 0.1, 16, 32)
    ];

    // Audio visualizer setup
    let visualizerActive = true;
    let particleColor = new THREE.Color(1, 1, 1);
    const audio = document.getElementById("audio");
    const canvas = document.getElementById("visualizer");
    const ctx = canvas.getContext("2d");
    let audioContext, analyser, dataArray, source;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener("resize", () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    audio.addEventListener("play", () => {
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
      }

      if (audioContext.state === "suspended") {
        audioContext.resume();
      }

      animate();
    });

    // Toggle visualizer
    function toggleVisualizer() {
      visualizerActive = !visualizerActive;
      if (!visualizerActive) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    // Change particle color
    function changeParticleColor() {
      const colorsList = [
        new THREE.Color(1, 0, 0),
        new THREE.Color(0, 1, 0),
        new THREE.Color(0, 0, 1),
        new THREE.Color(1, 0, 1),
        new THREE.Color(0, 1, 1),
        new THREE.Color(1, 1, 1)
      ];
      particleColor = colorsList[Math.floor(Math.random() * colorsList.length)];

      for (let i = 0; i < particleCount; i++) {
        colors[i * 3] = particleColor.r;
        colors[i * 3 + 1] = particleColor.g;
        colors[i * 3 + 2] = particleColor.b;
      }

      if (particleSystem instanceof THREE.Points) {
        particleSystem.geometry.attributes.color.neニーズUpdate = true;
      } else if (particleSystem instanceof THREE.InstancedMesh) {
        const color = new THREE.Color();
        for (let i = 0; i < particleCount; i++) {
          color.setRGB(colors[i * 3], colors[i * 3 + 1], colors[i * 3 + 2]);
          particleSystem.setColorAt(i, color);
        }
        particleSystem.instanceColor.needsUpdate = true;
      }
    }

    // Toggle camera orbit
    function toggleCameraOrbit() {
      isOrbiting = !isOrbiting;
    }

    // Change particle shape
    function changeParticleShape() {
      scene.remove(particleSystem);
      currentShapeIndex = (currentShapeIndex + 1) % shapes.length;

      if (currentShapeIndex === 0) {
        particleSystem = new THREE.Points(particles, particleMaterial);
      } else {
        const geometry = shapes[currentShapeIndex];
        const material = new THREE.MeshBasicMaterial({
          vertexColors: true,
          transparent: true,
          opacity: 0.8
        });
        particleSystem = new THREE.InstancedMesh(geometry, material, particleCount);

        particleSystem.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(particleCount * 3), 3);
        const matrix = new THREE.Matrix4();
        const color = new THREE.Color();
        for (let i = 0; i < particleCount; i++) {
          matrix.setPosition(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
          particleSystem.setMatrixAt(i, matrix);
          color.setRGB(colors[i * 3], colors[i * 3 + 1], colors[i * 3 + 2]);
          particleSystem.setColorAt(i, color);
        }
        particleSystem.instanceMatrix.needsUpdate = true;
        particleSystem.instanceColor.needsUpdate = true;
      }

      scene.add(particleSystem);
      changeParticleColor();
    }

    // Added playlist functionality with dropdown
    const songsData = {
      bengali: [
        { src: "Songs/bengali/Boba Tunnel.mp3", title: "Boba Tunnel" },
        { src: "Songs/bengali/Tistaan.mp3", title: "Tistaan" },
        { src: "Songs/bengali/Tomay Dilam.mp3", title: "Tomay Dilam" }
      ],
      english: [
        { src: "Songs/english/Back In Black.mp3", title: "Back In Black" },
        { src: "Songs/english/Hotel California.mp3", title: "Hotel California" },
        { src: "Songs/english/Queen Bohemian Rhapsody.mp3", title: "Queen Bohemian Rhapsody" }
      ],
      hindi: [
        { src: "Songs/hindi/Aaj Jaane Ki Zidd Na Karo.mp3", title: "Aaj Jaane Ki Zidd Na Karo" },
        { src: "Songs/hindi/Tum Itna Jo.mp3", title: "Tum Itna Jo" },
        { src: "Songs/hindi/Jiyein Kyun.mp3", title: "Jiyein Kyun" }
      ]
    };

    const languageSelect = document.getElementById('language-select');
    const songList = document.getElementById('song-list');
    const currentTrackDisplay = document.getElementById('current-track');
    let currentSongIndex = 0;
    let currentSongs = songsData.english; // Default to English

    function updateSongList() {
      const language = languageSelect.value;
      currentSongs = songsData[language];
      currentSongIndex = 0;
      songList.innerHTML = '';
      currentSongs.forEach((song, index) => {
        const songElement = document.createElement('div');
        songElement.className = 'song' + (index === 0 ? ' active' : '');
        songElement.setAttribute('data-src', song.src);
        songElement.setAttribute('data-title', song.title);
        songElement.textContent = song.title;
        songElement.onclick = () => playSong(songElement, index);
        songList.appendChild(songElement);
      });
      // Play the first song of the selected language
      const firstSong = currentSongs[0];
      audio.src = firstSong.src;
      currentTrackDisplay.textContent = firstSong.title;
      audio.play();
    }

    function playSong(element, index) {
      songList.querySelectorAll('.song').forEach(s => s.classList.remove('active'));
      element.classList.add('active');
      audio.src = element.getAttribute('data-src');
      currentTrackDisplay.textContent = element.getAttribute('data-title');
      currentSongIndex = index;
      audio.play();
    }

    function previousSong() {
      if (currentSongIndex > 0) {
        currentSongIndex--;
        const songElement = songList.children[currentSongIndex];
        playSong(songElement, currentSongIndex);
      }
    }

    function nextSong() {
      if (currentSongIndex < currentSongs.length - 1) {
        currentSongIndex++;
        const songElement = songList.children[currentSongIndex];
        playSong(songElement, currentSongIndex);
      }
    }

    // Initialize song list
    updateSongList();

    function animate() {
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

      if (particleSystem instanceof THREE.InstancedMesh) {
        const matrix = new THREE.Matrix4();
        for (let i = 0; i < particleCount; i++) {
          const index = i * 3;
          const freq = dataArray[i % dataArray.length] / 255;
          const x = basePositions[index] + Math.cos(Date.now() * 0.001 + i) * freq * 5;
          const y = basePositions[index + 1] + Math.sin(Date.now() * 0.001 + i) * freq * 5;
          const z = basePositions[index + 2];
          matrix.setPosition(x, y, z);
          particleSystem.setMatrixAt(i, matrix);
        }
        particleSystem.instanceMatrix.needsUpdate = true;
      } else {
        const positions = particleSystem.geometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
          const index = i * 3;
          const freq = dataArray[i % dataArray.length] / 255;
          positions[index + 1] = basePositions[index + 1] + Math.sin(Date.now() * 0.001 + i) * freq * 5;
          positions[index] = basePositions[index] + Math.cos(Date.now() * 0.001 + i) * freq * 5;
        }
        particleSystem.geometry.attributes.position.needsUpdate = true;
        particleMaterial.size = Math.max(0.3, avg / 100);
      }

      // Modified orbit speed (slower)
      if (isOrbiting) {
        angle += 0.001; // Reduced from 0.005 to 0.001 for slower orbit
        camera.position.x = Math.sin(angle) * 50;
        camera.position.z = Math.cos(angle) * 50;
        camera.lookAt(0, 0, 0);
      }

      if (visualizerActive) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.strokeStyle = `#${particleColor.getHexString()}`;
        ctx.lineWidth = 3;

        const sliceWidth = canvas.width / dataArray.length;
        let x = 0;

        for (let i = 0; i < dataArray.length; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * canvas.height) / 4 + canvas.height / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.stroke();
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }