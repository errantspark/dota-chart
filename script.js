var nice_index = ["Name", "", "Str", "Str+", "Agi", "Agi+", "Int", "Int+", "Movement Speed", "Armor", "Base Attack Time", "Dmg Min", "Dmg Max", "Range", "Missle Speed", "Attack Point", "Day Sight", "Night Sight", "Turn Rate", "Collision"];

var index = ["name", "main_stat", "str", "str_gain", "agi", "agi_gain", "int", "int_gain", "movespeed", "base_armor", "base_attack_time", "dmg_min", "dmg_max", "attack_range", "missile_speed", "attack_point", "day_sight", "night_sight", "turn_rate", "collision_size"];

//add a damage variance column to the hero table
heroes = heroes.map(function(x, i) {
  x.splice(13, 0, (x[12] - x[11]));
  return x;
});

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
      index: i
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
}

indicies_obj = make_indicies_array(index)


Object.keys(indicies_obj).forEach(function(x) {
  indicies_obj[x].width = "30px";
})

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
}

var hero_obj = make_hero_obj(heroes, indicies_obj)

var compute_min_max = function(key, array, store) {
  //fn("str",hero_obj,indicies_obj)
  var index = [];
  array.forEach(function(x, i) {
    index[x.index] = x[key].val;
  });
  store[key].max = Math.max.apply(null, index);
  store[key].min = Math.min.apply(null, index);
};

Object.keys(indicies_obj).forEach(function(x, i) {
  compute_min_max(x, hero_obj, indicies_obj);
});

var find_in = function(term, column, array) {
  var lookup = array.map(function(x) {
    return x[column];
  });
  return lookup.indexOf(term);
};

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

var std_render = function(datum) {
  return function(tr, cb) {
    var td = tr.insertCell();
    td.appendChild(document.createTextNode(datum));
    cb(td);
  };
};

var heat_scale = chroma.scale(['lightblue', 'khaki', 'salmon']);
var render_heat_attr_n = function(datum, column, hero, whole_table) {
  //render(23, "str", {name: Abb...}, {attr: "str", name: "Stre...}, [{hero} x 100])
  var max = column.max;
  var min = column.min;
  var normalize_val = function(x) {
    return (x - min) / (max - min);
  };
  //this whole shit is retarded, i should just pass the element to be styled
  //into this function and then i wouldn't need this crazy callback bullshit
  //also i probably don't want to be running the heat scale thing on render
  //but rather include the color for each cell within the heroes table because
  //the color per hero attribute stays the same
  return function(tr, cb) {
    var td = tr.insertCell();
    td.appendChild(document.createTextNode(datum));
    td.style.background = heat_scale(normalize_val(datum));
    if (column.index === (hero.main_stat + 1) * 2 || column.index === (hero.main_stat + 1) * 2 + 1) {
      td.style.fontWeight = "bold";
    }
    cb(td);
  };
};

var colorize_by_heat = function(hero, column, heat_scale){
  var max = column.max;
  var min = column.min;
  var normalize_val = function(x) {
    return (x - min) / (max - min);
  };
  var style = {}
  style.background = heat_scale(normalize_val(hero[column.attr].val)).hex(); 
  return style;
}


var styleColumn = function(colName, styleFn, heroTable, headers){
  var header = headers[colName]
  heroTable.forEach(function(dat){
    var style = styleFn(dat, header)
    Object.keys(style).forEach(function(key){
      dat[colName].style = dat[colName].style || {}
      dat[colName].style[key] = style[key];
    })
    //dat[colName].style = colorizer(dat, header)
  })
}

var heat_colorizer = (function(heat_s){
  return function(hero, column){return colorize_by_heat(hero, column, heat_s)}
})(heat_scale)

styleColumn("str", heat_colorizer, hero_obj, indicies_obj);

var render_main_attr = function(datum) {
  var color;
  switch (datum) {
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
  return function(tr, cb) {
    var td = tr.insertCell();
    td.classList.add(color);
    cb(td);
  };
};

Object.keys(indicies_obj).forEach(function(x, i) {
  indicies_obj[x].render = render_heat_attr_n;
});

"name,night_sight,day_sight,collision_size".split(",").forEach(function(x, i) {
  indicies_obj[x].render = std_render;
});

indicies_obj.main_stat.render = render_main_attr;

var basic_render = function(tr,value){
  var td = tr.insertCell();
  td.appendChild(document.createTextNode(value.val));
  if (value.style) { Object.keys(value.style).forEach(function(key){
    td.style[key] = value.style[key]
  })
  }
  return td;
}

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
    render(hero_obj, indicies_obj);
  };
  return ret;
};

Object.keys(indicies_obj).forEach(function(name) {
  indicies_obj[name].sorter = sorter(name);
});

var render = function(hero_array, indicies_obj) {
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

  for (var i = 0; i < hero_array.length; i++) {
    var tr = tbl.insertRow();
    for (var j = 0; j < columns.length; j++) {
      var td = basic_render(tr,hero_array[i][columns[j].attr])
      //var render_this = indicies_obj[columns[j].attr].render(hero_array[i][columns[j].attr].val, columns[j], hero_array[i], hero_array);
      //render(23, "str", {attr: "str", name: "Stre...}, {name: Abb...}, [{hero} x 100])
      //var td = render_this(tr, function(x) {
      td.classList.add("column", columns[j].attr);
      //});
    }
  }
  table.appendChild(tbl);
};

var scroll_pos = 0;
window.onscroll = function() {
  var header = document.getElementById("header")
  var offset = window.scrollY - scroll_pos;
  scroll_pos = window.scrollY;
  window.requestAnimationFrame(function() {
    var margintop = window.getComputedStyle(header).marginTop;
    var margint = parseInt(margintop.slice(0, margintop.lastIndexOf("p")));
    if (offset > 0) {
      margint - offset < -60 ? margint = -60 : margint = (margint - offset)
      header.style.marginTop = margint + "px"
    } else if (offset < 0) {
      margint - offset > 0 ? margint = 0 : margint = (margint - offset)
      header.style.marginTop = margint + "px"
    } //else if (window.scrollY > 60 && header.style.marginTop !== "-60px" && offset > 0) {
    // header.style.marginTop = "-60px";
    //}
  });
};

document.getElementById("filter").oninput = function(pr) {
  var search = pr.srcElement.value;
  var fill = fuzzy.filter(search, hero_obj, {
    extract: function(el) {
      return el.name
    }
  }).map(function(el) {
    return el.original
  })
  render(fill, indicies_obj)
}

document.onready = render(hero_obj, indicies_obj);
