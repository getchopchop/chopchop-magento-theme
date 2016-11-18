;
(function($) {
    window.Iweb = window.Iweb || {};

    Iweb.QtyWidget = Class.create({
        defaults: {
            eventNamespace: 'iwebqtywidget',
            upSelector: '.js-qty-up',
            downSelector: '.js-qty-down',
            // The local container for the element
            inputSelector: '.js-qty-input',
            // The global container which looks for events for all elements
            // This should be as contained as possible, but will fall back
            // to document if not set.
            delegateContainerSelector: null,
            disabledClass: 'disabled',
            containerSelector: '.js-qty',
            maxQty: 999,
            minQty: 1
        },

        settings: null,

        initialize: function(params) {
            this.settings = $.extend({}, this.defaults, params);
            this.addEvents();

            $(this.settings.inputSelector, this.settings.delegateContainer).each(function() {
                var $this = $(this);
                $this.data('original-value', $this.val());
            });
        },

        namespaceEvent: function(event) {
            return event + "." + this.settings.eventNamespace;
        },

        disable: function($container) {
            $container.find(this.settings.inputSelector).prop('disabled', 'disabled');
            $container.find(this.settings.upSelector + ", " + this.settings.downSelector).addClass(this.settings.disabledClass);
        },

        enable: function($container) {
            $container.find(this.settings.inputSelector).removeProp('disabled');
            $container.find(this.settings.upSelector + ", " + this.settings.downSelector).removeClass(this.settings.disabledClass);
        },

        getDelegateContainer: function() {
            if (!this.settings.delegateContainerSelector) {
                return $(document);
            }

            return $(this.settings.delegateContainerSelector);
        },

        addEvents: function() {
            var $delegateContainer = this.getDelegateContainer();
            var self = this;

            $delegateContainer.on(this.namespaceEvent('click'),
                this.settings.downSelector,
                function(ev) {

                    ev.preventDefault();

                    if ($(this).hasClass(self.settings.disabledClass)) {
                        return;
                    }

                    self.updateQuantity($(this).closest(
                        self.settings.containerSelector).find(self.settings.inputSelector), -1);
                }
            );

            $delegateContainer.on(this.namespaceEvent('click'),
                this.settings.upSelector,
                function(ev) {
                    ev.preventDefault();

                    if ($(this).hasClass(self.settings.disabledClass)) {
                        return;
                    }

                    self.updateQuantity($(this).closest(
                        self.settings.containerSelector).find(self.settings.inputSelector), +1);
                }
            );

            $delegateContainer.on(this.namespaceEvent('keyup'),
                this.settings.inputSelector,
                function(ev) {
                    self.checkInputValue($(this));
                }
            );
        },

        checkInputValue: function($input) {
            var $this = $(this);
            var inputUpdateType = 'same_value';

            if ($input.val() != $input.data('original-value')) {
                inputUpdateType = 'different_value';
            }

            if (isNaN(parseInt($input.val(), 10))) {
                inputUpdateType = 'non_numeric_value';
            }

            $this.trigger('input_update', {
                'value': $input.val(),
                'originalValue': $input.data('original-value'),
                '$widget': $this,
                '$container': $input.closest(this.settings.containerSelector),
                'inputUpdateType': inputUpdateType
            });

        },

        updateQuantity: function($element, increment) {
            var val = Math.min(this.settings.maxQty, Math.max(this.settings.minQty, parseInt($element.val()) + increment));
            var $container = $element.closest(this.settings.containerSelector);
            var $input = $container.find(this.settings.inputSelector);

            val = isNaN(val) ? 1 : val;

            $element.val(val);

            $(this).trigger('update', {
                'value': val,
                '$widget': $(this),
                '$container': $container
            });

            this.checkInputValue($input);
        }

    });
}(jQuery));
