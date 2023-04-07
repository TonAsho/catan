const { Server } = require('socket.io');

let user_count = 0;
let waiting = [];
let games = new Set();
let games_m = new Map();

const chat = (server) => {
  const io = new Server(server);
  io.on('connection', (socket) => {
    user_count++;io.emit("user_count",{user_count:user_count});

    //マッチング要請が来た
    //とりあえず２人来た瞬間にやるようにする
    socket.on("game_make",()=>{
        waiting.push(socket.id);
        // ２人以上待っていたら、マッチングする
        if(waiting.length>=2) {
            //順番を決めて、送信する
            //とりま順番は早くボタン押した人から。
            let plate_numbers = [2,3,3,4,4,5,5,6,6,7,8,8,9,9,10,10,11,11,12]; // length = 19
            let plate_types = [0,0,0,0,1,1,1,2,2,2,3,3,3,3,4,4,4,4,5]; // length = 19
             // プレートの種類をランダムにする
            let plate_types_new = [];
            for(let i = 0; i < 19; ++i) {
                let rnd_num = Math.floor(Math.random() * plate_types.length);
                plate_types_new.push(plate_types[rnd_num]);
                plate_types.splice(rnd_num, 1);
            }
            plate_types = plate_types_new;
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
                for(let i = 0; i < 19; ++i)if(plate_numbers_new[i]==7&&plate_types[i]!=5){
                    for(let j = 0; j < 19; ++j) if(plate_types[j]==5){
                        plate_numbers_new[i]=plate_numbers_new[j];
                        plate_numbers_new[j]=7;
                        i=1000,j=1000;
                    }
                }
                plate_numbers = plate_numbers_new;
            } while(!f(plate_numbers_new));
            
            for(let i=0;i<waiting.length;++i)io.to(waiting[i]).emit("start_game",{my_turn:i,player_count:waiting.length,plate_numbers:plate_numbers,plate_types:plate_types});
            games.add(waiting,waiting);
            for(let i = 0; i < waiting.length; ++i){
                games_m.set(waiting[i],waiting);
            }
            waiting=[];
        }
    });
    socket.on("cancel_game_make",()=>{
        for(let i = 0; i < waiting.length; ++i) if(waiting[i]==socket.id){
            waiting.splice(i,1);
        }
    });

    //打った
    socket.on("put_first",(info)=>{
        let group = games_m.get(socket.id);
        for(let i=0;i<group.length;++i)if(group[i]!=socket.id){
            io.to(group[i]).emit("get_put_first",info);
        }
    });
    socket.on("put",(info)=>{
        let group = games_m.get(socket.id);
        for(let i=0;i<group.length;++i)if(group[i]!=socket.id){
            io.to(group[i]).emit("get_put",info);
        }
    });
    //パスした
    socket.on("next_player",()=>{
        let group = games_m.get(socket.id);
        for(let i=0;i<group.length;++i)if(group[i]!=socket.id){
            io.to(group[i]).emit("next_player");
        }
    });
    //サイコロふられた
    socket.on("dice",(info)=> {
        let group = games_m.get(socket.id);
        for(let i=0;i<group.length;++i)if(group[i]!=socket.id){
            io.to(group[i]).emit("get_dice",info);
        }
    });
    //7のときにかえた
    socket.on("change_plate",(info)=>{
        let group = games_m.get(socket.id);
        for(let i=0;i<group.length;++i)if(group[i]!=socket.id){
            io.to(group[i]).emit("get_change_plate",info);
        }
    });
    socket.on("change_cards",(info)=>{
        let group = games_m.get(socket.id);
        for(let i=0;i<group.length;++i)if(group[i]!=socket.id){
            io.to(group[i]).emit("get_change_cards",info);
        }
    });
    socket.on("card7_give",(info)=>{
        let group = games_m.get(socket.id);
        io.to(group[info.to]).emit("get_card7_give",info);
    });
    //カードを辺超した
    socket.on("change_select",(info)=>{
        let group = games_m.get(socket.id);
        for(let i=0;i<group.length;++i)if(group[i]!=socket.id){
            io.to(group[i]).emit("get_change_select",info);
        }
    });
    socket.on("disconnect", (e)=> {
        for(let i = 0; i < waiting.length; ++i) if(waiting[i]==socket.id){
            waiting.splice(i,1);
        }
        games.forEach(game => {
            let flg=false;
            for(let i=0;i<game.length;++i)if(game[i]==socket.id)flg=true;
            if(flg){
                for(let i=0;i<game.length;++i)if(game[i]!=socket.id)io.to(game[i]).emit("connection_win",{});
            }
            //そのゲームを消去
        });
        user_count--;io.emit("user_count",{user_count:user_count});
    })
  });
}

const board_id = [
    [0, 1, 2],
    [3, 4, 5, 6],
    [7, 8, 9, 10, 11],
    [12, 13, 14, 15],
    [16, 17, 18]
];
function f(a) {
    for(let i = 0; i < 19; ++i) {
        if(a[i]!=6 && a[i]!=8) continue;
        let around = get_around(i);
        for(let j = 0; j < around.length; ++j) {
            if(a[around[j]] == 6 || a[around[j]] == 8) return false;
        }
    }
    return true;
}
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
module.exports = chat;