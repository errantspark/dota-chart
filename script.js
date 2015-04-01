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

//DESIGN NOTES: I want to keep the hero data as raw as possible and have a few
//functions the serve as "views" to transpose the data into a reasonable format
//and then render that, the "reasonable format" should be an object that
//has a .render function that gets passed an element and styles it

var create_rescale = function(idx){
  var x_tract = heroes.map(function(d){return d[idx]});
  var max = Math.max.apply(null, x_tract);
  var min = Math.min.apply(null, x_tract);
  return function(x){return (x-min)/(max-min)}
}

var handle_movespeed = (function(heros){
  var rescale_ms = create_rescale(8);
  return ;
})(heroes);

//this function is kind of a matrix thing where it takes a heroes and a 
//a mapping array where the array is a set of [20] functions that determine the 
//rendering by each taking an element (a td) and styling it/adding info
//this is passed an already sorted array?
//yes it makes sense because you might want to change the look of the table
//based on a sort and thus it makes sense to sort -> pass into combiner function
//that takes the table and genertes rendering rules
//
//yes this is a good idea because if i add a column to i can simply add a styling
//function and then the renderer just runs a the corresponding function agnostically
var std_render = function(datum, index, heroindex, whole_table){
  return function(tr){
    var td = tr.insertCell();
    td.appendChild(document.createTextNode(datum))
  }
}


var render_heat = function(datum, index, heroindex, whole_table){
   var heat_scale = chroma.scale(['lightblue', 'khaki' ,  'salmon']);
   var x_tract = whole_table.map(function(d){return d[index]});
   var max = Math.max.apply(null, x_tract);
   var min = Math.min.apply(null, x_tract);
   var normalize_val = function(x){return (x-min)/(max-min)}
   return function(tr){
      var td = tr.insertCell();
      td.appendChild(document.createTextNode(datum))
      td.style.background = heat_scale(normalize_val(datum))
   }
}


var merges = new Array(20);
merges[7] = render_heat;

var make_renderer = function(hero_array,merge_gen_array){
  return hero_array.map(function(hero,i){
    return hero.map(function(value, j){
      if (merge_gen_array[j] === undefined){
        return std_render(value, j)
      }else{
        return merge_gen_array[j](value, j, i, hero_array)
      }
    })
  })

}


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

var mov_scale =  create_rescale(8); 
var atkp_scale = create_rescale(15);


var sorter = function(x){
  var desc = true;
  var ret = function(){ 
    var test = "lol";
    heroes.sort(function(n,m){return m[x]-n[x]})
    if (!desc){
      heroes = heroes.reverse()
    }
    desc = !desc;
    tableCreate2();
  }
  return ret;
}
var sorts = [];
sorts = index.map(function(d, i){return sorter(i)})
function tableCreate2(){
  var champs = make_renderer(heroes, merges);
  Array.prototype.slice.call(document.getElementsByTagName("table")).forEach(function(x){x.remove()})
  var body = document.getElementsByTagName('body')[0],
      tbl  = document.createElement('table');

  var tr = tbl.insertRow();
  for(var j = 0; j < 20; j++){
    var td = tr.insertCell();
    td.appendChild(document.createTextNode(index[j]));
    td.addEventListener("click", sorts[j])
  }
  for(var i = 0; i < heroes.length; i++){
    var tr = tbl.insertRow();
    for(var j = 0; j < 20; j++){
      //render
      champs[i][j](tr);
    }
  }
  body.appendChild(tbl);
}

document.onready = tableCreate2();
function tableCreate(){
  Array.prototype.slice.call(document.getElementsByTagName("table")).forEach(function(x){x.remove()})
  var body = document.getElementsByTagName('body')[0],
      tbl  = document.createElement('table');

  var tr = tbl.insertRow();
  for(var j = 0; j < 20; j++){
    var td = tr.insertCell();
    td.appendChild(document.createTextNode(index[j]));
    td.addEventListener("click", sorts[j])
  }
  for(var i = 0; i < heroes.length; i++){
    var tr = tbl.insertRow();
    for(var j = 0; j < 20; j++){
      //render
      //table[i][j](tr);
      var td = tr.insertCell();
      switch (j){
        case 1:
          switch (heroes[i][j]) {
            case 0:
              td.style.background = "#ED201E";
              break;
            case 1:
              td.style.background = "#397737";
              break;
            case 2:
              td.style.background = "#1788B0";
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

//document.onready = tableCreate();


