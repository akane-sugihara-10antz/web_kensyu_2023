
//落下サイクル(小さい方が速い)
const SPEED = 500;
//ブロック1マスの大きさ
const BLOCK_SIZE = 32;
//ボードサイズ
const BOARD_ROW = 20;
const BOARD_COL = 10;
const TITLE_DIV_ID= $('#title').get(0)
const MAIN_DIV_ID= $('#sponer').get(0)
//キャンバスの取得
const CANVAS_ID = $('#canvas').get(0);
const CANVAS2_ID= $('#canvas2').get(0);
//2dコンテキストを取得/pages/copypage.action
const CONTEXT = CANVAS_ID.getContext('2d');
const CONTEXT2 = CANVAS2_ID.getContext('2d');
//キャンバスサイズ
const CANVAS_W = BLOCK_SIZE * BOARD_COL;
const CANVAS_H = BLOCK_SIZE * BOARD_ROW;

CANVAS_ID.width = CANVAS_W;
CANVAS_ID.height = CANVAS_H;
//コンテナの設定
const CONTAINER = document.getElementById('container');
CONTAINER.style.width = CANVAS_ID.width + 'px';
//tetの1辺の大きさ
const TET_SIZE = 4;

const CANVAS2_W = BLOCK_SIZE * (TET_SIZE+2);
const CANVAS2_H = BLOCK_SIZE * (TET_SIZE+1);

const BGM_ID=$('#bgm').get(0);
const SE_RESPORN_ID=$('#respan').get(0);
const SE_ONE_LINE_ID=$('#one_line').get(0);

//テトリミノの種類
const TET_TYPES = [
  [],
  [
    [0, 0, 0, 0],
    [0, 1, 1, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
  ],
  [
    [0, 0, 0, 0],
    [0, 1, 0, 0],
    [1, 1, 1, 0],
    [0, 0, 0, 0],
  ],
  [
    [0, 0, 0, 0],
    [1, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
  ],
  [
    [0, 0, 0, 0],
    [0, 1, 1, 0],
    [1, 1, 0, 0],
    [0, 0, 0, 0],
  ],
  [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  [
    [0, 0, 0, 0],
    [1, 1, 1, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 0],
  ],
  [
    [0, 0, 0, 0],
    [0, 0, 1, 0],
    [1, 1, 1, 0],
    [0, 0, 0, 0],
  ],
];
//テトリミノの色
const TET_COLORS = [
    '',
    '#f6fe85',
    '#07e0e7',
    '#7ced77',
    '#f78ff0',
    '#f94246',
    '#9693fe',
    '#f2b907',
];
const MINO_KIND=7;
//テトリミノのindex
let tetIndex=0;
//選択されたtet
let tet=0;
//テトリミノのオフセット量(何マス分ずれているか)
let offsetX = 0;
let offsetY = 0;

let nextTet=[0,0,0,0,0,0,0];
let nextTet2=[0,0,0,0,0,0,0];
let nextTetIndex=0;
let delTetLine=0;
//ボード本体
const board = [];
//タイマーID
let timerId = NaN;

//ゲームオーバーフラグ
let isGameOver =false;
//ゲームスタートフラグ
let isGameStart=false;

//描画処理
const Draw = () => {
    if(!isGameStart)
    {
      return;
    }
    //塗りに黒を設定
    CONTEXT.fillStyle = '#000';
    //キャンバスを塗りつぶす
    CONTEXT.fillRect(0, 0, CANVAS_W, CANVAS_H);

    //ボードに存在しているブロックを塗る
    for (let y = 0; y < BOARD_ROW; y++)
    {
      for (let x = 0; x < BOARD_COL; x++)
      {
        if (board[y][x])
        {
          DrawBlock(x, y,board[y][x]);
        }
      }
    }

    //テトリミノの描画
    for (let y = 0; y < TET_SIZE; y++)
    {
      for (let x = 0; x < TET_SIZE; x++)
      {
        if (tet[y][x]) {
          DrawBlock(offsetX + x, offsetY + y,tetIndex);
        }
      }
    }
    if (isGameOver)
    {
      let s = 'GAME OVER';
      CONTEXT.font = "40px 'MS ゴシック'";
      let w = CONTEXT.measureText(s).width;
      let x = CANVAS_W / 2 - w / 2;
      let y = CANVAS_H / 2 - 20;
      CONTEXT.fillStyle = 'white';
      CONTEXT.fillText(s, x, y);
      s ="消したライン数";
      w = CONTEXT.measureText(s).width;
      x = CANVAS_W / 2 - w / 2
      y = CANVAS_H / 2+20;
      CONTEXT.fillText(s, x, y);
      s = delTetLine;
      w = CONTEXT.measureText(s).width;
      x = CANVAS_W / 2 - w / 2
      y = CANVAS_H / 2 + 60;
      CONTEXT.fillText(s, x, y);
    }
    DrawNextBlock();
};

//ブロック一つを描画する
const DrawBlock = (x, y,tet_idx) => {
  let px = x * BLOCK_SIZE;
  let py = y * BLOCK_SIZE;
  //塗りを設定
  CONTEXT.fillStyle = TET_COLORS[tet_idx];
  CONTEXT.fillRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
  //線を設定
  CONTEXT.strokeStyle = '';
  //線を描画
  CONTEXT.strokeRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
};


const DrawNextBlock = () =>{
    //塗りに黒を設定
    CONTEXT2.fillStyle = '#000';
    //キャンバスを塗りつぶす
    CONTEXT2.fillRect(0, 0, CANVAS2_W, CANVAS2_H);

    let drawTetIndex=-1;
    if(nextTetIndex+1 < MINO_KIND)
    {
      drawTetIndex=nextTet[nextTetIndex+1];
    }
    else{
      drawTetIndex=nextTet2[0];
    }
    //テトリミノの描画
    for (let y = 0; y < TET_SIZE; y++)
    {
      for (let x = 0; x < TET_SIZE; x++)
      {
        if (TET_TYPES[drawTetIndex][y][x])
        {
          let px = x * BLOCK_SIZE+BLOCK_SIZE;
          let py = y * BLOCK_SIZE;
          //塗りを設定
          CONTEXT2.fillStyle = TET_COLORS[drawTetIndex];
          CONTEXT2.fillRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
          //線を設定
          CONTEXT2.strokeStyle = 'black';
          //線を描画
          CONTEXT2.strokeRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
        }
      }
    }
 }

//指定された方向に移動できるか？(x移動量,y移動量,対象tet)
const CanMove = (dx, dy, nowTet = tet) => {
  for (let y = 0; y < TET_SIZE; y++)
  {
    for (let x = 0; x < TET_SIZE; x++)
    {
      //その場所にブロックがあれば
      if (nowTet[y][x])
      {
        //ボード座標に変換（offsetX(-2~8)+x(0~3)+移動量(-1~1)
        let nx = offsetX + x + dx;
        let ny = offsetY + y + dy;
        //調査する座標がボード外だったらできない・移動したいボード上の場所にすでに存在してたらできない
        if (ny < 0 ||nx < 0 ||ny >= BOARD_ROW ||nx >= BOARD_COL ||board[ny][nx])
        {
          //移動できない
          return false;
        }
      }
    }
  }
  //移動できる
  return true;
};
//回転
const CreateRotateTet = () => {
  //新しいtetを作る
  let newTet = [];
  for (let y = 0; y < TET_SIZE; y++)
  {
    newTet[y] = [];
    for (let x = 0; x < TET_SIZE; x++)
    {
      //時計回りに90度回転させる
      newTet[y][x] = tet[TET_SIZE - 1 - x][y];
    }
  }
  return newTet;
};

document.onkeydown = (e) => {
  if (isGameOver) return;
  switch (e.key)
  {
    case 'ArrowLeft': //左
      if (CanMove(-1, 0))
      {
        offsetX--;
      }
      break;

    case 'ArrowRight': //右
      if (CanMove(1, 0))
      {
        offsetX++;
      }
      break;

    case 'ArrowDown': //下
      if (CanMove(0, 1))
      {
        offsetY++;
      }
      break;

    case " ": //space
    if(isGameOver)
    {
      TITLE_DIV_ID.style.visibility="visibility";
      MAIN_DIV_ID.style.visibility="hidden";
      isGameOver=false;
      isGameStart=false;
      break;
    }
    if(!isGameStart)
      {
        isGameStart=true;
        Init();
        break;
      }

      let newTet = CreateRotateTet();
      if (CanMove(0, 0, newTet))
      {
        tet = newTet;
      }
      break;
  }
  Draw();
};

//動きが止まったtetをボード座標に書き写す
const FixTet = () => {
  for (let y = 0; y < TET_SIZE; y++)
  {
    for (let x = 0; x < TET_SIZE; x++)
    {
      if (tet[y][x])
      {
        //ボードに書き込む
        board[offsetY + y][offsetX + x] = tetIndex;
      }
    }
  }
};
const ClearLine = () => {
  let delLine=0;
  //ボードの行を上から調査
  for (let y = 0; y < BOARD_ROW; y++)
  {
    //一列揃ってると仮定する
    let isLineOK = true;
    //列に-1が入っていないか調査
    for (let x = 0; x < BOARD_COL; x++)
    {
      if (board[y][x]===0)
      {
        isLineOK = false;
        break;
      }
    }
    if (isLineOK)
    {
      //その行から上に向かってfor文を動かす
      for (let ny = y; ny > 0; ny--)
      {
        for (let nx = 0; nx < BOARD_COL; nx++)
        {
          //一列上の情報をコピーする
          board[ny][nx] = board[ny - 1][nx];
        }
      }
      delTetLine++;
      delLine++;
    }
  }
  if(delLine>0)
  {
    SE_ONE_LINE_ID.play();
  }
};


//繰り返し行われる落下処理
const DropTet = () => {
  if (isGameOver) return;
  if(!isGameStart)return;
  //下に行けたら
  if (CanMove(0, 1)) {
    //下に行く
    offsetY++;
  }
  else
  {
    NextTetSpane();
  }

  Draw();
};

const NextTetSpane=() => {
    //行けなかったら固定する
    FixTet();
    //揃ったラインがあったら消す
    ClearLine();
    nextTetIndex++;
    //抽選
    RandomIdx();
    tetIndex=nextTet[nextTetIndex];
    tet = TET_TYPES[tetIndex];
    //初期位置に戻す
    InitStartPos();
    //次のtetを出せなかったらGameOver
    if (!CanMove(0, 0)) {
      isGameOver = true;
      clearInterval(timerId);
    }
    SE_RESPORN_ID.play();
}


const InitStartPos = () => {
  offsetX = BOARD_COL / 2 - TET_SIZE / 2;
  offsetY = 0;
};

//テトリミノのindexを抽選
const RandomIdx = () => {
  if(nextTetIndex < MINO_KIND)return;
  for (let i = 0; i < nextTet.length; i++) {
    nextTet[i]=nextTet2[i];
  }
  ArrayShuffle(nextTet2);
  nextTetIndex=0;
};

//出てくるミノをシャフルする
function ArrayShuffle(array) {
  for(let i = (nextTet.length - 1); 0 < i; i--){

    // 0〜(i+1)の範囲で値を取得
    let r = Math.floor(Math.random() * (i + 1));

    // 要素の並び替えを実行
    let tmp = array[i];
    array[i] = array[r];
    array[r] = tmp;
  }
  return array;
}


//初期化処理
const Init = () => {

   TITLE_DIV_ID.style.visibility="hidden";
   MAIN_DIV_ID.style.visibility="visible";

   BGM_ID.loop=true;
   BGM_ID.play();
   //ボード(20*10を0埋め)
   for (let y = 0; y < BOARD_ROW; y++)
   {
      board[y] = [];
      for (let x = 0; x < BOARD_COL; x++)
      {
        board[y][x] = 0;
      }
   }
   for (let i = 1; i < TET_TYPES.length; i++)
   {
      nextTet[i-1] = i;
      nextTet2[i-1]=i;
   }
   delTetLine=0;
   //最初のテトリミノを抽選
   nextTetIndex=8;
   ArrayShuffle(nextTet2);
   RandomIdx();
   tetIndex=nextTet[nextTetIndex];
   tet = TET_TYPES[tetIndex];
   InitStartPos();

   //繰り返し処理
   timerId=setInterval(DropTet,SPEED);
   Draw();


};


const BgmInit=()=>{
  BGM_ID.loop=true;
  BGM_ID.play();
  Init();
}