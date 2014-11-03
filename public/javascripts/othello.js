(function() {
    //
    // --- 定数 ---
    //
    var BLANK = 0;
    var BLACK = 1;
    var WHITE = 2;
    var FIELD_WIDTH  = 8;
    var FIELD_HEIGHT = 8;
    var PIECE_WIDTH  = 50;
    var PIECE_HEIGHT = 50;

    //
    // --- HTML 要素 ---
    //
    var mainElement;
    var piecePictures;
    var setElements = function() {
        mainElement = document.getElementById("main");
        piecePictures = [
            document.getElementById("blank"),
            document.getElementById("black"),
            document.getElementById("white")
        ];
    };

    //
    // --- ゲーム内で使用するデータ ---
    //
    var field = []; // 盤面（周囲に番兵あり）
    var nowTurn = BLACK; // 現在の番
    var initField = function() {
        // ゼロクリア
        for (var x = 0; x < FIELD_WIDTH + 2; x++) {
            field[x] = [];
            for (var y = 0; y < FIELD_HEIGHT + 2; y++) {
                field[x][y] = BLANK;
            }
        }

        // 初期配置
        var minCenter = ((FIELD_WIDTH  / 2) | 0);
        var maxCenter = ((FIELD_HEIGHT / 2) | 0) + 1;
        field[minCenter][minCenter] = field[maxCenter][maxCenter] = WHITE;
        field[minCenter][maxCenter] = field[maxCenter][minCenter] = BLACK;
    };

    //
    // 子要素をすべて削除する
    //
    var removeChildren = function(element_) {
        while (element_.firstChild) { element_.removeChild(element_.firstChild); }
    };

    //
    // 盤面に石を置く
    //
    var reversePiece = function(x, y, dx, dy, turn, put) {
        if (field[x][y] === turn)  { return true;  }
        if (field[x][y] === BLANK) { return false; }

        var result = reversePiece(x + dx, y + dy, dx, dy, turn, put);
        if (put && result) { field[x][y] = turn; }

        return result;
    };

    //
    // 盤面に石を置く
    // 置けたときは true を返し、置けなかったときは false を返す
    //
    // x, y : 石を置く盤面座標
    // turn : 石の種類（黒 or 白）
    // put  : 実際に石を入れ替えるならtrueにする（デフォルト : false）
    //
    var putPiece = function(x, y, turn, put) {
        put = (typeof put === "undefined") ? false : put;

        // すでに石が置かれているなら false を返す
        if (field[x][y] !== BLANK) { return false; }

        // 置けるかどうかチェックする
        var isReversable = false;
        for (var dx = -1; dx <= 1; dx++) {
            for (var dy = -1; dy <= 1; dy++) {
                if (field[x + dx][y + dy] === (3 - turn)) {
                    var result = reversePiece(x + (dx * 2), y + (dy * 2), dx, dy, turn, put);
                    if (put && result) { field[x + dx][y + dy] = turn; }
                    isReversable |= result;
                }
            }
        }

        if (put && isReversable) { field[x][y] = turn; }

        return isReversable;
    };

    //
    // 盤面を描画する
    //
    var drawField = function() {
        removeChildren(mainElement);

        for (var x = 1; x <= FIELD_WIDTH; x++) {
            for (var y = 1; y <= FIELD_HEIGHT; y++) {
                // 要素をコピーして追加する
                var elem = piecePictures[field[x][y]].cloneNode(true);
                elem.style.left = (x * PIECE_WIDTH  - PIECE_WIDTH)  + "px";
                elem.style.top  = (y * PIECE_HEIGHT - PIECE_HEIGHT) + "px";
                if (field[x][y] === BLANK) { // まだ石が置かれていないなら click イベントを追加する
                    (function(x, y) {
                        elem.onclick = function() {
                            if (putPiece(x, y, nowTurn, true)) {
                                nowTurn = 3 - nowTurn;
                                drawField();
                            }
                        };
                    })(x, y);
                }
                mainElement.appendChild(elem);
            }
        }
    };

    //
    // メイン
    //
    onload = function() {
        setElements();
        initField();
        drawField();
    };
})();
