// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

var qt = Object.create;
var Oe = Object.defineProperty;
var Yt = Object.getOwnPropertyDescriptor;
var Ht = Object.getOwnPropertyNames;
var Wt = Object.getPrototypeOf, Qt = Object.prototype.hasOwnProperty;
var j = (e, t)=>()=>(t || e((t = {
            exports: {}
        }).exports, t), t.exports), Zt = (e, t)=>{
    for(var n in t)Oe(e, n, {
        get: t[n],
        enumerable: !0
    });
}, we = (e, t, n, r)=>{
    if (t && typeof t == "object" || typeof t == "function") for (let i of Ht(t))!Qt.call(e, i) && i !== n && Oe(e, i, {
        get: ()=>t[i],
        enumerable: !(r = Yt(t, i)) || r.enumerable
    });
    return e;
}, z = (e, t, n)=>(we(e, t, "default"), n && we(n, t, "default")), Ye = (e, t, n)=>(n = e != null ? qt(Wt(e)) : {}, we(t || !e || !e.__esModule ? Oe(n, "default", {
        value: e,
        enumerable: !0
    }) : n, e));
var J = j((G)=>{
    "use strict";
    function Bt(e, t, n) {
        if (n === void 0 && (n = Array.prototype), e && typeof n.find == "function") return n.find.call(e, t);
        for(var r = 0; r < e.length; r++)if (Object.prototype.hasOwnProperty.call(e, r)) {
            var i = e[r];
            if (t.call(void 0, i, r, e)) return i;
        }
    }
    function be(e, t) {
        return t === void 0 && (t = Object), t && typeof t.freeze == "function" ? t.freeze(e) : e;
    }
    function Kt(e, t) {
        if (e === null || typeof e != "object") throw new TypeError("target is not an object");
        for(var n in t)Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e;
    }
    var He = be({
        HTML: "text/html",
        isHTML: function(e) {
            return e === He.HTML;
        },
        XML_APPLICATION: "application/xml",
        XML_TEXT: "text/xml",
        XML_XHTML_APPLICATION: "application/xhtml+xml",
        XML_SVG_IMAGE: "image/svg+xml"
    }), We = be({
        HTML: "http://www.w3.org/1999/xhtml",
        isHTML: function(e) {
            return e === We.HTML;
        },
        SVG: "http://www.w3.org/2000/svg",
        XML: "http://www.w3.org/XML/1998/namespace",
        XMLNS: "http://www.w3.org/2000/xmlns/"
    });
    G.assign = Kt;
    G.find = Bt;
    G.freeze = be;
    G.MIME_TYPE = He;
    G.NAMESPACE = We;
});
var Xe = j((X)=>{
    var nt = J(), C = nt.find, ee = nt.NAMESPACE;
    function Jt(e) {
        return e !== "";
    }
    function en(e) {
        return e ? e.split(/[\t\n\f\r ]+/).filter(Jt) : [];
    }
    function tn(e, t) {
        return e.hasOwnProperty(t) || (e[t] = !0), e;
    }
    function Qe(e) {
        if (!e) return [];
        var t = en(e);
        return Object.keys(t.reduce(tn, {}));
    }
    function nn(e) {
        return function(t) {
            return e && e.indexOf(t) !== -1;
        };
    }
    function ne(e, t) {
        for(var n in e)Object.prototype.hasOwnProperty.call(e, n) && (t[n] = e[n]);
    }
    function b(e, t) {
        var n = e.prototype;
        if (!(n instanceof t)) {
            let i = function() {};
            i.prototype = t.prototype, i = new i, ne(n, i), e.prototype = n = i;
        }
        n.constructor != e && (typeof e != "function" && console.error("unknown Class:" + e), n.constructor = e);
    }
    var I = {}, x = I.ELEMENT_NODE = 1, q = I.ATTRIBUTE_NODE = 2, fe = I.TEXT_NODE = 3, rt = I.CDATA_SECTION_NODE = 4, it = I.ENTITY_REFERENCE_NODE = 5, rn = I.ENTITY_NODE = 6, at = I.PROCESSING_INSTRUCTION_NODE = 7, ot = I.COMMENT_NODE = 8, ut = I.DOCUMENT_NODE = 9, st = I.DOCUMENT_TYPE_NODE = 10, L = I.DOCUMENT_FRAGMENT_NODE = 11, an = I.NOTATION_NODE = 12, D = {}, y = {}, Cn = D.INDEX_SIZE_ERR = (y[1] = "Index size error", 1), Mn = D.DOMSTRING_SIZE_ERR = (y[2] = "DOMString size error", 2), O = D.HIERARCHY_REQUEST_ERR = (y[3] = "Hierarchy request error", 3), Pn = D.WRONG_DOCUMENT_ERR = (y[4] = "Wrong document", 4), Ln = D.INVALID_CHARACTER_ERR = (y[5] = "Invalid character", 5), Un = D.NO_DATA_ALLOWED_ERR = (y[6] = "No data allowed", 6), Xn = D.NO_MODIFICATION_ALLOWED_ERR = (y[7] = "No modification allowed", 7), ct = D.NOT_FOUND_ERR = (y[8] = "Not found", 8), kn = D.NOT_SUPPORTED_ERR = (y[9] = "Not supported", 9), Ze = D.INUSE_ATTRIBUTE_ERR = (y[10] = "Attribute in use", 10), Fn = D.INVALID_STATE_ERR = (y[11] = "Invalid state", 11), zn = D.SYNTAX_ERR = (y[12] = "Syntax error", 12), Vn = D.INVALID_MODIFICATION_ERR = (y[13] = "Invalid modification", 13), jn = D.NAMESPACE_ERR = (y[14] = "Invalid namespace", 14), Gn = D.INVALID_ACCESS_ERR = (y[15] = "Invalid access", 15);
    function d(e, t) {
        if (t instanceof Error) var n = t;
        else n = this, Error.call(this, y[e]), this.message = y[e], Error.captureStackTrace && Error.captureStackTrace(this, d);
        return n.code = e, t && (this.message = this.message + ": " + t), n;
    }
    d.prototype = Error.prototype;
    ne(D, d);
    function P() {}
    P.prototype = {
        length: 0,
        item: function(e) {
            return this[e] || null;
        },
        toString: function(e, t) {
            for(var n = [], r = 0; r < this.length; r++)$(this[r], n, e, t);
            return n.join("");
        },
        filter: function(e) {
            return Array.prototype.filter.call(this, e);
        },
        indexOf: function(e) {
            return Array.prototype.indexOf.call(this, e);
        }
    };
    function Y(e, t) {
        this._node = e, this._refresh = t, Se(this);
    }
    function Se(e) {
        var t = e._node._inc || e._node.ownerDocument._inc;
        if (e._inc != t) {
            var n = e._refresh(e._node);
            yt(e, "length", n.length), ne(n, e), e._inc = t;
        }
    }
    Y.prototype.item = function(e) {
        return Se(this), this[e];
    };
    b(Y, P);
    function pe() {}
    function lt(e, t) {
        for(var n = e.length; n--;)if (e[n] === t) return n;
    }
    function Be(e, t, n, r) {
        if (r ? t[lt(t, r)] = n : t[t.length++] = n, e) {
            n.ownerElement = e;
            var i = e.ownerDocument;
            i && (r && ht(i, e, r), on(i, e, n));
        }
    }
    function Ke(e, t, n) {
        var r = lt(t, n);
        if (r >= 0) {
            for(var i = t.length - 1; r < i;)t[r] = t[++r];
            if (t.length = i, e) {
                var a = e.ownerDocument;
                a && (ht(a, e, n), n.ownerElement = null);
            }
        } else throw new d(ct, new Error(e.tagName + "@" + n));
    }
    pe.prototype = {
        length: 0,
        item: P.prototype.item,
        getNamedItem: function(e) {
            for(var t = this.length; t--;){
                var n = this[t];
                if (n.nodeName == e) return n;
            }
        },
        setNamedItem: function(e) {
            var t = e.ownerElement;
            if (t && t != this._ownerElement) throw new d(Ze);
            var n = this.getNamedItem(e.nodeName);
            return Be(this._ownerElement, this, e, n), n;
        },
        setNamedItemNS: function(e) {
            var t = e.ownerElement, n;
            if (t && t != this._ownerElement) throw new d(Ze);
            return n = this.getNamedItemNS(e.namespaceURI, e.localName), Be(this._ownerElement, this, e, n), n;
        },
        removeNamedItem: function(e) {
            var t = this.getNamedItem(e);
            return Ke(this._ownerElement, this, t), t;
        },
        removeNamedItemNS: function(e, t) {
            var n = this.getNamedItemNS(e, t);
            return Ke(this._ownerElement, this, n), n;
        },
        getNamedItemNS: function(e, t) {
            for(var n = this.length; n--;){
                var r = this[n];
                if (r.localName == t && r.namespaceURI == e) return r;
            }
            return null;
        }
    };
    function ft() {}
    ft.prototype = {
        hasFeature: function(e, t) {
            return !0;
        },
        createDocument: function(e, t, n) {
            var r = new re;
            if (r.implementation = this, r.childNodes = new P, r.doctype = n || null, n && r.appendChild(n), t) {
                var i = r.createElementNS(e, t);
                r.appendChild(i);
            }
            return r;
        },
        createDocumentType: function(e, t, n) {
            var r = new ve;
            return r.name = e, r.nodeName = e, r.publicId = t || "", r.systemId = n || "", r;
        }
    };
    function f() {}
    f.prototype = {
        firstChild: null,
        lastChild: null,
        previousSibling: null,
        nextSibling: null,
        attributes: null,
        parentNode: null,
        childNodes: null,
        ownerDocument: null,
        nodeValue: null,
        namespaceURI: null,
        prefix: null,
        localName: null,
        insertBefore: function(e, t) {
            return he(this, e, t);
        },
        replaceChild: function(e, t) {
            he(this, e, t, vt), t && this.removeChild(t);
        },
        removeChild: function(e) {
            return mt(this, e);
        },
        appendChild: function(e) {
            return this.insertBefore(e, null);
        },
        hasChildNodes: function() {
            return this.firstChild != null;
        },
        cloneNode: function(e) {
            return Ae(this.ownerDocument || this, this, e);
        },
        normalize: function() {
            for(var e = this.firstChild; e;){
                var t = e.nextSibling;
                t && t.nodeType == fe && e.nodeType == fe ? (this.removeChild(t), e.appendData(t.data)) : (e.normalize(), e = t);
            }
        },
        isSupported: function(e, t) {
            return this.ownerDocument.implementation.hasFeature(e, t);
        },
        hasAttributes: function() {
            return this.attributes.length > 0;
        },
        lookupPrefix: function(e) {
            for(var t = this; t;){
                var n = t._nsMap;
                if (n) {
                    for(var r in n)if (Object.prototype.hasOwnProperty.call(n, r) && n[r] === e) return r;
                }
                t = t.nodeType == q ? t.ownerDocument : t.parentNode;
            }
            return null;
        },
        lookupNamespaceURI: function(e) {
            for(var t = this; t;){
                var n = t._nsMap;
                if (n && Object.prototype.hasOwnProperty.call(n, e)) return n[e];
                t = t.nodeType == q ? t.ownerDocument : t.parentNode;
            }
            return null;
        },
        isDefaultNamespace: function(e) {
            var t = this.lookupPrefix(e);
            return t == null;
        }
    };
    function pt(e) {
        return e == "<" && "&lt;" || e == ">" && "&gt;" || e == "&" && "&amp;" || e == '"' && "&quot;" || "&#" + e.charCodeAt() + ";";
    }
    ne(I, f);
    ne(I, f.prototype);
    function te(e, t) {
        if (t(e)) return !0;
        if (e = e.firstChild) do if (te(e, t)) return !0;
        while (e = e.nextSibling)
    }
    function re() {
        this.ownerDocument = this;
    }
    function on(e, t, n) {
        e && e._inc++;
        var r = n.namespaceURI;
        r === ee.XMLNS && (t._nsMap[n.prefix ? n.localName : ""] = n.value);
    }
    function ht(e, t, n, r) {
        e && e._inc++;
        var i = n.namespaceURI;
        i === ee.XMLNS && delete t._nsMap[n.prefix ? n.localName : ""];
    }
    function Re(e, t, n) {
        if (e && e._inc) {
            e._inc++;
            var r = t.childNodes;
            if (n) r[r.length++] = n;
            else {
                for(var i = t.firstChild, a = 0; i;)r[a++] = i, i = i.nextSibling;
                r.length = a, delete r[r.length];
            }
        }
    }
    function mt(e, t) {
        var n = t.previousSibling, r = t.nextSibling;
        return n ? n.nextSibling = r : e.firstChild = r, r ? r.previousSibling = n : e.lastChild = n, t.parentNode = null, t.previousSibling = null, t.nextSibling = null, Re(e.ownerDocument, e), t;
    }
    function un(e) {
        return e && (e.nodeType === f.DOCUMENT_NODE || e.nodeType === f.DOCUMENT_FRAGMENT_NODE || e.nodeType === f.ELEMENT_NODE);
    }
    function sn(e) {
        return e && (M(e) || xe(e) || U(e) || e.nodeType === f.DOCUMENT_FRAGMENT_NODE || e.nodeType === f.COMMENT_NODE || e.nodeType === f.PROCESSING_INSTRUCTION_NODE);
    }
    function U(e) {
        return e && e.nodeType === f.DOCUMENT_TYPE_NODE;
    }
    function M(e) {
        return e && e.nodeType === f.ELEMENT_NODE;
    }
    function xe(e) {
        return e && e.nodeType === f.TEXT_NODE;
    }
    function Je(e, t) {
        var n = e.childNodes || [];
        if (C(n, M) || U(t)) return !1;
        var r = C(n, U);
        return !(t && r && n.indexOf(r) > n.indexOf(t));
    }
    function et(e, t) {
        var n = e.childNodes || [];
        function r(a) {
            return M(a) && a !== t;
        }
        if (C(n, r)) return !1;
        var i = C(n, U);
        return !(t && i && n.indexOf(i) > n.indexOf(t));
    }
    function cn(e, t, n) {
        if (!un(e)) throw new d(O, "Unexpected parent node type " + e.nodeType);
        if (n && n.parentNode !== e) throw new d(ct, "child not in parent");
        if (!sn(t) || U(t) && e.nodeType !== f.DOCUMENT_NODE) throw new d(O, "Unexpected node type " + t.nodeType + " for parent node type " + e.nodeType);
    }
    function ln(e, t, n) {
        var r = e.childNodes || [], i = t.childNodes || [];
        if (t.nodeType === f.DOCUMENT_FRAGMENT_NODE) {
            var a = i.filter(M);
            if (a.length > 1 || C(i, xe)) throw new d(O, "More than one element or text in fragment");
            if (a.length === 1 && !Je(e, n)) throw new d(O, "Element in fragment can not be inserted before doctype");
        }
        if (M(t) && !Je(e, n)) throw new d(O, "Only one element can be added and only after doctype");
        if (U(t)) {
            if (C(r, U)) throw new d(O, "Only one doctype is allowed");
            var o = C(r, M);
            if (n && r.indexOf(o) < r.indexOf(n)) throw new d(O, "Doctype can only be inserted before an element");
            if (!n && o) throw new d(O, "Doctype can not be appended since element is present");
        }
    }
    function vt(e, t, n) {
        var r = e.childNodes || [], i = t.childNodes || [];
        if (t.nodeType === f.DOCUMENT_FRAGMENT_NODE) {
            var a = i.filter(M);
            if (a.length > 1 || C(i, xe)) throw new d(O, "More than one element or text in fragment");
            if (a.length === 1 && !et(e, n)) throw new d(O, "Element in fragment can not be inserted before doctype");
        }
        if (M(t) && !et(e, n)) throw new d(O, "Only one element can be added and only after doctype");
        if (U(t)) {
            let u = function(c) {
                return U(c) && c !== n;
            };
            if (C(r, u)) throw new d(O, "Only one doctype is allowed");
            var o = C(r, M);
            if (n && r.indexOf(o) < r.indexOf(n)) throw new d(O, "Doctype can only be inserted before an element");
        }
    }
    function he(e, t, n, r) {
        cn(e, t, n), e.nodeType === f.DOCUMENT_NODE && (r || ln)(e, t, n);
        var i = t.parentNode;
        if (i && i.removeChild(t), t.nodeType === L) {
            var a = t.firstChild;
            if (a == null) return t;
            var o = t.lastChild;
        } else a = o = t;
        var s = n ? n.previousSibling : e.lastChild;
        a.previousSibling = s, o.nextSibling = n, s ? s.nextSibling = a : e.firstChild = a, n == null ? e.lastChild = o : n.previousSibling = o;
        do a.parentNode = e;
        while (a !== o && (a = a.nextSibling))
        return Re(e.ownerDocument || e, e), t.nodeType == L && (t.firstChild = t.lastChild = null), t;
    }
    function fn(e, t) {
        return t.parentNode && t.parentNode.removeChild(t), t.parentNode = e, t.previousSibling = e.lastChild, t.nextSibling = null, t.previousSibling ? t.previousSibling.nextSibling = t : e.firstChild = t, e.lastChild = t, Re(e.ownerDocument, e, t), t;
    }
    re.prototype = {
        nodeName: "#document",
        nodeType: ut,
        doctype: null,
        documentElement: null,
        _inc: 1,
        insertBefore: function(e, t) {
            if (e.nodeType == L) {
                for(var n = e.firstChild; n;){
                    var r = n.nextSibling;
                    this.insertBefore(n, t), n = r;
                }
                return e;
            }
            return he(this, e, t), e.ownerDocument = this, this.documentElement === null && e.nodeType === x && (this.documentElement = e), e;
        },
        removeChild: function(e) {
            return this.documentElement == e && (this.documentElement = null), mt(this, e);
        },
        replaceChild: function(e, t) {
            he(this, e, t, vt), e.ownerDocument = this, t && this.removeChild(t), M(e) && (this.documentElement = e);
        },
        importNode: function(e, t) {
            return Tt(this, e, t);
        },
        getElementById: function(e) {
            var t = null;
            return te(this.documentElement, function(n) {
                if (n.nodeType == x && n.getAttribute("id") == e) return t = n, !0;
            }), t;
        },
        getElementsByClassName: function(e) {
            var t = Qe(e);
            return new Y(this, function(n) {
                var r = [];
                return t.length > 0 && te(n.documentElement, function(i) {
                    if (i !== n && i.nodeType === x) {
                        var a = i.getAttribute("class");
                        if (a) {
                            var o = e === a;
                            if (!o) {
                                var s = Qe(a);
                                o = t.every(nn(s));
                            }
                            o && r.push(i);
                        }
                    }
                }), r;
            });
        },
        createElement: function(e) {
            var t = new V;
            t.ownerDocument = this, t.nodeName = e, t.tagName = e, t.localName = e, t.childNodes = new P;
            var n = t.attributes = new pe;
            return n._ownerElement = t, t;
        },
        createDocumentFragment: function() {
            var e = new Ee;
            return e.ownerDocument = this, e.childNodes = new P, e;
        },
        createTextNode: function(e) {
            var t = new Ce;
            return t.ownerDocument = this, t.appendData(e), t;
        },
        createComment: function(e) {
            var t = new Me;
            return t.ownerDocument = this, t.appendData(e), t;
        },
        createCDATASection: function(e) {
            var t = new Pe;
            return t.ownerDocument = this, t.appendData(e), t;
        },
        createProcessingInstruction: function(e, t) {
            var n = new Ue;
            return n.ownerDocument = this, n.tagName = n.target = e, n.nodeValue = n.data = t, n;
        },
        createAttribute: function(e) {
            var t = new me;
            return t.ownerDocument = this, t.name = e, t.nodeName = e, t.localName = e, t.specified = !0, t;
        },
        createEntityReference: function(e) {
            var t = new Le;
            return t.ownerDocument = this, t.nodeName = e, t;
        },
        createElementNS: function(e, t) {
            var n = new V, r = t.split(":"), i = n.attributes = new pe;
            return n.childNodes = new P, n.ownerDocument = this, n.nodeName = t, n.tagName = t, n.namespaceURI = e, r.length == 2 ? (n.prefix = r[0], n.localName = r[1]) : n.localName = t, i._ownerElement = n, n;
        },
        createAttributeNS: function(e, t) {
            var n = new me, r = t.split(":");
            return n.ownerDocument = this, n.nodeName = t, n.name = t, n.namespaceURI = e, n.specified = !0, r.length == 2 ? (n.prefix = r[0], n.localName = r[1]) : n.localName = t, n;
        }
    };
    b(re, f);
    function V() {
        this._nsMap = {};
    }
    V.prototype = {
        nodeType: x,
        hasAttribute: function(e) {
            return this.getAttributeNode(e) != null;
        },
        getAttribute: function(e) {
            var t = this.getAttributeNode(e);
            return t && t.value || "";
        },
        getAttributeNode: function(e) {
            return this.attributes.getNamedItem(e);
        },
        setAttribute: function(e, t) {
            var n = this.ownerDocument.createAttribute(e);
            n.value = n.nodeValue = "" + t, this.setAttributeNode(n);
        },
        removeAttribute: function(e) {
            var t = this.getAttributeNode(e);
            t && this.removeAttributeNode(t);
        },
        appendChild: function(e) {
            return e.nodeType === L ? this.insertBefore(e, null) : fn(this, e);
        },
        setAttributeNode: function(e) {
            return this.attributes.setNamedItem(e);
        },
        setAttributeNodeNS: function(e) {
            return this.attributes.setNamedItemNS(e);
        },
        removeAttributeNode: function(e) {
            return this.attributes.removeNamedItem(e.nodeName);
        },
        removeAttributeNS: function(e, t) {
            var n = this.getAttributeNodeNS(e, t);
            n && this.removeAttributeNode(n);
        },
        hasAttributeNS: function(e, t) {
            return this.getAttributeNodeNS(e, t) != null;
        },
        getAttributeNS: function(e, t) {
            var n = this.getAttributeNodeNS(e, t);
            return n && n.value || "";
        },
        setAttributeNS: function(e, t, n) {
            var r = this.ownerDocument.createAttributeNS(e, t);
            r.value = r.nodeValue = "" + n, this.setAttributeNode(r);
        },
        getAttributeNodeNS: function(e, t) {
            return this.attributes.getNamedItemNS(e, t);
        },
        getElementsByTagName: function(e) {
            return new Y(this, function(t) {
                var n = [];
                return te(t, function(r) {
                    r !== t && r.nodeType == x && (e === "*" || r.tagName == e) && n.push(r);
                }), n;
            });
        },
        getElementsByTagNameNS: function(e, t) {
            return new Y(this, function(n) {
                var r = [];
                return te(n, function(i) {
                    i !== n && i.nodeType === x && (e === "*" || i.namespaceURI === e) && (t === "*" || i.localName == t) && r.push(i);
                }), r;
            });
        }
    };
    re.prototype.getElementsByTagName = V.prototype.getElementsByTagName;
    re.prototype.getElementsByTagNameNS = V.prototype.getElementsByTagNameNS;
    b(V, f);
    function me() {}
    me.prototype.nodeType = q;
    b(me, f);
    function ie() {}
    ie.prototype = {
        data: "",
        substringData: function(e, t) {
            return this.data.substring(e, e + t);
        },
        appendData: function(e) {
            e = this.data + e, this.nodeValue = this.data = e, this.length = e.length;
        },
        insertData: function(e, t) {
            this.replaceData(e, 0, t);
        },
        appendChild: function(e) {
            throw new Error(y[O]);
        },
        deleteData: function(e, t) {
            this.replaceData(e, t, "");
        },
        replaceData: function(e, t, n) {
            var r = this.data.substring(0, e), i = this.data.substring(e + t);
            n = r + n + i, this.nodeValue = this.data = n, this.length = n.length;
        }
    };
    b(ie, f);
    function Ce() {}
    Ce.prototype = {
        nodeName: "#text",
        nodeType: fe,
        splitText: function(e) {
            var t = this.data, n = t.substring(e);
            t = t.substring(0, e), this.data = this.nodeValue = t, this.length = t.length;
            var r = this.ownerDocument.createTextNode(n);
            return this.parentNode && this.parentNode.insertBefore(r, this.nextSibling), r;
        }
    };
    b(Ce, ie);
    function Me() {}
    Me.prototype = {
        nodeName: "#comment",
        nodeType: ot
    };
    b(Me, ie);
    function Pe() {}
    Pe.prototype = {
        nodeName: "#cdata-section",
        nodeType: rt
    };
    b(Pe, ie);
    function ve() {}
    ve.prototype.nodeType = st;
    b(ve, f);
    function Et() {}
    Et.prototype.nodeType = an;
    b(Et, f);
    function Nt() {}
    Nt.prototype.nodeType = rn;
    b(Nt, f);
    function Le() {}
    Le.prototype.nodeType = it;
    b(Le, f);
    function Ee() {}
    Ee.prototype.nodeName = "#document-fragment";
    Ee.prototype.nodeType = L;
    b(Ee, f);
    function Ue() {}
    Ue.prototype.nodeType = at;
    b(Ue, f);
    function dt() {}
    dt.prototype.serializeToString = function(e, t, n) {
        return gt.call(e, t, n);
    };
    f.prototype.toString = gt;
    function gt(e, t) {
        var n = [], r = this.nodeType == 9 && this.documentElement || this, i = r.prefix, a = r.namespaceURI;
        if (a && i == null) {
            var i = r.lookupPrefix(a);
            if (i == null) var o = [
                {
                    namespace: a,
                    prefix: null
                }
            ];
        }
        return $(this, n, e, t, o), n.join("");
    }
    function tt(e, t, n) {
        var r = e.prefix || "", i = e.namespaceURI;
        if (!i || r === "xml" && i === ee.XML || i === ee.XMLNS) return !1;
        for(var a = n.length; a--;){
            var o = n[a];
            if (o.prefix === r) return o.namespace !== i;
        }
        return !0;
    }
    function Ie(e, t, n) {
        e.push(" ", t, '="', n.replace(/[<>&"\t\n\r]/g, pt), '"');
    }
    function $(e, t, n, r, i) {
        if (i || (i = []), r) if (e = r(e), e) {
            if (typeof e == "string") {
                t.push(e);
                return;
            }
        } else return;
        switch(e.nodeType){
            case x:
                var a = e.attributes, o = a.length, g = e.firstChild, s = e.tagName;
                n = ee.isHTML(e.namespaceURI) || n;
                var u = s;
                if (!n && !e.prefix && e.namespaceURI) {
                    for(var c, l = 0; l < a.length; l++)if (a.item(l).name === "xmlns") {
                        c = a.item(l).value;
                        break;
                    }
                    if (!c) for(var h = i.length - 1; h >= 0; h--){
                        var p = i[h];
                        if (p.prefix === "" && p.namespace === e.namespaceURI) {
                            c = p.namespace;
                            break;
                        }
                    }
                    if (c !== e.namespaceURI) for(var h = i.length - 1; h >= 0; h--){
                        var p = i[h];
                        if (p.namespace === e.namespaceURI) {
                            p.prefix && (u = p.prefix + ":" + s);
                            break;
                        }
                    }
                }
                t.push("<", u);
                for(var E = 0; E < o; E++){
                    var w = a.item(E);
                    w.prefix == "xmlns" ? i.push({
                        prefix: w.localName,
                        namespace: w.value
                    }) : w.nodeName == "xmlns" && i.push({
                        prefix: "",
                        namespace: w.value
                    });
                }
                for(var E = 0; E < o; E++){
                    var w = a.item(E);
                    if (tt(w, n, i)) {
                        var m = w.prefix || "", v = w.namespaceURI;
                        Ie(t, m ? "xmlns:" + m : "xmlns", v), i.push({
                            prefix: m,
                            namespace: v
                        });
                    }
                    $(w, t, n, r, i);
                }
                if (s === u && tt(e, n, i)) {
                    var m = e.prefix || "", v = e.namespaceURI;
                    Ie(t, m ? "xmlns:" + m : "xmlns", v), i.push({
                        prefix: m,
                        namespace: v
                    });
                }
                if (g || n && !/^(?:meta|link|img|br|hr|input)$/i.test(s)) {
                    if (t.push(">"), n && /^script$/i.test(s)) for(; g;)g.data ? t.push(g.data) : $(g, t, n, r, i.slice()), g = g.nextSibling;
                    else for(; g;)$(g, t, n, r, i.slice()), g = g.nextSibling;
                    t.push("</", u, ">");
                } else t.push("/>");
                return;
            case ut:
            case L:
                for(var g = e.firstChild; g;)$(g, t, n, r, i.slice()), g = g.nextSibling;
                return;
            case q:
                return Ie(t, e.name, e.value);
            case fe:
                return t.push(e.data.replace(/[<&>]/g, pt));
            case rt:
                return t.push("<![CDATA[", e.data, "]]>");
            case ot:
                return t.push("<!--", e.data, "-->");
            case st:
                var K = e.publicId, T = e.systemId;
                if (t.push("<!DOCTYPE ", e.name), K) t.push(" PUBLIC ", K), T && T != "." && t.push(" ", T), t.push(">");
                else if (T && T != ".") t.push(" SYSTEM ", T, ">");
                else {
                    var S = e.internalSubset;
                    S && t.push(" [", S, "]"), t.push(">");
                }
                return;
            case at:
                return t.push("<?", e.target, " ", e.data, "?>");
            case it:
                return t.push("&", e.nodeName, ";");
            default:
                t.push("??", e.nodeName);
        }
    }
    function Tt(e, t, n) {
        var r;
        switch(t.nodeType){
            case x:
                r = t.cloneNode(!1), r.ownerDocument = e;
            case L:
                break;
            case q:
                n = !0;
                break;
        }
        if (r || (r = t.cloneNode(!1)), r.ownerDocument = e, r.parentNode = null, n) for(var i = t.firstChild; i;)r.appendChild(Tt(e, i, n)), i = i.nextSibling;
        return r;
    }
    function Ae(e, t, n) {
        var r = new t.constructor;
        for(var i in t)if (Object.prototype.hasOwnProperty.call(t, i)) {
            var a = t[i];
            typeof a != "object" && a != r[i] && (r[i] = a);
        }
        switch(t.childNodes && (r.childNodes = new P), r.ownerDocument = e, r.nodeType){
            case x:
                var o = t.attributes, s = r.attributes = new pe, u = o.length;
                s._ownerElement = r;
                for(var c = 0; c < u; c++)r.setAttributeNode(Ae(e, o.item(c), !0));
                break;
            case q:
                n = !0;
        }
        if (n) for(var l = t.firstChild; l;)r.appendChild(Ae(e, l, n)), l = l.nextSibling;
        return r;
    }
    function yt(e, t, n) {
        e[t] = n;
    }
    try {
        if (Object.defineProperty) {
            let e = function(t) {
                switch(t.nodeType){
                    case x:
                    case L:
                        var n = [];
                        for(t = t.firstChild; t;)t.nodeType !== 7 && t.nodeType !== 8 && n.push(e(t)), t = t.nextSibling;
                        return n.join("");
                    default:
                        return t.nodeValue;
                }
            };
            e, Object.defineProperty(Y.prototype, "length", {
                get: function() {
                    return Se(this), this.$$length;
                }
            }), Object.defineProperty(f.prototype, "textContent", {
                get: function() {
                    return e(this);
                },
                set: function(t) {
                    switch(this.nodeType){
                        case x:
                        case L:
                            for(; this.firstChild;)this.removeChild(this.firstChild);
                            (t || String(t)) && this.appendChild(this.ownerDocument.createTextNode(t));
                            break;
                        default:
                            this.data = t, this.value = t, this.nodeValue = t;
                    }
                }
            }), yt = function(t, n, r) {
                t["$$" + n] = r;
            };
        }
    } catch  {}
    X.DocumentType = ve;
    X.DOMException = d;
    X.DOMImplementation = ft;
    X.Element = V;
    X.Node = f;
    X.NodeList = P;
    X.XMLSerializer = dt;
});
var _t = j((ae)=>{
    var Dt = J().freeze;
    ae.XML_ENTITIES = Dt({
        amp: "&",
        apos: "'",
        gt: ">",
        lt: "<",
        quot: '"'
    });
    ae.HTML_ENTITIES = Dt({
        lt: "<",
        gt: ">",
        amp: "&",
        quot: '"',
        apos: "'",
        Agrave: "\xC0",
        Aacute: "\xC1",
        Acirc: "\xC2",
        Atilde: "\xC3",
        Auml: "\xC4",
        Aring: "\xC5",
        AElig: "\xC6",
        Ccedil: "\xC7",
        Egrave: "\xC8",
        Eacute: "\xC9",
        Ecirc: "\xCA",
        Euml: "\xCB",
        Igrave: "\xCC",
        Iacute: "\xCD",
        Icirc: "\xCE",
        Iuml: "\xCF",
        ETH: "\xD0",
        Ntilde: "\xD1",
        Ograve: "\xD2",
        Oacute: "\xD3",
        Ocirc: "\xD4",
        Otilde: "\xD5",
        Ouml: "\xD6",
        Oslash: "\xD8",
        Ugrave: "\xD9",
        Uacute: "\xDA",
        Ucirc: "\xDB",
        Uuml: "\xDC",
        Yacute: "\xDD",
        THORN: "\xDE",
        szlig: "\xDF",
        agrave: "\xE0",
        aacute: "\xE1",
        acirc: "\xE2",
        atilde: "\xE3",
        auml: "\xE4",
        aring: "\xE5",
        aelig: "\xE6",
        ccedil: "\xE7",
        egrave: "\xE8",
        eacute: "\xE9",
        ecirc: "\xEA",
        euml: "\xEB",
        igrave: "\xEC",
        iacute: "\xED",
        icirc: "\xEE",
        iuml: "\xEF",
        eth: "\xF0",
        ntilde: "\xF1",
        ograve: "\xF2",
        oacute: "\xF3",
        ocirc: "\xF4",
        otilde: "\xF5",
        ouml: "\xF6",
        oslash: "\xF8",
        ugrave: "\xF9",
        uacute: "\xFA",
        ucirc: "\xFB",
        uuml: "\xFC",
        yacute: "\xFD",
        thorn: "\xFE",
        yuml: "\xFF",
        nbsp: "\xA0",
        iexcl: "\xA1",
        cent: "\xA2",
        pound: "\xA3",
        curren: "\xA4",
        yen: "\xA5",
        brvbar: "\xA6",
        sect: "\xA7",
        uml: "\xA8",
        copy: "\xA9",
        ordf: "\xAA",
        laquo: "\xAB",
        not: "\xAC",
        shy: "\xAD\xAD",
        reg: "\xAE",
        macr: "\xAF",
        deg: "\xB0",
        plusmn: "\xB1",
        sup2: "\xB2",
        sup3: "\xB3",
        acute: "\xB4",
        micro: "\xB5",
        para: "\xB6",
        middot: "\xB7",
        cedil: "\xB8",
        sup1: "\xB9",
        ordm: "\xBA",
        raquo: "\xBB",
        frac14: "\xBC",
        frac12: "\xBD",
        frac34: "\xBE",
        iquest: "\xBF",
        times: "\xD7",
        divide: "\xF7",
        forall: "\u2200",
        part: "\u2202",
        exist: "\u2203",
        empty: "\u2205",
        nabla: "\u2207",
        isin: "\u2208",
        notin: "\u2209",
        ni: "\u220B",
        prod: "\u220F",
        sum: "\u2211",
        minus: "\u2212",
        lowast: "\u2217",
        radic: "\u221A",
        prop: "\u221D",
        infin: "\u221E",
        ang: "\u2220",
        and: "\u2227",
        or: "\u2228",
        cap: "\u2229",
        cup: "\u222A",
        int: "\u222B",
        there4: "\u2234",
        sim: "\u223C",
        cong: "\u2245",
        asymp: "\u2248",
        ne: "\u2260",
        equiv: "\u2261",
        le: "\u2264",
        ge: "\u2265",
        sub: "\u2282",
        sup: "\u2283",
        nsub: "\u2284",
        sube: "\u2286",
        supe: "\u2287",
        oplus: "\u2295",
        otimes: "\u2297",
        perp: "\u22A5",
        sdot: "\u22C5",
        Alpha: "\u0391",
        Beta: "\u0392",
        Gamma: "\u0393",
        Delta: "\u0394",
        Epsilon: "\u0395",
        Zeta: "\u0396",
        Eta: "\u0397",
        Theta: "\u0398",
        Iota: "\u0399",
        Kappa: "\u039A",
        Lambda: "\u039B",
        Mu: "\u039C",
        Nu: "\u039D",
        Xi: "\u039E",
        Omicron: "\u039F",
        Pi: "\u03A0",
        Rho: "\u03A1",
        Sigma: "\u03A3",
        Tau: "\u03A4",
        Upsilon: "\u03A5",
        Phi: "\u03A6",
        Chi: "\u03A7",
        Psi: "\u03A8",
        Omega: "\u03A9",
        alpha: "\u03B1",
        beta: "\u03B2",
        gamma: "\u03B3",
        delta: "\u03B4",
        epsilon: "\u03B5",
        zeta: "\u03B6",
        eta: "\u03B7",
        theta: "\u03B8",
        iota: "\u03B9",
        kappa: "\u03BA",
        lambda: "\u03BB",
        mu: "\u03BC",
        nu: "\u03BD",
        xi: "\u03BE",
        omicron: "\u03BF",
        pi: "\u03C0",
        rho: "\u03C1",
        sigmaf: "\u03C2",
        sigma: "\u03C3",
        tau: "\u03C4",
        upsilon: "\u03C5",
        phi: "\u03C6",
        chi: "\u03C7",
        psi: "\u03C8",
        omega: "\u03C9",
        thetasym: "\u03D1",
        upsih: "\u03D2",
        piv: "\u03D6",
        OElig: "\u0152",
        oelig: "\u0153",
        Scaron: "\u0160",
        scaron: "\u0161",
        Yuml: "\u0178",
        fnof: "\u0192",
        circ: "\u02C6",
        tilde: "\u02DC",
        ensp: "\u2002",
        emsp: "\u2003",
        thinsp: "\u2009",
        zwnj: "\u200C",
        zwj: "\u200D",
        lrm: "\u200E",
        rlm: "\u200F",
        ndash: "\u2013",
        mdash: "\u2014",
        lsquo: "\u2018",
        rsquo: "\u2019",
        sbquo: "\u201A",
        ldquo: "\u201C",
        rdquo: "\u201D",
        bdquo: "\u201E",
        dagger: "\u2020",
        Dagger: "\u2021",
        bull: "\u2022",
        hellip: "\u2026",
        permil: "\u2030",
        prime: "\u2032",
        Prime: "\u2033",
        lsaquo: "\u2039",
        rsaquo: "\u203A",
        oline: "\u203E",
        euro: "\u20AC",
        trade: "\u2122",
        larr: "\u2190",
        uarr: "\u2191",
        rarr: "\u2192",
        darr: "\u2193",
        harr: "\u2194",
        crarr: "\u21B5",
        lceil: "\u2308",
        rceil: "\u2309",
        lfloor: "\u230A",
        rfloor: "\u230B",
        loz: "\u25CA",
        spades: "\u2660",
        clubs: "\u2663",
        hearts: "\u2665",
        diams: "\u2666"
    });
    ae.entityMap = ae.HTML_ENTITIES;
});
var xt = j((Fe)=>{
    var ce = J().NAMESPACE, ke = /[A-Z_a-z\xC0-\xD6\xD8-\xF6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, wt = new RegExp("[\\-\\.0-9" + ke.source.slice(1, -1) + "\\u00B7\\u0300-\\u036F\\u203F-\\u2040]"), Ot = new RegExp("^" + ke.source + wt.source + "*(?::" + ke.source + wt.source + "*)?$"), oe = 0, k = 1, H = 2, ue = 3, W = 4, Q = 5, se = 6, Ne = 7;
    function Z(e, t) {
        this.message = e, this.locator = t, Error.captureStackTrace && Error.captureStackTrace(this, Z);
    }
    Z.prototype = new Error;
    Z.prototype.name = Z.name;
    function At() {}
    At.prototype = {
        parse: function(e, t, n) {
            var r = this.domBuilder;
            r.startDocument(), St(t, t = {}), pn(e, t, n, r, this.errorHandler), r.endDocument();
        }
    };
    function pn(e, t, n, r, i) {
        function a(N) {
            if (N > 65535) {
                N -= 65536;
                var R = 55296 + (N >> 10), $t = 56320 + (N & 1023);
                return String.fromCharCode(R, $t);
            } else return String.fromCharCode(N);
        }
        function o(N) {
            var R = N.slice(1, -1);
            return Object.hasOwnProperty.call(n, R) ? n[R] : R.charAt(0) === "#" ? a(parseInt(R.substr(1).replace("x", "0x"))) : (i.error("entity not found:" + N), N);
        }
        function s(N) {
            if (N > m) {
                var R = e.substring(m, N).replace(/&#?\w+;/g, o);
                p && u(m), r.characters(R, 0, N - m), m = N;
            }
        }
        function u(N, R) {
            for(; N >= l && (R = h.exec(e));)c = R.index, l = c + R[0].length, p.lineNumber++;
            p.columnNumber = N - c + 1;
        }
        for(var c = 0, l = 0, h = /.*(?:\r\n?|\n)|.*$/g, p = r.locator, E = [
            {
                currentNSMap: t
            }
        ], w = {}, m = 0;;){
            try {
                var v = e.indexOf("<", m);
                if (v < 0) {
                    if (!e.substr(m).match(/^\s*$/)) {
                        var g = r.doc, K = g.createTextNode(e.substr(m));
                        g.appendChild(K), r.currentElement = K;
                    }
                    return;
                }
                switch(v > m && s(v), e.charAt(v + 1)){
                    case "/":
                        var _ = e.indexOf(">", v + 3), T = e.substring(v + 2, _).replace(/[ \t\n\r]+$/g, ""), S = E.pop();
                        _ < 0 ? (T = e.substring(v + 2).replace(/[\s<].*/, ""), i.error("end tag name: " + T + " is not complete:" + S.tagName), _ = v + 1 + T.length) : T.match(/\s</) && (T = T.replace(/[\s<].*/, ""), i.error("end tag name: " + T + " maybe not complete"), _ = v + 1 + T.length);
                        var ye = S.localNSMap, je = S.tagName == T, jt = je || S.tagName && S.tagName.toLowerCase() == T.toLowerCase();
                        if (jt) {
                            if (r.endElement(S.uri, S.localName, T), ye) for(var Ge in ye)Object.prototype.hasOwnProperty.call(ye, Ge) && r.endPrefixMapping(Ge);
                            je || i.fatalError("end tag name: " + T + " is not match the current start tagName:" + S.tagName);
                        } else E.push(S);
                        _++;
                        break;
                    case "?":
                        p && u(v), _ = Nn(e, v, r);
                        break;
                    case "!":
                        p && u(v), _ = En(e, v, r, i);
                        break;
                    default:
                        p && u(v);
                        var A = new Rt, De = E[E.length - 1].currentNSMap, _ = hn(e, v, A, De, o, i), $e = A.length;
                        if (!A.closed && vn(e, _, A.tagName, w) && (A.closed = !0, n.nbsp || i.warning("unclosed xml attribute")), p && $e) {
                            for(var Gt = bt(p, {}), _e = 0; _e < $e; _e++){
                                var qe = A[_e];
                                u(qe.offset), qe.locator = bt(p, {});
                            }
                            r.locator = Gt, It(A, r, De) && E.push(A), r.locator = p;
                        } else It(A, r, De) && E.push(A);
                        ce.isHTML(A.uri) && !A.closed ? _ = mn(e, _, A.tagName, o, r) : _++;
                }
            } catch (N) {
                if (N instanceof Z) throw N;
                i.error("element parse error: " + N), _ = -1;
            }
            _ > m ? m = _ : s(Math.max(v, m) + 1);
        }
    }
    function bt(e, t) {
        return t.lineNumber = e.lineNumber, t.columnNumber = e.columnNumber, t;
    }
    function hn(e, t, n, r, i, a) {
        function o(E, w, m) {
            n.attributeNames.hasOwnProperty(E) && a.fatalError("Attribute " + E + " redefined"), n.addValue(E, w.replace(/[\t\n\r]/g, " ").replace(/&#?\w+;/g, i), m);
        }
        for(var s, u, c = ++t, l = oe;;){
            var h = e.charAt(c);
            switch(h){
                case "=":
                    if (l === k) s = e.slice(t, c), l = ue;
                    else if (l === H) l = ue;
                    else throw new Error("attribute equal must after attrName");
                    break;
                case "'":
                case '"':
                    if (l === ue || l === k) if (l === k && (a.warning('attribute value must after "="'), s = e.slice(t, c)), t = c + 1, c = e.indexOf(h, t), c > 0) u = e.slice(t, c), o(s, u, t - 1), l = Q;
                    else throw new Error("attribute value no end '" + h + "' match");
                    else if (l == W) u = e.slice(t, c), o(s, u, t), a.warning('attribute "' + s + '" missed start quot(' + h + ")!!"), t = c + 1, l = Q;
                    else throw new Error('attribute value must after "="');
                    break;
                case "/":
                    switch(l){
                        case oe:
                            n.setTagName(e.slice(t, c));
                        case Q:
                        case se:
                        case Ne:
                            l = Ne, n.closed = !0;
                        case W:
                        case k:
                        case H:
                            break;
                        default:
                            throw new Error("attribute invalid close char('/')");
                    }
                    break;
                case "":
                    return a.error("unexpected end of input"), l == oe && n.setTagName(e.slice(t, c)), c;
                case ">":
                    switch(l){
                        case oe:
                            n.setTagName(e.slice(t, c));
                        case Q:
                        case se:
                        case Ne:
                            break;
                        case W:
                        case k:
                            u = e.slice(t, c), u.slice(-1) === "/" && (n.closed = !0, u = u.slice(0, -1));
                        case H:
                            l === H && (u = s), l == W ? (a.warning('attribute "' + u + '" missed quot(")!'), o(s, u, t)) : ((!ce.isHTML(r[""]) || !u.match(/^(?:disabled|checked|selected)$/i)) && a.warning('attribute "' + u + '" missed value!! "' + u + '" instead!!'), o(u, u, t));
                            break;
                        case ue:
                            throw new Error("attribute value missed!!");
                    }
                    return c;
                case "\x80":
                    h = " ";
                default:
                    if (h <= " ") switch(l){
                        case oe:
                            n.setTagName(e.slice(t, c)), l = se;
                            break;
                        case k:
                            s = e.slice(t, c), l = H;
                            break;
                        case W:
                            var u = e.slice(t, c);
                            a.warning('attribute "' + u + '" missed quot(")!!'), o(s, u, t);
                        case Q:
                            l = se;
                            break;
                    }
                    else switch(l){
                        case H:
                            n.tagName;
                            (!ce.isHTML(r[""]) || !s.match(/^(?:disabled|checked|selected)$/i)) && a.warning('attribute "' + s + '" missed value!! "' + s + '" instead2!!'), o(s, s, t), t = c, l = k;
                            break;
                        case Q:
                            a.warning('attribute space is required"' + s + '"!!');
                        case se:
                            l = k, t = c;
                            break;
                        case ue:
                            l = W, t = c;
                            break;
                        case Ne:
                            throw new Error("elements closed character '/' and '>' must be connected to");
                    }
            }
            c++;
        }
    }
    function It(e, t, n) {
        for(var r = e.tagName, i = null, h = e.length; h--;){
            var a = e[h], o = a.qName, s = a.value, p = o.indexOf(":");
            if (p > 0) var u = a.prefix = o.slice(0, p), c = o.slice(p + 1), l = u === "xmlns" && c;
            else c = o, u = null, l = o === "xmlns" && "";
            a.localName = c, l !== !1 && (i == null && (i = {}, St(n, n = {})), n[l] = i[l] = s, a.uri = ce.XMLNS, t.startPrefixMapping(l, s));
        }
        for(var h = e.length; h--;){
            a = e[h];
            var u = a.prefix;
            u && (u === "xml" && (a.uri = ce.XML), u !== "xmlns" && (a.uri = n[u || ""]));
        }
        var p = r.indexOf(":");
        p > 0 ? (u = e.prefix = r.slice(0, p), c = e.localName = r.slice(p + 1)) : (u = null, c = e.localName = r);
        var E = e.uri = n[u || ""];
        if (t.startElement(E, c, r, e), e.closed) {
            if (t.endElement(E, c, r), i) for(u in i)Object.prototype.hasOwnProperty.call(i, u) && t.endPrefixMapping(u);
        } else return e.currentNSMap = n, e.localNSMap = i, !0;
    }
    function mn(e, t, n, r, i) {
        if (/^(?:script|textarea)$/i.test(n)) {
            var a = e.indexOf("</" + n + ">", t), o = e.substring(t + 1, a);
            if (/[&<]/.test(o)) return /^script$/i.test(n) ? (i.characters(o, 0, o.length), a) : (o = o.replace(/&#?\w+;/g, r), i.characters(o, 0, o.length), a);
        }
        return t + 1;
    }
    function vn(e, t, n, r) {
        var i = r[n];
        return i == null && (i = e.lastIndexOf("</" + n + ">"), i < t && (i = e.lastIndexOf("</" + n)), r[n] = i), i < t;
    }
    function St(e, t) {
        for(var n in e)Object.prototype.hasOwnProperty.call(e, n) && (t[n] = e[n]);
    }
    function En(e, t, n, r) {
        var i = e.charAt(t + 2);
        switch(i){
            case "-":
                if (e.charAt(t + 3) === "-") {
                    var a = e.indexOf("-->", t + 4);
                    return a > t ? (n.comment(e, t + 4, a - t - 4), a + 3) : (r.error("Unclosed comment"), -1);
                } else return -1;
            default:
                if (e.substr(t + 3, 6) == "CDATA[") {
                    var a = e.indexOf("]]>", t + 9);
                    return n.startCDATA(), n.characters(e, t + 9, a - t - 9), n.endCDATA(), a + 3;
                }
                var o = dn(e, t), s = o.length;
                if (s > 1 && /!doctype/i.test(o[0][0])) {
                    var u = o[1][0], c = !1, l = !1;
                    s > 3 && (/^public$/i.test(o[2][0]) ? (c = o[3][0], l = s > 4 && o[4][0]) : /^system$/i.test(o[2][0]) && (l = o[3][0]));
                    var h = o[s - 1];
                    return n.startDTD(u, c, l), n.endDTD(), h.index + h[0].length;
                }
        }
        return -1;
    }
    function Nn(e, t, n) {
        var r = e.indexOf("?>", t);
        if (r) {
            var i = e.substring(t, r).match(/^<\?(\S*)\s*([\s\S]*?)\s*$/);
            if (i) {
                i[0].length;
                return n.processingInstruction(i[1], i[2]), r + 2;
            } else return -1;
        }
        return -1;
    }
    function Rt() {
        this.attributeNames = {};
    }
    Rt.prototype = {
        setTagName: function(e) {
            if (!Ot.test(e)) throw new Error("invalid tagName:" + e);
            this.tagName = e;
        },
        addValue: function(e, t, n) {
            if (!Ot.test(e)) throw new Error("invalid attribute:" + e);
            this.attributeNames[e] = this.length, this[this.length++] = {
                qName: e,
                value: t,
                offset: n
            };
        },
        length: 0,
        getLocalName: function(e) {
            return this[e].localName;
        },
        getLocator: function(e) {
            return this[e].locator;
        },
        getQName: function(e) {
            return this[e].qName;
        },
        getURI: function(e) {
            return this[e].uri;
        },
        getValue: function(e) {
            return this[e].value;
        }
    };
    function dn(e, t) {
        var n, r = [], i = /'[^']+'|"[^"]+"|[^\s<>\/=]+=?|(\/?\s*>|<)/g;
        for(i.lastIndex = t, i.exec(e); n = i.exec(e);)if (r.push(n), n[1]) return r;
    }
    Fe.XMLReader = At;
    Fe.ParseError = Z;
});
var kt = j((ge)=>{
    var gn = J(), Tn = Xe(), Ct = _t(), Lt = xt(), yn = Tn.DOMImplementation, Mt = gn.NAMESPACE, Dn = Lt.ParseError, _n = Lt.XMLReader;
    function Ut(e) {
        return e.replace(/\r[\n\u0085]/g, `
`).replace(/[\r\u0085\u2028]/g, `
`);
    }
    function Xt(e) {
        this.options = e || {
            locator: {}
        };
    }
    Xt.prototype.parseFromString = function(e, t) {
        var n = this.options, r = new _n, i = n.domBuilder || new le, a = n.errorHandler, o = n.locator, s = n.xmlns || {}, u = /\/x?html?$/.test(t), c = u ? Ct.HTML_ENTITIES : Ct.XML_ENTITIES;
        o && i.setDocumentLocator(o), r.errorHandler = wn(a, i, o), r.domBuilder = n.domBuilder || i, u && (s[""] = Mt.HTML), s.xml = s.xml || Mt.XML;
        var l = n.normalizeLineEndings || Ut;
        return e && typeof e == "string" ? r.parse(l(e), s, c) : r.errorHandler.error("invalid doc source"), i.doc;
    };
    function wn(e, t, n) {
        if (!e) {
            if (t instanceof le) return t;
            e = t;
        }
        var r = {}, i = e instanceof Function;
        n = n || {};
        function a(o) {
            var s = e[o];
            !s && i && (s = e.length == 2 ? function(u) {
                e(o, u);
            } : e), r[o] = s && function(u) {
                s("[xmldom " + o + "]	" + u + ze(n));
            } || function() {};
        }
        return a("warning"), a("error"), a("fatalError"), r;
    }
    function le() {
        this.cdata = !1;
    }
    function B(e, t) {
        t.lineNumber = e.lineNumber, t.columnNumber = e.columnNumber;
    }
    le.prototype = {
        startDocument: function() {
            this.doc = new yn().createDocument(null, null, null), this.locator && (this.doc.documentURI = this.locator.systemId);
        },
        startElement: function(e, t, n, r) {
            var i = this.doc, a = i.createElementNS(e, n || t), o = r.length;
            de(this, a), this.currentElement = a, this.locator && B(this.locator, a);
            for(var s = 0; s < o; s++){
                var e = r.getURI(s), u = r.getValue(s), n = r.getQName(s), c = i.createAttributeNS(e, n);
                this.locator && B(r.getLocator(s), c), c.value = c.nodeValue = u, a.setAttributeNode(c);
            }
        },
        endElement: function(e, t, n) {
            var r = this.currentElement, i = r.tagName;
            this.currentElement = r.parentNode;
        },
        startPrefixMapping: function(e, t) {},
        endPrefixMapping: function(e) {},
        processingInstruction: function(e, t) {
            var n = this.doc.createProcessingInstruction(e, t);
            this.locator && B(this.locator, n), de(this, n);
        },
        ignorableWhitespace: function(e, t, n) {},
        characters: function(e, t, n) {
            if (e = Pt.apply(this, arguments), e) {
                if (this.cdata) var r = this.doc.createCDATASection(e);
                else var r = this.doc.createTextNode(e);
                this.currentElement ? this.currentElement.appendChild(r) : /^\s*$/.test(e) && this.doc.appendChild(r), this.locator && B(this.locator, r);
            }
        },
        skippedEntity: function(e) {},
        endDocument: function() {
            this.doc.normalize();
        },
        setDocumentLocator: function(e) {
            (this.locator = e) && (e.lineNumber = 0);
        },
        comment: function(e, t, n) {
            e = Pt.apply(this, arguments);
            var r = this.doc.createComment(e);
            this.locator && B(this.locator, r), de(this, r);
        },
        startCDATA: function() {
            this.cdata = !0;
        },
        endCDATA: function() {
            this.cdata = !1;
        },
        startDTD: function(e, t, n) {
            var r = this.doc.implementation;
            if (r && r.createDocumentType) {
                var i = r.createDocumentType(e, t, n);
                this.locator && B(this.locator, i), de(this, i), this.doc.doctype = i;
            }
        },
        warning: function(e) {
            console.warn("[xmldom warning]	" + e, ze(this.locator));
        },
        error: function(e) {
            console.error("[xmldom error]	" + e, ze(this.locator));
        },
        fatalError: function(e) {
            throw new Dn(e, this.locator);
        }
    };
    function ze(e) {
        if (e) return `
@` + (e.systemId || "") + "#[line:" + e.lineNumber + ",col:" + e.columnNumber + "]";
    }
    function Pt(e, t, n) {
        return typeof e == "string" ? e.substr(t, n) : e.length >= t + n || t ? new java.lang.String(e, t, n) + "" : e;
    }
    "endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl".replace(/\w+/g, function(e) {
        le.prototype[e] = function() {
            return null;
        };
    });
    function de(e, t) {
        e.currentElement ? e.currentElement.appendChild(t) : e.doc.appendChild(t);
    }
    ge.__DOMHandler = le;
    ge.normalizeLineEndings = Ut;
    ge.DOMParser = Xt;
});
var Ve = j((Te)=>{
    var Ft = Xe();
    Te.DOMImplementation = Ft.DOMImplementation;
    Te.XMLSerializer = Ft.XMLSerializer;
    Te.DOMParser = kt().DOMParser;
});
var F = {};
Zt(F, {
    DOMImplementation: ()=>On,
    DOMParser: ()=>In,
    XMLSerializer: ()=>bn,
    default: ()=>Sn
});
var Vt = Ye(Ve());
z(F, Ye(Ve()));
var { DOMImplementation: On , XMLSerializer: bn , DOMParser: In  } = Vt, { default: zt , ...An } = Vt, Sn = zt !== void 0 ? zt : An;
export { On as DOMImplementation, In as DOMParser, bn as XMLSerializer };
export { Sn as default };
