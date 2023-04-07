// 見りゃ分かる
const socket = io();
let board;
socket.on("user_count",(info)=>{});
// マッチング開始
function game_make() {
    socket.emit("game_make");
}
function cancel_game_make() {
    socket.emit("cancel_game_make");
}
// マッチング完了。ゲーム開始
socket.on("start_game",(info)=>{
    document.getElementById("home").style.opacity="0.0";
    setTimeout(() => {
        document.getElementById("home").style.display="none";
        document.getElementById("game").style.display="block";
        start(info.player_count,info.my_turn,info.plate_numbers,info.plate_types);    
    }, 2000);
    
});
// 接続切れ勝ち
socket.on("connection_win",()=>{
    alert("相手が接続を切りました")
})
//はじめのやつで置く
function put_first_emit(x,y,z) {
    socket.emit("put_first",{x:x,y:y,z:z});
}
socket.on("get_put_first",(info)=>{
    board.put_first(info.x,info.y,info.z,true);
});
//自分のターンで置く
function put_emit(x,y,z,policy) {
    socket.emit("put",{x:x,y:y,z:z,policy:policy});
}
socket.on("get_put",(info)=>{
    board.policy=info.policy;
    board.put(info.x,info.y,info.z,true);
});
//誰かがカードを変換した
socket.on("get_change_select",(info)=>{
    board.cards[info.c][info.a]-=4;
    board.cards[info.c][info.b]+=1;
    board.print_card_counts();
});
//7のとき
socket.on("get_change_plate",(info)=>{
    board.plate_numbers=info.plate_numbers;
    board.print();
});
socket.on("get_change_cards",(info)=>{
    board.cards[info.from]=info.new_cards;
    board.print_card_counts();
})
let get_cnt=0;
socket.on("get_card7_give",(info)=>{
    get_cnt++;
    if(get_cnt==board.player_count-1){
        get_cnt=0;
        //ここで全員のカードが集まった。
        move_7();
    }
})
//誰かがターンを譲った
socket.on("next_player",()=>{board.next_player()});
//サイコロ打った
socket.on("get_dice",(info)=>{rollDice(info.x,info.y);});
// 木 * 4      0
// 石 * 3      1
// レンガ * 3   2
// 羊  * 4     3
// 畑  * 4     4
// 荒地 * 1    5
const plate_types_back = ["green", "orange", "white", "yellow", "gray", "black"];

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
    //合法酒を取得
    legal(p) {
        let res = [];
        if(p<=10){
            //自分の返上に自分の街道か開拓地か都市があれば良い
            let seen = [];
            for(let j = 0; j < 19; ++j) {
                seen[j] = Array(6);
                for(let k = 0; k < 6; ++k) seen[j][k] = false;
            }       
            for(let j = 0; j < 19; ++j) for(let k = 0; k < 6; ++k) {
                if(!seen[j][k]&&this.komas[j][0][k]==0) {
                    let x=(k==0?5:k-1),y=k,z=(k==5?0:k+1);
                    let s = this.komas;
                    let flg = false;
                    //街道
                    if(s[j][0][x]==this.player+1||s[j][0][z]==this.player+1)flg=true;
                    let ss = get_other_s(j,k);
                    if(ss[0]!=undefined&&(s[ss[0]][0][(ss[1]==0?5:ss[1]-1)]==this.player+1||s[ss[0]][0][(ss[1]==5?0:ss[1]+1)]==this.player+1))flg=true;
                    //開拓地以上
                    let kai = (this.player+1)*11,tosi = (this.player+1)*111;
                    if(s[j][1][y]==kai||s[j][1][z]==kai||s[j][1][z]==tosi||s[j][1][y]==tosi) flg = true;
                    if(flg)res.push([j,k]);

                    let around = get_other_s(j,k);
                    if(around[0]!=undefined)seen[around[0]][around[1]] = true;
                }
            }
        } else {
            //同じ辺に誰かの（自分も含む）開拓地、都市があればだめ。
            //同じ辺に必ず自分の街道がなきゃだめよん
            //都市の場合は開拓地がある上にも置ける。
            let seen = [];
            for(let j = 0; j < 19; ++j) {
                seen[j] = Array(6);
                for(let k = 0; k < 6; ++k) seen[j][k] = false;
            }       
            for(let j = 0; j < 19; ++j) for(let k = 0; k < 6; ++k) {
                if(!seen[j][k]&&(get_player(this.komas[j][1][k])==this.player||this.komas[j][1][k]==0)) {
                    seen[j][k] = true;
                    
                    let s=this.komas,l=get_other_h(j,k);
                    let flg = false;
                    if(!this.first) {
                        if((s[j][0][k]!=0&&get_player(s[j][0][k]!=0)==this.player)||(s[j][0][(k==0?5:k-1)]!=0&&get_player(s[j][0][(k==0?5:k-1)]!=0)==this.player))flg=true;
                        for(let i=0;i<l.length;++i){
                            if(l[i][0]==undefined)continue;
                            let y=l[i][1],z=(l[i][1]==0?5:l[i][1]-1);
                            if((s[l[i][0]][0][y]!=0&&get_player(s[l[i][0]][0][y])==this.player)||(s[l[i][0]][0][z]!=0&&get_player(s[l[i][0]][0][z])==this.player))flg=true;
                        }
                    } else flg=true;
                    if(s[j][1][(k==5?0:k+1)]!=0||s[j][1][(k==0?5:k-1)]!=0)flg=false;
                    for(let i=0;i<l.length;++i){
                        if(l[i][0]==undefined)continue;
                        let y=(l[i][1]==5?0:l[i][1]+1),z=(l[i][1]==0?5:l[i][1]-1);
                        if(s[l[i][0]][1][y]!=0||s[l[i][0]][1][z]!=0)flg=false;
                    }
                    if(p>=100&&this.komas[j][1][k]!=0)res.push([j,k]);
                    else if(this.komas[j][1][k]==0&&flg&&p<100)res.push([j,k]);
                    
                    let around = get_other_h(j,k);
                    if(around[0][0]!=undefined)seen[around[0][0]][around[0][1]] = true;
                    if(around[1][0]!=undefined)seen[around[1][0]][around[1][1]] = true;
                }                
            }
        }
        return res;
    }
    print_legal(res,p) {
        for(let i = 0; i < res.length; ++i) {
            if(p==1)document.getElementById(`h${res[i][0]}${res[i][1]}`).style.backgroundColor="black";
            else document.getElementById(`s${res[i][0]}${res[i][1]}`).style.backgroundColor="black"
        }
    }
    delete_legal(res,p) {
        for(let i = 0; i < res.length; ++i) {
            if(p<=10)document.getElementById(`s${res[i][0]}${res[i][1]}`).style.backgroundColor="";
            else {
                if(p>=100&&this.komas[res[i][0]][1][res[i][1]]!=0)document.getElementById(`h${res[i][0]}${res[i][1]}`).style.backgroundColor=player_color[this.player];
                else document.getElementById(`h${res[i][0]}${res[i][1]}`).style.backgroundColor=""
            }
        }
    }
    //終了しているか？
    finish() {
        let res = false;
        for(let i = 0; i < this.player_count;++i)if(this.point(i)>=10)res=true;
        return res;
    }
    //プレイヤーの点数
    point(p) {
        let seen = [];
        let res = 0;
        for(let j = 0; j < 19; ++j) {
            seen[j] = Array(6);
            for(let k = 0; k < 6; ++k) seen[j][k] = false;
        }       
        for(let j = 0; j < 19; ++j) for(let k = 0; k < 6; ++k) {
            if(!seen[j][k] && get_player(this.komas[j][1][k])==p) {
                seen[j][k] = true;
                if(this.komas[j][1][k]>=100)res+=2;
                else res++;
                let around = get_other_h(j,k);
                if(around[0][0]!=undefined)seen[around[0][0]][around[0][1]] = true;
                if(around[1][0]!=undefined)seen[around[1][0]][around[1][1]] = true;
            }
        }
        return res;
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
                    if(this.plate_types[around[l][0]]!=5&&this.plate_numbers[around[l][0]]!=7&&this.plate_numbers[around[l][0]]==dice) {
                        if(this.komas[j][1][k]>=100)add[this.plate_types[around[l][0]]] += 2;
                        else add[this.plate_types[around[l][0]]] += 1;
                    }
                }
            }
            // 実際に加算する
            for(let k = 0; k < 5; ++k) {
                this.cards[i][k]+=add[k];
            }
        }
        this.print_card_counts();
    }
    //　ターンの人のプレートの枠をぬる
    turn_paint() {
        document.getElementById(get_player_id(this.player==0 ? this.player_count-1:this.player-1, this.my_turn,this.player_count)).style.border = "solid 0px red";
        document.getElementById(get_player_id(this.player,this.my_turn,this.player_count)).style.border = "solid 3px red";  
    }
    // はじめのほうのやつ
    put_first(x,y,z,f) {
        if(!f&&((y==0&&this.policy>=10)||(y==1&&this.policy<=10)))return;
        let ll = this.legal(this.policy);
        let flag = false;
        for(let i = 0; i < ll.length;++i)if(ll[i][0]==x&&ll[i][1]==z)flag=true;
        if(!f&&!flag)return;
        cancel_select(true);
        if(y==0){
            this.komas[x][y][z] = (this.player+1);
            if(get_other_s(x,z).length>0)this.komas[get_other_s(x,z)[0]][y][get_other_s(x,z)[1]] = (this.player+1);
        }else{
            this.komas[x][y][z] = (this.player+1)*11;
            let now = get_other_h(x,z);
            this.cards[this.player][this.plate_types[x]]++;
            for(let i = 0; i < now.length;++i)if(now[i].length!=0&&now[i][0]!=undefined)this.komas[now[i][0]][y][now[i][1]] = (this.player+1)*11,this.cards[this.player][this.plate_types[now[i][0]]]++;;
        }
        this.print_card_counts();
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
                if(board.player==board.my_turn) myturn();
            } else if(this.koma_count(this.player_count-1)==4){
                //反時計回り
                this.player--;
                if(this.player==this.my_turn)show_alert("Your Turn"),ok_first(11);
                document.getElementById(get_player_id(this.player+1,this.my_turn,this.player_count)).style.border = "solid 0px red";
                document.getElementById(get_player_id(this.player,this.my_turn,this.player_count)).style.border = "solid 3px red";
            }else{
                //時計回り
                this.player++;
                if(this.player==this.my_turn)show_alert("Your Turn"),ok_first(11);
                this.turn_paint();
            }
        } else {
            // まだ同じ人の盤です
            if(this.player==this.my_turn){
                show_alert("Your Turn");
                if(this.koma_count(this.player)==2&&this.player==this.player_count-1){
                    ok_first(11);
                } else {
                    ok_first(1);
                }
            }
        }
        if(!f)put_first_emit(x,y,z);
        this.print_komas();
    }
    // 置く x番目のプレートのyの場所にのやつをzにおく
    put(x,y,z,f) {
        // this.delete_legal(this.legal(this.policy),this.policy);
        let ll = this.legal(this.policy);
        let flag = false;
        for(let i = 0; i < ll.length;++i)if(ll[i][0]==x&&ll[i][1]==z)flag=true;
        cancel_select(true);
    
        let o = this.policy;
        // 打てなかったらリターン
        if((o<=10&&y!=0||o>10&&y!=1)||!flag){
            this.policy=0;
            alert("そこうてねぇよばか")
            return;
        }
        if(o<=10) {
            if(get_other_s(x,z).length>0) this.komas[get_other_s(x,z)[0]][0][get_other_s(x,z)[1]] = o;
            this.cards[this.player][0]-=1,this.cards[this.player][1]-=1;
        } else {
            let now = get_other_h(x,z);
            for(let i = 0; i < now.length;++i) {
                if(now[i].length==0||now[i][0]==undefined)continue;
                this.komas[now[i][0]][1][now[i][1]] = o;
            }
            if(o<=100)this.cards[this.player][0]-=1,this.cards[this.player][1]-=1,this.cards[this.player][2]-=1,this.cards[this.player][3]-=1;
            else this.cards[this.player][3]-=2,this.cards[this.player][4]-=3;
        }
        //うつ
        this.komas[x][y][z] = o;

        if(!f)put_emit(x,y,z,this.policy);


        //街道とか選択していない状態にする
        this.policy=0;
        //色彩
        this.print_komas();
        this.print_card_counts();

        if(this.finish()) {
            //試合が終わってる。
            alert("試合終了！")
        }
    }
    //次のプレイヤーに手番を渡す
    next_player() {
        //次の人にする
        this.player = Math.floor((this.player+1)%this.player_count);
        this.policy=0;
        this.turn_paint();
        if(this.player==this.my_turn) myturn();
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
        //初期設定
        // プレートの種類をランダムにする
        // let plate_types_new = [];
        // for(let i = 0; i < 19; ++i) {
        //     let rnd_num = Math.floor(Math.random() * this.plate_types.length);
        //     plate_types_new.push(this.plate_types[rnd_num]);
        //     this.plate_types.splice(rnd_num, 1);
        // }
        // this.plate_types = plate_types_new;
        
        // // プレート上の番号をランダムにして、もし６、８が隣接していたらもう一度
        // let plate_numbers_new = [];
        // do {
        //     plate_numbers_new.length = 0;
        //     let plate_numbers_now = [2,3,3,4,4,5,5,6,6,7,8,8,9,9,10,10,11,11,12];
        //     for(let i = 0; i < 19; ++i) {
        //         let rnd_num = Math.floor(Math.random() * plate_numbers_now.length);
        //         plate_numbers_new.push(plate_numbers_now[rnd_num]);
        //         plate_numbers_now.splice(rnd_num, 1);
        //     }
        //     this.plate_numbers = plate_numbers_new;
        // } while(!this.f(plate_numbers_new));

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
                    if(pa.komas[i][0][j]==0&&pa.policy!=0&&pa.player==pa.my_turn)(pa.first?pa.put_first(i,0,j,false):pa.put(i,0,j,false));
                });
                if(y != undefined) y.addEventListener("click",function() {
                    if(((pa.komas[i][1][j]==0&&pa.policy!=0)||(pa.komas[i][1][j]<100&&pa.policy>=100))&&pa.player==pa.my_turn)(pa.first?pa.put_first(i,1,j,false):pa.put(i,1,j,false));
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
            if(this.plate_numbers[i]!=7)new_ele.className = "plate_number";
            else new_ele.className = "plate_number_7";
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
    print_card_counts() {
        for(let i = 0; i < this.player_count; ++i) {
            for(let j = 0; j < 5; ++j) {
                document.getElementById(`p${get_player_id2(i,this.my_turn,this.player_count)}_a_cnt_${j}`).innerHTML=this.cards[i][j];
            }
        }
    }
}

async function myturn() {
    //サイコロを打つ
    let x = Math.floor(Math.random() * (6 - 1 + 1)) + 1;
    let y = Math.floor(Math.random() * (6 - 1 + 1)) + 1;
    //相手にも送る
    socket.emit("dice",{x:x,y:y});
    await rollDice(x,y);    
    await show_alert("Your Turn");
}

async function start(player_count,my_turn,plate_number,plate_types) {
    board = new Board(player_count,my_turn);
    board.init();
    board.plate_numbers=plate_number;
    board.plate_types=plate_types;
    board.print();
    board.first = true;
    board.policy=1;
    // ゲームの進行はクラス内でやりません。
    if(board.player==board.my_turn){
        await show_alert("Your Turn");
        ok_first(11);
    }
}



// html保存
var lastHTML;
window.onload = function() {
    lastHTML = document.body.innerHTML;
}
function restore() {
    document.body.innerHTML = lastHTML;
}

function rollDice(x,y) {
    let result =x;
    let result2 = y;
    document.getElementById("dices").style.display = "block";
    let dice = document.getElementById("dice");
    let dice2 = document.getElementById("dice2");
    document.getElementById("game").style.pointerEvents="none";
    dice.dataset.side = result;
    dice.classList.toggle("reRoll");
    dice2.dataset.side = result2;
    dice2.classList.toggle("reRoll");

    return new Promise(resolve => {
        setTimeout(function(){ 
            //ここで結果を表示 
            document.getElementById("dices").style.display = "none";
            document.getElementById("game").style.pointerEvents="auto";
            if(x+y==7) {
                button_put_cannot("pass_button");
                button_put_cannot("change_select_button");
                button_put_cannot("player0");
                let sum = 0;
                for(let i=0;i<5;++i)sum+=board.cards[board.my_turn][i];
                if(sum>=8){
                    show_alert("捨てるカードを選択してください");
                    document.getElementById("card7").style.display="block";
                    document.getElementById("card7_message").innerHTML=`残りあと${Math.floor(sum/2)}枚`
                    for(let i=0;i<5;++i){
                        document.getElementById(`card7_${i}`).innerHTML="";
                        for(let j=0;j<board.cards[board.my_turn][i];++j){
                            let new_ele = document.createElement("div");
                            new_ele.className=`card7_img a_img_${i}`;
                            new_ele.id=`card7_${i}_${j}`
                            new_ele.style.opacity="1.0";
                            document.getElementById(`card7_${i}`).appendChild(new_ele);
                            document.getElementById(`card7_${i}_${j}`).addEventListener("click",function(){
                                if(document.getElementById(`card7_${i}_${j}`).style.opacity=="1")document.getElementById(`card7_${i}_${j}`).style.opacity="0.3";
                                else document.getElementById(`card7_${i}_${j}`).style.opacity="1";
                                let now = 0;
                                for(let k=0;k<5;++k)for(let l=0;l<board.cards[board.my_turn][k];++l){
                                    if(document.getElementById(`card7_${k}_${l}`).style.opacity=="0.3") now++;
                                }
                                
                                document.getElementById("card7_message").innerHTML=`残りあと${Math.floor(sum/2)-now}枚`
                            });
                        }
                    }
                    document.getElementById("card7_button").addEventListener("click",function(){
                        let now = 0;
                        let add = [0,0,0,0,0];
                        for(let k=0;k<5;++k)for(let l=0;l<board.cards[board.my_turn][k];++l){
                            if(document.getElementById(`card7_${k}_${l}`).style.opacity=="0.3") now++,add[k]++;
                        }
                        for(let i = 0; i < 5; ++i) board.cards[board.my_turn][i]-=add[i];
                        if(Math.floor(sum/2)-now==0){
                            for(let i=0;i<5;++i)document.getElementById(`card7_${i}`).innerHTML="";
                            document.getElementById("card7").style.display="none";
                            socket.emit("change_cards",{from:board.my_turn,new_cards:board.cards[board.my_turn]});
                            if(board.player!=board.my_turn) {
                                socket.emit("card7_give",{to:board.player});
                            }
                            button_put_can("pass_button");
                            button_put_can("change_select_button");
                            button_put_can("player0");
                        }
                        board.print_card_counts();
                    })
                }else{
                    socket.emit("card7_give",{to:board.player,add:[0,0,0,0,0]});
                    button_put_can("pass_button");
                    button_put_can("change_select_button");
                    button_put_can("player0");
                }
                
            } else {
                board.correct_cards(x+y);
            }
            resolve();
        }, 2100);
    });
}

//盗賊移動




// それぞれの資材の数が決まったkazugakimatta
//　交換とかは後でする
function ok(p) {
    //街道建設 0 2
    //開拓地  0 1 3 4
    //都市    4*2 1*3
    if(p==1) {
        if(board.cards[board.player][0]>=1&&board.cards[board.player][1]>=1)board.policy=(board.player+1)*1,board.print_legal(board.legal(1),0),select(1);
    }
    else if(p==11) {
        if(board.cards[board.player][0]>=1&&board.cards[board.player][1]>=1&&board.cards[board.player][2]>=1&&board.cards[board.player][3]>=1)board.policy=(board.player+1)*11,board.print_legal(board.legal(11),1),select(11);
    }
    else {
        if(board.cards[board.player][3]>=2&&board.cards[board.player][4]>=3)board.policy=(board.player+1)*111,board.print_legal(board.legal(111),1),select(111);
    }
    document.getElementById("select").style.display="none";
}
function ok_first(p) {
    //街道建設 0 2
    //開拓地  0 1 3 4
    //都市    4*2 1*3
    if(p==1) {
        board.policy=(board.player+1)*1,board.print_legal(board.legal(1),0),select(1);
    }
    else if(p==11) {
        board.policy=(board.player+1)*11,board.print_legal(board.legal(11),1),select(11);
    }
    else {
        board.policy=(board.player+1)*111,board.print_legal(board.legal(111),1),select(111);
    }
    document.getElementById("select").style.display="none";
}
function select(p) {
    document.getElementById("now_select_a").style.display="block";
    if(p==1)document.getElementById("now_select").innerHTML="街道"
    if(p==11)document.getElementById("now_select").innerHTML="開拓地"
    if(p==111)document.getElementById("now_select").innerHTML="都市"
    action();
}
function cancel_select(f) {
    if(board.first&&!f)return;
    document.getElementById("now_select_a").style.display="none";
    if(board.policy==(board.player+1)*1)board.delete_legal(board.legal(1),1);
    if(board.policy==(board.player+1)*11)board.delete_legal(board.legal(11),11);
    if(board.policy==(board.player+1)*111)board.delete_legal(board.legal(111),111);
    if(!f)board.policy=0;
}
// 選択中にパスボタンとか押せないようにする
function action() {
    ///
    //
    //
    //
    //
    //
    //
}
//手番を渡す
function pass() {
    if(board.player==board.my_turn&&!board.first){
        cancel_select(false);
        board.next_player(),socket.emit("next_player");
        change_cancel();
    }
}

//f見た目
function select_card_init() {
    if(document.getElementById('select').style.display=='block')return;
    if(board.player==board.my_turn)document.getElementById('select').style.display='block';
    for(let i = 0; i < 3; ++i) document.getElementById(`content_${i}`).style.opacity="1.0",document.getElementById(`content_${i}`).style.pointerEvents="auto";
    let m = [[-1,-1,0,0,0],[-1,-1,-1,-1,0],[0,0,0,-2,-3]];
    for(let i = 0; i < 3; ++i) {
        let flg = false;
        for(let j = 0; j < 5; ++j) {
            document.getElementById(`select_${i}_${j}`).innerHTML=board.cards[board.player][j]+m[i][j]
            if(board.cards[board.player][j]+m[i][j]<0) flg = true;
        }
        if(flg) {
            document.getElementById(`content_${i}`).style.opacity="0.5";
            document.getElementById(`content_${i}`).style.pointerEvents="none";
        }
    }
}

// ４枚を１枚に変更
let select_change = -1;

function sc(p) {
    if(select_change==-1){
        document.getElementById("change_message").innerHTML="何と交換するか選択";
        select_change=p;                
        button_put_cannot(`select${p}`);
        for(let i = 0; i < 5; ++i) {
            if(i!=select_change){
                button_put_can(`select${i}`);
            }
        }
    } else {
        if(board.cards[board.player][select_change]>=4){
            socket.emit("change_select",{a:select_change,b:p,c:board.my_turn});
            board.cards[board.player][select_change]-=4;
            board.cards[board.player][p]++;  
            board.print_card_counts();       
        }
        change_cancel();
    }
}
function change_cancel() {
    select_change=-1;
    for(let i = 0; i < 5; ++i)document.getElementById(`select${i}`).style.display="block",button_put_can(`select${i}`);
    document.getElementById('change').style.display='none';
}
function change_select_init() {
    if(document.getElementById('select').style.display=='block')return;
    if(board.player==board.my_turn)document.getElementById('change').style.display='block';document.getElementById('change_message').innerHTML='何を交換するか選択';
    for(let i = 0; i < 5; ++i) {if(board.cards[board.player][i]<4){button_put_cannot(`select${i}`);}}
}
function show_alert(message) {
    document.getElementById("alert_box").style.display="inline-block";
    document.getElementById("alert_box").style.animation="alert_a 0.3s linear 1";
    document.getElementById("message").innerHTML=message;
    document.getElementById("game").style.opacity="0.5";
    document.getElementById("game").style.pointerEvents="none";
    return new Promise(resolve => {
        setTimeout(() => {
            document.getElementById("alert_box").style.animation="alert_b 0.3s linear 1";
            setTimeout(() => {
                document.getElementById("alert_box").style.display="none";
                resolve();
                document.getElementById("game").style.opacity="1.0";
                document.getElementById("game").style.pointerEvents="auto";
            }, 300);
        }, 1000);
    })

}


//都市二つget　合法手がおかしい　合法手がきえない
function button_put_cannot(id) {
    document.getElementById(id).style.pointerEvents="none";
    document.getElementById(id).style.opacity="0.5";
}
function button_put_can(id) {
    document.getElementById(id).style.pointerEvents="auto";
    document.getElementById(id).style.opacity="1.0";
}
//盗賊を動かす
function move_7() {
    show_alert("盗賊の移動先を選択してください");
    for(let i = 0; i < 19; ++i) {
        document.getElementById(`plate_number${i}`).addEventListener("click",function(){
            if(board.plate_numbers[i]==7)return;
            for(let j=0;j<19;++j)if(board.plate_numbers[j]==7){
                board.plate_numbers[j]=board.plate_numbers[i];
                board.plate_numbers[i]=7;
                button_put_can("pass_button");button_put_can("change_select_button");button_put_can("player0");
                board.print();
                socket.emit("change_plate",{plate_numbers:board.plate_numbers});
                j==1000;
            }
            for(let j = 0; j < 19; ++j)document.getElementById(`plate_number${j}`).removeEventListener("click",function(){});
        })
    }
}