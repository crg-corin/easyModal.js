/**
* easyModal.js v1.3.1
* A minimal jQuery modal that works with your CSS.
* Author: Flavius Matis - http://flaviusmatis.github.com/
* URL: https://github.com/flaviusmatis/easyModal.js
*/

/*jslint browser: true*/
/*global jQuery*/

define(['jquery'], function ($) {
    "use strict";
    var methods = {
        init: function (options) {

            var defaults = {
                top: 'auto',
                autoOpen: false,
                overlayOpacity: 0.5,
                overlayColor: '#000',
                overlayClose: true,
                overlayParent: 'body',
                closeOnEscape: true,
                closeButtonClass: '.close',
                transitionIn: false,
                transitionOut: false,
                wrapperClass: 'easy-modal-wrapper',
                onOpen: false,
                onClose: false,
                zIndex: function () {
                    return (function (value) {
                        return value === -Infinity ? 0 : value + 1;
                    }(Math.max.apply(Math, $.makeArray($('*').map(function () {
                        return $(this).css('z-index');
                    }).filter(function () {
                        return $.isNumeric(this);
                    }).map(function () {
                        return parseInt(this, 10);
                    })))));
                },
                updateZIndexOnOpen: true

            };

            options = $.extend(defaults, options);

            var
                closeCallback = function() {},
                openCallback = closeCallback
            ;

            return this.each(function () {

                var o = options,
                    $overlay = $('.lean-overlay'),
                    $modal = $(this),
                    autoTop = parseInt(o.top, 10) > -1
                ;
                if ($overlay.length === 0)
                    $overlay = $('<div class="lean-overlay"></div>');

                if (o.onOpen && typeof o.onOpen === 'function') {
                    openCallback = function(){
                        // callback receives as argument the modal window
                        o.onOpen.call($modal[0], $modal[0]);
                    };
                }
                if (o.onClose && typeof o.onClose === 'function') {
                    closeCallback = function(){
                        // callback receives as argument the modal window
                        o.onClose.call($modal[0], $modal[0]);
                    };
                }

                $overlay.css({
                    'display': 'none',
                    'position': 'fixed',
                    // When updateZIndexOnOpen is set to true, we avoid computing the z-index on initialization,
                    // because the value would be replaced when opening the modal.
                    'z-index': (o.updateZIndexOnOpen ? 0 : o.zIndex()),
                    'top': 0,
                    'left': 0,
                    'height': '100%',
                    'width': '100%',
                    'background': o.overlayColor,
                    'opacity': 0,
                    'overflow': 'auto'
                }).appendTo(o.overlayParent);

                $modal
                    .css({
                        'display': 'block',
                        'box-sizing': 'border-box',
                        'margin-left': '-50%'
                    })
                    .wrap(function() {
                        return $('<div>')
                            .addClass(o.wrapperClass)
                            .css({
                                'display': 'none',
                                'position' : 'fixed',
                                // When updateZIndexOnOpen is set to true, we avoid computing the z-index on initialization,
                                // because the value would be replaced when opening the modal.
                                'z-index': (o.updateZIndexOnOpen ? 0 : o.zIndex() + 1),
                                'left' : 50 + '%',
                                'top' : autoTop ? o.top : '50%'
                            });
                    });

                var closeOnOverlayClick = function () {
                    if (o.overlayClose) {
                        $modal.trigger('closeModal');
                    }
                };

                var closeOnEscapeKeyPressed = function (e) {
                    if (o.closeOnEscape && e.keyCode === 27) {
                        $modal.trigger('closeModal');
                    }
                };

                var closeOnButtonClicked = function (e) {
                    $modal.trigger('closeModal');
                    e.preventDefault();
                };

                $modal.bind('openModal', function () {
                    $overlay.on('click', closeOnOverlayClick);
                    $(document).on('keydown', closeOnEscapeKeyPressed);
                    $modal.on('click', o.closeButtonClass, closeOnButtonClicked);

                    var overlayZ = o.updateZIndexOnOpen ? o.zIndex() : parseInt($overlay.css('z-index'), 10),
                        modalZ = overlayZ + 1;

                    $modal
                        .css('margin-top', autoTop ? 0 : -($modal.outerHeight() / 2) + 'px')
                        .parent().css('z-index', modalZ);

                    var shown = $overlay
                        .css({
                            'display': 'block',
                            'z-index': overlayZ
                        })
                        .fadeTo('normal', o.overlayOpacity).promise();

                    var p = $modal.parent();
                    if(o.transitionIn && o.transitionOut) {
                        p.css('display', 'block');
                        p.animate.apply(p, o.transitionIn).promise()
                            .done(function() {
                                shown.done(openCallback);
                            });
                    } else {
                        shown.done(function() {
                            p.fadeIn('fast', openCallback);
                        });
                    }
                });

                $modal.bind('closeModal', function () {
                    $overlay.off('click', closeOnOverlayClick);
                    $(document).off('keydown', closeOnEscapeKeyPressed);
                    $modal.off('click', o.closeButtonClass, closeOnButtonClicked);

                    var p = $modal.parent();
                    var complete = function() {
                        $overlay.fadeOut('normal', closeCallback);
                    };
                    if(o.transitionIn && o.transitionOut) {
                        p.animate.apply(p, o.transitionOut).promise()
                            .done(function() {
                                p.css('display', 'none');
                                complete();
                            });
                    } else {
                        p.fadeOut('fast', complete);
                    }
                });

                // Automatically open modal if option set
                if (o.autoOpen) {
                    $modal.trigger('openModal');
                }
            });
        }
    };

    $.fn.easyModal = function (method) {

        // Method calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }

        if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        }

        $.error('Method ' + method + ' does not exist on jQuery.easyModal');

    };

});
