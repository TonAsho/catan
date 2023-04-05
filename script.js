// 木 * 4      0
// 石 * 3      1
// レンガ * 3   2
// 羊  * 4     3
// 畑  * 4     4
// 荒地 * 1    5
const plate_types_back = ["lightgreen", "gray", "brown", "pink", "yellow", "black"];

// 2 * 1
// 3 * 2
// 4 * 2
// 5 * 2
// 6 * 2
// 7 * 1 (盗賊)
// 8 * 2
// 9 * 2
// 10 * 2
// 11 * 2
// 12 * 1

// 見りゃ分かる
const board_id = [
    [0, 1, 2],
    [3, 4, 5, 6],
    [7, 8, 9, 10, 11],
    [12, 13, 14, 15],
    [16, 17, 18]
];
// 見りゃ分かる
const komas_classname = [
    ["s_top_right","s_right","s_bottom_right","s_bottom_left","s_left","s_top_left"],
    ["h_top","h_top_right","h_bottom_right","h_bottom","h_bottom_left","h_top_left"],
]
// 見りゃ分かる
const player_color = ["blue", "red", "purple", "yellow"];
const player_color_css = ["rgb(0,41,78) linear-gradient(0deg, rgba(0,41,78,1) 0%, rgba(0,174,252,1) 100%)","rgb(94,4,4) linear-gradient(0deg, rgba(94,4,4,1) 0%, rgba(240,13,13,1) 100%)","rgb(29,0,57) linear-gradient(0deg, rgba(29,0,57,1) 0%, rgba(146,13,240,1) 100%)","rgb(250,255,23) linear-gradient(90deg, rgba(250,255,23,1) 0%, rgba(155,200,89,1) 100%)"]



// idの回り５コのidを配列で返す
function get_around(id) {
    let res = [];
    let h, w;
    for(let i = 0; i < 5; ++i) for(let j = 0; j < board_id[i].length; ++j) {
        if(board_id[i][j] == id) {
            h = i, w = j;
            i = 10000;
            break;
        }
    }
    if(w - 1 >= 0) res.push(id - 1);
    if(w + 1 < board_id[h].length) res.push(id + 1);
    // up
    if(h - 1 >= 0) {
        if(board_id[h - 1].length > w) res.push(board_id[h - 1][w]);
        if(h <= 2) {
            if(board_id[h - 1].length > w - 1 && w - 1 >= 0) res.push(board_id[h - 1][w - 1]);
        } else {
            if(board_id[h - 1].length > w + 1 && w + 1 >= 0) res.push(board_id[h - 1][w + 1]);
        }
    }
    // bottom
    if(h + 1 <= 4) {
        if(board_id[h + 1].length > w) res.push(board_id[h + 1][w]);
        if(h >= 2) {
            if(board_id[h + 1].length > w - 1 && w - 1 >= 0) res.push(board_id[h + 1][w - 1]);
        } else {
            if(board_id[h + 1].length > w + 1 && w + 1 >= 0) res.push(board_id[h + 1][w + 1]);
        }
    }
    return res;
}
// i番目のjに置いたときに接するもう一方のやからを配列で返す
function get_other_s(h,w) {
    let i, j;
    for(let ii = 0; ii < 5; ++ii) for(let jj = 0; jj < board_id[ii].length; ++jj) {
        if(board_id[ii][jj] == h) {
            i = ii;
            j = jj;
        }
    }
    if(w==0) {
        if(i<=2&&i-1>=0&&j<board_id[i-1].length) return [board_id[i-1][j], 3];
        else if(i>2&&i-1>=0&&j-1<board_id[i-1].length&&j-1>=0) return [board_id[i-1][j-1], 3];
    } 
    else if(w==1) {
        if(j+1<board_id[i].length) return [board_id[i][j+1], 4];
    } 
    else if(w==2) {
        if(i+1<=4) {
            if(i<2&&j+1<board_id[i+1].length) return [board_id[i+1][j+1], 5];
            else if(j<board_id[i+1].length)return [board_id[i+1][j], 5];
        }
    } 
    else if(w==3) {
        if(i+1<=4) {
            if(i>=2&&j-1>=0&&j-1<board_id[i+1].length) return [board_id[i+1][j-1], 0];
            else if(j<board_id[i+1].length)return [board_id[i+1][j], 0];
        }
    } 
    else if(w==4) {
        if(j-1>=0) return [board_id[i][j-1], 1];
    } 
    else if(w==5) {
        if(i>2&&i-1>=0&&j<board_id[i-1].length) return [board_id[i-1][j], 2];
        else if(i<=2&&i-1>=0&&j-1<board_id[i-1].length&&j-1>=0) return [board_id[i-1][j-1], 2];
    }
    return [];
}
function get_other_h_calc(h,w) {
    let i, j;
    for(let ii = 0; ii < 5; ++ii) for(let jj = 0; jj < board_id[ii].length; ++jj) {
        if(board_id[ii][jj] == h) {
            i = ii;
            j = jj;
        }
    }
    if(w==0) {
        if(i<=2&&i-1>=0&&j<board_id[i-1].length) return [board_id[i-1][j], 3];
        else if(i>2&&i-1>=0&&j-1<board_id[i-1].length&&j-1>=0) return [board_id[i-1][j-1], 3];
    } 
    else if(w==1) {
        if(j+1<board_id[i].length) return [board_id[i][j+1], 4];
    } 
    else if(w==2) {
        if(i+1<=4) {
            if(i<2&&j+1<board_id[i+1].length) return [board_id[i+1][j+1], 5];
            else if(j<board_id[i+1].length)return [board_id[i+1][j], 5];
        }
    } 
    else if(w==3) {
        if(i+1<=4) {
            if(i>=2&&j-1>=0&&j-1<board_id[i+1].length) return [board_id[i+1][j-1], 0];
            else if(j<board_id[i+1].length)return [board_id[i+1][j], 0];
        }
    } 
    else if(w==4) {
        if(j-1>=0) return [board_id[i][j-1], 1];
    } 
    else if(w==5) {
        if(i>2&&i-1>=0&&j<board_id[i-1].length) return [board_id[i-1][j], 2];
        else if(i<=2&&i-1>=0&&j-1<board_id[i-1].length&&j-1>=0) return [board_id[i-1][j-1], 2];
    }
    return [];
}
// 上ほぼいっしょ
function get_other_h(h,w) {
    return [[get_other_h_calc(h,(w==0 ? 5:w-1))[0],Math.floor((w+2)%6)], [get_other_h_calc(h,w)[0],Math.floor((w+4)%6)]];
}
// 街道 1
// 開拓地　11
// 都市 111
// 1とか11を入れるとプレイヤー番号0が帰ってくる
// １０以上は対応しない
function get_player(a) {
    return Math.floor(a%10)-1;
}
function get_player_id(a,b,c) {
    return String("player"+Math.floor((a-b+c) % c));
}
function get_player_id2(a, b, c) {
    return Math.floor((a-b+c) % c);
}
class Board {
    constructor(player_count, my_turn) {
        this.player_count = player_count;
        this.plate_numbers = [2,3,3,4,4,5,5,6,6,7,8,8,9,9,10,10,11,11,12] // length = 19
        this.plate_types = [0,0,0,0,1,1,1,2,2,2,3,3,3,3,4,4,4,4,5]; // length = 19
        this.komas = [];
        this.player = 0;
        this.my_turn = my_turn;
        this.cards = [];
        this.first = true;
        //　何を打つか？
        this.policy = 1;
        for(let i = 0; i < 19; ++i) {
            this.komas[i] = Array(2);
            this.komas[i][0] = Array(6);
            this.komas[i][1] = Array(6);
            for(let j = 0; j < 6; ++j) this.komas[i][0][j] = 0;
            for(let j = 0; j < 6; ++j) this.komas[i][1][j] = 0;
        }
        for(let i = 0; i < player_count; ++i) {
            this.cards[i] = Array(5);
            for(let j = 0; j < 5; ++j) this.cards[i][j] = 0;
        }
    }
    // プレイヤーの駒の数
    koma_count(p) {
        let seen = [];
        let res = 0;
        for(let j = 0; j < 19; ++j) {
            seen[j] = Array(2);
            seen[j][0] = Array(6);
            seen[j][1] = Array(6);
            for(let k = 0; k < 6; ++k) seen[j][0][k] = false;
            for(let k = 0; k < 6; ++k) seen[j][1][k] = false;
        }       
        for(let j = 0; j < 19; ++j) for(let k = 0; k < 6; ++k) {
            if(!seen[j][1][k] && get_player(this.komas[j][1][k])==p) {
                seen[j][1][k] = true;
                res++;
                let around = get_other_h(j,k);
                if(around[0][0]!=undefined)seen[around[0][0]][1][around[0][1]] = true;
                if(around[1][0]!=undefined)seen[around[1][0]][1][around[1][1]] = true;
            }
            if(!seen[j][0][k] && get_player(this.komas[j][0][k])==p) {
                seen[j][0][k] = true;
                res++;
                let around = get_other_s(j,k);
                if(around[0]!=undefined)seen[around[0]][0][around[1]] = true;
            }
        }
        return res;
    }
    //　それぞれのプレイヤーの資源を回収する
    correct_cards(dice) {
        for(let i = 0; i < this.player_count; ++i) {
            let seen = [];
            for(let j = 0; j < 19; ++j) {
                seen[j] = Array(6);
                for(let k = 0; k < 6; ++k) seen[j][k] = false;
            }
            let add = [0,0,0,0,0];
            for(let j = 0; j < 19; ++j) for(let k = 0; k < 6; ++k) {
                if(seen[j][k] || get_player(this.komas[j][1][k])!=i) continue;
                let around = get_other_h(j,k);
                seen[j][k] = true;
                if(this.plate_types[j]!=5&&this.plate_numbers[j]==dice) add[this.plate_types[j]] += 1;
                for(let l = 0; l < around.length; ++l) {
                    if(around[l][0]==undefined)continue;
                    seen[around[l][0]][around[l][1]] = true;        
                    //　そこが開拓地の時
                    //　そこがサイコロの目にあってるか？
                    if(this.plate_types[around[l][0]]!=5&&this.plate_numbers[around[l][0]]==dice) add[this.plate_types[around[l][0]]] += 1;
                }
            }
            // 実際に加算する
            for(let k = 0; k < 5; ++k) {
                let x = document.getElementById(`p${get_player_id2(i,this.my_turn,this.player_count)}_a_cnt_${k}`);
                x.innerHTML = Number(x.innerHTML) + add[k];
                this.cards[i][k]+=add[k];
            }
        }
    }
    //　ターンの人のプレートの枠をぬる
    turn_paint() {
        document.getElementById(get_player_id(this.player==0 ? this.player_count-1:this.player-1, this.my_turn,this.player_count)).style.border = "solid 0px red";
        document.getElementById(get_player_id(this.player,this.my_turn,this.player_count)).style.border = "solid 3px red";  
    }
    // はじめのほうのやつ
    put_first(x,y,z) {
        if(y==0){
            this.komas[x][y][z] = (this.player+1);
            if(get_other_s(x,z).length>0)this.komas[get_other_s(x,z)[0]][y][get_other_s(x,z)[1]] = (this.player+1);
        }else{
            this.komas[x][y][z] = (this.player+1)*11;
            let now = get_other_h(x,z);
            for(let i = 0; i < now.length;++i)if(now[i].length!=0&&now[i][0]!=undefined)this.komas[now[i][0]][y][now[i][1]] = (this.player+1)*11;
        }
        // 全部終わったか？
        let flg = true;
        for(let i=0;i<this.player_count;++i)if(this.koma_count(i)!=4)flg=false;
        //時計回りか逆回りか
        //まだそのひとが打てるか？
        if((Math.floor((this.koma_count(this.player))%2)==0&&this.player!=this.player_count-1)||(this.koma_count(this.player)==4&&this.player==this.player_count-1)){
            if(flg) {
                // 初期設定終了
                this.policy=0;
                this.first=false;
            } else if(this.koma_count(this.player_count-1)==4){
                //反時計回り
                this.player--;
                document.getElementById(get_player_id(this.player+1,this.my_turn,this.player_count)).style.border = "solid 0px red";
                document.getElementById(get_player_id(this.player,this.my_turn,this.player_count)).style.border = "solid 3px red"; 
            }else{
                //時計回り
                this.player++;
                this.turn_paint();
            }
        } else {
            // まだ同じ人の盤です
        }
        this.print_komas();
    }
    // 置く x番目のプレートのyの場所にのやつをzにおく
    put(x,y,z) {
        let o = this.policy;
        // 打てなかったらリターン
        if(o<=10&&y!=0||o>10&&y!=1){
            this.policy=0;
            return;
        }

        
        if(o<=10) {
            if(get_other_s(x,z).length>0) this.komas[get_other_s(x,z)[0]][0][get_other_s(x,z)[1]] = o;
        } else {
            let now = get_other_h(x,z);
            for(let i = 0; i < now.length;++i) {
                if(now[i].length==0||now[i][0]==undefined)continue;
                this.komas[now[i][0]][1][now[i][1]] = o;
            }
        }
        //うつ
        this.komas[x][y][z] = o;
        //資材を集める
        //this.correct_cards(9);

        //街道とか選択していない状態にする
        this.policy=0;
        //色彩
        
        this.print_komas();
    }
    //次のプレイヤーに手番を渡す
    next_player() {
        //次の人にする
        this.player = Math.floor((this.player+1)%this.player_count);
        this.policy=0;
        this.turn_paint();
    }
    // aがプレート上の番号の条件に合致するか
    f(a) {
        for(let i = 0; i < 19; ++i) {
            if(a[i]!=6 && a[i]!=8) continue;
            let around = get_around(i);
            for(let j = 0; j < around.length; ++j) {
                if(a[around[j]] == 6 || a[around[j]] == 8) return false;
            }
        }
        return true;
    }
    init() {
        restore();
        // 初期設定
        // プレートの種類をランダムにする
        let plate_types_new = [];
        for(let i = 0; i < 19; ++i) {
            let rnd_num = Math.floor(Math.random() * this.plate_types.length);
            plate_types_new.push(this.plate_types[rnd_num]);
            this.plate_types.splice(rnd_num, 1);
        }
        this.plate_types = plate_types_new;
        
        // プレート上の番号をランダムにして、もし６、８が隣接していたらもう一度
        let plate_numbers_new = [];
        do {
            plate_numbers_new.length = 0;
            let plate_numbers_now = [2,3,3,4,4,5,5,6,6,7,8,8,9,9,10,10,11,11,12];
            for(let i = 0; i < 19; ++i) {
                let rnd_num = Math.floor(Math.random() * plate_numbers_now.length);
                plate_numbers_new.push(plate_numbers_now[rnd_num]);
                plate_numbers_now.splice(rnd_num, 1);
            }
            this.plate_numbers = plate_numbers_new;
        } while(!this.f(plate_numbers_new));

        // それぞれの駒にid付与
        for(let i = 0; i < 19; ++i) {
            for(let j = 0; j < 6; ++j) {
                let x = document.getElementById(String(i)).getElementsByClassName(komas_classname[0][j]);
                if(x.length > 0) x[0].id = `s${i}${j}`;
                x = document.getElementById(String(i)).getElementsByClassName(komas_classname[1][j]);
                if(x.length > 0) x[0].id = `h${i}${j}`;
            }
        }
        // クリック時の処理
        for(let i = 0; i < 19; ++i) {
            for(let j = 0; j < 6; ++j) {
                let x = document.getElementById(`s${i}${j}`);
                let y = document.getElementById(`h${i}${j}`);
                if(x != undefined)x.style.backgroundColor = "",x.removeEventListener("click",function(){});
                if(y != undefined)y.style.backgroundColor = "",y.removeEventListener("click",function(){});
                let pa = this;
                if(x != undefined) x.addEventListener("click",function() {
                    if(pa.komas[i][0][j]==0&&pa.policy!=0&&this.player==this.my_turn)(pa.first?pa.put_first(i,0,j):pa.put(i,0,j));
                });
                if(y != undefined) y.addEventListener("click",function() {
                    if(pa.komas[i][1][j]==0&&pa.policy!=0&&this.player==this.my_turn)(pa.first?pa.put_first(i,1,j):pa.put(i,1,j));
                });
            }
        }
        //　プレイヤーのカード作成
        for(let i = 0; i < this.player_count; ++i) {
            document.getElementById(String("player"+i)).style.display = "block";
        }
        // カードの装飾
        for(let i=0;i<this.player_count;++i) {
            document.getElementById(String("player"+i)).style.background = player_color_css[this.my_turn];
            this.my_turn = Math.floor((this.my_turn+1)%this.player_count);
        }
        this.turn_paint();
        // 後で変える
        for(let i = 0; i < 5; ++i) {
            document.getElementById(`card_${i}`).style.backgroundColor=plate_types_back[i];
        }
    }
    // こまの配置をかく
    print_komas() {
        for(let i = 0; i < 19; ++i) {
            for(let j = 0; j < 6; ++j) {
                if(this.komas[i][0][j]!=0) {
                    if(document.getElementById(`s${i}${j}`) != undefined) document.getElementById(`s${i}${j}`).style.backgroundColor = player_color[get_player(this.komas[i][0][j])];
                }
                if(this.komas[i][1][j]!=0) {
                    if(document.getElementById(`h${i}${j}`) != undefined) {
                        document.getElementById(`h${i}${j}`).style.backgroundColor = player_color[get_player(this.komas[i][1][j])];
                        if(this.komas[i][1][j]>=100)document.getElementById(`h${i}${j}`).style.height="5vmin";
                    }
                }
            }
        }
    }
    print() {
        // 数をかく
        for(let i = 0; i < 19; ++i) {
            let new_ele = document.createElement("div");
            new_ele.className = "plate_number";
            new_ele.innerHTML = this.plate_numbers[i];
            new_ele.id = `plate_number${i}`;
            if(document.getElementById(`plate_number${i}`) != undefined) document.getElementById(`plate_number${i}`).remove();
            if(this.plate_numbers[i]==6 || this.plate_numbers[i]==8) new_ele.style.color = "red", new_ele.style.fontWeight = "900";
            document.getElementById(String(i)).append(new_ele);
        }
        // プレトの種類をかく
        // だるかった。助けて
        for(let i = 0; i < 19; ++i) {
            document.getElementById(String("0" + String(i))).style.backgroundColor = plate_types_back[this.plate_types[i]];
            document.getElementById(String("0" + String(i) + "a")).style.backgroundColor = plate_types_back[this.plate_types[i]];
            document.getElementById(String("0" + String(i) + "b")).style.backgroundColor = plate_types_back[this.plate_types[i]];
        }
    }
}


let board;
function start() {
    board = new Board(2,0);
    board.init();
    board.print();
    board.first = false;
    board.policy=0;
    // ゲームの進行はクラス内でやりません。
}



// html保存
var lastHTML;
window.onload = function() {
    lastHTML = document.body.innerHTML;
    start();
}
function restore() {
    document.body.innerHTML = lastHTML;
}

function rollDice() {
    let result = Math.floor(Math.random() * (6 - 1 + 1)) + 1;
    let result2 = Math.floor(Math.random() * (6 - 1 + 1)) + 1;
    let dice = document.getElementById("dice");
    let dice2 = document.getElementById("dice2");
    dice.dataset.side = result;
    dice.classList.toggle("reRoll");
    dice2.dataset.side = result2;
    dice2.classList.toggle("reRoll");

    setTimeout(function(){ 
        //ここで結果を表示 
    }, 1500);
}

/***** ドラッグ開始時の処理 *****/
function f_dragstart(event){
    //ドラッグするデータのid名をDataTransferオブジェクトにセット
    event.dataTransfer.setData("text", event.target.id);
}
  /***** ドラッグ要素がドロップ要素に重なっている間の処理 *****/
function f_dragover(event){
    //dragoverイベントをキャンセルして、ドロップ先の要素がドロップを受け付けるようにする
    event.preventDefault();
}

let selected = [0,0,0,0,0];
  /***** ドロップ時の処理 *****/
function f_drop(event){
    //ドラッグされたデータのid名をDataTransferオブジェクトから取得
    let id_name = event.dataTransfer.getData("text");
    //id名からドラッグされた要素を取得
    document.getElementById(`card_${Number(id_name.slice(-1))}_cnt`).innerHTML=++selected[Number(id_name.slice(-1))];
    //エラー回避のため、ドロップ処理の最後にdropイベントをキャンセルしておく
     event.preventDefault();
}
function cancel_select() {
    selected = [0,0,0,0,0];
    for(let i=0;i<5;++i)document.getElementById(`card_${i}_cnt`).innerHTML="0";
}
// それぞれの資材の数が決まったkazugakimatta
//　交換とかは後でする
function ok() {
    let vc = 0;
    let s = selected;
    for(let i = 0; i < 5; ++i) if(selected[i]==0)vc++;
    //街道建設 0 2
    //開拓地  0 1 3 4
    //都市    4*2 1*3
    if(vc==3&&s[0]==1&&s[2]==1) board.policy=(board.player+1)*1;
    else if(vc==1&&s[0]==1&&s[1]==1&&s[3]==1&&s[4]==1) board.policy=(board.player+1)*11;
    else if(vc==3&&s[4]==2&&s[1]==3) board.policy=(board.player+1)*111;
    else {
        // 違うときの処理
        return ;
    }
    document.getElementById("select").style.display="none";
    cancel_select();
}
//手番を渡す
function pass() {
    if(board.player==board.my_turn)board.next_player();
}