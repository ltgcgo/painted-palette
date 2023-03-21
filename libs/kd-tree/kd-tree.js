// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

var A = Object.create;
var x = Object.defineProperty;
var B = Object.getOwnPropertyDescriptor;
var E = Object.getOwnPropertyNames;
var H = Object.getPrototypeOf, T = Object.prototype.hasOwnProperty;
var q = (f, l)=>()=>(l || f((l = {
            exports: {}
        }).exports, l), l.exports), C = (f, l)=>{
    for(var g in l)x(f, g, {
        get: l[g],
        enumerable: !0
    });
}, N = (f, l, g, u)=>{
    if (l && typeof l == "object" || typeof l == "function") for (let c of E(l))!T.call(f, c) && c !== g && x(f, c, {
        get: ()=>l[c],
        enumerable: !(u = B(l, c)) || u.enumerable
    });
    return f;
}, _ = (f, l, g)=>(N(f, l, "default"), g && N(g, l, "default")), J = (f, l, g)=>(g = f != null ? A(H(f)) : {}, N(l || !f || !f.__esModule ? x(g, "default", {
        value: f,
        enumerable: !0
    }) : g, f));
var D = q((z)=>{
    (function(f, l) {
        typeof define == "function" && define.amd ? define([
            "exports"
        ], l) : l(typeof z == "object" ? z : f);
    })(z, function(f) {
        function l(u, c, e) {
            this.obj = u, this.left = null, this.right = null, this.parent = e, this.dimension = c;
        }
        function g(u) {
            this.content = [], this.scoreFunction = u;
        }
        g.prototype = {
            push: function(u) {
                this.content.push(u), this.bubbleUp(this.content.length - 1);
            },
            pop: function() {
                var u = this.content[0], c = this.content.pop();
                return this.content.length > 0 && (this.content[0] = c, this.sinkDown(0)), u;
            },
            peek: function() {
                return this.content[0];
            },
            remove: function(u) {
                for(var c = this.content.length, e = 0; e < c; e++)if (this.content[e] == u) {
                    var b = this.content.pop();
                    return void (e != c - 1 && (this.content[e] = b, this.scoreFunction(b) < this.scoreFunction(u) ? this.bubbleUp(e) : this.sinkDown(e)));
                }
                throw new Error("Node not found.");
            },
            size: function() {
                return this.content.length;
            },
            bubbleUp: function(u) {
                for(var c = this.content[u]; u > 0;){
                    var e = Math.floor((u + 1) / 2) - 1, b = this.content[e];
                    if (!(this.scoreFunction(c) < this.scoreFunction(b))) break;
                    this.content[e] = c, this.content[u] = b, u = e;
                }
            },
            sinkDown: function(u) {
                for(var c = this.content.length, e = this.content[u], b = this.scoreFunction(e);;){
                    var p = 2 * (u + 1), t = p - 1, i = null;
                    if (t < c) {
                        var r = this.content[t], a = this.scoreFunction(r);
                        a < b && (i = t);
                    }
                    if (p < c) {
                        var n = this.content[p];
                        this.scoreFunction(n) < (i == null ? b : a) && (i = p);
                    }
                    if (i == null) break;
                    this.content[u] = this.content[i], this.content[i] = e, u = i;
                }
            }
        }, f.kdTree = function(u, c, e) {
            function b(t, i, r) {
                var a, n, h = i % e.length;
                return t.length === 0 ? null : t.length === 1 ? new l(t[0], h, r) : (t.sort(function(s, o) {
                    return s[e[h]] - o[e[h]];
                }), a = Math.floor(t.length / 2), n = new l(t[a], h, r), n.left = b(t.slice(0, a), i + 1, n), n.right = b(t.slice(a + 1), i + 1, n), n);
            }
            var p = this;
            Array.isArray(u) ? this.root = b(u, 0, null) : function(t) {
                function i(r) {
                    r.left && (r.left.parent = r, i(r.left)), r.right && (r.right.parent = r, i(r.right));
                }
                p.root = t, i(p.root);
            }(u), this.toJSON = function(t) {
                t || (t = this.root);
                var i = new l(t.obj, t.dimension, null);
                return t.left && (i.left = p.toJSON(t.left)), t.right && (i.right = p.toJSON(t.right)), i;
            }, this.insert = function(t) {
                function i(h, s) {
                    if (h === null) return s;
                    var o = e[h.dimension];
                    return t[o] < h.obj[o] ? i(h.left, h) : i(h.right, h);
                }
                var r, a, n = i(this.root, null);
                n !== null ? (r = new l(t, (n.dimension + 1) % e.length, n), a = e[n.dimension], t[a] < n.obj[a] ? n.left = r : n.right = r) : this.root = new l(t, 0, null);
            }, this.remove = function(t) {
                function i(n) {
                    if (n === null) return null;
                    if (n.obj === t) return n;
                    var h = e[n.dimension];
                    return t[h] < n.obj[h] ? i(n.left, n) : i(n.right, n);
                }
                function r(n) {
                    function h(d, w) {
                        var k, v, F, j, m;
                        return d === null ? null : (k = e[w], d.dimension === w ? d.left !== null ? h(d.left, w) : d : (v = d.obj[k], F = h(d.left, w), j = h(d.right, w), m = d, F !== null && F.obj[k] < v && (m = F), j !== null && j.obj[k] < m.obj[k] && (m = j), m));
                    }
                    var s, o, y;
                    if (n.left === null && n.right === null) return n.parent === null ? void (p.root = null) : (y = e[n.parent.dimension], void (n.obj[y] < n.parent.obj[y] ? n.parent.left = null : n.parent.right = null));
                    n.right !== null ? (o = (s = h(n.right, n.dimension)).obj, r(s), n.obj = o) : (o = (s = h(n.left, n.dimension)).obj, r(s), n.right = n.left, n.left = null, n.obj = o);
                }
                var a;
                (a = i(p.root)) !== null && r(a);
            }, this.nearest = function(t, i, r) {
                function a(o) {
                    function y(S, U) {
                        s.push([
                            S,
                            U
                        ]), s.size() > i && s.pop();
                    }
                    var d, w, k, v, F = e[o.dimension], j = c(t, o.obj), m = {};
                    for(v = 0; v < e.length; v += 1)v === o.dimension ? m[e[v]] = t[e[v]] : m[e[v]] = o.obj[e[v]];
                    w = c(m, o.obj), o.right !== null || o.left !== null ? (a(d = o.right === null ? o.left : o.left === null ? o.right : t[F] < o.obj[F] ? o.left : o.right), (s.size() < i || j < s.peek()[1]) && y(o, j), (s.size() < i || Math.abs(w) < s.peek()[1]) && (k = d === o.left ? o.right : o.left) !== null && a(k)) : (s.size() < i || j < s.peek()[1]) && y(o, j);
                }
                var n, h, s;
                if (s = new g(function(o) {
                    return -o[1];
                }), r) for(n = 0; n < i; n += 1)s.push([
                    null,
                    r
                ]);
                for(p.root && a(p.root), h = [], n = 0; n < Math.min(i, s.content.length); n += 1)s.content[n][0] && h.push([
                    s.content[n][0].obj,
                    s.content[n][1]
                ]);
                return h;
            }, this.balanceFactor = function() {
                function t(r) {
                    return r === null ? 0 : Math.max(t(r.left), t(r.right)) + 1;
                }
                function i(r) {
                    return r === null ? 0 : i(r.left) + i(r.right) + 1;
                }
                return t(p.root) / (Math.log(i(p.root)) / Math.log(2));
            };
        }, f.BinaryHeap = g;
    });
});
var M = {};
C(M, {
    default: ()=>K
});
var G = J(D());
_(M, J(D()));
var { default: O , ...I } = G, K = O !== void 0 ? O : I;
export { K as default };
