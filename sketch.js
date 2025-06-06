let video;
let facemesh;
let handpose;
let predictions = [];
let handPredictions = [];
let gesture = "none"; // stone, paper, scissors

function setup() {
  createCanvas(640, 480).position(
    (windowWidth - 640) / 2,
    (windowHeight - 480) / 2
  );
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  facemesh = ml5.facemesh(video, modelReady);
  facemesh.on('predict', results => {
    predictions = results;
  });

  handpose = ml5.handpose(video, handModelReady);
  handpose.on('predict', results => {
    handPredictions = results;
    gesture = detectGesture(handPredictions);
  });
}

function modelReady() {
  // 臉部模型載入完成
}
function handModelReady() {
  // 手部模型載入完成
}

// 手勢偵測（簡易版，僅供參考）
function detectGesture(hands) {
  if (hands.length === 0) return "none";
  const annotations = hands[0].annotations;
  // 取得五指指尖座標
  const tips = [
    annotations.thumb[3],
    annotations.indexFinger[3],
    annotations.middleFinger[3],
    annotations.ringFinger[3],
    annotations.pinky[3]
  ];
  // 計算每指與手腕距離
  const wrist = hands[0].annotations.palmBase[0];
  let extended = tips.map(tip => dist(tip[0], tip[1], wrist[0], wrist[1]) > 60);

  // 石頭：全部收起
  if (extended.filter(e => e).length <= 1) return "stone";
  // 布：全部伸直
  if (extended.filter(e => e).length >= 4) return "paper";
  // 剪刀：只有食指與中指伸直
  if (extended[1] && extended[2] && !extended[0] && !extended[3] && !extended[4]) return "scissors";
  return "none";
}

function draw() {
  image(video, 0, 0, width, height);

  if (predictions.length > 0) {
    const keypoints = predictions[0].scaledMesh;
    let x, y;

    // 根據手勢決定圓圈位置
    if (gesture === "stone") {
      // 額頭（第10點）
      [x, y] = keypoints[10];
    } else if (gesture === "paper") {
      // 左右眼睛（第33與263點的中點）
      const [x1, y1] = keypoints[33];
      const [x2, y2] = keypoints[263];
      x = (x1 + x2) / 2;
      y = (y1 + y2) / 2;
    } else if (gesture === "scissors") {
      // 左右臉頰（第234與454點的中點）
      const [x1, y1] = keypoints[234];
      const [x2, y2] = keypoints[454];
      x = (x1 + x2) / 2;
      y = (y1 + y2) / 2;
    } else {
      // 預設額頭
      [x, y] = keypoints[10];
    }

    noFill();
    stroke(255, 0, 0);
    strokeWeight(4);
    ellipse(x, y, 100, 100);

    // 顯示手勢文字
    fill(0, 200, 0);
    noStroke();
    textSize(32);
    textAlign(LEFT, TOP);
    text("手勢: " + gesture, 10, 10);
  }
}
