var eafl_public = eafl_public || {};
jQuery(document).ready(function($) {
    jQuery('a.eafl-link-direct').on('click', function() {
        var data = {
            action: 'eafl_register_click',
            security: eafl_public.nonce,
            link: jQuery(this).data('eafl-id')
        };
        jQuery.post(eafl_public.ajax_url, data);
    });
});
(function($, w) {
    "use strict";
    var methods = (function() {
        var c = {
            bcClass: 'sf-breadcrumb',
            menuClass: 'sf-js-enabled',
            anchorClass: 'sf-with-ul',
            menuArrowClass: 'sf-arrows'
        }
          , ios = (function() {
            var ios = /^(?![\w\W]*Windows Phone)[\w\W]*(iPhone|iPad|iPod)/i.test(navigator.userAgent);
            if (ios) {
                $('html').css('cursor', 'pointer').on('click', $.noop);
            }
            return ios;
        }
        )()
          , wp7 = (function() {
            var style = document.documentElement.style;
            return ('behavior'in style && 'fill'in style && /iemobile/i.test(navigator.userAgent));
        }
        )()
          , unprefixedPointerEvents = (function() {
            return (!!w.PointerEvent);
        }
        )()
          , toggleMenuClasses = function($menu, o, add) {
            var classes = c.menuClass, method;
            if (o.cssArrows) {
                classes += ' ' + c.menuArrowClass;
            }
            method = (add) ? 'addClass' : 'removeClass';
            $menu[method](classes);
        }
          , setPathToCurrent = function($menu, o) {
            return $menu.find('li.' + o.pathClass).slice(0, o.pathLevels).addClass(o.hoverClass + ' ' + c.bcClass).filter(function() {
                return ($(this).children(o.popUpSelector).hide().show().length);
            }).removeClass(o.pathClass);
        }
          , toggleAnchorClass = function($li, add) {
            var method = (add) ? 'addClass' : 'removeClass';
            $li.children('a')[method](c.anchorClass);
        }
          , toggleTouchAction = function($menu) {
            var msTouchAction = $menu.css('ms-touch-action');
            var touchAction = $menu.css('touch-action');
            touchAction = touchAction || msTouchAction;
            touchAction = (touchAction === 'pan-y') ? 'auto' : 'pan-y';
            $menu.css({
                'ms-touch-action': touchAction,
                'touch-action': touchAction
            });
        }
          , getMenu = function($el) {
            return $el.closest('.' + c.menuClass);
        }
          , getOptions = function($el) {
            return getMenu($el).data('sfOptions');
        }
          , over = function() {
            var $this = $(this)
              , o = getOptions($this);
            clearTimeout(o.sfTimer);
            $this.siblings().superfish('hide').end().superfish('show');
        }
          , close = function(o) {
            o.retainPath = ($.inArray(this[0], o.$path) > -1);
            this.superfish('hide');
            if (!this.parents('.' + o.hoverClass).length) {
                o.onIdle.call(getMenu(this));
                if (o.$path.length) {
                    $.proxy(over, o.$path)();
                }
            }
        }
          , out = function() {
            var $this = $(this)
              , o = getOptions($this);
            if (ios) {
                $.proxy(close, $this, o)();
            } else {
                clearTimeout(o.sfTimer);
                o.sfTimer = setTimeout($.proxy(close, $this, o), o.delay);
            }
        }
          , touchHandler = function(e) {
            var $this = $(this)
              , o = getOptions($this)
              , $ul = $this.siblings(e.data.popUpSelector);
            if (o.onHandleTouch.call($ul) === false) {
                return this;
            }
            if ($ul.length > 0 && $ul.is(':hidden')) {
                $this.one('click.superfish', false);
                if (e.type === 'MSPointerDown' || e.type === 'pointerdown') {
                    $this.trigger('focus');
                } else {
                    $.proxy(over, $this.parent('li'))();
                }
            }
        }
          , applyHandlers = function($menu, o) {
            var targets = 'li:has(' + o.popUpSelector + ')';
            if ($.fn.hoverIntent && !o.disableHI) {
                $menu.hoverIntent(over, out, targets);
            } else {
                $menu.on('mouseenter.superfish', targets, over).on('mouseleave.superfish', targets, out);
            }
            var touchevent = 'MSPointerDown.superfish';
            if (unprefixedPointerEvents) {
                touchevent = 'pointerdown.superfish';
            }
            if (!ios) {
                touchevent += ' touchend.superfish';
            }
            if (wp7) {
                touchevent += ' mousedown.superfish';
            }
            $menu.on('focusin.superfish', 'li', over).on('focusout.superfish', 'li', out).on(touchevent, 'a', o, touchHandler);
        };
        return {
            hide: function(instant) {
                if (this.length) {
                    var $this = this
                      , o = getOptions($this);
                    if (!o) {
                        return this;
                    }
                    var not = (o.retainPath === true) ? o.$path : ''
                      , $ul = $this.find('li.' + o.hoverClass).add(this).not(not).removeClass(o.hoverClass).children(o.popUpSelector)
                      , speed = o.speedOut;
                    if (instant) {
                        $ul.show();
                        speed = 0;
                    }
                    o.retainPath = false;
                    if (o.onBeforeHide.call($ul) === false) {
                        return this;
                    }
                    $ul.stop(true, true).animate(o.animationOut, speed, function() {
                        var $this = $(this);
                        o.onHide.call($this);
                    });
                }
                return this;
            },
            show: function() {
                var o = getOptions(this);
                if (!o) {
                    return this;
                }
                var $this = this.addClass(o.hoverClass)
                  , $ul = $this.children(o.popUpSelector);
                if (o.onBeforeShow.call($ul) === false) {
                    return this;
                }
                $ul.stop(true, true).animate(o.animation, o.speed, function() {
                    o.onShow.call($ul);
                });
                return this;
            },
            destroy: function() {
                return this.each(function() {
                    var $this = $(this), o = $this.data('sfOptions'), $hasPopUp;
                    if (!o) {
                        return false;
                    }
                    $hasPopUp = $this.find(o.popUpSelector).parent('li');
                    clearTimeout(o.sfTimer);
                    toggleMenuClasses($this, o);
                    toggleAnchorClass($hasPopUp);
                    toggleTouchAction($this);
                    $this.off('.superfish').off('.hoverIntent');
                    $hasPopUp.children(o.popUpSelector).attr('style', function(i, style) {
                        return style.replace(/display[^;]+;?/g, '');
                    });
                    o.$path.removeClass(o.hoverClass + ' ' + c.bcClass).addClass(o.pathClass);
                    $this.find('.' + o.hoverClass).removeClass(o.hoverClass);
                    o.onDestroy.call($this);
                    $this.removeData('sfOptions');
                });
            },
            init: function(op) {
                return this.each(function() {
                    var $this = $(this);
                    if ($this.data('sfOptions')) {
                        return false;
                    }
                    var o = $.extend({}, $.fn.superfish.defaults, op)
                      , $hasPopUp = $this.find(o.popUpSelector).parent('li');
                    o.$path = setPathToCurrent($this, o);
                    $this.data('sfOptions', o);
                    toggleMenuClasses($this, o, true);
                    toggleAnchorClass($hasPopUp, true);
                    toggleTouchAction($this);
                    applyHandlers($this, o);
                    $hasPopUp.not('.' + c.bcClass).superfish('hide', true);
                    o.onInit.call(this);
                });
            }
        };
    }
    )();
    $.fn.superfish = function(method, args) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            return $.error('Method ' + method + ' does not exist on jQuery.fn.superfish');
        }
    }
    ;
    $.fn.superfish.defaults = {
        popUpSelector: 'ul,.sf-mega',
        hoverClass: 'sfHover',
        pathClass: 'overrideThisToUse',
        pathLevels: 1,
        delay: 800,
        animation: {
            opacity: 'show'
        },
        animationOut: {
            opacity: 'hide'
        },
        speed: 'normal',
        speedOut: 'fast',
        cssArrows: true,
        disableHI: false,
        onInit: $.noop,
        onBeforeShow: $.noop,
        onShow: $.noop,
        onBeforeHide: $.noop,
        onHide: $.noop,
        onIdle: $.noop,
        onDestroy: $.noop,
        onHandleTouch: $.noop
    };
}
)(jQuery, window);
!function(e, t, n) {
    function a(t, n) {
        this.element = t,
        this.settings = e.extend({}, i, n),
        this.settings.duplicate || n.hasOwnProperty("removeIds") || (this.settings.removeIds = !1),
        this._defaults = i,
        this._name = s,
        this.init()
    }
    var i = {
        label: "MENU",
        duplicate: !0,
        duration: 200,
        easingOpen: "swing",
        easingClose: "swing",
        closedSymbol: "&#9658;",
        openedSymbol: "&#9660;",
        prependTo: "body",
        appendTo: "",
        parentTag: "a",
        closeOnClick: !1,
        allowParentLinks: !1,
        nestedParentLinks: !0,
        showChildren: !1,
        removeIds: !0,
        removeClasses: !1,
        removeStyles: !1,
        brand: "",
        animations: "jquery",
        init: function() {},
        beforeOpen: function() {},
        beforeClose: function() {},
        afterOpen: function() {},
        afterClose: function() {}
    }
      , s = "slicknav"
      , o = "slicknav"
      , l = {
        DOWN: 40,
        ENTER: 13,
        ESCAPE: 27,
        LEFT: 37,
        RIGHT: 39,
        SPACE: 32,
        TAB: 9,
        UP: 38
    };
    a.prototype.init = function() {
        var n, a, i = this, s = e(this.element), r = this.settings;
        if (r.duplicate ? i.mobileNav = s.clone() : i.mobileNav = s,
        r.removeIds && (i.mobileNav.removeAttr("id"),
        i.mobileNav.find("*").each(function(t, n) {
            e(n).removeAttr("id")
        })),
        r.removeClasses && (i.mobileNav.removeAttr("class"),
        i.mobileNav.find("*").each(function(t, n) {
            e(n).removeAttr("class")
        })),
        r.removeStyles && (i.mobileNav.removeAttr("style"),
        i.mobileNav.find("*").each(function(t, n) {
            e(n).removeAttr("style")
        })),
        n = o + "_icon",
        "" === r.label && (n += " " + o + "_no-text"),
        "a" == r.parentTag && (r.parentTag = 'a href="#"'),
        i.mobileNav.attr("class", o + "_nav"),
        a = e('<div class="' + o + '_menu"></div>'),
        "" !== r.brand) {
            var c = e('<div class="' + o + '_brand">' + r.brand + "</div>");
            e(a).append(c)
        }
        i.btn = e(["<" + r.parentTag + ' aria-haspopup="true" role="button" tabindex="0" class="' + o + "_btn " + o + '_collapsed">', '<span class="' + o + '_menutxt">' + r.label + "</span>", '<span class="' + n + '">', '<span class="' + o + '_icon-bar"></span>', '<span class="' + o + '_icon-bar"></span>', '<span class="' + o + '_icon-bar"></span>', "</span>", "</" + r.parentTag + ">"].join("")),
        e(a).append(i.btn),
        "" !== r.appendTo ? e(r.appendTo).append(a) : e(r.prependTo).prepend(a),
        a.append(i.mobileNav);
        var p = i.mobileNav.find("li");
        e(p).each(function() {
            var t = e(this)
              , n = {};
            if (n.children = t.children("ul").attr("role", "menu"),
            t.data("menu", n),
            n.children.length > 0) {
                var a = t.contents()
                  , s = !1
                  , l = [];
                e(a).each(function() {
                    return e(this).is("ul") ? !1 : (l.push(this),
                    void (e(this).is("a") && (s = !0)))
                });
                var c = e("<" + r.parentTag + ' role="menuitem" aria-haspopup="true" tabindex="-1" class="' + o + '_item"/>');
                if (r.allowParentLinks && !r.nestedParentLinks && s)
                    e(l).wrapAll('<span class="' + o + "_parent-link " + o + '_row"/>').parent();
                else {
                    var p = e(l).wrapAll(c).parent();
                    p.addClass(o + "_row")
                }
                r.showChildren ? t.addClass(o + "_open") : t.addClass(o + "_collapsed"),
                t.addClass(o + "_parent");
                var d = e('<span class="' + o + '_arrow">' + (r.showChildren ? r.openedSymbol : r.closedSymbol) + "</span>");
                r.allowParentLinks && !r.nestedParentLinks && s && (d = d.wrap(c).parent()),
                e(l).last().after(d)
            } else
                0 === t.children().length && t.addClass(o + "_txtnode");
            t.children("a").attr("role", "menuitem").click(function(t) {
                r.closeOnClick && !e(t.target).parent().closest("li").hasClass(o + "_parent") && e(i.btn).click()
            }),
            r.closeOnClick && r.allowParentLinks && (t.children("a").children("a").click(function(t) {
                e(i.btn).click()
            }),
            t.find("." + o + "_parent-link a:not(." + o + "_item)").click(function(t) {
                e(i.btn).click()
            }))
        }),
        e(p).each(function() {
            var t = e(this).data("menu");
            r.showChildren || i._visibilityToggle(t.children, null, !1, null, !0)
        }),
        i._visibilityToggle(i.mobileNav, null, !1, "init", !0),
        i.mobileNav.attr("role", "menu"),
        e(t).mousedown(function() {
            i._outlines(!1)
        }),
        e(t).keyup(function() {
            i._outlines(!0)
        }),
        e(i.btn).click(function(e) {
            e.preventDefault(),
            i._menuToggle()
        }),
        i.mobileNav.on("click", "." + o + "_item", function(t) {
            t.preventDefault(),
            i._itemClick(e(this))
        }),
        e(i.btn).keydown(function(t) {
            var n = t || event;
            switch (n.keyCode) {
            case l.ENTER:
            case l.SPACE:
            case l.DOWN:
                t.preventDefault(),
                n.keyCode === l.DOWN && e(i.btn).hasClass(o + "_open") || i._menuToggle(),
                e(i.btn).next().find('[role="menuitem"]').first().focus()
            }
        }),
        i.mobileNav.on("keydown", "." + o + "_item", function(t) {
            var n = t || event;
            switch (n.keyCode) {
            case l.ENTER:
                t.preventDefault(),
                i._itemClick(e(t.target));
                break;
            case l.RIGHT:
                t.preventDefault(),
                e(t.target).parent().hasClass(o + "_collapsed") && i._itemClick(e(t.target)),
                e(t.target).next().find('[role="menuitem"]').first().focus()
            }
        }),
        i.mobileNav.on("keydown", '[role="menuitem"]', function(t) {
            var n = t || event;
            switch (n.keyCode) {
            case l.DOWN:
                t.preventDefault();
                var a = e(t.target).parent().parent().children().children('[role="menuitem"]:visible')
                  , s = a.index(t.target)
                  , r = s + 1;
                a.length <= r && (r = 0);
                var c = a.eq(r);
                c.focus();
                break;
            case l.UP:
                t.preventDefault();
                var a = e(t.target).parent().parent().children().children('[role="menuitem"]:visible')
                  , s = a.index(t.target)
                  , c = a.eq(s - 1);
                c.focus();
                break;
            case l.LEFT:
                if (t.preventDefault(),
                e(t.target).parent().parent().parent().hasClass(o + "_open")) {
                    var p = e(t.target).parent().parent().prev();
                    p.focus(),
                    i._itemClick(p)
                } else
                    e(t.target).parent().parent().hasClass(o + "_nav") && (i._menuToggle(),
                    e(i.btn).focus());
                break;
            case l.ESCAPE:
                t.preventDefault(),
                i._menuToggle(),
                e(i.btn).focus()
            }
        }),
        r.allowParentLinks && r.nestedParentLinks && e("." + o + "_item a").click(function(e) {
            e.stopImmediatePropagation()
        })
    }
    ,
    a.prototype._menuToggle = function(e) {
        var t = this
          , n = t.btn
          , a = t.mobileNav;
        n.hasClass(o + "_collapsed") ? (n.removeClass(o + "_collapsed"),
        n.addClass(o + "_open")) : (n.removeClass(o + "_open"),
        n.addClass(o + "_collapsed")),
        n.addClass(o + "_animating"),
        t._visibilityToggle(a, n.parent(), !0, n)
    }
    ,
    a.prototype._itemClick = function(e) {
        var t = this
          , n = t.settings
          , a = e.data("menu");
        a || (a = {},
        a.arrow = e.children("." + o + "_arrow"),
        a.ul = e.next("ul"),
        a.parent = e.parent(),
        a.parent.hasClass(o + "_parent-link") && (a.parent = e.parent().parent(),
        a.ul = e.parent().next("ul")),
        e.data("menu", a)),
        a.parent.hasClass(o + "_collapsed") ? (a.arrow.html(n.openedSymbol),
        a.parent.removeClass(o + "_collapsed"),
        a.parent.addClass(o + "_open"),
        a.parent.addClass(o + "_animating"),
        t._visibilityToggle(a.ul, a.parent, !0, e)) : (a.arrow.html(n.closedSymbol),
        a.parent.addClass(o + "_collapsed"),
        a.parent.removeClass(o + "_open"),
        a.parent.addClass(o + "_animating"),
        t._visibilityToggle(a.ul, a.parent, !0, e))
    }
    ,
    a.prototype._visibilityToggle = function(t, n, a, i, s) {
        function l(t, n) {
            e(t).removeClass(o + "_animating"),
            e(n).removeClass(o + "_animating"),
            s || p.afterOpen(t)
        }
        function r(n, a) {
            t.attr("aria-hidden", "true"),
            d.attr("tabindex", "-1"),
            c._setVisAttr(t, !0),
            t.hide(),
            e(n).removeClass(o + "_animating"),
            e(a).removeClass(o + "_animating"),
            s ? "init" == n && p.init() : p.afterClose(n)
        }
        var c = this
          , p = c.settings
          , d = c._getActionItems(t)
          , u = 0;
        a && (u = p.duration),
        t.hasClass(o + "_hidden") ? (t.removeClass(o + "_hidden"),
        s || p.beforeOpen(i),
        "jquery" === p.animations ? t.stop(!0, !0).slideDown(u, p.easingOpen, function() {
            l(i, n)
        }) : "velocity" === p.animations && t.velocity("finish").velocity("slideDown", {
            duration: u,
            easing: p.easingOpen,
            complete: function() {
                l(i, n)
            }
        }),
        t.attr("aria-hidden", "false"),
        d.attr("tabindex", "0"),
        c._setVisAttr(t, !1)) : (t.addClass(o + "_hidden"),
        s || p.beforeClose(i),
        "jquery" === p.animations ? t.stop(!0, !0).slideUp(u, this.settings.easingClose, function() {
            r(i, n)
        }) : "velocity" === p.animations && t.velocity("finish").velocity("slideUp", {
            duration: u,
            easing: p.easingClose,
            complete: function() {
                r(i, n)
            }
        }))
    }
    ,
    a.prototype._setVisAttr = function(t, n) {
        var a = this
          , i = t.children("li").children("ul").not("." + o + "_hidden");
        n ? i.each(function() {
            var t = e(this);
            t.attr("aria-hidden", "true");
            var i = a._getActionItems(t);
            i.attr("tabindex", "-1"),
            a._setVisAttr(t, n)
        }) : i.each(function() {
            var t = e(this);
            t.attr("aria-hidden", "false");
            var i = a._getActionItems(t);
            i.attr("tabindex", "0"),
            a._setVisAttr(t, n)
        })
    }
    ,
    a.prototype._getActionItems = function(e) {
        var t = e.data("menu");
        if (!t) {
            t = {};
            var n = e.children("li")
              , a = n.find("a");
            t.links = a.add(n.find("." + o + "_item")),
            e.data("menu", t)
        }
        return t.links
    }
    ,
    a.prototype._outlines = function(t) {
        t ? e("." + o + "_item, ." + o + "_btn").css("outline", "") : e("." + o + "_item, ." + o + "_btn").css("outline", "none")
    }
    ,
    a.prototype.toggle = function() {
        var e = this;
        e._menuToggle()
    }
    ,
    a.prototype.open = function() {
        var e = this;
        e.btn.hasClass(o + "_collapsed") && e._menuToggle()
    }
    ,
    a.prototype.close = function() {
        var e = this;
        e.btn.hasClass(o + "_open") && e._menuToggle()
    }
    ,
    e.fn[s] = function(t) {
        var n = arguments;
        if (void 0 === t || "object" == typeof t)
            return this.each(function() {
                e.data(this, "plugin_" + s) || e.data(this, "plugin_" + s, new a(this,t))
            });
        if ("string" == typeof t && "_" !== t[0] && "init" !== t) {
            var i;
            return this.each(function() {
                var o = e.data(this, "plugin_" + s);
                o instanceof a && "function" == typeof o[t] && (i = o[t].apply(o, Array.prototype.slice.call(n, 1)))
            }),
            void 0 !== i ? i : this
        }
    }
}(jQuery, document, window);
;window.Modernizr = function(a, b, c) {
    function D(a) {
        j.cssText = a
    }
    function E(a, b) {
        return D(n.join(a + ";") + (b || ""))
    }
    function F(a, b) {
        return typeof a === b
    }
    function G(a, b) {
        return !!~("" + a).indexOf(b)
    }
    function H(a, b) {
        for (var d in a) {
            var e = a[d];
            if (!G(e, "-") && j[e] !== c)
                return b == "pfx" ? e : !0
        }
        return !1
    }
    function I(a, b, d) {
        for (var e in a) {
            var f = b[a[e]];
            if (f !== c)
                return d === !1 ? a[e] : F(f, "function") ? f.bind(d || b) : f
        }
        return !1
    }
    function J(a, b, c) {
        var d = a.charAt(0).toUpperCase() + a.slice(1)
          , e = (a + " " + p.join(d + " ") + d).split(" ");
        return F(b, "string") || F(b, "undefined") ? H(e, b) : (e = (a + " " + q.join(d + " ") + d).split(" "),
        I(e, b, c))
    }
    function K() {
        e.input = function(c) {
            for (var d = 0, e = c.length; d < e; d++)
                u[c[d]] = c[d]in k;
            return u.list && (u.list = !!b.createElement("datalist") && !!a.HTMLDataListElement),
            u
        }("autocomplete autofocus list placeholder max min multiple pattern required step".split(" ")),
        e.inputtypes = function(a) {
            for (var d = 0, e, f, h, i = a.length; d < i; d++)
                k.setAttribute("type", f = a[d]),
                e = k.type !== "text",
                e && (k.value = l,
                k.style.cssText = "position:absolute;visibility:hidden;",
                /^range$/.test(f) && k.style.WebkitAppearance !== c ? (g.appendChild(k),
                h = b.defaultView,
                e = h.getComputedStyle && h.getComputedStyle(k, null).WebkitAppearance !== "textfield" && k.offsetHeight !== 0,
                g.removeChild(k)) : /^(search|tel)$/.test(f) || (/^(url|email)$/.test(f) ? e = k.checkValidity && k.checkValidity() === !1 : e = k.value != l)),
                t[a[d]] = !!e;
            return t
        }("search tel url email datetime date month week time datetime-local number range color".split(" "))
    }
    var d = "2.6.2", e = {}, f = !0, g = b.documentElement, h = "modernizr", i = b.createElement(h), j = i.style, k = b.createElement("input"), l = ":)", m = {}.toString, n = " -webkit- -moz- -o- -ms- ".split(" "), o = "Webkit Moz O ms", p = o.split(" "), q = o.toLowerCase().split(" "), r = {
        svg: "http://www.w3.org/2000/svg"
    }, s = {}, t = {}, u = {}, v = [], w = v.slice, x, y = function(a, c, d, e) {
        var f, i, j, k, l = b.createElement("div"), m = b.body, n = m || b.createElement("body");
        if (parseInt(d, 10))
            while (d--)
                j = b.createElement("div"),
                j.id = e ? e[d] : h + (d + 1),
                l.appendChild(j);
        return f = ["&#173;", '<style id="s', h, '">', a, "</style>"].join(""),
        l.id = h,
        (m ? l : n).innerHTML += f,
        n.appendChild(l),
        m || (n.style.background = "",
        n.style.overflow = "hidden",
        k = g.style.overflow,
        g.style.overflow = "hidden",
        g.appendChild(n)),
        i = c(l, a),
        m ? l.parentNode.removeChild(l) : (n.parentNode.removeChild(n),
        g.style.overflow = k),
        !!i
    }, z = function(b) {
        var c = a.matchMedia || a.msMatchMedia;
        if (c)
            return c(b).matches;
        var d;
        return y("@media " + b + " { #" + h + " { position: absolute; }}", function(b) {
            d = (a.getComputedStyle ? getComputedStyle(b, null) : b.currentStyle)["position"] == "absolute"
        }),
        d
    }, A = function() {
        function d(d, e) {
            e = e || b.createElement(a[d] || "div"),
            d = "on" + d;
            var f = d in e;
            return f || (e.setAttribute || (e = b.createElement("div")),
            e.setAttribute && e.removeAttribute && (e.setAttribute(d, ""),
            f = F(e[d], "function"),
            F(e[d], "undefined") || (e[d] = c),
            e.removeAttribute(d))),
            e = null,
            f
        }
        var a = {
            select: "input",
            change: "input",
            submit: "form",
            reset: "form",
            error: "img",
            load: "img",
            abort: "img"
        };
        return d
    }(), B = {}.hasOwnProperty, C;
    !F(B, "undefined") && !F(B.call, "undefined") ? C = function(a, b) {
        return B.call(a, b)
    }
    : C = function(a, b) {
        return b in a && F(a.constructor.prototype[b], "undefined")
    }
    ,
    Function.prototype.bind || (Function.prototype.bind = function(b) {
        var c = this;
        if (typeof c != "function")
            throw new TypeError;
        var d = w.call(arguments, 1)
          , e = function() {
            if (this instanceof e) {
                var a = function() {};
                a.prototype = c.prototype;
                var f = new a
                  , g = c.apply(f, d.concat(w.call(arguments)));
                return Object(g) === g ? g : f
            }
            return c.apply(b, d.concat(w.call(arguments)))
        };
        return e
    }
    ),
    s.flexbox = function() {
        return J("flexWrap")
    }
    ,
    s.canvas = function() {
        var a = b.createElement("canvas");
        return !!a.getContext && !!a.getContext("2d")
    }
    ,
    s.canvastext = function() {
        return !!e.canvas && !!F(b.createElement("canvas").getContext("2d").fillText, "function")
    }
    ,
    s.webgl = function() {
        return !!a.WebGLRenderingContext
    }
    ,
    s.touch = function() {
        var c;
        return "ontouchstart"in a || a.DocumentTouch && b instanceof DocumentTouch ? c = !0 : y(["@media (", n.join("touch-enabled),("), h, ")", "{#modernizr{top:9px;position:absolute}}"].join(""), function(a) {
            c = a.offsetTop === 9
        }),
        c
    }
    ,
    s.geolocation = function() {
        return "geolocation"in navigator
    }
    ,
    s.postmessage = function() {
        return !!a.postMessage
    }
    ,
    s.websqldatabase = function() {
        return !!a.openDatabase
    }
    ,
    s.indexedDB = function() {
        return !!J("indexedDB", a)
    }
    ,
    s.hashchange = function() {
        return A("hashchange", a) && (b.documentMode === c || b.documentMode > 7)
    }
    ,
    s.history = function() {
        return !!a.history && !!history.pushState
    }
    ,
    s.draganddrop = function() {
        var a = b.createElement("div");
        return "draggable"in a || "ondragstart"in a && "ondrop"in a
    }
    ,
    s.websockets = function() {
        return "WebSocket"in a || "MozWebSocket"in a
    }
    ,
    s.rgba = function() {
        return D("background-color:rgba(150,255,150,.5)"),
        G(j.backgroundColor, "rgba")
    }
    ,
    s.hsla = function() {
        return D("background-color:hsla(120,40%,100%,.5)"),
        G(j.backgroundColor, "rgba") || G(j.backgroundColor, "hsla")
    }
    ,
    s.multiplebgs = function() {
        return D("background:url(https://),url(https://),red url(https://)"),
        /(url\s*\(.*?){3}/.test(j.background)
    }
    ,
    s.backgroundsize = function() {
        return J("backgroundSize")
    }
    ,
    s.borderimage = function() {
        return J("borderImage")
    }
    ,
    s.borderradius = function() {
        return J("borderRadius")
    }
    ,
    s.boxshadow = function() {
        return J("boxShadow")
    }
    ,
    s.textshadow = function() {
        return b.createElement("div").style.textShadow === ""
    }
    ,
    s.opacity = function() {
        return E("opacity:.55"),
        /^0.55$/.test(j.opacity)
    }
    ,
    s.cssanimations = function() {
        return J("animationName")
    }
    ,
    s.csscolumns = function() {
        return J("columnCount")
    }
    ,
    s.cssgradients = function() {
        var a = "background-image:"
          , b = "gradient(linear,left top,right bottom,from(#9f9),to(white));"
          , c = "linear-gradient(left top,#9f9, white);";
        return D((a + "-webkit- ".split(" ").join(b + a) + n.join(c + a)).slice(0, -a.length)),
        G(j.backgroundImage, "gradient")
    }
    ,
    s.cssreflections = function() {
        return J("boxReflect")
    }
    ,
    s.csstransforms = function() {
        return !!J("transform")
    }
    ,
    s.csstransforms3d = function() {
        var a = !!J("perspective");
        return a && "webkitPerspective"in g.style && y("@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}", function(b, c) {
            a = b.offsetLeft === 9 && b.offsetHeight === 3
        }),
        a
    }
    ,
    s.csstransitions = function() {
        return J("transition")
    }
    ,
    s.fontface = function() {
        var a;
        return y('@font-face {font-family:"font";src:url("https://")}', function(c, d) {
            var e = b.getElementById("smodernizr")
              , f = e.sheet || e.styleSheet
              , g = f ? f.cssRules && f.cssRules[0] ? f.cssRules[0].cssText : f.cssText || "" : "";
            a = /src/i.test(g) && g.indexOf(d.split(" ")[0]) === 0
        }),
        a
    }
    ,
    s.generatedcontent = function() {
        var a;
        return y(["#", h, "{font:0/0 a}#", h, ':after{content:"', l, '";visibility:hidden;font:3px/1 a}'].join(""), function(b) {
            a = b.offsetHeight >= 3
        }),
        a
    }
    ,
    s.video = function() {
        var a = b.createElement("video")
          , c = !1;
        try {
            if (c = !!a.canPlayType)
                c = new Boolean(c),
                c.ogg = a.canPlayType('video/ogg; codecs="theora"').replace(/^no$/, ""),
                c.h264 = a.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/, ""),
                c.webm = a.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/, "")
        } catch (d) {}
        return c
    }
    ,
    s.audio = function() {
        var a = b.createElement("audio")
          , c = !1;
        try {
            if (c = !!a.canPlayType)
                c = new Boolean(c),
                c.ogg = a.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ""),
                c.mp3 = a.canPlayType("audio/mpeg;").replace(/^no$/, ""),
                c.wav = a.canPlayType('audio/wav; codecs="1"').replace(/^no$/, ""),
                c.m4a = (a.canPlayType("audio/x-m4a;") || a.canPlayType("audio/aac;")).replace(/^no$/, "")
        } catch (d) {}
        return c
    }
    ,
    s.localstorage = function() {
        try {
            return localStorage.setItem(h, h),
            localStorage.removeItem(h),
            !0
        } catch (a) {
            return !1
        }
    }
    ,
    s.sessionstorage = function() {
        try {
            return sessionStorage.setItem(h, h),
            sessionStorage.removeItem(h),
            !0
        } catch (a) {
            return !1
        }
    }
    ,
    s.webworkers = function() {
        return !!a.Worker
    }
    ,
    s.applicationcache = function() {
        return !!a.applicationCache
    }
    ,
    s.svg = function() {
        return !!b.createElementNS && !!b.createElementNS(r.svg, "svg").createSVGRect
    }
    ,
    s.inlinesvg = function() {
        var a = b.createElement("div");
        return a.innerHTML = "<svg/>",
        (a.firstChild && a.firstChild.namespaceURI) == r.svg
    }
    ,
    s.smil = function() {
        return !!b.createElementNS && /SVGAnimate/.test(m.call(b.createElementNS(r.svg, "animate")))
    }
    ,
    s.svgclippaths = function() {
        return !!b.createElementNS && /SVGClipPath/.test(m.call(b.createElementNS(r.svg, "clipPath")))
    }
    ;
    for (var L in s)
        C(s, L) && (x = L.toLowerCase(),
        e[x] = s[L](),
        v.push((e[x] ? "" : "no-") + x));
    return e.input || K(),
    e.addTest = function(a, b) {
        if (typeof a == "object")
            for (var d in a)
                C(a, d) && e.addTest(d, a[d]);
        else {
            a = a.toLowerCase();
            if (e[a] !== c)
                return e;
            b = typeof b == "function" ? b() : b,
            typeof f != "undefined" && f && (g.className += " " + (b ? "" : "no-") + a),
            e[a] = b
        }
        return e
    }
    ,
    D(""),
    i = k = null,
    function(a, b) {
        function k(a, b) {
            var c = a.createElement("p")
              , d = a.getElementsByTagName("head")[0] || a.documentElement;
            return c.innerHTML = "x<style>" + b + "</style>",
            d.insertBefore(c.lastChild, d.firstChild)
        }
        function l() {
            var a = r.elements;
            return typeof a == "string" ? a.split(" ") : a
        }
        function m(a) {
            var b = i[a[g]];
            return b || (b = {},
            h++,
            a[g] = h,
            i[h] = b),
            b
        }
        function n(a, c, f) {
            c || (c = b);
            if (j)
                return c.createElement(a);
            f || (f = m(c));
            var g;
            return f.cache[a] ? g = f.cache[a].cloneNode() : e.test(a) ? g = (f.cache[a] = f.createElem(a)).cloneNode() : g = f.createElem(a),
            g.canHaveChildren && !d.test(a) ? f.frag.appendChild(g) : g
        }
        function o(a, c) {
            a || (a = b);
            if (j)
                return a.createDocumentFragment();
            c = c || m(a);
            var d = c.frag.cloneNode()
              , e = 0
              , f = l()
              , g = f.length;
            for (; e < g; e++)
                d.createElement(f[e]);
            return d
        }
        function p(a, b) {
            b.cache || (b.cache = {},
            b.createElem = a.createElement,
            b.createFrag = a.createDocumentFragment,
            b.frag = b.createFrag()),
            a.createElement = function(c) {
                return r.shivMethods ? n(c, a, b) : b.createElem(c)
            }
            ,
            a.createDocumentFragment = Function("h,f", "return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&(" + l().join().replace(/\w+/g, function(a) {
                return b.createElem(a),
                b.frag.createElement(a),
                'c("' + a + '")'
            }) + ");return n}")(r, b.frag)
        }
        function q(a) {
            a || (a = b);
            var c = m(a);
            return r.shivCSS && !f && !c.hasCSS && (c.hasCSS = !!k(a, "article,aside,figcaption,figure,footer,header,hgroup,nav,section{display:block}mark{background:#FF0;color:#000}")),
            j || p(a, c),
            a
        }
        var c = a.html5 || {}, d = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i, e = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i, f, g = "_html5shiv", h = 0, i = {}, j;
        (function() {
            try {
                var a = b.createElement("a");
                a.innerHTML = "<xyz></xyz>",
                f = "hidden"in a,
                j = a.childNodes.length == 1 || function() {
                    b.createElement("a");
                    var a = b.createDocumentFragment();
                    return typeof a.cloneNode == "undefined" || typeof a.createDocumentFragment == "undefined" || typeof a.createElement == "undefined"
                }()
            } catch (c) {
                f = !0,
                j = !0
            }
        }
        )();
        var r = {
            elements: c.elements || "abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video",
            shivCSS: c.shivCSS !== !1,
            supportsUnknownElements: j,
            shivMethods: c.shivMethods !== !1,
            type: "default",
            shivDocument: q,
            createElement: n,
            createDocumentFragment: o
        };
        a.html5 = r,
        q(b)
    }(this, b),
    e._version = d,
    e._prefixes = n,
    e._domPrefixes = q,
    e._cssomPrefixes = p,
    e.mq = z,
    e.hasEvent = A,
    e.testProp = function(a) {
        return H([a])
    }
    ,
    e.testAllProps = J,
    e.testStyles = y,
    e.prefixed = function(a, b, c) {
        return b ? J(a, b, c) : J(a, "pfx")
    }
    ,
    g.className = g.className.replace(/(^|\s)no-js(\s|$)/, "$1$2") + (f ? " js " + v.join(" ") : ""),
    e
}(this, this.document),
function(a, b, c) {
    function d(a) {
        return "[object Function]" == o.call(a)
    }
    function e(a) {
        return "string" == typeof a
    }
    function f() {}
    function g(a) {
        return !a || "loaded" == a || "complete" == a || "uninitialized" == a
    }
    function h() {
        var a = p.shift();
        q = 1,
        a ? a.t ? m(function() {
            ("c" == a.t ? B.injectCss : B.injectJs)(a.s, 0, a.a, a.x, a.e, 1)
        }, 0) : (a(),
        h()) : q = 0
    }
    function i(a, c, d, e, f, i, j) {
        function k(b) {
            if (!o && g(l.readyState) && (u.r = o = 1,
            !q && h(),
            l.onload = l.onreadystatechange = null,
            b)) {
                "img" != a && m(function() {
                    t.removeChild(l)
                }, 50);
                for (var d in y[c])
                    y[c].hasOwnProperty(d) && y[c][d].onload()
            }
        }
        var j = j || B.errorTimeout
          , l = b.createElement(a)
          , o = 0
          , r = 0
          , u = {
            t: d,
            s: c,
            e: f,
            a: i,
            x: j
        };
        1 === y[c] && (r = 1,
        y[c] = []),
        "object" == a ? l.data = c : (l.src = c,
        l.type = a),
        l.width = l.height = "0",
        l.onerror = l.onload = l.onreadystatechange = function() {
            k.call(this, r)
        }
        ,
        p.splice(e, 0, u),
        "img" != a && (r || 2 === y[c] ? (t.insertBefore(l, s ? null : n),
        m(k, j)) : y[c].push(l))
    }
    function j(a, b, c, d, f) {
        return q = 0,
        b = b || "j",
        e(a) ? i("c" == b ? v : u, a, b, this.i++, c, d, f) : (p.splice(this.i++, 0, a),
        1 == p.length && h()),
        this
    }
    function k() {
        var a = B;
        return a.loader = {
            load: j,
            i: 0
        },
        a
    }
    var l = b.documentElement, m = a.setTimeout, n = b.getElementsByTagName("script")[0], o = {}.toString, p = [], q = 0, r = "MozAppearance"in l.style, s = r && !!b.createRange().compareNode, t = s ? l : n.parentNode, l = a.opera && "[object Opera]" == o.call(a.opera), l = !!b.attachEvent && !l, u = r ? "object" : l ? "script" : "img", v = l ? "script" : u, w = Array.isArray || function(a) {
        return "[object Array]" == o.call(a)
    }
    , x = [], y = {}, z = {
        timeout: function(a, b) {
            return b.length && (a.timeout = b[0]),
            a
        }
    }, A, B;
    B = function(a) {
        function b(a) {
            var a = a.split("!"), b = x.length, c = a.pop(), d = a.length, c = {
                url: c,
                origUrl: c,
                prefixes: a
            }, e, f, g;
            for (f = 0; f < d; f++)
                g = a[f].split("="),
                (e = z[g.shift()]) && (c = e(c, g));
            for (f = 0; f < b; f++)
                c = x[f](c);
            return c
        }
        function g(a, e, f, g, h) {
            var i = b(a)
              , j = i.autoCallback;
            i.url.split(".").pop().split("?").shift(),
            i.bypass || (e && (e = d(e) ? e : e[a] || e[g] || e[a.split("/").pop().split("?")[0]]),
            i.instead ? i.instead(a, e, f, g, h) : (y[i.url] ? i.noexec = !0 : y[i.url] = 1,
            f.load(i.url, i.forceCSS || !i.forceJS && "css" == i.url.split(".").pop().split("?").shift() ? "c" : c, i.noexec, i.attrs, i.timeout),
            (d(e) || d(j)) && f.load(function() {
                k(),
                e && e(i.origUrl, h, g),
                j && j(i.origUrl, h, g),
                y[i.url] = 2
            })))
        }
        function h(a, b) {
            function c(a, c) {
                if (a) {
                    if (e(a))
                        c || (j = function() {
                            var a = [].slice.call(arguments);
                            k.apply(this, a),
                            l()
                        }
                        ),
                        g(a, j, b, 0, h);
                    else if (Object(a) === a)
                        for (n in m = function() {
                            var b = 0, c;
                            for (c in a)
                                a.hasOwnProperty(c) && b++;
                            return b
                        }(),
                        a)
                            a.hasOwnProperty(n) && (!c && !--m && (d(j) ? j = function() {
                                var a = [].slice.call(arguments);
                                k.apply(this, a),
                                l()
                            }
                            : j[n] = function(a) {
                                return function() {
                                    var b = [].slice.call(arguments);
                                    a && a.apply(this, b),
                                    l()
                                }
                            }(k[n])),
                            g(a[n], j, b, n, h))
                } else
                    !c && l()
            }
            var h = !!a.test, i = a.load || a.both, j = a.callback || f, k = j, l = a.complete || f, m, n;
            c(h ? a.yep : a.nope, !!i),
            i && c(i)
        }
        var i, j, l = this.yepnope.loader;
        if (e(a))
            g(a, 0, l, 0);
        else if (w(a))
            for (i = 0; i < a.length; i++)
                j = a[i],
                e(j) ? g(j, 0, l, 0) : w(j) ? B(j) : Object(j) === j && h(j, l);
        else
            Object(a) === a && h(a, l)
    }
    ,
    B.addPrefix = function(a, b) {
        z[a] = b
    }
    ,
    B.addFilter = function(a) {
        x.push(a)
    }
    ,
    B.errorTimeout = 1e4,
    null == b.readyState && b.addEventListener && (b.readyState = "loading",
    b.addEventListener("DOMContentLoaded", A = function() {
        b.removeEventListener("DOMContentLoaded", A, 0),
        b.readyState = "complete"
    }
    , 0)),
    a.yepnope = k(),
    a.yepnope.executeStack = h,
    a.yepnope.injectJs = function(a, c, d, e, i, j) {
        var k = b.createElement("script"), l, o, e = e || B.errorTimeout;
        k.src = a;
        for (o in d)
            k.setAttribute(o, d[o]);
        c = j ? h : c || f,
        k.onreadystatechange = k.onload = function() {
            !l && g(k.readyState) && (l = 1,
            c(),
            k.onload = k.onreadystatechange = null)
        }
        ,
        m(function() {
            l || (l = 1,
            c(1))
        }, e),
        i ? k.onload() : n.parentNode.insertBefore(k, n)
    }
    ,
    a.yepnope.injectCss = function(a, c, d, e, g, i) {
        var e = b.createElement("link"), j, c = i ? h : c || f;
        e.href = a,
        e.rel = "stylesheet",
        e.type = "text/css";
        for (j in d)
            e.setAttribute(j, d[j]);
        g || (n.parentNode.insertBefore(e, n),
        m(c, 0))
    }
}(this, document),
Modernizr.load = function() {
    yepnope.apply(window, [].slice.call(arguments, 0))
}
;
;(function(window, document) {
    var version = '3.7.3';
    var options = window.html5 || {};
    var reSkip = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i;
    var saveClones = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i;
    var supportsHtml5Styles;
    var expando = '_html5shiv';
    var expanID = 0;
    var expandoData = {};
    var supportsUnknownElements;
    (function() {
        try {
            var a = document.createElement('a');
            a.innerHTML = '<xyz></xyz>';
            supportsHtml5Styles = ('hidden'in a);
            supportsUnknownElements = a.childNodes.length == 1 || (function() {
                (document.createElement)('a');
                var frag = document.createDocumentFragment();
                return (typeof frag.cloneNode == 'undefined' || typeof frag.createDocumentFragment == 'undefined' || typeof frag.createElement == 'undefined');
            }());
        } catch (e) {
            supportsHtml5Styles = true;
            supportsUnknownElements = true;
        }
    }());
    function addStyleSheet(ownerDocument, cssText) {
        var p = ownerDocument.createElement('p')
          , parent = ownerDocument.getElementsByTagName('head')[0] || ownerDocument.documentElement;
        p.innerHTML = 'x<style>' + cssText + '</style>';
        return parent.insertBefore(p.lastChild, parent.firstChild);
    }
    function getElements() {
        var elements = html5.elements;
        return typeof elements == 'string' ? elements.split(' ') : elements;
    }
    function addElements(newElements, ownerDocument) {
        var elements = html5.elements;
        if (typeof elements != 'string') {
            elements = elements.join(' ');
        }
        if (typeof newElements != 'string') {
            newElements = newElements.join(' ');
        }
        html5.elements = elements + ' ' + newElements;
        shivDocument(ownerDocument);
    }
    function getExpandoData(ownerDocument) {
        var data = expandoData[ownerDocument[expando]];
        if (!data) {
            data = {};
            expanID++;
            ownerDocument[expando] = expanID;
            expandoData[expanID] = data;
        }
        return data;
    }
    function createElement(nodeName, ownerDocument, data) {
        if (!ownerDocument) {
            ownerDocument = document;
        }
        if (supportsUnknownElements) {
            return ownerDocument.createElement(nodeName);
        }
        if (!data) {
            data = getExpandoData(ownerDocument);
        }
        var node;
        if (data.cache[nodeName]) {
            node = data.cache[nodeName].cloneNode();
        } else if (saveClones.test(nodeName)) {
            node = (data.cache[nodeName] = data.createElem(nodeName)).cloneNode();
        } else {
            node = data.createElem(nodeName);
        }
        return node.canHaveChildren && !reSkip.test(nodeName) && !node.tagUrn ? data.frag.appendChild(node) : node;
    }
    function createDocumentFragment(ownerDocument, data) {
        if (!ownerDocument) {
            ownerDocument = document;
        }
        if (supportsUnknownElements) {
            return ownerDocument.createDocumentFragment();
        }
        data = data || getExpandoData(ownerDocument);
        var clone = data.frag.cloneNode()
          , i = 0
          , elems = getElements()
          , l = elems.length;
        for (; i < l; i++) {
            clone.createElement(elems[i]);
        }
        return clone;
    }
    function shivMethods(ownerDocument, data) {
        if (!data.cache) {
            data.cache = {};
            data.createElem = ownerDocument.createElement;
            data.createFrag = ownerDocument.createDocumentFragment;
            data.frag = data.createFrag();
        }
        ownerDocument.createElement = function(nodeName) {
            if (!html5.shivMethods) {
                return data.createElem(nodeName);
            }
            return createElement(nodeName, ownerDocument, data);
        }
        ;
        ownerDocument.createDocumentFragment = Function('h,f', 'return function(){' + 'var n=f.cloneNode(),c=n.createElement;' + 'h.shivMethods&&(' + getElements().join().replace(/[\w\-:]+/g, function(nodeName) {
            data.createElem(nodeName);
            data.frag.createElement(nodeName);
            return 'c("' + nodeName + '")';
        }) + ');return n}')(html5, data.frag);
    }
    function shivDocument(ownerDocument) {
        if (!ownerDocument) {
            ownerDocument = document;
        }
        var data = getExpandoData(ownerDocument);
        if (html5.shivCSS && !supportsHtml5Styles && !data.hasCSS) {
            data.hasCSS = !!addStyleSheet(ownerDocument, 'article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}' + 'mark{background:#FF0;color:#000}' + 'template{display:none}');
        }
        if (!supportsUnknownElements) {
            shivMethods(ownerDocument, data);
        }
        return ownerDocument;
    }
    var html5 = {
        'elements': options.elements || 'abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output picture progress section summary template time video',
        'version': version,
        'shivCSS': (options.shivCSS !== false),
        'supportsUnknownElements': supportsUnknownElements,
        'shivMethods': (options.shivMethods !== false),
        'type': 'default',
        'shivDocument': shivDocument,
        createElement: createElement,
        createDocumentFragment: createDocumentFragment,
        addElements: addElements
    };
    window.html5 = html5;
    shivDocument(document);
    if (typeof module == 'object' && module.exports) {
        module.exports = html5;
    }
}(typeof window !== "undefined" ? window : this, document));
!function(t) {
    if ("object" == typeof exports && "undefined" != typeof module)
        module.exports = t();
    else if ("function" == typeof define && define.amd)
        define([], t);
    else {
        var e;
        e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this,
        e.Clipboard = t()
    }
}(function() {
    var t, e, n;
    return function t(e, n, r) {
        function o(a, s) {
            if (!n[a]) {
                if (!e[a]) {
                    var c = "function" == typeof require && require;
                    if (!s && c)
                        return c(a, !0);
                    if (i)
                        return i(a, !0);
                    var u = new Error("Cannot find module '" + a + "'");
                    throw u.code = "MODULE_NOT_FOUND",
                    u
                }
                var l = n[a] = {
                    exports: {}
                };
                e[a][0].call(l.exports, function(t) {
                    var n = e[a][1][t];
                    return o(n ? n : t)
                }, l, l.exports, t, e, n, r)
            }
            return n[a].exports
        }
        for (var i = "function" == typeof require && require, a = 0; a < r.length; a++)
            o(r[a]);
        return o
    }({
        1: [function(t, e, n) {
            var r = t("matches-selector");
            e.exports = function(t, e, n) {
                for (var o = n ? t : t.parentNode; o && o !== document; ) {
                    if (r(o, e))
                        return o;
                    o = o.parentNode
                }
            }
        }
        , {
            "matches-selector": 5
        }],
        2: [function(t, e, n) {
            function r(t, e, n, r, i) {
                var a = o.apply(this, arguments);
                return t.addEventListener(n, a, i),
                {
                    destroy: function() {
                        t.removeEventListener(n, a, i)
                    }
                }
            }
            function o(t, e, n, r) {
                return function(n) {
                    n.delegateTarget = i(n.target, e, !0),
                    n.delegateTarget && r.call(t, n)
                }
            }
            var i = t("closest");
            e.exports = r
        }
        , {
            closest: 1
        }],
        3: [function(t, e, n) {
            n.node = function(t) {
                return void 0 !== t && t instanceof HTMLElement && 1 === t.nodeType
            }
            ,
            n.nodeList = function(t) {
                var e = Object.prototype.toString.call(t);
                return void 0 !== t && ("[object NodeList]" === e || "[object HTMLCollection]" === e) && "length"in t && (0 === t.length || n.node(t[0]))
            }
            ,
            n.string = function(t) {
                return "string" == typeof t || t instanceof String
            }
            ,
            n.fn = function(t) {
                var e = Object.prototype.toString.call(t);
                return "[object Function]" === e
            }
        }
        , {}],
        4: [function(t, e, n) {
            function r(t, e, n) {
                if (!t && !e && !n)
                    throw new Error("Missing required arguments");
                if (!s.string(e))
                    throw new TypeError("Second argument must be a String");
                if (!s.fn(n))
                    throw new TypeError("Third argument must be a Function");
                if (s.node(t))
                    return o(t, e, n);
                if (s.nodeList(t))
                    return i(t, e, n);
                if (s.string(t))
                    return a(t, e, n);
                throw new TypeError("First argument must be a String, HTMLElement, HTMLCollection, or NodeList")
            }
            function o(t, e, n) {
                return t.addEventListener(e, n),
                {
                    destroy: function() {
                        t.removeEventListener(e, n)
                    }
                }
            }
            function i(t, e, n) {
                return Array.prototype.forEach.call(t, function(t) {
                    t.addEventListener(e, n)
                }),
                {
                    destroy: function() {
                        Array.prototype.forEach.call(t, function(t) {
                            t.removeEventListener(e, n)
                        })
                    }
                }
            }
            function a(t, e, n) {
                return c(document.body, t, e, n)
            }
            var s = t("./is")
              , c = t("delegate");
            e.exports = r
        }
        , {
            "./is": 3,
            delegate: 2
        }],
        5: [function(t, e, n) {
            function r(t, e) {
                if (i)
                    return i.call(t, e);
                for (var n = t.parentNode.querySelectorAll(e), r = 0; r < n.length; ++r)
                    if (n[r] == t)
                        return !0;
                return !1
            }
            var o = Element.prototype
              , i = o.matchesSelector || o.webkitMatchesSelector || o.mozMatchesSelector || o.msMatchesSelector || o.oMatchesSelector;
            e.exports = r
        }
        , {}],
        6: [function(t, e, n) {
            function r(t) {
                var e;
                if ("INPUT" === t.nodeName || "TEXTAREA" === t.nodeName)
                    t.focus(),
                    t.setSelectionRange(0, t.value.length),
                    e = t.value;
                else {
                    t.hasAttribute("contenteditable") && t.focus();
                    var n = window.getSelection()
                      , r = document.createRange();
                    r.selectNodeContents(t),
                    n.removeAllRanges(),
                    n.addRange(r),
                    e = n.toString()
                }
                return e
            }
            e.exports = r
        }
        , {}],
        7: [function(t, e, n) {
            function r() {}
            r.prototype = {
                on: function(t, e, n) {
                    var r = this.e || (this.e = {});
                    return (r[t] || (r[t] = [])).push({
                        fn: e,
                        ctx: n
                    }),
                    this
                },
                once: function(t, e, n) {
                    function r() {
                        o.off(t, r),
                        e.apply(n, arguments)
                    }
                    var o = this;
                    return r._ = e,
                    this.on(t, r, n)
                },
                emit: function(t) {
                    var e = [].slice.call(arguments, 1)
                      , n = ((this.e || (this.e = {}))[t] || []).slice()
                      , r = 0
                      , o = n.length;
                    for (r; o > r; r++)
                        n[r].fn.apply(n[r].ctx, e);
                    return this
                },
                off: function(t, e) {
                    var n = this.e || (this.e = {})
                      , r = n[t]
                      , o = [];
                    if (r && e)
                        for (var i = 0, a = r.length; a > i; i++)
                            r[i].fn !== e && r[i].fn._ !== e && o.push(r[i]);
                    return o.length ? n[t] = o : delete n[t],
                    this
                }
            },
            e.exports = r
        }
        , {}],
        8: [function(t, e, n) {
            "use strict";
            function r(t) {
                return t && t.__esModule ? t : {
                    "default": t
                }
            }
            function o(t, e) {
                if (!(t instanceof e))
                    throw new TypeError("Cannot call a class as a function")
            }
            n.__esModule = !0;
            var i = function() {
                function t(t, e) {
                    for (var n = 0; n < e.length; n++) {
                        var r = e[n];
                        r.enumerable = r.enumerable || !1,
                        r.configurable = !0,
                        "value"in r && (r.writable = !0),
                        Object.defineProperty(t, r.key, r)
                    }
                }
                return function(e, n, r) {
                    return n && t(e.prototype, n),
                    r && t(e, r),
                    e
                }
            }()
              , a = t("select")
              , s = r(a)
              , c = function() {
                function t(e) {
                    o(this, t),
                    this.resolveOptions(e),
                    this.initSelection()
                }
                return t.prototype.resolveOptions = function t() {
                    var e = arguments.length <= 0 || void 0 === arguments[0] ? {} : arguments[0];
                    this.action = e.action,
                    this.emitter = e.emitter,
                    this.target = e.target,
                    this.text = e.text,
                    this.trigger = e.trigger,
                    this.selectedText = ""
                }
                ,
                t.prototype.initSelection = function t() {
                    if (this.text && this.target)
                        throw new Error('Multiple attributes declared, use either "target" or "text"');
                    if (this.text)
                        this.selectFake();
                    else {
                        if (!this.target)
                            throw new Error('Missing required attributes, use either "target" or "text"');
                        this.selectTarget()
                    }
                }
                ,
                t.prototype.selectFake = function t() {
                    var e = this
                      , n = "rtl" == document.documentElement.getAttribute("dir");
                    this.removeFake(),
                    this.fakeHandler = document.body.addEventListener("click", function() {
                        return e.removeFake()
                    }),
                    this.fakeElem = document.createElement("textarea"),
                    this.fakeElem.style.fontSize = "12pt",
                    this.fakeElem.style.border = "0",
                    this.fakeElem.style.padding = "0",
                    this.fakeElem.style.margin = "0",
                    this.fakeElem.style.position = "absolute",
                    this.fakeElem.style[n ? "right" : "left"] = "-9999px",
                    this.fakeElem.style.top = (window.pageYOffset || document.documentElement.scrollTop) + "px",
                    this.fakeElem.setAttribute("readonly", ""),
                    this.fakeElem.value = this.text,
                    document.body.appendChild(this.fakeElem),
                    this.selectedText = s.default(this.fakeElem),
                    this.copyText()
                }
                ,
                t.prototype.removeFake = function t() {
                    this.fakeHandler && (document.body.removeEventListener("click"),
                    this.fakeHandler = null),
                    this.fakeElem && (document.body.removeChild(this.fakeElem),
                    this.fakeElem = null)
                }
                ,
                t.prototype.selectTarget = function t() {
                    this.selectedText = s.default(this.target),
                    this.copyText()
                }
                ,
                t.prototype.copyText = function t() {
                    var e = void 0;
                    try {
                        e = document.execCommand(this.action)
                    } catch (n) {
                        e = !1
                    }
                    this.handleResult(e)
                }
                ,
                t.prototype.handleResult = function t(e) {
                    e ? this.emitter.emit("success", {
                        action: this.action,
                        text: this.selectedText,
                        trigger: this.trigger,
                        clearSelection: this.clearSelection.bind(this)
                    }) : this.emitter.emit("error", {
                        action: this.action,
                        trigger: this.trigger,
                        clearSelection: this.clearSelection.bind(this)
                    })
                }
                ,
                t.prototype.clearSelection = function t() {
                    this.target && this.target.blur(),
                    window.getSelection().removeAllRanges()
                }
                ,
                t.prototype.destroy = function t() {
                    this.removeFake()
                }
                ,
                i(t, [{
                    key: "action",
                    set: function t() {
                        var e = arguments.length <= 0 || void 0 === arguments[0] ? "copy" : arguments[0];
                        if (this._action = e,
                        "copy" !== this._action && "cut" !== this._action)
                            throw new Error('Invalid "action" value, use either "copy" or "cut"')
                    },
                    get: function t() {
                        return this._action
                    }
                }, {
                    key: "target",
                    set: function t(e) {
                        if (void 0 !== e) {
                            if (!e || "object" != typeof e || 1 !== e.nodeType)
                                throw new Error('Invalid "target" value, use a valid Element');
                            this._target = e
                        }
                    },
                    get: function t() {
                        return this._target
                    }
                }]),
                t
            }();
            n.default = c,
            e.exports = n.default
        }
        , {
            select: 6
        }],
        9: [function(t, e, n) {
            "use strict";
            function r(t) {
                return t && t.__esModule ? t : {
                    "default": t
                }
            }
            function o(t, e) {
                if (!(t instanceof e))
                    throw new TypeError("Cannot call a class as a function")
            }
            function i(t, e) {
                if ("function" != typeof e && null !== e)
                    throw new TypeError("Super expression must either be null or a function, not " + typeof e);
                t.prototype = Object.create(e && e.prototype, {
                    constructor: {
                        value: t,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                    }
                }),
                e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
            }
            function a(t, e) {
                var n = "data-clipboard-" + t;
                if (e.hasAttribute(n))
                    return e.getAttribute(n)
            }
            n.__esModule = !0;
            var s = t("./clipboard-action")
              , c = r(s)
              , u = t("tiny-emitter")
              , l = r(u)
              , f = t("good-listener")
              , d = r(f)
              , h = function(t) {
                function e(n, r) {
                    o(this, e),
                    t.call(this),
                    this.resolveOptions(r),
                    this.listenClick(n)
                }
                return i(e, t),
                e.prototype.resolveOptions = function t() {
                    var e = arguments.length <= 0 || void 0 === arguments[0] ? {} : arguments[0];
                    this.action = "function" == typeof e.action ? e.action : this.defaultAction,
                    this.target = "function" == typeof e.target ? e.target : this.defaultTarget,
                    this.text = "function" == typeof e.text ? e.text : this.defaultText
                }
                ,
                e.prototype.listenClick = function t(e) {
                    var n = this;
                    this.listener = d.default(e, "click", function(t) {
                        return n.onClick(t)
                    })
                }
                ,
                e.prototype.onClick = function t(e) {
                    var n = e.delegateTarget || e.currentTarget;
                    this.clipboardAction && (this.clipboardAction = null),
                    this.clipboardAction = new c.default({
                        action: this.action(n),
                        target: this.target(n),
                        text: this.text(n),
                        trigger: n,
                        emitter: this
                    })
                }
                ,
                e.prototype.defaultAction = function t(e) {
                    return a("action", e)
                }
                ,
                e.prototype.defaultTarget = function t(e) {
                    var n = a("target", e);
                    return n ? document.querySelector(n) : void 0
                }
                ,
                e.prototype.defaultText = function t(e) {
                    return a("text", e)
                }
                ,
                e.prototype.destroy = function t() {
                    this.listener.destroy(),
                    this.clipboardAction && (this.clipboardAction.destroy(),
                    this.clipboardAction = null)
                }
                ,
                e
            }(l.default);
            n.default = h,
            e.exports = n.default
        }
        , {
            "./clipboard-action": 8,
            "good-listener": 4,
            "tiny-emitter": 7
        }]
    }, {}, [9])(9)
});
!function(o) {
    var t = null;
    o.modal = function(e, i) {
        o.modal.close();
        var s, l;
        if (this.$body = o("body"),
        this.options = o.extend({}, o.modal.defaults, i),
        this.options.doFade = !isNaN(parseInt(this.options.fadeDuration, 10)),
        e.is("a"))
            if (l = e.attr("href"),
            /^#/.test(l)) {
                if (this.$elm = o(l),
                1 !== this.$elm.length)
                    return null;
                this.$body.append(this.$elm),
                this.open()
            } else
                this.$elm = o("<div>"),
                this.$body.append(this.$elm),
                s = function(o, t) {
                    t.elm.remove()
                }
                ,
                this.showSpinner(),
                e.trigger(o.modal.AJAX_SEND),
                o.get(l).done(function(i) {
                    t && (e.trigger(o.modal.AJAX_SUCCESS),
                    t.$elm.empty().append(i).on(o.modal.CLOSE, s),
                    t.hideSpinner(),
                    t.open(),
                    e.trigger(o.modal.AJAX_COMPLETE))
                }).fail(function() {
                    e.trigger(o.modal.AJAX_FAIL),
                    t.hideSpinner(),
                    e.trigger(o.modal.AJAX_COMPLETE)
                });
        else
            this.$elm = e,
            this.$body.append(this.$elm),
            this.open()
    }
    ,
    o.modal.prototype = {
        constructor: o.modal,
        open: function() {
            var t = this;
            this.options.doFade ? (this.block(),
            setTimeout(function() {
                t.show()
            }, this.options.fadeDuration * this.options.fadeDelay)) : (this.block(),
            this.show()),
            this.options.escapeClose && o(document).on("keydown.modal", function(t) {
                27 == t.which && o.modal.close()
            }),
            this.options.clickClose && this.blocker.click(function(t) {
                t.target == this && o.modal.close()
            })
        },
        close: function() {
            this.unblock(),
            this.hide(),
            o(document).off("keydown.modal")
        },
        block: function() {
            this.$elm.trigger(o.modal.BEFORE_BLOCK, [this._ctx()]),
            this.blocker = o('<div class="jquery-modal blocker"></div>'),
            this.$body.css("overflow", "hidden"),
            this.$body.append(this.blocker),
            this.options.doFade && this.blocker.css("opacity", 0).animate({
                opacity: 1
            }, this.options.fadeDuration),
            this.$elm.trigger(o.modal.BLOCK, [this._ctx()])
        },
        unblock: function() {
            if (this.options.doFade) {
                var o = this;
                this.blocker.fadeOut(this.options.fadeDuration, function() {
                    o.blocker.children().appendTo(o.$body),
                    o.blocker.remove(),
                    o.$body.css("overflow", "")
                })
            } else
                this.blocker.children().appendTo(this.$body),
                this.blocker.remove(),
                this.$body.css("overflow", "")
        },
        show: function() {
            this.$elm.trigger(o.modal.BEFORE_OPEN, [this._ctx()]),
            this.options.showClose && (this.closeButton = o('<a href="#close-modal" rel="modal:close" class="close-modal ' + this.options.closeClass + '">' + this.options.closeText + "</a>"),
            this.$elm.append(this.closeButton)),
            this.$elm.addClass(this.options.modalClass + " current"),
            this.$elm.appendTo(this.blocker),
            this.options.doFade ? this.$elm.css("opacity", 0).show().animate({
                opacity: 1
            }, this.options.fadeDuration) : this.$elm.show(),
            this.$elm.trigger(o.modal.OPEN, [this._ctx()])
        },
        hide: function() {
            this.$elm.trigger(o.modal.BEFORE_CLOSE, [this._ctx()]),
            this.closeButton && this.closeButton.remove(),
            this.$elm.removeClass("current");
            var t = this;
            this.options.doFade ? this.$elm.fadeOut(this.options.fadeDuration, function() {
                t.$elm.trigger(o.modal.AFTER_CLOSE, [t._ctx()])
            }) : this.$elm.hide(0, function() {
                t.$elm.trigger(o.modal.AFTER_CLOSE, [t._ctx()])
            }),
            this.$elm.trigger(o.modal.CLOSE, [this._ctx()])
        },
        showSpinner: function() {
            this.options.showSpinner && (this.spinner = this.spinner || o('<div class="' + this.options.modalClass + '-spinner"></div>').append(this.options.spinnerHtml),
            this.$body.append(this.spinner),
            this.spinner.show())
        },
        hideSpinner: function() {
            this.spinner && this.spinner.remove()
        },
        _ctx: function() {
            return {
                elm: this.$elm,
                blocker: this.blocker,
                options: this.options
            }
        }
    },
    o.modal.close = function(o) {
        if (t) {
            o && o.preventDefault(),
            t.close();
            var e = t.$elm;
            return t = null,
            e
        }
    }
    ,
    o.modal.isActive = function() {
        return t ? !0 : !1
    }
    ,
    o.modal.defaults = {
        escapeClose: !0,
        clickClose: !0,
        closeText: "Close",
        closeClass: "",
        modalClass: "modal",
        spinnerHtml: null,
        showSpinner: !0,
        showClose: !0,
        fadeDuration: null,
        fadeDelay: 1
    },
    o.modal.BEFORE_BLOCK = "modal:before-block",
    o.modal.BLOCK = "modal:block",
    o.modal.BEFORE_OPEN = "modal:before-open",
    o.modal.OPEN = "modal:open",
    o.modal.BEFORE_CLOSE = "modal:before-close",
    o.modal.CLOSE = "modal:close",
    o.modal.AFTER_CLOSE = "modal:after-close",
    o.modal.AJAX_SEND = "modal:ajax:send",
    o.modal.AJAX_SUCCESS = "modal:ajax:success",
    o.modal.AJAX_FAIL = "modal:ajax:fail",
    o.modal.AJAX_COMPLETE = "modal:ajax:complete",
    o.fn.modal = function(e) {
        return 1 === this.length && (t = new o.modal(this,e)),
        this
    }
    ,
    o(document).on("click.modal", 'a[rel="modal:close"]', o.modal.close),
    o(document).on("click.modal", 'a[rel="modal:open"]', function(t) {
        t.preventDefault(),
        o(this).modal()
    })
}(jQuery);
(function($) {
    $(document).ready(function() {
        "use strict";
        var example = $('.sf-menu').superfish({
            delay: 100,
            speed: 'fast',
            autoArrows: false
        });
        var clipboard = new Clipboard('.coupon-code');
        clipboard.on('success', function(e) {
            console.info('Action:', e.action);
            console.info('Text:', e.text);
            console.info('Trigger:', e.trigger);
            e.clearSelection();
        });
        clipboard.on('error', function(e) {
            console.error('Action:', e.action);
            console.error('Trigger:', e.trigger);
        });
        var copyclipboard = new Clipboard('.copy-code');
        copyclipboard.on('success', function(e) {
            console.info('Action:', e.action);
            console.info('Text:', e.text);
            console.info('Trigger:', e.trigger);
            e.clearSelection();
        });
        copyclipboard.on('error', function(e) {
            console.error('Action:', e.action);
            console.error('Trigger:', e.trigger);
        });
        $('.click-change').click(function() {
            var $this = $(this);
            $this.toggleClass('click-change');
            if ($this.hasClass('click-change')) {
                $this.text('Copy');
            } else {
                $this.text('Copied');
                $this.off('click');
            }
        });
        $('#primary-menu').slicknav({
            prependTo: '#slick-mobile-menu',
            allowParentLinks: true,
            label: ''
        });
        $("#back-top").hide();
        $(function() {
            $(window).scroll(function() {
                if ($(this).scrollTop() > 100) {
                    $('#back-top').fadeIn('200');
                } else {
                    $('#back-top').fadeOut('200');
                }
            });
            $('#back-top a').click(function() {
                $('body,html').animate({
                    scrollTop: 0
                }, 400);
                return false;
            });
        });
        $('.slicknav_btn').click(function() {
            $('.header-search').slideUp('fast', function() {});
            $('.search-icon > .genericon-search').removeClass('active');
            $('.search-icon > .genericon-close').removeClass('active');
        });
        $('.search-icon > .genericon-search').click(function() {
            $('.header-search').slideDown('fast', function() {});
            $('.search-icon > .genericon-search').toggleClass('active');
            $('.search-icon > .genericon-close').toggleClass('active');
            $('.slicknav_btn').removeClass('slicknav_open');
            $('.slicknav_nav').addClass('slicknav_hidden');
            $('.slicknav_nav').css('display', 'none');
        });
        $('.search-icon > .genericon-close').click(function() {
            $('.header-search').slideUp('fast', function() {});
            $('.search-icon > .genericon-search').toggleClass('active');
            $('.search-icon > .genericon-close').toggleClass('active');
            $('.slicknav_btn').removeClass('slicknav_open');
            $('.slicknav_nav').addClass('slicknav_hidden');
            $('.slicknav_nav').css('display', 'none');
        });
    });
}
)(jQuery);
!function(a, b) {
    "use strict";
    function c() {
        if (!e) {
            e = !0;
            var a, c, d, f, g = -1 !== navigator.appVersion.indexOf("MSIE 10"), h = !!navigator.userAgent.match(/Trident.*rv:11\./), i = b.querySelectorAll("iframe.wp-embedded-content");
            for (c = 0; c < i.length; c++) {
                if (d = i[c],
                !d.getAttribute("data-secret"))
                    f = Math.random().toString(36).substr(2, 10),
                    d.src += "#?secret=" + f,
                    d.setAttribute("data-secret", f);
                if (g || h)
                    a = d.cloneNode(!0),
                    a.removeAttribute("security"),
                    d.parentNode.replaceChild(a, d)
            }
        }
    }
    var d = !1
      , e = !1;
    if (b.querySelector)
        if (a.addEventListener)
            d = !0;
    if (a.wp = a.wp || {},
    !a.wp.receiveEmbedMessage)
        if (a.wp.receiveEmbedMessage = function(c) {
            var d = c.data;
            if (d)
                if (d.secret || d.message || d.value)
                    if (!/[^a-zA-Z0-9]/.test(d.secret)) {
                        var e, f, g, h, i, j = b.querySelectorAll('iframe[data-secret="' + d.secret + '"]'), k = b.querySelectorAll('blockquote[data-secret="' + d.secret + '"]');
                        for (e = 0; e < k.length; e++)
                            k[e].style.display = "none";
                        for (e = 0; e < j.length; e++)
                            if (f = j[e],
                            c.source === f.contentWindow) {
                                if (f.removeAttribute("style"),
                                "height" === d.message) {
                                    if (g = parseInt(d.value, 10),
                                    g > 1e3)
                                        g = 1e3;
                                    else if (~~g < 200)
                                        g = 200;
                                    f.height = g
                                }
                                if ("link" === d.message)
                                    if (h = b.createElement("a"),
                                    i = b.createElement("a"),
                                    h.href = f.getAttribute("src"),
                                    i.href = d.value,
                                    i.host === h.host)
                                        if (b.activeElement === f)
                                            a.top.location.href = d.value
                            } else
                                ;
                    }
        }
        ,
        d)
            a.addEventListener("message", a.wp.receiveEmbedMessage, !1),
            b.addEventListener("DOMContentLoaded", c, !1),
            a.addEventListener("load", c, !1)
}(window, document);
