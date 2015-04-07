var old_index = ["Hero     ",
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
  "Collision"
];

var nice_index = ["Name", "Main Stat", "Str", "Str+", "Agi", "Agi+", "Int", "Int+", "Movement Speed", "Armor", "Base Attack Time", "Dmg Min", "Dmg Max", "Range", "Missle Speed", "Attack Point", "Day Sight", "Night Sight", "Turn Rate", "Collision"];

var index = ["name", "main_stat", "str", "str_gain", "agi", "agi_gain", "int", "int_gain", "movespeed", "base_armor", "base_attack_time", "dmg_min", "dmg_max", "attack_range", "missile_speed", "attack_point", "day_sight", "night_sight", "turn_rate", "collision_size"];

//add a damage variance column to the hero table
heroes = heroes.map(function(x, i) {
  x.splice(13, 0, (x[12] - x[11]));
  return x;
});

index.splice(13, 0, "dmg_vari");
nice_index.splice(13, 0, "Damage Variance");

var indicies = index.map(function(x, i) {
  return {
    attr: x,
    name: nice_index[i],
    index: i
  };
});

var indicies_obj = (function(iind){
  var nope = {};
  iind.forEach(function(x,i){
    nope[x.attr] = x ;
  });
  return nope;
})(indicies);

//indicies is an array
//[{attr:

var zip_to_object = function(name_array, obj_array, idx) {
  var output = {};
  name_array.forEach(function(x, i) {
    output[x] = obj_array[i];
  });
  output.index = idx;
  return output;
};



hero_obj = heroes.map(function(x, i) {
  return zip_to_object(index, x, i);
});

var compute_min_max = function(key,array,store){
  //fn("str",hero_obj,indicies_obj)
  var index = [];
  array.forEach(function(x,i){
    index[x.index] = x[key];
  });
  store[key].max = Math.max.apply(null, index);
  store[key].min = Math.min.apply(null, index);
};
compute_min_max("str",hero_obj,indicies_obj);

var find_in = function(term, column, array) {
  var lookup = array.map(function(x) {
    return x[column];
  });
  return lookup.indexOf(term);
};

var col_w = new Array(20);
col_w[0] = [80];


var viewhero = function(x) {
  heroes[x].forEach(function(x, i) {
    console.log(index[i] + ": " + x);
  });
};

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

//DESIGN NOTES: I want to keep the hero data as raw as possible and have a few
//functions the serve as "views" to transpose the data into a reasonable format
//and then render that, the "reasonable format" should be an object that
//has a .render function that gets passed an element and styles it


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
var make_renderer = function(hero_array, view_gen_array) {
  return hero_array.map(function(hero, i) {
    return hero.map(function(value, j) {
      if (view_gen_array[j] === undefined) {
        return std_render(value, j);
      } else if (view_gen_array[j] === null) {
        return function() {};
      } else {
        return view_gen_array[j](value, j, i, hero_array);
      }
    });
  });
};

var std_render = function(datum, index, heroindex, whole_table) {
  return function(tr, cb) {
    var td = tr.insertCell();
    td.appendChild(document.createTextNode(datum));
    cb(td);
  };
};

var render_heat = function(datum, index, heroindex, whole_table) {
  var heat_scale = chroma.scale(['lightblue', 'khaki', 'salmon']);
  var x_tract = whole_table.map(function(d) {
    return d[index];
  });
  var max = Math.max.apply(null, x_tract);
  var min = Math.min.apply(null, x_tract);
  var normalize_val = function(x) {
    return (x - min) / (max - min);
  };
  return function(tr, cb) {
    var td = tr.insertCell();
    td.appendChild(document.createTextNode(datum));
    td.style.background = heat_scale(normalize_val(datum));
    cb(td);
  };
};

var render_heat_attr = function(datum, index, heroindex, whole_table) {
  var heat_scale = chroma.scale(['lightblue', 'khaki', 'salmon']);
  var x_tract = whole_table.map(function(d) {
    return d[index];
  });
  var max = Math.max.apply(null, x_tract);
  var min = Math.min.apply(null, x_tract);
  var normalize_val = function(x) {
    return (x - min) / (max - min);
  };
  return function(tr, cb) {
    var td = tr.insertCell();
    td.appendChild(document.createTextNode(datum));
    td.style.background = heat_scale(normalize_val(datum));
    if (index === (whole_table[heroindex][1] + 1) * 2 || index === (whole_table[heroindex][1] + 1) * 2 + 1) {
      td.style.fontWeight = "bold";
    }
    cb(td);
  };
};

var render_heat_attr_n = function(datum, name, hero, column, whole_table) {
  debugger;
  //render(23, "str", {name: Abb...}, {attr: "str", name: "Stre...}, [{hero} x 100])
  var heat_scale = chroma.scale(['lightblue', 'khaki', 'salmon']);
  //var x_tract = whole_table.map(function(d) {
  //  return d[index];
  //});
  //var max = .max.apply(null, x_tract);
  //var min = Math.min.apply(null, x_tract);
  var max = column.max
  var min = column.min
  var normalize_val = function(x) {
    return (x - min) / (max - min);
  };
  return function(tr, cb) {
    var td = tr.insertCell();
    td.appendChild(document.createTextNode(datum));
    td.style.background = heat_scale(normalize_val(datum));
    if (index === (hero.main_stat + 1) * 2 || index === (hero.main_stat + 1) * 2 + 1) {
      td.style.fontWeight = "bold";
    }
    cb(td);
  };
};


var render_main_attr = function(datum) {
  var color;
  switch (datum) {
    case 0:
      color = "#ED201E";
    break;
    case 1:
      color = "#397737";
    break;
    case 2:
      color = "#1788B0";
    break;
  }
  return function(tr, cb) {
    var td = tr.insertCell();
    td.style.background = color;
    cb(td);
  };
};

Object.keys(indicies_obj).forEach(function(x, i) {
   indicies_obj[x].render = std_render;
});

//for (var i = 2; i < 8; i++) {
//  views[indicies[i].attr] = render_heat_attr;
//}

var sorter = function(col_name) {
  var desc = true;
  var ret = function() {
    hero_obj.sort(function(n, m) {
      return m[col_name] - n[col_name];
    });
    if (!desc) {
      hero_obj = hero_obj.reverse();
    }
    desc = !desc;
    render(hero_obj, views, indicies);
  };
  return ret;
};

var sorters = [];
sorters = indicies.map(function(d) {
  return sorter(d.attr);
});

var render = function(hero_array, indicies_array) {
  //this deletes every table
  Array.prototype.slice.call(document.getElementsByTagName("table")).forEach(function(x) {
    x.remove();
  });
  //this draws the top
  var headtable = document.getElementById('tablehead');
  var headers = document.createElement('table');
  var tr = headers.insertRow();

  var columns = []
  Object.keys(indicies_array).forEach(function(x,i){
    columns[indicies_array[x].index] = indicies_array[x];
  });

  for (var j = 0; j < columns.length; j++) {
    var td = tr.insertCell();
    td.appendChild(document.createTextNode(columns[j].name));
    td.addEventListener("click", sorters[j]);
    if (col_w[j]) {
      td.style.width = col_w[j] + "px";
      td.style.maxWidth = col_w[j] + "px";
    } else {
      td.style.width = "30px";
      td.style.maxWidth = "30px";
    }
  }

  headtable.appendChild(headers);
  //this section draws the table
  var table = document.getElementById('table');
  var tbl = document.createElement('table');

  for (var i = 0; i < hero_array.length; i++) {
    var tr = tbl.insertRow();
    for (var j = 0; j < columns.length; j++) {
      var render_this = indicies_array[columns[j].attr].render(hero_array[i][columns[j].attr], columns[j], hero_array[i], indicies_array[columns[j]], hero_array);
      //render(23, "str", {name: Abb...}, {attr: "str", name: "Stre...}, [{hero} x 100])
      var td = render_this(tr, function(x) {
        if (col_w[j]) {
          x.style.width = col_w[j] + "px";
          x.style.maxWidth = col_w[j] + "px";
        } else {
          x.style.width = "30px";
          x.style.maxWidth = "30px";
        }
      });
    }

  }
  table.appendChild(tbl);

};

window.onscroll = function() {
  window.requestAnimationFrame(function() {
    if (window.scrollY <= 60) {
      header.style.marginTop = "-" + window.scrollY + "px";
    } else if (window.scrollY > 60 && header.style.marginTop !== "-60px") {
      header.style.marginTop = "-60px";
    }
  });

};

document.onready = render(hero_obj, indicies_obj);
