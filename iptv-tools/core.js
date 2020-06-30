module.exports = function(m3u8Parser) {
  return function(m3u8) {
    var putAry = function(map, key, value) {
      var ary = map[key];
      if (ary === undefined) {
        ary = [value];
        map[key] = ary;
      } else {
        ary.push(value);
      }
    };
    var countryName = {
      CN:'大陆',
      HK:'香港',
      MO:'澳门',
      TW:'台湾',
      SG:'新加坡',
      MY:'马来西亚'
    };
    var genreName = {
      General:'综合',
      Education:'教育',
      News:'新闻',
      Kids:'儿童',
      Music:'音乐',
      Entertainment:'娱乐',
      Sport:'体育',
      Movies:'电影',
      Documentary:'记实',
      Religious:'宗教',
      Travel:'旅游',
      Legislative:'',
      Weather:'天气',
      Lifestyle:'生活'
    };
    var result = m3u8Parser.parse(m3u8);
    var items = result.items;
    var map = {};
    items.filter(e => e.url).map( e => {
        return {
          url:e.url,
          name:e.name,
          genre:e.group.title,
          country:e.tvg.country,
          simpleName:e.tvg.name
        }
    }).forEach(e => {
      putAry(map, e.name, e);
    });
    var merged = [];
    for (var name in map) {
      if (map.hasOwnProperty(name)) {
        var ary = map[name];
        merged.push(ary.slice(1).reduce((a,b)=>{
          a.url = a.url + '#' + b.url;
          return a;
        }, ary[0]));
      }
    }
    var byCountry = {};
    merged.forEach(e => {
      putAry(byCountry, e.country, e);
    });
    var byGenre = {};
    merged.forEach(e => {
      putAry(byGenre, e.genre, e);
    });

    var toTxt = function(group, nameMap, empty) {
      var output = '';
      for (var name in group) {
        if (group.hasOwnProperty(name)) {
          output += (nameMap[name] || name || empty) + ',#genre#\n';
          var ary = group[name];
          ary.forEach(e => {
            output += e.name + ',' + e.url + '\n';
          });
          output += '\n';
        }
      }
      return output;
    };
    return toTxt(byCountry, countryName, '其他地区') + toTxt(byGenre, genreName, '其他类别');
  };
};
