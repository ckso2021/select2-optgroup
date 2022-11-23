(function($){

    $.fn.select2.amd.define('optgroup-data', ['select2/data/select', 'select2/utils'], function(SelectAdapter, Utils){
        function OptgroupData ($element, options) {
            OptgroupData.__super__.constructor.apply(this, arguments);
            this._checkOptgroups();
        }
        
        Utils.Extend(OptgroupData, SelectAdapter);
        
        OptgroupData.prototype.current = function (callback) {
            var data = [];
            var self = this;
            this._checkOptgroups();
            this.$element.find(':not(.selected-custom) :selected, .selected-custom').each(function () {
                var $option = $(this);
                var option = self.item($option);
                
                if (!option.hasOwnProperty('id')) {
                    option.id = 'optgroup';
                }
                
                data.push(option);
            });
    
            callback(data);
        };
        
        OptgroupData.prototype.bind = function (container, $container) {
            OptgroupData.__super__.bind.apply(this, arguments);        
            var self = this;
    
            container.on('optgroup:select', function (params) {
                self.optgroupSelect(params.data);
            });
            
            container.on('optgroup:unselect', function (params) {
                self.optgroupUnselect(params.data);
            });
        };
        
        // OptgroupData.prototype.select = function (data) {
        //     if ($(data.element).is('optgroup')){
        //         this.optgroupSelect(data);
        //         return;
        //     }

        //     // Change selected property on underlying option element 
        //     data.selected = !data.selected;
        //     data.element.selected = !data.element.selected;

        //     console.log('xxxdata', data);
    
        //     this.$element.trigger('change');
        //     this.clearSearch();
    
        //     // Manually trigger dropdrop positioning handler
        //     $(window).trigger('scroll.select2');        
        // };
        
        // OptgroupData.prototype.unselect = function (data) {
        //     if ($(data.element).is('optgroup')){
        //         this.optgroupUnselect(data);
        //         return;
        //     }
            
        //     // Change selected property on underlying option element 

        //     console.log(data);
        //     data.selected = !data.selected;
        //     data.element.selected = !data.element.selected;
            
        //     this.$element.trigger('change');
            
        //     // Manually trigger dropdrop positioning handler
        //     $(window).trigger('scroll.select2');
        // };
        
        OptgroupData.prototype.optgroupSelect = function (data) {
            data.selected = true;
            var vals = this.$element.val() || [];

            console.log('optgroupSelect', vals);
    
            var newVals = $.map(data.element.children, function(child){
                return '' + child.value;
            });
            
            newVals.forEach(function(val){
                if ($.inArray(val, vals) == -1){
                    vals.push(val);
                }
            });
            
            this.$element.val(vals);
            this.$element.trigger('change');
            this.clearSearch();
            
            // Manually trigger dropdrop positioning handler
            $(window).trigger('scroll.select2');
        };
        
        OptgroupData.prototype.optgroupUnselect = function (data) {
            data.selected = false;
            var vals = this.$element.val() || [];

            console.log('optgroupUnselect', vals);

            var removeVals = $.map(data.element.children, function(child){
                return '' + child.value;
            });
            var newVals = [];
            
            vals.forEach(function(val){
                if ($.inArray(val, removeVals) == -1){
                    newVals.push(val);
                }
            });
            this.$element.val(newVals);
            this.$element.trigger('change');
    
            // Manually trigger dropdrop positioning handler
            $(window).trigger('scroll.select2');
        };
        
        // Check if all children of optgroup are selected. If so, select optgroup
        OptgroupData.prototype._checkOptgroups = function(){
            this.$element.find('optgroup').each(function(){
                var children = this.children;
                
                var allSelected = !!children.length;
                
                for (var i = 0; i < children.length; i++) {
                    allSelected = children[i].selected;
                    if (!allSelected) { break; }
                }

               // console.log('allSelected', $(this).attr('label'), allSelected, children);

                if(allSelected){
                    $(this).selected = true;
                    $(this).attr('aria-selected', true);

                }else{
                    $(this).selected = false;
                    $(this).attr('aria-selected', false);
                }
                $(this).toggleClass('select2-results__option--selected', allSelected);
                $(this).selected = allSelected;
                $(this).attr('aria-selected', allSelected);
                $(this).toggleClass('selected-custom', allSelected);
            });
    
        };
        
        OptgroupData.prototype.clearSearch = function(){
            if (!this.container) {
                return;
            } 
            
            if (this.container.selection.$search.val()) {
                this.container.selection.$search.val('');
                this.container.selection.handleSearch();
            }
        } 
        
        return OptgroupData;
    });
    $.fn.select2.amd.define('optgroup-results', ['select2/results', 'select2/utils',  'select2/keys'], function OptgroupResults (ResultsAdapter, Utils, KEYS) {
        function OptgroupResults () {
            OptgroupResults.__super__.constructor.apply(this, arguments);
        };
    
        Utils.Extend(OptgroupResults, ResultsAdapter);
            
        OptgroupResults.prototype.option = function (data) {
            var option = OptgroupResults.__super__.option.call(this, data);
    
            if (data.children) {
                var $label = $(option).find('.select2-results__group');
                $label.attr({
                      'role': 'treeitem',
                      'aria-selected': 'false'
                });
                $label.data('data', data);
            }
            
            return option;
        };
        
        OptgroupResults.prototype.bind = function(container, $container) {
            OptgroupResults.__super__.bind.call(this, container, $container);
            var self = this;
            
            this.$results.on('mouseup', '.select2-results__group', function(evt) {
                var $this = $(this);

                var data = $this.data('data');
      

                var trigger = (data.selected == true)  ? 'optgroup:unselect' : 'optgroup:select';

              //  data.selected = ($this.attr('aria-selected') === 'true')  ? true : false;

              $this.toggleClass('select2-results__option--selected', data.selected);

              console.log('$this data',$this[0].textContent, $this[0].ariaSelected, trigger, !data.selected);
                self.trigger(trigger, {
                    originalEvent: evt,
                    data: data
                });
                    
                return false;
            });
            
            this.$results.on('mouseenter', '.select2-results__group[aria-selected]', function(evt) {
                var data = $(this).data('data');
    
                self.getHighlightedResults().removeClass('select2-results__option--highlighted');
    
                self.trigger('results:focus', {
                    data: data,
                    element: $(this)
                });
            });        
            
            container.on('optgroup:select', function () {
                if (!container.isOpen()) {
                    return;
                }
                
                if (self.options.options.closeOnSelect) {
                    self.trigger('close');
                }
                
                self.setClasses();
            });
    
            container.on('optgroup:unselect', function () {
                if (!container.isOpen()) {
                  return;
                }
    
                self.setClasses();
            });
        };
        
        OptgroupResults.prototype.setClasses = function(container, $container) {
            var self = this;
    
            this.data.current(function (selected) {
                var selectedIds = [];
                var optgroupLabels = [];

    
                
                $.each(selected, function (i, obj) {
                    if (obj.children) {

                        console.log('selected', obj.text);
                        optgroupLabels.push(obj.text);
                        $.each(obj.children, function(j, child) {
                            selectedIds.push(child.id.toString());
                        });
                    } else {
                        selectedIds.push(obj.id.toString());
                    }
                });

                console.log('selectedIds', selectedIds);
    
                var $options = self.$results.find('.select2-results__option[aria-selected]');
    
                $options.each(function () {
                    var $option = $(this);
            
                 //   var item = $.data(this, 'data');

  
    
                    // id needs to be converted to a string when comparing
                    var id = '' + $option[0].id.split('-')[$option[0].id.split('-').length - 1];

                  //  console.log('$option', $option, id, $option[0].$element);

                    if (($option.selected) || 
                        ($.inArray(id, selectedIds) > -1)) {
                            $option.attr('aria-selected', 'true');
                    } else {
                        $option.attr('aria-selected', 'false');
                    }
                });
    
            
                var $groups = self.$results.find('.select2-results__group[aria-selected]');

                console.log('optgroupLabels', optgroupLabels);
            
                $groups.each(function () {
                    var $optgroup = $(this);
                   // var item = $.data(this, 'data');
                //    var text = $optgroup.textContent;

                 console.log('$optgroup', $optgroup[0].textContent, $optgroup.hasClass('selected-custom'), $.inArray($optgroup[0].textContent, optgroupLabels) > -1);
                    //var $element = $(item.element);
    
                    if ( $optgroup.hasClass('selected-custom') || $.inArray($optgroup[0].textContent, optgroupLabels) > -1) {

                        $optgroup.attr('aria-selected', 'true');
                    } else {
                        $optgroup.attr('aria-selected', 'false');
                    }
                });

                 var val_in_grp = [];
                $(".select2-selection__rendered").find("li").each(function(){
                    var ele = $(this).find('.select2-selection__choice__display');

                    var id = ele[0].id;
                    id = id.split('-')[id.split('-').length - 1];

                    if(id == 'optgroup'){
                        self.$element.find('optgroup[label="' + ele.text() + '"] option').each(function(){
                            if(!val_in_grp.includes($(this).val())){
                                val_in_grp.push($(this).val());
                            }
                        });
                    }
                });

                $(".select2-selection__rendered").find("li").each(function(){
                    var ele = $(this).find('.select2-selection__choice__display');

                    var id = ele[0].id;
                    id = id.split('-')[id.split('-').length - 1];

                    if(id != 'optgroup' && val_in_grp.includes(id)){
                        $(this).remove();
                    }
                });
    
                if (!self.getHighlightedResults().length) {
                    $('.select2-results__option[aria-selected]').first().trigger('mouseenter');
                }
    
                // if (!self.getHighlightedResults().length) {
                //     $('.select2-results__option[aria-selected]').first().trigger('mouseenter');
                // }
                self.trigger('change');
            });
        };
        
        return OptgroupResults;
    });
    })(jQuery);