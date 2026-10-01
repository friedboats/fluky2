(() => {
  const canvas = document.getElementById('wheelCanvas');
  const ctx = canvas.getContext('2d');
  const nameInput = document.getElementById('nameInput');
  const addNameButton = document.getElementById('addNameButton');
  const spinButton = document.getElementById('spinButton');
  const nameList = document.getElementById('nameList');
  const controls = document.getElementById('controls');
  const wheelContainer = document.getElementById('wheelContainer');
  const wheelWrap = document.getElementById('wheelWrap'); // Wheel plus its pointer hand

  // Increase the canvas size to accommodate the larger wheel and ensure the arrow stays in view
  canvas.width = 600; // Adjusted width for larger wheel
  canvas.height = 600; // Adjusted height for larger wheel
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  // Increase radius by 1/3 (from 200 to 266)
  const radius = 266;

  let names = [];
  let anglePerName;
  let currentAngle = 0;
  let spinVelocity = 0;
  let spinning = false;
  const spinDirection = 1; // 1 = clockwise, to match the witch pushing down on the right

  // NORMAL
  /* const predefinedColors = [
    '#FFBC70',
    '#5FCFFF',
    '#B23A3A',
    '#D3BEEA',
    '#35816E',
    '#FEA379',
    '#2B83C6',
    '#BD8A6A',
    '#DDE38C',
    '#FFDF61',
    '#5D84A2',
    '#74B959',
    '#E41F84',
    '#A2C7E3',
    '#FF9162',
    '#3A693F',
    '#E1ADE7',
    '#D0BBCE',
    '#285E86',
    '#BDAA3E',
  ]; */

  // HALLOWEEN: retro horror poster colors
  const predefinedColors = [
    '#F39A4A', // orange
    '#F3E3C3', // cream
    '#D8443A', // blood red
    '#E3B04B', // mustard
    '#8FA58A', // sage
    '#F2B88B', // peach
    '#B49BC8', // dusty lavender
    '#7FA8A3', // faded teal
    '#C96F3B', // rust
    '#D98A8A', // rose
    '#A8B06A', // olive
    '#D9B98C', // sand
  ];

  let assignedColors = [];

  function getColor() {
    if (assignedColors.length < predefinedColors.length) {
      let randomColor;
      do {
        randomColor =
          predefinedColors[Math.floor(Math.random() * predefinedColors.length)];
      } while (assignedColors.includes(randomColor)); // Make sure the color hasn't been used already
      return randomColor;
    } else {
      // If we run out of predefined colors, generate a random color
      const hue = Math.floor(Math.random() * 360);
      const saturation = Math.floor(Math.random() * 20) + 70;
      const lightness = Math.floor(Math.random() * 20) + 40;
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }
  }

  // Add a name to the wheel
  addNameButton.addEventListener('click', () => {
    addNameToWheel();
  });

  nameInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent the default action (form submission)
      addNameToWheel();
    }
  });

  function addNameToWheel() {
    const name = nameInput.value.trim();
    if (name && !names.includes(name)) {
      names.push(name);

      // Assign a color from the predefined array or generate a random one
      const color = getColor();
      assignedColors.push(color);

      nameInput.value = ''; // Clear the input field
      updateNameList();
      drawWheel();

      // The new row appears with a poof of magic
      poofElements([nameList.lastElementChild], 'in');
    }
  }

  // Update the name list display
  function updateNameList() {
    nameList.innerHTML = '';
    names.forEach((name, index) => {
      const li = document.createElement('li');
      li.textContent = name;
      li.style.backgroundColor = assignedColors[index];

      const removeButton = document.createElement('span');
      removeButton.textContent = 'X';
      removeButton.style.marginLeft = '10px';
      removeButton.style.color = 'white';
      removeButton.style.cursor = 'pointer';
      removeButton.addEventListener('click', () => removeName(name, li));

      li.appendChild(removeButton);
      nameList.appendChild(li);
    });
  }

  // The row poofs away first, then the name comes off the list and wheel
  function removeName(name, li) {
    if (li.dataset.removing) return; // Already on its way out
    li.dataset.removing = 'true';

    const [poof] = poofElements([li], 'out');
    poof.finished.then(() => {
      const index = names.indexOf(name);
      names.splice(index, 1);
      assignedColors.splice(index, 1);
      updateNameList();
      drawWheel();
    });
  }

  // Draw the wheel
  function drawWheel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Remove the Spin button completely when there are no names
    spinButton.style.display = names.length > 0 ? '' : 'none';
    // Show only when there are names and we're NOT spinning
    spinButton.style.opacity = names.length > 0 && !spinning ? 1 : 0;
    // Optional safety: disable clicks while hidden
    spinButton.style.pointerEvents =
      names.length > 0 && !spinning ? 'auto' : 'none';

    /* // NORMAL
    if (names.length === 0) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.setLineDash([15, 15]); // Dotted line style
      ctx.fillStyle = 'rgb(255, 99, 255)';
      ctx.fill();
      ctx.font = '100px Georgia';
      ctx.fillStyle = 'white';
      ctx.fillText('Euchre', centerX - 155, centerY - 20);
      ctx.fillText('Night!!!', centerX - 155, centerY + 95);
      return;
    } */

    // HALLOWEEN
    if (names.length === 0) {
      ctx.setLineDash([]); // remove the dotted line

      // 🌕 Flat orange moon, the same size as the wheel
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#F39A4A'; // poster orange
      ctx.fill();

      // Text overlay: cream dripping letters with a stacked red shadow
      ctx.font = '96px Creepster, Georgia';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#D8443A';
      for (let offset = 6; offset > 0; offset -= 2) {
        ctx.fillText('Spoochre', centerX + offset, centerY - 15 + offset);
        ctx.fillText('Night!!!', centerX + offset, centerY + 90 + offset);
      }
      ctx.fillStyle = '#F3E3C3';
      ctx.fillText('Spoochre', centerX, centerY - 15);
      ctx.fillText('Night!!!', centerX, centerY + 90);

      return;
    }

    anglePerName = (2 * Math.PI) / names.length;
    names.forEach((name, index) => {
      const startAngle = currentAngle + index * anglePerName;
      const endAngle = startAngle + anglePerName;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = assignedColors[index]; // Use the pre-assigned color for this wedge
      ctx.fill();

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + anglePerName / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#000';
      ctx.font = '16px Arial';
      //   ctx.fillText(name, radius - 10, 0);
      ctx.restore();
    });

    // HALLOWEEN: the pointer is a bone shard, otherwise the plain black triangle
    if (document.body.classList.contains('halloween')) {
      drawBonePointer();
      return;
    }

    // Draw the arrow
    ctx.fillStyle = '#000';
    // Slight drop shadow so the arrow sits on top of the wheel
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius + 15);
    ctx.lineTo(centerX - 10, centerY - radius - 10);
    ctx.lineTo(centerX + 10, centerY - radius - 10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // A bone shard for the pointer: the same triangle as the plain arrow, but
  // cream with a broken, jagged top edge and a crack running down it
  function drawBonePointer() {
    const tipY = centerY - radius + 15;
    const topY = centerY - radius - 14;

    const shard = new Path2D();
    shard.moveTo(centerX, tipY);
    shard.quadraticCurveTo(centerX - 6, topY + 16, centerX - 13, topY + 3);
    // Jagged broken top edge
    shard.lineTo(centerX - 8, topY);
    shard.lineTo(centerX - 4, topY + 4);
    shard.lineTo(centerX + 1, topY - 1);
    shard.lineTo(centerX + 6, topY + 3);
    shard.lineTo(centerX + 13, topY + 1);
    shard.quadraticCurveTo(centerX + 6, topY + 16, centerX, tipY);
    shard.closePath();

    ctx.save();
    // Dark outline with a slight drop shadow, then the cream bone on top
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1c1c1f';
    ctx.stroke(shard);
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#F3E3C3';
    ctx.fill(shard);

    // Hairline crack from the broken edge
    ctx.beginPath();
    ctx.moveTo(centerX - 4, topY + 4);
    ctx.lineTo(centerX - 1, topY + 11);
    ctx.lineTo(centerX - 3, topY + 17);
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(28, 28, 31, 0.6)';
    ctx.stroke();
    ctx.restore();
  }

  // --- Spin transition ---
  // The controls slide off to the left one after another, then the wheel
  // glides into its new spot with a little overshoot, then it spins.
  const EXIT_MS = 450; // How long each control takes to slide away
  const STAGGER_MS = 60; // Delay between each control starting to slide
  const MAX_STAGGER_TOTAL_MS = 400; // Keeps long name lists from dragging on
  const WHEEL_MOVE_MS = 800; // How long the wheel takes to glide into place
  let controlAnimations = [];

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // The name box, each name row, and the Spin button, top to bottom
  function getControlPieces() {
    return [
      document.getElementById('inputContainer'),
      ...nameList.children,
      spinButton,
    ].filter((el) => el.offsetParent !== null);
  }

  // Poof the controls away (or back) like a spell, one after another;
  // resolves when all are done
  function animateControls(direction) {
    controlAnimations = poofElements(getControlPieces(), direction);
    return Promise.all(controlAnimations.map((a) => a.finished));
  }

  // Poof any elements in or out with the spell effect; returns their animations
  function poofElements(pieces, direction) {
    const stagger = Math.min(STAGGER_MS, MAX_STAGGER_TOTAL_MS / pieces.length);
    const reduce = prefersReducedMotion();

    // Swell up a touch, then shrink into a blur and vanish
    const shown = { transform: 'scale(1)', filter: 'blur(0)', opacity: 1 };
    const swell = { transform: 'scale(1.08)', filter: 'blur(0)', opacity: 1 };
    const gone = { transform: 'scale(0.3)', filter: 'blur(10px)', opacity: 0 };
    const frames =
      direction === 'out'
        ? [shown, { ...swell, offset: 0.3 }, gone]
        : [gone, { ...swell, offset: 0.7 }, shown];

    return pieces.map((el, i) => {
      const delay = reduce ? 0 : i * stagger;
      if (!reduce) {
        // The smoke and sparkles burst right as the piece vanishes (or appears)
        const burstAt = direction === 'out' ? delay + EXIT_MS * 0.3 : delay;
        setTimeout(() => poofEffect(el), burstAt);
      }
      return el.animate(frames, {
        duration: reduce ? 0 : EXIT_MS,
        delay,
        easing: 'ease-in-out',
        // Hold hidden before starting (in) and after finishing (out)
        fill: direction === 'out' ? 'forwards' : 'backwards',
      });
    });
  }

  // A puff of smoke and a burst of sparkles over an element
  function poofEffect(el) {
    const rect = el.getBoundingClientRect();
    if (!rect.width) return;

    const layer = document.createElement('div');
    layer.classList.add('poof-layer');
    document.body.appendChild(layer);

    const randomIn = (min, max) => Math.random() * (max - min) + min;
    const centerY = rect.top + rect.height / 2;

    // Soft smoke clouds spread along the element
    const puffCount = Math.max(3, Math.round(rect.width / 90));
    for (let i = 0; i < puffCount; i++) {
      const puff = document.createElement('span');
      puff.classList.add('poof-smoke');
      const size = rect.height * randomIn(1.3, 2);
      puff.style.width = `${size}px`;
      puff.style.height = `${size}px`;
      puff.style.left = `${randomIn(rect.left, rect.right) - size / 2}px`;
      puff.style.top = `${centerY - size / 2}px`;
      layer.appendChild(puff);
      const rise = randomIn(-20, -6); // Smoke drifts up a little
      puff.animate(
        [
          { transform: 'scale(0.3)', opacity: 0.7 },
          { transform: `scale(1.6) translateY(${rise}px)`, opacity: 0 },
        ],
        { duration: randomIn(600, 900), easing: 'ease-out', fill: 'forwards' },
      );
    }

    // Twinkling sparkles flying outward
    const sparkColors = ['#F3E3C3', '#F39A4A', '#B49BC8', '#E3B04B'];
    const sparkCount = Math.max(8, Math.round(rect.width / 30));
    for (let i = 0; i < sparkCount; i++) {
      const spark = document.createElement('span');
      spark.classList.add('poof-spark');
      spark.textContent = '✦';
      spark.style.color =
        sparkColors[Math.floor(Math.random() * sparkColors.length)];
      spark.style.fontSize = `${randomIn(10, 22)}px`;
      spark.style.left = `${randomIn(rect.left, rect.right)}px`;
      spark.style.top = `${randomIn(rect.top, rect.bottom)}px`;
      layer.appendChild(spark);

      const angle = randomIn(0, 2 * Math.PI);
      const distance = randomIn(40, 120);
      spark.animate(
        [
          { transform: 'translate(0, 0) scale(0.4) rotate(0deg)', opacity: 1 },
          { offset: 0.3, transform: 'scale(1.2)', opacity: 1 },
          {
            transform: `translate(${Math.cos(angle) * distance}px, ${
              Math.sin(angle) * distance
            }px) scale(0) rotate(${randomIn(-180, 180)}deg)`,
            opacity: 0,
          },
        ],
        { duration: randomIn(600, 1000), easing: 'ease-out', fill: 'forwards' },
      );
    }

    setTimeout(() => layer.remove(), 1100);
  }

  // Change the layout, then make the wheel glide from where it was to where it lands
  function moveWheelSmoothly(changeLayout) {
    const before = wheelWrap.getBoundingClientRect();
    changeLayout();
    const after = wheelWrap.getBoundingClientRect();

    const dx = before.left + before.width / 2 - (after.left + after.width / 2);
    const dy = before.top + before.height / 2 - (after.top + after.height / 2);
    const scale = before.width / after.width;

    // Move the wrapper so the pointer hand travels with the wheel
    return wheelWrap.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(${scale})` },
        { transform: 'none' },
      ],
      {
        duration: prefersReducedMotion() ? 0 : WHEEL_MOVE_MS,
        easing: 'cubic-bezier(0.34, 1.4, 0.64, 1)', // Slight overshoot, then settles
      },
    ).finished;
  }

  // Spin the wheel
  spinButton.addEventListener('click', () => {
    if (!spinning && names.length > 0) {
      const randomSpinVelocity = Math.random() * 5 + 10; // Random spin velocity between 10 and 15
      spinVelocity = randomSpinVelocity; // Set the initial spin velocity
      spinning = true;
      spinButton.style.pointerEvents = 'none';

      animateControls('out')
        .then(() =>
          moveWheelSmoothly(() => {
            controls.style.display = 'none';
            // On phones, the wheel rises to sit near the top of the screen
            if (window.innerWidth < 1024) {
              wheelContainer.classList.add('slide-mobile');
            }
            window.scrollTo({ top: 0 });
          }),
        )
        .then(witchSpinsWheel)
        .then(() => {
          startWheelMagic();
          requestAnimationFrame(spin);
        });
    }
  });

  // --- Witch's hand pushes the wheel ---
  const witchHand = document.getElementById('witchHand');
  const HAND_ENTER_MS = 800; // Reaching in from the bottom-right corner
  const HAND_PAUSE_MS = 350; // Hovering on the rim before the push
  const HAND_PUSH_MS = 260; // Pushing down the rim
  const HAND_EXIT_MS = 650; // Pulling back out while the wheel spins

  // The wheel's radius in screen pixels
  function wheelRadiusOnScreen() {
    return canvas.getBoundingClientRect().width * (radius / canvas.width);
  }

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Resolves at the moment the claw pushes the wheel, so the spin starts then
  function witchSpinsWheel() {
    if (prefersReducedMotion()) return Promise.resolve();

    const wheel = canvas.getBoundingClientRect();
    const wheelRadius = wheelRadiusOnScreen();
    const handWidth = Math.max(300, wheel.width * 0.9);
    const handHeight = handWidth; // witch-hand.svg is 660x660

    // Put the claw tip (at 3,311 in the drawing) just inside the right rim,
    // a little above center, so pushing down spins the wheel clockwise
    const clawX = (handWidth * 3) / 660;
    const clawY = (handHeight * 311) / 660;
    const touchX = wheel.left + wheel.width / 2 + wheelRadius * 0.92;
    const touchY = wheel.top + wheel.height / 2 - wheelRadius * 0.35;
    const handLeft = touchX - clawX;
    const handTop = touchY - clawY;

    witchHand.style.width = `${handWidth}px`;
    witchHand.style.left = `${handLeft}px`;
    witchHand.style.top = `${handTop}px`;
    witchHand.style.display = 'block';

    // Fully off the bottom-right corner of the screen
    const away = `translate(${window.innerWidth - handLeft + 40}px, ${
      window.innerHeight - handTop + 40
    }px)`;
    const pushed = `translateY(${wheelRadius * 0.55}px) rotate(-8deg)`;

    const reachIn = witchHand.animate([{ transform: away }, { transform: 'none' }], {
      duration: HAND_ENTER_MS,
      easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)', // Glides in and settles
      fill: 'forwards',
    });

    return reachIn.finished
      .then(() => wait(HAND_PAUSE_MS))
      .then(
        () =>
          witchHand.animate([{ transform: 'none' }, { transform: pushed }], {
            duration: HAND_PUSH_MS,
            easing: 'cubic-bezier(0.5, 0, 0.9, 0.5)', // Speeds up into the push
            fill: 'forwards',
          }).finished,
      )
      .then(() => {
        const pullBack = witchHand.animate(
          [{ transform: pushed }, { transform: away }],
          {
            duration: HAND_EXIT_MS,
            easing: 'cubic-bezier(0.5, 0, 0.8, 0.4)',
            fill: 'forwards',
          },
        );
        pullBack.finished.then(() => {
          witchHand.style.display = 'none';
          witchHand.getAnimations().forEach((a) => a.cancel());
        });
      });
  }

  // --- Magic streaming off behind the wheel while it spins ---
  const MAX_MAGIC_SPARKS = 120;
  let magicLayer;
  let magicGlow;
  let magicCenter = { x: 0, y: 0 };

  function startWheelMagic() {
    if (!magicLayer) {
      // Sits behind the canvas inside the wheel container
      magicLayer = document.createElement('div');
      magicLayer.classList.add('wheel-magic');
      magicGlow = document.createElement('div');
      magicGlow.classList.add('wheel-glow');
      magicLayer.appendChild(magicGlow);
      wheelContainer.insertBefore(magicLayer, wheelWrap);
    }

    // Measure where the wheel's center is inside the container
    const box = wheelContainer.getBoundingClientRect();
    const wheel = canvas.getBoundingClientRect();
    const wheelRadius = wheelRadiusOnScreen();
    magicCenter = {
      x: wheel.left - box.left + wheel.width / 2,
      y: wheel.top - box.top + wheel.height / 2,
    };
    magicGlow.style.width = `${wheelRadius * 2}px`;
    magicGlow.style.height = `${wheelRadius * 2}px`;
    magicGlow.style.left = `${magicCenter.x - wheelRadius}px`;
    magicGlow.style.top = `${magicCenter.y - wheelRadius}px`;
  }

  // Called every spin frame: more sparkles and a brighter glow the faster it spins
  function emitWheelMagic() {
    if (!magicLayer || prefersReducedMotion()) return;

    const strength = Math.min(1, Math.sqrt(spinVelocity / 0.5));
    magicGlow.style.opacity = String(strength * 0.9);

    const sparkCount = magicLayer.childElementCount - 1; // Minus the glow
    if (sparkCount >= MAX_MAGIC_SPARKS || Math.random() > strength * 0.9) {
      return;
    }

    const sparkColors = ['#F3E3C3', '#F39A4A', '#B49BC8', '#E3B04B'];
    const wheelRadius = wheelRadiusOnScreen();
    const angle = Math.random() * 2 * Math.PI;
    const spark = document.createElement('span');
    spark.classList.add('poof-spark');
    spark.textContent = '✦';
    spark.style.color =
      sparkColors[Math.floor(Math.random() * sparkColors.length)];
    spark.style.fontSize = `${Math.random() * 14 + 10}px`;
    // Start just behind the rim so sparks seem to fly off the wheel's edge
    spark.style.left = `${magicCenter.x + Math.cos(angle) * wheelRadius * 0.97}px`;
    spark.style.top = `${magicCenter.y + Math.sin(angle) * wheelRadius * 0.97}px`;
    magicLayer.appendChild(spark);

    // Fly outward and trail along the direction the wheel is turning
    const distance = (Math.random() * 70 + 40) * (0.5 + strength / 2);
    const trail = distance * 0.6 * spinDirection;
    const endX = Math.cos(angle) * distance - Math.sin(angle) * trail;
    const endY = Math.sin(angle) * distance + Math.cos(angle) * trail;
    spark
      .animate(
        [
          { transform: 'translate(0, 0) scale(1) rotate(0deg)', opacity: 1 },
          {
            transform: `translate(${endX}px, ${endY}px) scale(0) rotate(180deg)`,
            opacity: 0,
          },
        ],
        { duration: Math.random() * 500 + 700, easing: 'ease-out' },
      )
      .finished.then(() => spark.remove());
  }

  function stopWheelMagic() {
    if (magicGlow) magicGlow.style.opacity = '0';
  }

  // The winner screen bounces below full size after it first fills the view,
  // so a matching backdrop switches on at that moment to keep the page hidden
  const modalBackdrop = document.getElementById('modalBackdrop');
  const MODAL_FIRST_FULL_MS = 360; // 40% of the 900ms grow animation

  function showModalBackdrop(modal) {
    modalBackdrop.style.background = getComputedStyle(modal).background;
    modalBackdrop.style.display = 'block';
    modalBackdrop.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 1,
      delay: prefersReducedMotion() ? 0 : MODAL_FIRST_FULL_MS,
      fill: 'both',
    });
  }

  function hideModalBackdrop() {
    modalBackdrop.style.display = 'none';
    modalBackdrop.getAnimations().forEach((a) => a.cancel());
  }

  // Play again: close the winner screen and slide everything back with the same names
  document.getElementById('playAgainButton').addEventListener('click', () => {
    const modal = document.getElementById('modal');
    modal.classList.remove('animated');
    modal.style.display = 'none';
    modal.querySelectorAll('.confetti-container').forEach((c) => c.remove());
    hideModalBackdrop();

    drawWheel(); // Also brings the Spin button back

    moveWheelSmoothly(() => {
      // Clear the slid-away positions so the controls can come back
      controlAnimations.forEach((a) => a.cancel());
      controls.style.display = '';
      wheelContainer.classList.remove('slide-mobile');
      window.scrollTo({ top: 0 });
    });
    animateControls('in');
  });

  function spin() {
    if (spinVelocity > 0.001) {
      currentAngle += spinVelocity * spinDirection;
      spinVelocity *= 0.99; // Gradual slowdown
      drawWheel();
      emitWheelMagic();
      requestAnimationFrame(spin);
    } else {
      spinning = false;
      stopWheelMagic();
      determineWinner();
    }
  }

  function determineWinner() {
    const normalizedAngle =
      ((currentAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI); // Normalize the angle to [0, 2 * PI]
    const arrowAngle = Math.PI / 2; // Arrow is at the top pointing to 90 degrees
    const effectiveAngle = (normalizedAngle + arrowAngle) % (2 * Math.PI); // Account for arrow's fixed position

    // Invert the direction of the wheel (as it spins clockwise)
    const segmentIndex =
      Math.floor((2 * Math.PI - effectiveAngle) / anglePerName) % names.length;

    animateWinnerAnnouncement(segmentIndex);
  }

  function animateWinnerAnnouncement(segmentIndex) {
    // Get the list items and find the winner's list item
    const listItems = nameList.getElementsByTagName('li');
    const winnerLi = listItems[segmentIndex];

    const winnerNameText = winnerLi.textContent.replace('X', '').trim();

    // Show the modal after the animation
    setTimeout(() => {
      const modal = document.getElementById('modal');
      modal.classList.add('animated');
      modal.style.display = 'block'; // Show the modal
      // NORMAL
      // modal.style.backgroundColor = winnerLi.style.backgroundColor;
      // HALLOWEEN: background comes from body.halloween in styles.scss,
      // and the moon takes the winning wedge's color
      const moon = modal.querySelector('#moon');
      if (moon) moon.style.fill = winnerLi.style.backgroundColor;
      winnerName.innerHTML = winnerNameText;
      showModalBackdrop(modal);

      // Start the confetti once the screen has finished bouncing in
      const startConfetti = (event) => {
        if (event.target !== modal || event.animationName !== 'grow') return;
        modal.removeEventListener('animationend', startConfetti);
        if (modal.style.display !== 'none') generateConfetti();
      };
      modal.addEventListener('animationend', startConfetti);
    }, 1000); // Wait for the animation duration to complete before showing the modal
  }

  // --- HALLOWEEN SPIDER CONFETTI ---
  // Replaces the shape of each confetti piece with a little spider SVG.
  // Size/behavior/animation variables are unchanged; only the visual is different.

  const SPIDER_SIZE = 40; // ⬅️ bump this as big as you want

  // Force size override even if your CSS sets .confetti width/height
  injectSpiderSizeOverride(SPIDER_SIZE);

  function injectSpiderSizeOverride(sizePx) {
    const style = document.createElement('style');
    style.textContent = `
      /* Ensure SVG spiders respect requested size even if other CSS targets .confetti */
      svg.confetti {
        width: ${sizePx}px !important;
        height: ${sizePx}px !important;
        display: block; /* avoid inline-gap quirks */
      }
    `;
    document.head.appendChild(style);
  }

  function createSpiderSVG(color) {
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(SVG_NS, 'svg');

    svg.classList.add('confetti');
    svg.setAttribute('width', String(SPIDER_SIZE));
    svg.setAttribute('height', String(SPIDER_SIZE));
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    svg.style.position = 'absolute';
    svg.style.setProperty('width', `${SPIDER_SIZE}px`, 'important');
    svg.style.setProperty('height', `${SPIDER_SIZE}px`, 'important');

    // Body
    const body = document.createElementNS(SVG_NS, 'ellipse');
    body.setAttribute('cx', '8');
    body.setAttribute('cy', '9');
    body.setAttribute('rx', '3.5');
    body.setAttribute('ry', '4');
    body.setAttribute('fill', color);

    // Head
    const head = document.createElementNS(SVG_NS, 'circle');
    head.setAttribute('cx', '8');
    head.setAttribute('cy', '4.5');
    head.setAttribute('r', '2');
    head.setAttribute('fill', color);

    // Legs
    const legs = [
      { x1: 6, y1: 6, x2: 3.5, y2: 4.5 },
      { x1: 5.7, y1: 8, x2: 3.2, y2: 7.5 },
      { x1: 5.7, y1: 10, x2: 3.2, y2: 11.2 },
      { x1: 6, y1: 12, x2: 3.6, y2: 13.5 },
      { x1: 10, y1: 6, x2: 12.5, y2: 4.5 },
      { x1: 10.3, y1: 8, x2: 12.8, y2: 7.5 },
      { x1: 10.3, y1: 10, x2: 12.8, y2: 11.2 },
      { x1: 10, y1: 12, x2: 12.4, y2: 13.5 },
    ];

    legs.forEach((p) => {
      const leg = document.createElementNS(SVG_NS, 'line');
      leg.setAttribute('x1', p.x1);
      leg.setAttribute('y1', p.y1);
      leg.setAttribute('x2', p.x2);
      leg.setAttribute('y2', p.y2);
      leg.setAttribute('stroke', color);
      leg.setAttribute('stroke-width', '1.6');
      leg.setAttribute('stroke-linecap', 'round');
      svg.appendChild(leg);
    });

    svg.appendChild(body);
    svg.appendChild(head);
    return svg;
  }

  function createPumpkinSVG(color) {
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(SVG_NS, 'svg');

    svg.classList.add('confetti');
    svg.setAttribute('width', String(SPIDER_SIZE));
    svg.setAttribute('height', String(SPIDER_SIZE));
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    svg.style.position = 'absolute';
    svg.style.setProperty('width', `${SPIDER_SIZE}px`, 'important');
    svg.style.setProperty('height', `${SPIDER_SIZE}px`, 'important');

    // Stem
    const stem = document.createElementNS(SVG_NS, 'path');
    stem.setAttribute('d', 'M7.6 5 Q7.4 2.8 9 2');
    stem.setAttribute('stroke', color);
    stem.setAttribute('stroke-width', '1.4');
    stem.setAttribute('stroke-linecap', 'round');
    stem.setAttribute('fill', 'none');
    svg.appendChild(stem);

    // Left lobe, right lobe, then center lobe on top
    [
      { cx: 5.3, rx: 3.3 },
      { cx: 10.7, rx: 3.3 },
      { cx: 8, rx: 3.4 },
    ].forEach((lobe) => {
      const ellipse = document.createElementNS(SVG_NS, 'ellipse');
      ellipse.setAttribute('cx', String(lobe.cx));
      ellipse.setAttribute('cy', '9.5');
      ellipse.setAttribute('rx', String(lobe.rx));
      ellipse.setAttribute('ry', '4.6');
      ellipse.setAttribute('fill', color);
      svg.appendChild(ellipse);
    });

    return svg;
  }

  let witchHatCount = 0; // Gives each hat's cutout mask a unique id

  function createWitchHatSVG(color) {
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(SVG_NS, 'svg');

    svg.classList.add('confetti');
    svg.setAttribute('width', String(SPIDER_SIZE));
    svg.setAttribute('height', String(SPIDER_SIZE));
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    svg.style.position = 'absolute';
    svg.style.setProperty('width', `${SPIDER_SIZE}px`, 'important');
    svg.style.setProperty('height', `${SPIDER_SIZE}px`, 'important');

    // Brim
    const brim = document.createElementNS(SVG_NS, 'ellipse');
    brim.setAttribute('cx', '8');
    brim.setAttribute('cy', '13.2');
    brim.setAttribute('rx', '7.2');
    brim.setAttribute('ry', '1.6');
    brim.setAttribute('fill', color);

    // Cone with a bent tip
    const cone = document.createElementNS(SVG_NS, 'path');
    cone.setAttribute(
      'd',
      'M4.6 13 Q6.5 8 7.6 4 Q8.6 1.2 11.8 2.2 Q9.6 3 9.6 5.5 L11.4 13 Z',
    );
    cone.setAttribute('fill', color);

    // Buckle cut out of the hat like a cookie cutter
    const maskId = `hatMask${witchHatCount++}`;
    const defs = document.createElementNS(SVG_NS, 'defs');
    const mask = document.createElementNS(SVG_NS, 'mask');
    mask.setAttribute('id', maskId);

    const maskFill = document.createElementNS(SVG_NS, 'rect');
    maskFill.setAttribute('width', '16');
    maskFill.setAttribute('height', '16');
    maskFill.setAttribute('fill', 'white');

    const buckle = document.createElementNS(SVG_NS, 'rect');
    buckle.setAttribute('x', '6.8');
    buckle.setAttribute('y', '10.4');
    buckle.setAttribute('width', '2.4');
    buckle.setAttribute('height', '2.2');
    buckle.setAttribute('fill', 'none');
    buckle.setAttribute('stroke', 'black');
    buckle.setAttribute('stroke-width', '0.7');

    mask.appendChild(maskFill);
    mask.appendChild(buckle);
    defs.appendChild(mask);

    const hat = document.createElementNS(SVG_NS, 'g');
    hat.setAttribute('mask', `url(#${maskId})`);
    hat.appendChild(brim);
    hat.appendChild(cone);

    svg.appendChild(defs);
    svg.appendChild(hat);
    return svg;
  }

  function createCardSuitSVG(color) {
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(SVG_NS, 'svg');

    svg.classList.add('confetti');
    svg.setAttribute('width', String(SPIDER_SIZE));
    svg.setAttribute('height', String(SPIDER_SIZE));
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    svg.style.position = 'absolute';
    svg.style.setProperty('width', `${SPIDER_SIZE}px`, 'important');
    svg.style.setProperty('height', `${SPIDER_SIZE}px`, 'important');

    // Randomly pick a suit
    const suits = ['spade', 'club', 'diamond', 'heart'];
    const suit = suits[Math.floor(Math.random() * suits.length)];

    let path;
    switch (suit) {
      case 'spade':
        // Spade: ♠ - Upside down heart with stem at bottom
        path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute(
          'd',
          'M12 20 Q6 14 6 10 Q6 6 9 6 Q11 6 12 8 Q13 6 15 6 Q18 6 18 10 Q18 14 12 20 M12 20 L12 26 M10 25 L14 25 L14 26 L10 26 Z',
        );
        path.setAttribute('fill', color);
        svg.appendChild(path);
        break;

      case 'club':
        // Club: ♣ - 3 touching circles (1 on top, 2 on bottom) with stem
        // Top circle
        let leaf1 = document.createElementNS(SVG_NS, 'circle');
        leaf1.setAttribute('cx', '12');
        leaf1.setAttribute('cy', '7');
        leaf1.setAttribute('r', '3.15');
        leaf1.setAttribute('fill', color);
        svg.appendChild(leaf1);

        // Bottom left circle
        let leaf2 = document.createElementNS(SVG_NS, 'circle');
        leaf2.setAttribute('cx', '9');
        leaf2.setAttribute('cy', '13');
        leaf2.setAttribute('r', '3.15');
        leaf2.setAttribute('fill', color);
        svg.appendChild(leaf2);

        // Bottom right circle
        let leaf3 = document.createElementNS(SVG_NS, 'circle');
        leaf3.setAttribute('cx', '15');
        leaf3.setAttribute('cy', '13');
        leaf3.setAttribute('r', '3.15');
        leaf3.setAttribute('fill', color);
        svg.appendChild(leaf3);

        // Stem only (no crossbar at bottom)
        let stemPath = document.createElementNS(SVG_NS, 'path');
        stemPath.setAttribute('d', 'M12 13 L12 20');
        stemPath.setAttribute('stroke', color);
        stemPath.setAttribute('stroke-width', '1.5');
        svg.appendChild(stemPath);
        break;

      case 'diamond':
        // Diamond: ♦
        path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('d', 'M12 2 L20 12 L12 22 L4 12 Z');
        path.setAttribute('fill', color);
        svg.appendChild(path);
        break;

      case 'heart':
        // Heart: ♥
        path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute(
          'd',
          'M12 22 C12 22 4 15 4 10 Q4 6 7 6 Q9 6 12 8 Q15 6 17 6 Q20 6 20 10 Q20 15 12 22 Z',
        );
        path.setAttribute('fill', color);
        svg.appendChild(path);
        break;
    }

    return svg;
  }

  function generateConfetti() {
    const numConfetti = 100; // Number of confetti pieces
    const confettiContainer = document.createElement('div');
    confettiContainer.classList.add('confetti-container');
    // Inside the modal so it falls over the winner color but behind the name
    document.getElementById('modal').appendChild(confettiContainer);

    // NORMAL
    /* const colors = [
      '#FFBC70',
      '#5FCFFF',
      '#B23A3A',
      '#D3BEEA',
      '#35816E',
      '#FEA379',
      '#2B83C6',
      '#BD8A6A',
      '#DDE38C',
      '#FFDF61',
      '#5D84A2',
      '#74B959',
      '#E41F84',
      '#A2C7E3',
      '#FF9162',
      '#3A693F',
      '#E1ADE7',
      '#D0BBCE',
      '#285E86',
      '#BDAA3E',
    ]; */

    // HALLOWEEN (night colors)
    /* const colors = [
      '#FF7518',
      '#8B0000',
      '#4B0082',
      '#7E30A0',
      '#FFB347',
      '#FEE715',
      '#2E8B57',
      '#E25822',
      '#2C2C2C',
      '#F4F1DE',
      '#A020F0',
      '#FF6F61',
      '#1C1C1C',
      '#00FF7F',
      '#FF9F00',
      '#9932CC',
      '#D2691E',
      '#F8DE7E',
      '#3A3A3A',
      '#FFA07A',
    ]; */

    // HALLOWEEN: retro horror poster colors
    const colors = [
      '#F39A4A', // orange
      '#F3E3C3', // cream
      '#D8443A', // blood red
      '#E3B04B', // mustard
      '#8FA58A', // sage
      '#F2B88B', // peach
      '#B49BC8', // dusty lavender
      '#7FA8A3', // faded teal
      '#C96F3B', // rust
      '#D98A8A', // rose
      '#A8B06A', // olive
      '#D9B98C', // sand
    ];

    for (let i = 0; i < numConfetti; i++) {
      // Randomly pick a spider, pumpkin, or witch hat
      const color = colors[Math.floor(Math.random() * colors.length)];
      const shapes = [
        () => createSpiderSVG(color),
        () => createPumpkinSVG(color),
        () => createWitchHatSVG(color),
      ];
      // A little card suit confetti mixed in (about 1 in 10 pieces)
      const confettiPiece =
        Math.random() < 0.1
          ? createCardSuitSVG(color)
          : shapes[Math.floor(Math.random() * shapes.length)]();

      // Set a random horizontal position (from 0% to 100% of the viewport width)
      confettiPiece.style.top = '-20px';
      confettiPiece.style.left = `${Math.random() * 100}vw`;

      // Random animation delay, speed (duration), and rotation for each confetti piece
      const delay = Math.random() * 2; // Random delay between 0 and 2 seconds
      const fallDuration = Math.random() * 3 + 2; // Random fall duration between 2s and 5s
      const rotationStart = Math.random() * 360; // Random start rotation (0-360 degrees)
      const rotationEnd = Math.random() * 360; // Random end rotation (0-360 degrees)

      // Set inline CSS custom properties for delay, duration, and rotation
      confettiPiece.style.setProperty('--delay', `${delay}s`);
      confettiPiece.style.setProperty('--fall-duration', `${fallDuration}s`);
      confettiPiece.style.setProperty(
        '--rotation-start',
        `${rotationStart}deg`,
      );
      confettiPiece.style.setProperty('--rotation-end', `${rotationEnd}deg`);

      // Append the confetti piece to the container
      confettiContainer.appendChild(confettiPiece);
    }
  }

  function loadNamesFromUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const namesParam = urlParams.get('names');
    if (namesParam) {
      const namesArray = namesParam.split(',').map((name) => name.trim());
      namesArray.forEach((name) => {
        if (name && !names.includes(name)) {
          const captializedName = name.charAt(0).toUpperCase() + name.slice(1);
          names.push(captializedName);
          const color = getColor();
          assignedColors.push(color);
        }
      });
      updateNameList();
      drawWheel();
    }
  }

  function makeWaves() {
    const container = document.querySelector('.wave-container');
    const waveCount = 20; // Number of falling balls

    for (let i = 0; i < waveCount; i++) {
      const wave = document.createElement('div');
      wave.classList.add('wave');

      // Randomize size
      const size = Math.random() * 150 + 50; // Size between 50px and 200px
      wave.style.width = `${size}px`;
      wave.style.height = `${size}px`;

      // Randomize horizontal position
      wave.style.left = `${Math.random() * 100}vw`;

      // Randomize speed
      const speed = Math.random() * 10 + 12; // Speed between 5s and 15s
      wave.style.animationDuration = `${speed}s`;

      // Randomize delay
      const delay = Math.random() * -10; // Delay between -10s and 0s
      wave.style.animationDelay = `${delay}s`;

      // Randomize opacity slightly
      wave.style.opacity = 0.4;

      // **NEW: Randomize background color for each wave**
      /* const hue = Math.random() * 360; // Full hue spectrum
      const saturation = Math.random() * 30 + 70; // Saturation between 70-100%
      const lightness = Math.random() * 20 + 50; // Lightness between 50-70%
      wave.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`; */

      const halloweenHues = [
        [20, 45], // orange / pumpkin
        [270, 310], // purple / violet
        [100, 140], // green / slime
        [0, 10], // red / blood
      ];
      const [min, max] =
        halloweenHues[Math.floor(Math.random() * halloweenHues.length)];
      const hue = Math.random() * (max - min) + min;
      const saturation = Math.random() * 20 + 70; // 70–90%
      const lightness = Math.random() * 15 + 45; // 45–60%
      wave.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

      container.appendChild(wave);
    }
  }

  loadNamesFromUrlParams();
  // Names from the link appear with magic, along with the Spin button
  if (names.length > 0) {
    poofElements([...nameList.children, spinButton], 'in');
  }

  makeWaves();

  // Initial draw
  drawWheel();

  // Redraw once the Creepster font is ready so the pumpkin text uses it
  document.fonts.load('96px Creepster').then(drawWheel);
})();
