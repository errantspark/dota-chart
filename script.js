var index = [ "Hero     ",
              "Main Attr",
              "Base Str ",
              "Str Grow ",
              "Base Agi ",
              "Agi Grow ",
              "Base Int ",
              "Int Grow ",
              "Mov spd  ",
              "BaseArmor",
              "BAT      ",
              "Dmg (min)",
              "Dmg (max)",
              "Range    ",
              "Missl spd",
              "Atk point",
              "Day SR   ",
              "Night SR ",
              "Turn rate",
              "Collision"]

var viewhero = function(x){
  heroes[x].forEach(function(x,i){console.log(index[i]+": "+x)})
}
var sort = {};
sort.damage_variability = function(x,y){
return Math.abs(y[11]-y[12])-Math.abs(x[11]-x[12])}

sort.base_stat = function(x,y){
return y[(y[1]+1)*2]-x[(x[1]+1)*2]}

sort.base_stat_growth = function(x,y){
return y[(y[1]+1)*2+1]-x[(x[1]+1)*2+1]}

sort.combined_stat_growth = function(x,y){
return (y[3]+y[5]+y[7])-(x[3]+x[5]+x[7])}

sort.movespeed = function(x,y){
return y[8]-x[8]}

var create_rescale = function(idx){
  var x_tract = heroes.map(function(d){return d[idx]});
  var max = Math.max.apply(null, x_tract);
  var min = Math.min.apply(null, x_tract);
  return function(x){return (x-min)/(max-min)}
}
var mov_scale = create_rescale(8);
var atkp_scale = create_rescale(15);
var coscale = chroma.scale(['lightblue', 'khaki' ,  'salmon']);
function tableCreate(){
  Array.prototype.slice.call(document.getElementsByTagName("table")).forEach(function(x){x.remove()})
        var body = document.getElementsByTagName('body')[0],
            tbl  = document.createElement('table');

         var tr = tbl.insertRow();
            for(var j = 0; j < 20; j++){
                    var td = tr.insertCell();
                    td.appendChild(document.createTextNode(index[j]));
            }
        for(var i = 0; i < heroes.length; i++){
            var tr = tbl.insertRow();
            for(var j = 0; j < 20; j++){
                    var td = tr.insertCell();
                    switch (j){
                      case 1:
                        switch (heroes[i][j]) {
                          case 0:
                            td.style.background = "#ED201E";
                            break;
                          case 1:
                            td.style.background = "#1788B0";
                            break;
                          case 2:
                            td.style.background = "#397737";
                            break;
                        }
                        break;
                      case 8:
                          td.appendChild(document.createTextNode(heroes[i][j]));
                          td.style.background = coscale(mov_scale(heroes[i][j]));
                        break;
                      case 15:
                          td.appendChild(document.createTextNode(heroes[i][j]));
                          td.style.background = coscale(atkp_scale(heroes[i][j]));
                        break;
                      case 13:
                        if (heroes[i][j] === 0){
                          td.appendChild(document.createTextNode("Melee"))
                        } else {
                          td.appendChild(document.createTextNode(heroes[i][j]));
                        }
                        break;
                      case 14:
                        if (heroes[i][j] === 0){
                          td.appendChild(document.createTextNode("-"));
                        } else {
                          td.appendChild(document.createTextNode(heroes[i][j]));
                        }
                        break;

                      default: 
                        td.appendChild(document.createTextNode(heroes[i][j]));
                        if (j === (heroes[i][1]+1)*2 || j === (heroes[i][1]+1)*2+1){
                          td.style.fontWeight = "bold";
                        }
                        break;
                    }
            }
        }
        body.appendChild(tbl);
}

document.onready = tableCreate();


