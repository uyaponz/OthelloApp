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
    }

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
                            // TODO とりあえず黒を置いている
                            field[x][y] = BLACK;
                            drawField();
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
