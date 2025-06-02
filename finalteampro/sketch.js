// ────────────────────────────────────────────────────────────
// 전역 변수 선언
// ────────────────────────────────────────────────────────────
let scene = 0; // 0: 초기 화면, 1: 지유 파트, 2: 시원 손가락, 3: 시원 추락, 4: 지연 컴퓨터, 5: 지연 밖, 6: 최종 화면

// 씬별 초기화 플래그
let hasInitScene0 = false;
let hasInitScene1 = false;
let hasInitScene2 = false;
let hasInitScene4 = false;
let hasInitScene5 = false;
let hasInitScene6 = false;

// 씬 진입 시각 기록 변수
let scene0StartTime = null;
let scene3StartTime = null;

// ==== 초기·최종 화면용 이미지 ====
let initialImg, finalImg;

// ==== 지유(황지유) 파트 변수 ====  
let girlImg, daggerImg;
let state = "typing";

let keyboardY;
let inputBox;
let inputComment = "";
let typedComments = [];

let daggers = [];
let daggerAnimating = false;
let waitingForClick = false;

let staggerTimer = 0;
let staggerIndex = 0;

// ==== 시원(오시원) 파트 변수 ====  
let img, bgImg, peoImg;
let fingers = [];
let centerX, centerY;
let numFingers = 10;
let fingerAnimationProgress = 0;
let fingerAnimationActive = false;

let hands = [];
let video;
let handPose;

let peoAlpha = 255;
let fadeStartFrame = null;

// 추락 장면 변수  
let personY = -100;
let isFalling = true;
let showBlood = false;
let dripHeights = [];

// ==== 지연(신지연) 파트 변수 ====  
let Outside;
let scene2FallingSound = 0;

let inputH;             // hate message 입력창
let messages = [];      // hate message 목록
let replies = [];       // reply 목록

function preload() {
  // 초기·최종 화면 이미지 로드
  initialImg = loadImage('opening.png'); // 초기 화면 이미지 파일명
  finalImg   = loadImage('ending.png');   // 최종 화면 이미지 파일명

  // 지유 파트 이미지 로드
  girlImg   = loadImage('atgirl.png');
  daggerImg = loadImage('dagger.png');

  // 시원 파트 이미지 로드
  img    = loadImage('hand.png');
  bgImg  = loadImage('background.png');
  peoImg = loadImage('people.png');

  // 지연 파트 이미지 로드
  Outside = loadImage('seeingOutside.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  noStroke();
  fill(255);
}

function draw() {
  background(200);

  switch (scene) {
    // ────────────────────────────────────────────────────────────────
    // scene 0: 초기 화면 (2초 유지 후 scene 1으로 전환)
    // ────────────────────────────────────────────────────────────────
    case 0:
      if (!hasInitScene0) {
        scene0StartTime = millis();
        hasInitScene0 = true;
      }
      imageMode(CENTER);
      image(initialImg, width / 2, height / 2, width, height);
      if (millis() - scene0StartTime >= 2000) {
        scene = 1;
      }
      break;

    // ────────────────────────────────────────────────────────────────
    // scene 1: 지유(황지유) 파트 (댓글 입력 + 대거 애니메이션)
    // ────────────────────────────────────────────────────────────────
    case 1:
      if (!hasInitScene1) {
        initScene1();
        hasInitScene1 = true;
      }
      drawScene1();
      break;

    // ────────────────────────────────────────────────────────────────
    // scene 2: 시원(오시원) 파트 – 손가락 애니메이션
    // ────────────────────────────────────────────────────────────────
    case 2:
      if (!hasInitScene2) {
        initScene2();
        hasInitScene2 = true;
      }
      drawScene2();
      if (frameCount - fadeStartFrame > 300) {
        scene = 3;
      }
      break;

    // ────────────────────────────────────────────────────────────────
    // scene 3: 시원(오시원) 파트 – 추락 애니메이션 → 2초 후 scene 4 전환
    // ────────────────────────────────────────────────────────────────
    case 3:
      if (scene3StartTime === null) {
        scene3StartTime = millis();
      }
      drawScene3();
      if (millis() - scene3StartTime >= 2000) {
        scene = 4;
      }
      break;

    // ────────────────────────────────────────────────────────────────
    // scene 4: 지연(신지연) 파트 – 컴퓨터 화면 + hate messages
    // ────────────────────────────────────────────────────────────────
    case 4:
      if (!hasInitScene4) {
        initScene4();
        hasInitScene4 = true;
      }
      drawScene4();
      break;

    // ────────────────────────────────────────────────────────────────
    // scene 5: 지연(신지연) 파트 – 밖 보기
    // ────────────────────────────────────────────────────────────────
    case 5:
      if (!hasInitScene5) {
        hasInitScene5 = true;
      }
      drawScene5();
      break;

    // ────────────────────────────────────────────────────────────────
    // scene 6: 최종 화면 (이미지 고정)
    // ────────────────────────────────────────────────────────────────
    case 6:
      if (!hasInitScene6) {
        hasInitScene6 = true;
      }
      imageMode(CENTER);
      image(finalImg, width / 2, height / 2, width, height);
      break;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// initScene1(): 지유 파트 초기화 (댓글 입력창 생성 등)
// ────────────────────────────────────────────────────────────────────────────
function initScene1() {
  keyboardY = height + 100;

  inputBox = createInput();
  inputBox.position(220, height - 140);
  inputBox.size(400, 30);
  inputBox.attribute('placeholder', '댓글을 입력하세요...');
  inputBox.style('font-size', '16px');
  inputBox.style('padding', '5px');
  inputBox.style('border-radius', '5px');
  inputBox.style('border', '1px solid #ccc');

  inputBox.input(() => {
    inputComment = inputBox.value();
  });

  inputBox.elt.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !daggerAnimating) {
      if (inputComment.trim() !== "") {
        typedComments.push(inputComment);
        inputBox.value('');
        inputComment = '';

        if (typedComments.length === 1) {
          state = "stab";
          spawnSingleDagger();
          inputBox.hide();
          daggerAnimating = true;
          waitingForClick = false;
        }
        else if (typedComments.length === 4) {
          state = "stab";
          spawnMultipleDaggers();
          inputBox.hide();
          daggerAnimating = true;
          waitingForClick = false;
          staggerTimer = millis();
          staggerIndex = 0;
        }
      }
    }
  });
}

// ────────────────────────────────────────────────────────────────────────────
// drawScene1(): 지유 파트 그리기
// ────────────────────────────────────────────────────────────────────────────
function drawScene1() {
  if (state === "typing") {
    drawPCScreen();
    animateKeyboard();
    drawDaggers();

    if (typedComments.length === 1) {
      fill(255, 0, 0);
      textSize(16);
      textStyle(BOLD);
      text('뉴스 속보: “악플로 정신과 치료 중…”', 220, 350);
    }

  } else if (state === "stab") {
    drawGirl();
    drawDaggers();

    if (typedComments.length === 4) {
      updateSequentialDaggers();
    }

    if (
      daggerAnimating &&
      daggers.length > 0 &&
      daggers.every(d => d.hit)
    ) {
      daggerAnimating = false;
      waitingForClick = true;
    }

    // 대거 4개 모두 멈추면 scene 2로 전환
    if (
      !daggerAnimating &&
      typedComments.length === 4 &&
      daggers.length === 4 &&
      daggers.every(d => d.hit)
    ) {
      scene = 2;
      return;
    }

    let alpha = map(daggers.length, 1, 5, 0, 150, true);
    fill(0, 0, 0, alpha);
    noStroke();
    rect(0, 0, width, height);
  }
}

function mousePressed() {
  // 댓글 1개일 때 대거 멈춘 상태 → 댓글 입력창 복귀
  if (
    scene === 1 &&
    state === "stab" &&
    waitingForClick &&
    !daggerAnimating &&
    typedComments.length === 1 &&
    daggers.length === 1 &&
    daggers[0].hit
  ) {
    state = "typing";
    inputBox.show();
    keyboardY = height + 100;
    daggers = [];
    waitingForClick = false;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// drawPCScreen(), drawComputer(), drawCommentSection(), drawTypedComments(),
// animateKeyboard(), drawGirl(), spawnSingleDagger(), spawnMultipleDaggers(),
// updateSequentialDaggers(), drawDaggers() 등은 기존 지유 파트와 동일
// ────────────────────────────────────────────────────────────────────────────
function drawPCScreen() {
  drawComputer();
  drawCommentSection();
  drawTypedComments();
}

function drawComputer() {
  fill(40);
  rect(200, 100, 400, 300, 10);
  fill(250);
  rect(220, 120, 360, 260);
}

function drawCommentSection() {
  fill(240);
  rect(230, 130, 340, 240, 5);
  fill(0);
  textSize(20);
  textStyle(BOLD);
  text('Comments', 240, 160);
}

function drawTypedComments() {
  textSize(14);
  textStyle(NORMAL);
  fill(50);
  for (let i = 0; i < typedComments.length; i++) {
    fill(180);
    ellipse(250, 190 + i * 40, 20, 20);
    fill(50);
    text(typedComments[i], 275, 195 + i * 40);
  }
}

function animateKeyboard() {
  if (keyboardY > height - 100) {
    keyboardY -= 4;
  }
  fill(60);
  rect(200, keyboardY, 560, 100, 10);
}

function drawGirl() {
  background(200);
  imageMode(CENTER);
  image(girlImg, width / 2, height / 2 + 50, 500, 600);
}

function spawnSingleDagger() {
  let startX = width + 100;
  let startY = -100;
  let targetX = width / 2 + 150;
  let targetY = height / 2 + 80;
  let dx = targetX - startX;
  let dy = targetY - startY;
  let distVal = sqrt(dx * dx + dy * dy);

  daggers = [];
  daggers.push({
    x: startX,
    y: startY,
    dx: dx / distVal * 8,
    dy: dy / distVal * 8,
    targetX: targetX,
    targetY: targetY,
    hit: false
  });
}

function spawnMultipleDaggers() {
  daggers = [];
  for (let i = 0; i < 4; i++) {
    let startX = width + 100;
    let startY = -100;
    let targetX = width / 2 + random(-20, 20);
    let targetY = height / 2 + random(-20, 20);
    let dx = targetX - startX;
    let dy = targetY - startY;
    let distVal = sqrt(dx * dx + dy * dy);

    daggers.push({
      x: startX,
      y: startY,
      dx: dx / distVal * 8,
      dy: dy / distVal * 8,
      targetX: targetX,
      targetY: targetY,
      hit: false,
      delay: i * 300
    });
  }
  staggerTimer = millis();
  staggerIndex = 0;
}

function updateSequentialDaggers() {
  let now = millis();
  if (staggerIndex < daggers.length) {
    let d = daggers[staggerIndex];
    if (now - staggerTimer > d.delay) {
      staggerIndex++;
    }
  }
}

function drawDaggers() {
  for (let i = 0; i < daggers.length; i++) {
    let d = daggers[i];
    if (!d.hit && typedComments.length === 4 && i >= staggerIndex) {
      continue;
    }
    if (!d.hit) {
      d.x += d.dx;
      d.y += d.dy;
      if (dist(d.x, d.y, d.targetX, d.targetY) < 10) {
        d.hit = true;
        d.x = d.targetX;
        d.y = d.targetY;
      }
    }
    imageMode(CENTER);
    image(daggerImg, d.x, d.y, 80, 80);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// initScene2(): 시원 파트 초기화 (HandPose 세팅 등)
// ────────────────────────────────────────────────────────────────────────────
function initScene2() {
  setupHandAnimation(img, width, height, numFingers);

  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  handPose = ml5.handpose(video, () => {
    console.log('HandPose 모델 로드 완료');
  });
  handPose.on('predict', (results) => {
    hands = results;
    updateHandAnimation(hands);
  });

  fadeStartFrame = frameCount;

  dripHeights = [];
  for (let x = 0; x < width; x += 10) {
    dripHeights.push(0);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// drawScene2(): 시원 파트 손가락 애니메이션 그리기
// ────────────────────────────────────────────────────────────────────────────
function drawScene2() {
  drawFirstScene();
}

// ────────────────────────────────────────────────────────────────────────────
// drawScene3(): 시원 파트 추락 애니메이션 그리기
// ────────────────────────────────────────────────────────────────────────────
function drawScene3() {
  drawSecondScene();
}

// ────────────────────────────────────────────────────────────────────────────
// initScene4(): 지연(신지연) 파트 초기화 (hate message 입력창 등)
// ────────────────────────────────────────────────────────────────────────────
function initScene4() {
  inputH = createInput();
  inputH.position(20, 20);
  inputH.size(300);
  inputH.attribute('placeholder', '여기에 악플을 입력 후 Enter');

  inputH.elt.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      let msg = inputH.value().trim();
      if (msg !== '') {
        hateMessagePopUp(msg);
        inputH.value('');
      }
    }
  });
}

// ────────────────────────────────────────────────────────────────────────────
// drawScene4(): 지연(신지연) 파트 – 컴퓨터 화면 + hate messages
// ────────────────────────────────────────────────────────────────────────────
function drawScene4() {
  background(155);

  // 컴퓨터 그리기
  fill(50);
  ellipse(windowWidth / 2, windowHeight / 2 + 400, 900, 70);
  rect(windowWidth / 2, windowHeight / 2 + 300, 100, 200);
  rect(windowWidth / 2, windowHeight / 2 - 50, 1100, 700);
  fill(240);
  rect(windowWidth / 2, windowHeight / 2 - 50, 1000, 600);

  // 버튼
  fill(200);
  noStroke();
  ellipse(50, windowHeight / 2, 50, 50);

  drawHateMessages();
}

// ────────────────────────────────────────────────────────────────────────────
// drawScene5(): 지연(신지연) 파트 – 밖 보기
// ────────────────────────────────────────────────────────────────────────────
function drawScene5() {
  image(Outside, 0, 0, windowWidth, windowHeight);
  noStroke();
  fill(200);
  ellipse(windowWidth - 50, windowHeight / 2, 50, 50);
  fill(105);
  triangle(
    windowWidth - 40, windowHeight / 2,
    windowWidth - 60, windowHeight / 2 - 10,
    windowWidth - 60, windowHeight / 2 + 10
  );
}

// ────────────────────────────────────────────────────────────────────────────
// hateMessagePopUp/ hateReplyPopup/ drawHateMessages/ redScreen 함수들
// ────────────────────────────────────────────────────────────────────────────
function hateMessagePopUp(msg) {
  let rx = random(100, windowWidth - 100);
  let ry = random(150, windowHeight - 150);

  let msgObj = { text: msg, x: rx, y: ry, timeCreated: millis() };
  messages.push(msgObj);

  hateReplyPopup(msgObj);
}

function hateReplyPopup(parentMsgObj) {
  let exampleReplies = [
    '너나 잘하라고!',
    'ㅋㅋ 너부터 반성해라',
    '그딴 식상한 말 하지 마!'
  ];
  let spacingY = 30;

  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      let replyObj = {
        text: exampleReplies[i % exampleReplies.length],
        x: parentMsgObj.x,
        y: parentMsgObj.y + spacingY * (i + 1),
        timeCreated: millis(),
        flashStart: millis()
      };
      replies.push(replyObj);
    }, 750 * (i + 1));
  }
}

function drawHateMessages() {
  for (let obj of messages) {
    fill(255, 200, 0);
    textSize(20);
    text(obj.text, obj.x, obj.y);
  }
  for (let obj of replies) {
    fill(255, 100, 100);
    textSize(18);
    text(obj.text, obj.x, obj.y);
  }
  redScreen();
}

function redScreen() {
  let now = millis();
  for (let obj of replies) {
    if (now - obj.flashStart <= 300) {
      let alpha = map(now - obj.flashStart, 0, 300, 150, 0);
      push();
      rectMode(CORNER);
      noStroke();
      fill(255, 0, 0, alpha);
      rect(0, 0, width, height);
      pop();
      break;
    }
  }
}

// ────────────────────────────────────────────────────────────────────────────
// 시원 파트: 손가락 애니메이션 함수들
// ────────────────────────────────────────────────────────────────────────────
function drawFirstScene() {
  image(bgImg, 0, 0, width, height);
  if (fadeStartFrame !== null && frameCount - fadeStartFrame <= 300) {
    let progress = (frameCount - fadeStartFrame) / 300;
    peoAlpha = lerp(255, 0, progress);
  } else if (frameCount - fadeStartFrame > 300) {
    peoAlpha = 0;
  }
  push();
  tint(255, peoAlpha);
  image(peoImg, 160, 130, 350, 350);
  pop();
  drawHandAnimation(hands);
}

function setupHandAnimation(handImg, canvasWidth, canvasHeight, fingerCount = 10) {
  img = handImg;
  centerX = windowWidth / 2;
  centerY = windowHeight / 2;
  numFingers = fingerCount;
  fingers = [];
  fingerAnimationProgress = 0;
  fingerAnimationActive = false;
}

function updateHandAnimation(hands) {
  if (
    hands.length > 0 &&
    hands[0].annotations &&
    hands[0].annotations.indexFinger &&
    hands[0].annotations.indexFinger.length > 0
  ) {
    if (!fingerAnimationActive) {
      startFingerAnimation();
    }
  } else {
    stopFingerAnimation();
  }

  if (fingerAnimationActive) {
    fingerAnimationProgress += 0.3;
    if (fingerAnimationProgress > 1) fingerAnimationProgress = 1;

    for (let f of fingers) {
      f.x = lerp(f.startX, f.targetX, fingerAnimationProgress);
      f.y = lerp(f.startY, f.targetY, fingerAnimationProgress);
    }
  }
}

function startFingerAnimation() {
  fingerAnimationActive = true;
  fingerAnimationProgress = 0;
  fingers = [];

  let radiusX = width * 0.5;
  let radiusY = height * 0.45;
  let spacing = 80;

  for (let i = 0; i < numFingers; i++) {
    let angle = map(i, 0, numFingers, 0, TWO_PI);
    let targetX = centerX + cos(angle) * radiusX;
    let targetY = centerY + sin(angle) * radiusY;

    let startX, startY;
    if (i === 0) {
      startX = targetX;
      startY = height + random(150, 250);
    } else if (i >= 1 && i <= 3) {
      startX = -random(150, 250);
      startY = centerY + (i - 2) * spacing;
    } else if (i >= 4 && i <= 6) {
      startX = width + random(150, 250);
      startY = centerY + (i - 5) * spacing;
    } else {
      startX = centerX + (i - 8) * spacing;
      startY = -random(150, 250);
    }

    fingers.push({
      angle, startX, startY, targetX, targetY,
      x: startX, y: startY,
      size: 60, progress: 0
    });
  }
}

function stopFingerAnimation() {
  fingerAnimationActive = false;
  fingerAnimationProgress = 0;
  fingers = [];
}

function drawHandAnimation(hands) {
  if (
    hands.length > 0 &&
    hands[0].annotations &&
    hands[0].annotations.indexFinger &&
    hands[0].annotations.indexFinger.length > 0
  ) {
    let tip = hands[0].annotations.indexFinger[3];
    fill(0, 255, 0);
    noStroke();
    ellipse(tip[0], tip[1], 30, 30);
  }

  if (fingerAnimationActive) {
    for (let f of fingers) {
      let dx = centerX - f.x;
      let dy = centerY - f.y;
      let angleToCenter = atan2(dy, dx);

      push();
      translate(f.x, f.y);
      rotate(angleToCenter + HALF_PI);
      imageMode(CENTER);
      image(img, 0, 0, 500, 700);
      pop();
    }
  }
}

function drawSecondScene() {
  drawGradientBackground();
  drawWindowGrid();
  updateFallingPerson();
}

function updateFallingPerson() {
  drawFallingSilhouette(width / 2, personY, 1.3);

  if (isFalling) {
    personY += 30;
    if (personY >= height + 100) {
      isFalling = false;
      showBlood = true;
    }
  }
}

function drawGradientBackground() {
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(color(85, 91, 158), color(28, 21, 74), inter);
    stroke(c);
    line(0, y, width, y);
  }
}

function drawWindowGrid() {
  for (let w = 0; w < width; w += width / 3) {
    noStroke();
    fill(0, 0, 0, 230);
    rect(w, 0, 50, height);
  }
  for (let h = 0; h < height; h += height / 3) {
    fill(0, 0, 0, 230);
    rect(0, h, width, 50);
  }
}

function drawFallingSilhouette(x, y, scaleFactor = 1) {
  push();
  translate(x, y);
  scale(scaleFactor);
  rotate(PI / 4);
  noStroke();
  fill(0);
  drawHead();
  drawBody();
  drawLimbs();
  pop();
}

function drawHead() {
  ellipse(-10, -50, 20, 20);
}

function drawBody() {
  beginShape();
  vertex(-25, -40);
  vertex(-35, 10);
  vertex(5, 10);
  vertex(15, -40);
  endShape(CLOSE);
}

function drawLimbs() {
  beginShape();
  vertex(-25, -30);
  vertex(-50, -70);
  vertex(-45, -75);
  vertex(-20, -35);
  endShape(CLOSE);

  beginShape();
  vertex(5, -30);
  vertex(30, -70);
  vertex(25, -75);
  vertex(0, -35);
  endShape(CLOSE);

  beginShape();
  vertex(-30, 10);
  vertex(-50, 40);
  vertex(-40, 45);
  vertex(-20, 15);
  endShape(CLOSE);

  beginShape();
  vertex(0, 10);
  vertex(20, 40);
  vertex(10, 45);
  vertex(-5, 15);
  endShape(CLOSE);
}

function keyPressed() {
  if (key === 'F') {
    fullscreen(!fullscreen());
  }
  if (key === 'E'){
    imageMode(CENTER);
    image(finalImg, width / 2, height / 2, width, height);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
