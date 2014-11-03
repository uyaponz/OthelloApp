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
    var messageElement;
    var piecePictures;
    var setElements = function() {
        mainElement = document.getElementById("main");
        messageElement = document.getElementById("message");
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
    var endGame = false; // ゲームが終了したら true
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
    // 石をひっくり返す
    //
    // x_, y_   : ひっくり返すかどうか判定する対象の盤面座標
    // dx_, dy_ : 走査の進行方向
    // turn_    : 石の種類（黒 or 白）
    // put_     : 実際に石をひっくり返すなら true にする
    //
    var reversePiece = function(x_, y_, dx_, dy_, turn_, put_) {
        if (field[x_][y_] === turn_)  { return true;  }
        if (field[x_][y_] === BLANK) { return false; }

        var result = reversePiece(x_ + dx_, y_ + dy_, dx_, dy_, turn_, put_);
        if (put_ && result) { field[x_][y_] = turn_; }

        return result;
    };

    //
    // 盤面に石を置く
    // 置けたときは true を返し、置けなかったときは false を返す
    //
    // x_, y_ : 石を置く盤面座標
    // turn_  : 石の種類（黒 or 白）
    // put_   : 実際に石を入れ替えるなら true にする（デフォルト : false）
    //
    var putPiece = function(x_, y_, turn_, put_) {
        put_ = (typeof put_ === "undefined") ? false : put_;

        // すでに石が置かれているなら false を返す
        if (field[x_][y_] !== BLANK) { return false; }

        // 置けるかどうかチェックする
        var isReversable = false;
        for (var dx = -1; dx <= 1; dx++) {
            for (var dy = -1; dy <= 1; dy++) {
                if (field[x_ + dx][y_ + dy] === (3 - turn_)) {
                    var result = reversePiece(x_ + (dx * 2), y_ + (dy * 2), dx, dy, turn_, put_);
                    if (put_ && result) { field[x_ + dx][y_ + dy] = turn_; }
                    isReversable |= result;
                }
            }
        }

        if (put_ && isReversable) { field[x_][y_] = turn_; }

        return isReversable;
    };

    //
    // 置ける場所が存在するなら true を返す
    //
    var hasPuttablePos = function(turn_) {
        for (var x = 1; x <= FIELD_WIDTH; x++) {
            for (var y = 1; y <= FIELD_HEIGHT; y++) {
                if (putPiece(x, y, turn_)) { return true; }
            }
        }
        return false;
    };

    //
    // 先攻後攻の交代後の番を返す
    //
    var getChangedTurn = function(nowTurn_) {
        if (hasPuttablePos(3 - nowTurn_)) {
            return 3 - nowTurn_; // 次の番へ
        }

        if (hasPuttablePos(nowTurn_)) {
            return nowTurn_; // パス
        }

        // 両者パス（ゲーム終了）
        return null;
    };

    //
    // メッセージ追加表示
    //
    var addMessage = function(message_) {
        var elem = document.createElement("p");
        elem.innerHTML = message_;
        messageElement.appendChild(elem);
    };

    //
    // 盤面を描画する
    //
    var drawField = function() {
        removeChildren(mainElement);

        // main 要素の幅・高さを更新する
        mainElement.style.width  = PIECE_WIDTH  * FIELD_WIDTH  + "px";
        mainElement.style.height = PIECE_HEIGHT * FIELD_HEIGHT + "px";

        for (var x = 1; x <= FIELD_WIDTH; x++) {
            for (var y = 1; y <= FIELD_HEIGHT; y++) {
                // 要素をコピーして追加する
                var elem = piecePictures[field[x][y]].cloneNode(true);
                elem.style.left = (x * PIECE_WIDTH  - PIECE_WIDTH)  + "px";
                elem.style.top  = (y * PIECE_HEIGHT - PIECE_HEIGHT) + "px";
                if (field[x][y] === BLANK && !endGame) { // まだ石が置かれていないなら click イベントを追加する
                    (function(x, y) {
                        elem.onclick = function() {
                            if (putPiece(x, y, nowTurn, true)) {
                                removeChildren(messageElement);

                                var changedTurn = getChangedTurn(nowTurn);
                                if (changedTurn === null) { // ゲーム終了
                                    endGame = true;
                                    addMessage("ゲーム終了");
                                } else { // 継続
                                    if (nowTurn === changedTurn) {
                                        addMessage("パス！");
                                    }
                                    nowTurn = changedTurn;
                                    addMessage(((nowTurn === BLACK) ? "黒" : "白") + "の番");
                                }
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
        addMessage(((nowTurn === BLACK) ? "黒" : "白") + "の番");
        drawField();
    };
})();
