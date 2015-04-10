var nice_index = ["Name", "", "Str", "Str+", "Agi", "Agi+", "Int", "Int+", "Movement Speed", "Armor", "Base Attack Time", "Dmg Min", "Dmg Max", "Range", "Missle Speed", "Attack Point", "Day Sight", "Night Sight", "Turn Rate", "Collision"];

var index = ["name", "main_stat", "str", "str_gain", "agi", "agi_gain", "int", "int_gain", "movespeed", "base_armor", "base_attack_time", "dmg_min", "dmg_max", "attack_range", "missile_speed", "attack_point", "day_sight", "night_sight", "turn_rate", "collision_size"];

var heatStyle = ["str", "str_gain", "agi", "agi_gain", "int", "int_gain", "movespeed", "base_armor", "base_attack_time", "dmg_min", "dmg_max", "attack_range", "missile_speed", "attack_point", "turn_rate", "stat_gain_avg", "dmg_vari"];
//add a damage variance column to the hero table
heroes = heroes.map(function(x, i) {
  x.splice(13, 0, (x[12] - x[11]));
  return x;
});
var clone = function(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
    return copy;
}

index.splice(13, 0, "dmg_vari");
nice_index.splice(13, 0, "Damage Variance");

heroes = heroes.map(function(x, i) {
  var avg = Math.round(100 * (((x[3] + x[5] + x[7]) / 3))) / 100;
  x.splice(8, 0, avg);
  return x;
});

index.splice(8, 0, "stat_gain_avg");
nice_index.splice(8, 0, "Stat Gain Average");

var make_indicies_array = function(index) {
  var indicies = index.map(function(x, i) {
    return {
      attr: x,
      name: nice_index[i],
      index: i,
      styleFns: []
    };
  });

  var indicies_obj = (function(iind) {
    var nope = {};
    iind.forEach(function(x, i) {
      nope[x.attr] = x;
    });
    return nope;
  })(indicies);

  return indicies_obj;
};

indicies_obj = make_indicies_array(index);


Object.keys(indicies_obj).forEach(function(x) {
  indicies_obj[x].width = "30px";
});

indicies_obj.name.width = "80px";
indicies_obj.main_stat.width = "10px";

var zip_to_object = function(name_array, obj_array, idx) {
  var output = {};
  Object.keys(name_array).forEach(function(x, i) {
    output[x] = {val:obj_array[i]};
  });
  output.index = idx;
  return output;
};

var make_hero_obj = function(heroes, index) {
  return heroes.map(function(x, i) {
    return zip_to_object(index, x, i);
  });
};

var hero_obj = make_hero_obj(heroes, indicies_obj);

var compute_min_max = function(key, array, headers) {
  //fn("str",hero_obj,indicies_obj)
  var index = [];
  array.forEach(function(x, i) {
    index[x.index] = x[key].val;
  });
  headers[key].max = Math.max.apply(null, index);
  headers[key].min = Math.min.apply(null, index);
};

var updateMinMax = function(heroTable, headers){
  var newHeaders = clone(headers);
  Object.keys(newHeaders).map(function(x, i) {
    compute_min_max(x, heroTable, newHeaders);
  });
  return newHeaders;
}

indicies_obj = updateMinMax(hero_obj, indicies_obj);

var sorts = {};
sorts.damage_variability = function(x, y) {
  return Math.abs(y[11] - y[12]) - Math.abs(x[11] - x[12]);
};

sorts.base_stat = function(x, y) {
  return y[(y[1] + 1) * 2] - x[(x[1] + 1) * 2];
};

sorts.base_stat_growth = function(x, y) {
  return y[(y[1] + 1) * 2 + 1] - x[(x[1] + 1) * 2 + 1];
};

sorts.combined_stat_growth = function(x, y) {
  return (y[3] + y[5] + y[7]) - (x[3] + x[5] + x[7]);
};

sorts.movespeed = function(x, y) {
  return y[8] - x[8];
};

var heatScale = chroma.scale(['lightblue', 'khaki', 'salmon']);

var colorByHeat = function(hero, column, heatScale){
  var max = column.max;
  var min = column.min;
  var normalizeVal = function(x) {
    return (x - min) / (max - min);
  };
  var style = {};
  var classes = [];
  style.background = heatScale(normalizeVal(hero[column.attr].val)).hex(); 
  return {style: style, classes: classes};
};
//continuation cause the styling function only takes 2 argumens
var heatColorizer = (function(heatS){
  return function(hero, column){return colorByHeat(hero, column, heatS);};
})(heatScale);

var boldIfMain = function(hero, column){
  if (column.index === (hero.main_stat.val + 1) * 2 || column.index === (hero.main_stat.val + 1) * 2 + 1) {
    var style = {};
    style.fontWeight = "bold";
  }

  return {style: style};
};


var styleColumn = function(colName, styleFn, heroTable, headers){
  var header = headers[colName];
  heroTable.forEach(function(dat){
    var output = styleFn(dat,header);
    var style = output.style || {};
    var classes = output.classes || [];
    Object.keys(style).forEach(function(key){
      dat[colName].style = dat[colName].style || {};
      dat[colName].style[key] = style[key];
    });
    dat[colName].classes = classes; 
  });
};

var styleColumns = function(colNameArray, styleFn, heroTable, headers){
  colNameArray.forEach(function(dat){
    styleColumn(dat, styleFn, heroTable, headers);
  });
};



var renderMainStat = function(hero) {
  var color;
  switch (hero.main_stat.val) {
    case 0:
      color = "str_stat";
    break;
    case 1:
      color = "agi_stat";
    break;
    case 2:
      color = "int_stat";
    break;
  }
  var classes = [color];
  return {classes: classes};
};

var basicRender = function(tr,value){
  var td = tr.insertCell();
  td.appendChild(document.createTextNode(value.val));
  if (value.style) { Object.keys(value.style).forEach(function(key){
    td.style[key] = value.style[key];
  });
  }
  if (value.classes) {
    DOMTokenList.prototype.add.apply(td.classList,value.classes);
  }
  return td;
};

var styleByHeaders = function(heroTable, headers){
  var colkeys = Object.keys(headers);
  colkeys.forEach(function(key){
    if (headers[key].styleFns.length > 0){
      headers[key].styleFns.forEach(function(dat){
        styleColumn(key, dat, heroTable, headers);
      });
    }
  });
};

heatStyle.forEach(function(x, i) {
  indicies_obj[x].styleFns.push(heatColorizer);
});

"agi,agi_gain,str,str_gain,int,int_gain".split(",").forEach(function(x, i) {
  indicies_obj[x].styleFns.push(boldIfMain);
});

indicies_obj.main_stat.styleFns.push(renderMainStat);

styleByHeaders(hero_obj, indicies_obj);

var changeLevel = function(heroEl, level){
  var hero = clone(heroEl)
  "str,agi,int".split(",").forEach(function(key){
    hero[key].val = Math.round(hero[key].val+hero[key+"_gain"].val*(level-1));
  });
  return hero;
};
var mutateByLevel = function(heroInTable, level){
  var heroTable = clone(heroInTable)
  heroTable = heroTable.map(function(hero){
    return changeLevel(hero, level)
  });
  var updatedHeaders = updateMinMax(heroTable, indicies_obj)
  styleByHeaders(heroTable, updatedHeaders);
  return heroTable;
};

var sorter = function(col_name, hero_obj, indicies_obj) {
  var ret = function() {
    hero_obj.sort(function(n, m) {
      return m[col_name].val - n[col_name].val;
    });
    if (!stupidGlobalSortDirectionHack) {
      hero_obj = hero_obj.reverse();
    }
    stupidGlobalSortDirectionHack = !stupidGlobalSortDirectionHack;
    render(hero_obj, indicies_obj);
  };
  return ret;
};

var stupidGlobalSortDirectionHack = true;

var level = 1;
var render = function(heroTsable, indicies_obj) {
  var heroTable = clone(heroTsable)
  Object.keys(indicies_obj).forEach(function(name) {
    indicies_obj[name].sorter = sorter(name, heroTable, indicies_obj);
  });
  heroTable = mutateByLevel(heroTable, level)
  //this deletes every table
  Array.prototype.slice.call(document.getElementsByTagName("table")).forEach(function(x) {
    x.remove();
  });
  //this draws the top
  var headtable = document.getElementById('tablehead');
  var headers = document.createElement('table');
  var tr = headers.insertRow();

  var columns = [];
  Object.keys(indicies_obj).forEach(function(name) {
    columns[indicies_obj[name].index] = indicies_obj[name];
  });

  for (var j = 0; j < columns.length; j++) {
    var td = tr.insertCell();
    td.appendChild(document.createTextNode(columns[j].name));
    td.addEventListener("click", columns[j].sorter);
    td.classList.add("column", columns[j].attr, "tableheaders");
  }

  headtable.appendChild(headers);
  //this section draws the table
  var table = document.getElementById('table');
  var tbl = document.createElement('table');

  for (var i = 0; i < heroTable.length; i++) {
    var tr = tbl.insertRow();
    for (var j = 0; j < columns.length; j++) {
      var td = basicRender(tr,heroTable[i][columns[j].attr]);
      td.classList.add("column", columns[j].attr);
    }
  }
  table.appendChild(tbl);
};

var scroll_pos = 0;
window.onscroll = function() {
  var header = document.getElementById("header");
  var offset = window.scrollY - scroll_pos;
  scroll_pos = window.scrollY;
  window.requestAnimationFrame(function() {
    var margintop = window.getComputedStyle(header).marginTop;
    var margint = parseInt(margintop.slice(0, margintop.lastIndexOf("p")));
    if (offset > 0) {
      margint - offset < -60 ? margint = -60 : margint = (margint - offset);
      header.style.marginTop = margint + "px";
    } else if (offset < 0) {
      margint - offset > 0 ? margint = 0 : margint = (margint - offset);
      header.style.marginTop = margint + "px";
    } //else if (window.scrollY > 60 && header.style.marginTop !== "-60px" && offset > 0) {
    // header.style.marginTop = "-60px";
    //}
  });
};
document.getElementById("filter").oninput = function(pr) {
  var search = pr.srcElement.value.split(",");
  var fill = search.map(function(elem){
    return fuzzy.filter(elem, hero_obj, {
      extract: function(el) {
       return el.name.val;
      }
    }).map(function(el) {
      return el.original;
    })
  })
  fill = fill.reduce(function(x,y){return x.concat(y)})
  render(fill, indicies_obj);
  };

document.onready = render(hero_obj, indicies_obj);
