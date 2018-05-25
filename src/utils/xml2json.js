/*	This work is licensed under Creative Commons GNU LGPL License.

	License: http://creativecommons.org/licenses/LGPL/2.1/
   Version: 0.9
	Author:  Stefan Goessner/2006
	Web:     http://goessner.net/
*/ // eslint-disable-line
export default function xml2json(xml, tab) {
  var X = {
    toObj: function(xml) {
      var o = {};
      var n;
      // element node ..
      if (xml.nodeType == 1) {
        // element with attributes  ..
        if (xml.attributes.length)
          for (var i = 0; i < xml.attributes.length; i++)
            o["@" + xml.attributes[i].nodeName] = (
              xml.attributes[i].nodeValue || ""
            ).toString();
        // element has child nodes ..
        if (xml.firstChild) {
          var textChild = 0,
            cdataChild = 0,
            hasElementChild = false;
          for (n = xml.firstChild; n; n = n.nextSibling) {
            if (n.nodeType == 1) hasElementChild = true;
            // non-whitespace text
            else if (n.nodeType == 3 && n.nodeValue.match(/[^ \f\n\r\t\v]/))
              textChild++;
            // cdata section node
            else if (n.nodeType == 4) cdataChild++;
          }
          if (hasElementChild) {
            // structured element with evtl. a single text or/and cdata node ..
            if (textChild < 2 && cdataChild < 2) {
              X.removeWhite(xml);
              for (n = xml.firstChild; n; n = n.nextSibling) {
                // text node
                if (n.nodeType == 3) o["#text"] = X.escape(n.nodeValue);
                // cdata node
                else if (n.nodeType == 4) o["#cdata"] = X.escape(n.nodeValue);
                // multiple occurence of element ..
                else if (o[n.nodeName]) {
                  if (o[n.nodeName] instanceof Array)
                    o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                  else o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                  // first occurence of element..
                } else o[n.nodeName] = X.toObj(n);
              }
              // mixed content
            } else {
              if (!xml.attributes.length) o = X.escape(X.innerXml(xml));
              else o["#text"] = X.escape(X.innerXml(xml));
            }
            // pure text
          } else if (textChild) {
            if (!xml.attributes.length) o = X.escape(X.innerXml(xml));
            else o["#text"] = X.escape(X.innerXml(xml));
            // cdata
          } else if (cdataChild) {
            if (cdataChild > 1) o = X.escape(X.innerXml(xml));
            else
              for (n = xml.firstChild; n; n = n.nextSibling)
                o["#cdata"] = X.escape(n.nodeValue);
          }
        }
        if (!xml.attributes.length && !xml.firstChild) o = null;
        // document.node
      } else if (xml.nodeType == 9) {
        o = X.toObj(xml.documentElement);
      } else alert("unhandled node type: " + xml.nodeType);
      return o;
    },
    toJson: function(o, name, ind) {
      var json = name ? `"${name}"` : "";
      if (o instanceof Array) {
        for (var i = 0, n = o.length; i < n; i++)
          o[i] = X.toJson(o[i], "", ind + "\t");
        json += (name ? ":[" : "[") + (o.length > 1 ? ("\n" + ind + "\t" + o.join(",\n" + ind + "\t") + "\n" + ind) : o.join("")) + "]"; // eslint-disable-line
      } else if (o == null) json += (name && ":") + "null";
      else if (typeof o == "object") {
        var arr = [];
        for (var m in o) arr[arr.length] = X.toJson(o[m], m, ind + "\t");
        json += (name ? ":{" : "{") + (arr.length > 1 ? ("\n" + ind + "\t" + arr.join(",\n" + ind + "\t") + "\n" + ind) : arr.join("")) + "}"; // eslint-disable-line
      } else if (typeof o == "string")
        json += `${name && ":"} "${o.toString()}"`;
      else json += (name && ":") + o.toString();
      return json;
    },
    innerXml: function(node) {
      var s = "";
      if ("innerHTML" in node) s = node.innerHTML;
      else {
        var asXml = function(n) {
          var s = "";
          if (n.nodeType == 1) {
            s += "<" + n.nodeName;
            for (var i = 0; i < n.attributes.length; i++)
              s += ` ${n.attributes[i].nodeName} ="
              ${(n.attributes[i].nodeValue || "").toString()} "`;
            if (n.firstChild) {
              s += ">";
              for (var c = n.firstChild; c; c = c.nextSibling) s += asXml(c);
              s += "</" + n.nodeName + ">";
            } else s += "/>";
          } else if (n.nodeType == 3) s += n.nodeValue;
          else if (n.nodeType == 4) s += "<![CDATA[" + n.nodeValue + "]]>";
          return s;
        };
        for (var c = node.firstChild; c; c = c.nextSibling) s += asXml(c);
      }
      return s;
    },
    escape: function(txt) {
      return txt
        .replace(/[\\]/g, "\\\\")
        .replace(/["]/g, '\\"')
        .replace(/[\n]/g, "\\n")
        .replace(/[\r]/g, "\\r");
    },
    removeWhite: function(e) {
      e.normalize();
      for (var n = e.firstChild; n; ) {
        // text node
        if (n.nodeType == 3) {
          // pure whitespace text node
          if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) {
            var nxt = n.nextSibling;
            e.removeChild(n);
            n = nxt;
          } else n = n.nextSibling;
          // element node
        } else if (n.nodeType == 1) {
          X.removeWhite(n);
          n = n.nextSibling;
          // any other node
        } else n = n.nextSibling;
      }
      return e;
    }
  };
  // document node
  if (xml.nodeType == 9) xml = xml.documentElement;
  var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
  return `{\n ${tab +
    (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, ""))} \n}`;
}
